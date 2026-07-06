-- ============================================================================
-- Invitación Pablo Antonio — esquema de base de datos (Supabase / Postgres)
-- ============================================================================
-- Ejecuta este script completo en: Supabase Dashboard → SQL Editor → New query
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Tabla principal de invitados
-- ----------------------------------------------------------------------------
create table if not exists public.guests (
  id                  bigint generated always as identity primary key,
  token               text not null unique,
  name                text not null,
  phone               text not null default '',
  expected_adults     integer not null default 1,
  expected_children   integer not null default 0,
  confirmed_adults    integer,
  confirmed_children  integer,
  status              text not null default 'pending'
                        check (status in ('pending', 'attending', 'not_attending')),
  message             text not null default '',
  comments            text not null default '',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  confirmed_at        timestamptz
);

create index if not exists guests_token_idx on public.guests (token);

-- ----------------------------------------------------------------------------
-- Generación de token único, no adivinable, del lado del servidor
-- (12 caracteres, url-safe: base64 de 9 bytes aleatorios con +/ reemplazados)
-- ----------------------------------------------------------------------------
create or replace function public.generate_guest_token()
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  loop
    candidate := replace(replace(replace(
      encode(gen_random_bytes(9), 'base64'), '+', '-'), '/', '_'), '=', '');
    exit when not exists (select 1 from public.guests where token = candidate);
  end loop;
  return candidate;
end;
$$;

create or replace function public.guests_before_insert()
returns trigger
language plpgsql
as $$
begin
  if new.token is null or length(trim(new.token)) = 0 then
    new.token := public.generate_guest_token();
  end if;
  new.created_at := coalesce(new.created_at, now());
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_guests_before_insert on public.guests;
create trigger trg_guests_before_insert
  before insert on public.guests
  for each row execute function public.guests_before_insert();

create or replace function public.guests_before_update()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_guests_before_update on public.guests;
create trigger trg_guests_before_update
  before update on public.guests
  for each row execute function public.guests_before_update();

-- ----------------------------------------------------------------------------
-- Seguridad: RLS habilitado. La tabla NO es accesible directamente para el
-- rol "anon" (invitados públicos): solo el panel de administración
-- (usuario autenticado con Supabase Auth) puede leer/escribir la tabla
-- completa. Los invitados públicos usan las funciones RPC de abajo, que
-- solo exponen/editan la fila que corresponde a su propio token.
-- ----------------------------------------------------------------------------
alter table public.guests enable row level security;

drop policy if exists "authenticated_full_access" on public.guests;
create policy "authenticated_full_access" on public.guests
  for all
  to authenticated
  using (true)
  with check (true);

revoke all on public.guests from anon;
grant select, insert, update, delete on public.guests to authenticated;

-- ----------------------------------------------------------------------------
-- RPC pública: obtener los datos de un invitado por su token (para precargar
-- el formulario). No expone el token ni datos de otros invitados.
-- ----------------------------------------------------------------------------
create or replace function public.get_guest_by_token(p_token text)
returns table (
  id integer,
  name text,
  phone text,
  expected_adults integer,
  expected_children integer,
  confirmed_adults integer,
  confirmed_children integer,
  status text,
  message text,
  comments text
)
language sql
security definer
set search_path = public
as $$
  select g.id, g.name, g.phone, g.expected_adults, g.expected_children,
         g.confirmed_adults, g.confirmed_children, g.status, g.message, g.comments
  from public.guests g
  where g.token = p_token;
$$;

grant execute on function public.get_guest_by_token(text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- RPC pública: confirmar/actualizar la asistencia de un invitado por token.
-- Los cupos de adultos/niños se limitan siempre a expected_adults/children.
-- ----------------------------------------------------------------------------
create or replace function public.submit_rsvp(
  p_token text,
  p_status text,
  p_adults integer,
  p_children integer,
  p_message text,
  p_comments text
)
returns table (
  status text,
  confirmed_adults integer,
  confirmed_children integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  g public.guests;
  final_adults integer;
  final_children integer;
begin
  if p_status not in ('attending', 'not_attending') then
    raise exception 'Estado inválido';
  end if;

  select * into g from public.guests where token = p_token;
  if not found then
    raise exception 'Invitación no encontrada';
  end if;

  if p_status = 'attending' then
    final_adults := greatest(0, least(coalesce(p_adults, 0), g.expected_adults));
    final_children := greatest(0, least(coalesce(p_children, 0), g.expected_children));
  else
    final_adults := 0;
    final_children := 0;
  end if;

  update public.guests
  set status = p_status,
      confirmed_adults = final_adults,
      confirmed_children = final_children,
      message = coalesce(p_message, ''),
      comments = coalesce(p_comments, ''),
      confirmed_at = now()
  where token = p_token;

  return query select p_status, final_adults, final_children;
end;
$$;

grant execute on function public.submit_rsvp(text, text, integer, integer, text, text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Tiempo real: permitir que el panel de administración reciba cambios en vivo
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'guests'
  ) then
    alter publication supabase_realtime add table public.guests;
  end if;
end $$;

-- ============================================================================
-- Registro de clics en el enlace personal de cada invitado
-- ============================================================================
create table if not exists public.guest_link_clicks (
  id          bigint generated always as identity primary key,
  guest_id    bigint not null references public.guests(id) on delete cascade,
  clicked_at  timestamptz not null default now(),
  user_agent  text,
  ip          text
);

create index if not exists guest_link_clicks_guest_id_idx on public.guest_link_clicks (guest_id);

alter table public.guest_link_clicks enable row level security;

drop policy if exists "authenticated_read_clicks" on public.guest_link_clicks;
create policy "authenticated_read_clicks" on public.guest_link_clicks
  for select
  to authenticated
  using (true);

revoke all on public.guest_link_clicks from anon;
grant select on public.guest_link_clicks to authenticated;

-- RPC pública: registra un clic al enlace personal. Toma IP y user-agent de
-- los headers originales de la petición HTTP (expuestos por PostgREST vía
-- current_setting('request.headers')), no de lo que el navegador reporte.
create or replace function public.log_guest_link_click(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guest_id bigint;
  v_headers json;
  v_ua text;
  v_ip text;
begin
  select id into v_guest_id from public.guests where token = p_token;
  if v_guest_id is null then
    return;
  end if;

  begin
    v_headers := nullif(current_setting('request.headers', true), '')::json;
  exception when others then
    v_headers := null;
  end;

  v_ua := coalesce(v_headers->>'user-agent', 'desconocido');
  v_ip := coalesce(v_headers->>'x-forwarded-for', v_headers->>'cf-connecting-ip', 'desconocida');
  if v_ip like '%,%' then
    v_ip := trim(split_part(v_ip, ',', 1));
  end if;

  insert into public.guest_link_clicks (guest_id, user_agent, ip)
  values (v_guest_id, v_ua, v_ip);
end;
$$;

grant execute on function public.log_guest_link_click(text) to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'guest_link_clicks'
  ) then
    alter publication supabase_realtime add table public.guest_link_clicks;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- (Opcional) Datos de ejemplo — bórralos o coméntalos si no los quieres
-- ----------------------------------------------------------------------------
-- insert into public.guests (name, phone, expected_adults, expected_children, status)
-- values ('Familia de prueba', '50212345678', 2, 1, 'pending');
