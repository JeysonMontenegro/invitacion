import { supabase, ADMIN_EMAIL } from './supabaseClient.js';

// ---------------------------------------------------------------------------
// Mapping helpers: DB (snake_case) <-> app model (camelCase)
// App model: id, token, name, phone, expectedAdults, expectedChildren,
//            confirmedAdults, confirmedChildren, status, message, comments,
//            createdAt, updatedAt, confirmedAt
// ---------------------------------------------------------------------------
function fromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    token: row.token,
    name: row.name,
    phone: row.phone || '',
    expectedAdults: row.expected_adults,
    expectedChildren: row.expected_children,
    confirmedAdults: row.confirmed_adults,
    confirmedChildren: row.confirmed_children,
    status: row.status,
    message: row.message || '',
    comments: row.comments || '',
    createdAt: row.created_at ? new Date(row.created_at).getTime() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : null,
    confirmedAt: row.confirmed_at ? new Date(row.confirmed_at).getTime() : null,
  };
}

function toRow(guest) {
  const row = {};
  if (guest.name !== undefined) row.name = guest.name;
  if (guest.phone !== undefined) row.phone = guest.phone;
  if (guest.expectedAdults !== undefined) row.expected_adults = guest.expectedAdults;
  if (guest.expectedChildren !== undefined) row.expected_children = guest.expectedChildren;
  if (guest.confirmedAdults !== undefined) row.confirmed_adults = guest.confirmedAdults;
  if (guest.confirmedChildren !== undefined) row.confirmed_children = guest.confirmedChildren;
  if (guest.status !== undefined) row.status = guest.status;
  if (guest.message !== undefined) row.message = guest.message;
  if (guest.comments !== undefined) row.comments = guest.comments;
  if (guest.confirmedAt !== undefined) {
    row.confirmed_at = guest.confirmedAt ? new Date(guest.confirmedAt).toISOString() : null;
  }
  return row;
}

// ---------------------------------------------------------------------------
// Public flow (no auth needed — uses SECURITY DEFINER RPCs scoped by token)
// ---------------------------------------------------------------------------
export async function fetchGuestByToken(token) {
  if (!token) return null;
  const { data, error } = await supabase
    .rpc('get_guest_by_token', { p_token: token })
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    phone: data.phone || '',
    expectedAdults: data.expected_adults,
    expectedChildren: data.expected_children,
    confirmedAdults: data.confirmed_adults,
    confirmedChildren: data.confirmed_children,
    status: data.status,
    message: data.message || '',
    comments: data.comments || '',
  };
}

export async function submitRsvp(token, { status, adults, children, message, comments }) {
  const { data, error } = await supabase
    .rpc('submit_rsvp', {
      p_token: token,
      p_status: status,
      p_adults: adults,
      p_children: children,
      p_message: message || '',
      p_comments: comments || '',
    })
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Admin auth (Supabase Auth — password-only UI, fixed internal email)
// ---------------------------------------------------------------------------
export async function adminSignIn(password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password,
  });
  if (error) throw error;
  return data.session;
}

export async function adminSignOut() {
  await supabase.auth.signOut();
}

export function getSession() {
  return supabase.auth.getSession().then(({ data }) => data.session);
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

// ---------------------------------------------------------------------------
// Admin CRUD (requires authenticated session — enforced by RLS)
// ---------------------------------------------------------------------------
export async function fetchAllGuests() {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export function subscribeToGuests(onChange) {
  const channel = supabase
    .channel('guests-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' }, onChange)
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export async function createGuest(guest) {
  const { data, error } = await supabase
    .from('guests')
    .insert(toRow(guest))
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateGuest(id, guest) {
  const { data, error } = await supabase
    .from('guests')
    .update(toRow(guest))
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteGuest(id) {
  const { error } = await supabase.from('guests').delete().eq('id', id);
  if (error) throw error;
}

export async function bulkInsertGuests(guests) {
  if (!guests.length) return [];
  const { data, error } = await supabase
    .from('guests')
    .insert(guests.map(toRow))
    .select();
  if (error) throw error;
  return (data || []).map(fromRow);
}
