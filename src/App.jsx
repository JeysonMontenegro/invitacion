import { useEffect, useState } from 'react';
import { fetchGuestByToken, getSession, onAuthStateChange } from './lib/guestsApi.js';
import PublicInvitation from './components/public/PublicInvitation.jsx';
import AdminLogin from './components/admin/AdminLogin.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('inv');
  const wantsAdmin = params.has('admin');

  const [view, setView] = useState(wantsAdmin ? 'adminLogin' : 'public');
  const [guest, setGuest] = useState(null);
  const [guestLoading, setGuestLoading] = useState(!!token);
  const [notFound, setNotFound] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    if (!token) return;
    setGuestLoading(true);
    fetchGuestByToken(token)
      .then((g) => {
        setGuest(g);
        setNotFound(!g);
      })
      .catch(() => setNotFound(true))
      .finally(() => setGuestLoading(false));
  }, [token]);

  useEffect(() => {
    getSession().then((session) => {
      if (session && wantsAdmin) setView('admin');
      setSessionChecked(true);
    });
    const unsubscribe = onAuthStateChange((session) => {
      if (!session && view === 'admin') setView('adminLogin');
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goLogin() {
    const url = new URL(window.location.href);
    url.searchParams.set('admin', '1');
    window.history.replaceState({}, '', url);
    setView('adminLogin');
  }

  function backPublic() {
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.history.replaceState({}, '', url);
    setView('public');
  }

  if (!sessionChecked && wantsAdmin) return null;

  if (view === 'admin') {
    return <AdminDashboard onBackPublic={backPublic} />;
  }

  if (view === 'adminLogin') {
    return <AdminLogin onSuccess={() => setView('admin')} onBackPublic={backPublic} />;
  }

  return (
    <PublicInvitation
      guest={guest}
      token={token}
      loading={guestLoading}
      notFound={notFound}
      onGoLogin={goLogin}
    />
  );
}
