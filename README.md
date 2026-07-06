# Invitación Pablo Antonio 🎉

App de invitación digital para el primer cumpleaños de Pablo Antonio: vista
pública de RSVP por link personal + panel de administración con datos en
tiempo real (Supabase / Postgres).

Mismo diseño y comportamiento del HTML original, pero ahora las confirmaciones
de los invitados se guardan en una base de datos en la nube y el panel de los
papás se actualiza en vivo desde cualquier dispositivo.

## Stack

- **Frontend**: React 18 + Vite
- **Backend/DB**: Supabase (Postgres + Realtime + Auth)
- **Deploy**: Vercel o Netlify (frontend estático) + Supabase (base de datos)

## 1. Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. Cuando esté listo, ve a **SQL Editor → New query**, pega el contenido de
   [`supabase/schema.sql`](./supabase/schema.sql) y ejecútalo. Esto crea:
   - La tabla `guests` con el modelo de invitado (id, token, name, phone,
     expectedAdults/Children, confirmedAdults/Children, status, message,
     comments, createdAt/updatedAt/confirmedAt).
   - Generación de `token` única y no adivinable del lado del servidor
     (aleatoria, 12 caracteres, url-safe).
   - Row Level Security: la tabla **no** es accesible directamente para
     visitantes anónimos. Los invitados públicos solo pueden leer/actualizar
     **su propia fila** a través de dos funciones RPC (`get_guest_by_token`,
     `submit_rsvp`) que validan el token en el servidor. El panel de admin
     usa una sesión autenticada de Supabase Auth con acceso completo.
   - Publicación de Realtime sobre `guests` para que el dashboard se
     actualice en vivo.

3. Crea el usuario administrador (uno solo, para el panel):
   - Ve a **Authentication → Users → Add user**.
   - Email: usa el mismo valor que pondrás en `VITE_ADMIN_EMAIL` (por
     ejemplo `admin@pablo-cumple.local`, no necesita ser un correo real).
   - Password: la contraseña que usarán los papás para entrar al panel.
   - Marca **Auto Confirm User**.

4. Copia tus credenciales desde **Project Settings → API**:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

## 2. Configurar variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_ADMIN_EMAIL=admin@pablo-cumple.local
```

## 3. Correr en local

```bash
npm install
npm run dev
```

- Invitación pública: `http://localhost:5173/`
- Con link personal: `http://localhost:5173/?inv=TOKEN`
- Panel admin: `http://localhost:5173/?admin=1`

## 4. Importar invitados

Desde el panel de administración → **📥 Plantilla** descarga un `.xlsx` de
ejemplo, o sube directamente tu propio archivo con **📄 Importar Excel**
usando columnas como `Nombre, Teléfono, Adultos, Niños` (el orden y
mayúsculas no importan, se detectan por nombre de columna; si no hay
encabezados, se asume ese mismo orden). A cada invitado se le asigna un
token único automáticamente al guardarse en la base de datos. El mensaje de
cumpleaños ("💌 Mensaje para Pablito") no se importa — lo escribe cada
invitado desde su propio formulario al confirmar.

Para enviar la invitación a cada quien, usa los botones 🔗 (copiar link) o
💬 (WhatsApp) de la tabla — generan `tu-dominio.com/?inv=TOKEN`.

## 5. Desplegar

### Vercel

```bash
npm i -g vercel
vercel
```

En el dashboard del proyecto (Settings → Environment Variables) agrega
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_ADMIN_EMAIL`, luego
vuelve a desplegar (`vercel --prod`).

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --build
```

Build command: `npm run build` · Publish directory: `dist`. Agrega las
mismas variables de entorno en **Site settings → Environment variables**.

## Estructura del proyecto

```
src/
  lib/
    supabaseClient.js   Cliente de Supabase
    guestsApi.js         Toda la capa de datos (RPCs públicas + CRUD admin)
    importExcel.js        Parseo de Excel (misma lógica que el HTML original)
    adminStyles.js         Helpers de estilo para el dashboard
  hooks/
    useCountdown.js        Cuenta regresiva
    useGuests.js            Carga + suscripción realtime de invitados (admin)
  components/
    public/                Invitación pública (hero, cuenta regresiva,
                            detalles del evento, formulario RSVP)
    admin/                  Login, dashboard, modal de invitado
  App.jsx                   Enrutamiento por query params (?inv=, ?admin=)
supabase/
  schema.sql                Esquema completo de base de datos
```

## Notas de seguridad

- El token de cada invitado se genera en la base de datos (`pgcrypto`,
  aleatorio, no secuencial) — es la única credencial que necesita un
  invitado para confirmar su asistencia.
- La tabla `guests` está protegida con Row Level Security: nadie puede leer
  la lista completa de invitados sin iniciar sesión como administrador.
- La contraseña del panel de administración es una sesión real de Supabase
  Auth (no una comparación de texto en el cliente).
# invitacion
