import { useState } from 'react';
import { adminSignIn } from '../../lib/guestsApi.js';

export default function AdminLogin({ onSuccess, onBackPublic }) {
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  async function doLogin() {
    setAuthError('');
    setLoading(true);
    try {
      await adminSignIn(password);
      onSuccess();
    } catch (e) {
      setAuthError('Contraseña incorrecta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22, background: 'linear-gradient(180deg,#FFF7E9,#FDEFE6)' }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 28, padding: '34px 26px', boxShadow: '0 24px 50px rgba(0,0,0,.12)', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 18px' }}>
          <div style={{ position: 'absolute', top: -14, left: 2, width: 42, height: 42, borderRadius: '50%', background: '#1D1D1D' }} />
          <div style={{ position: 'absolute', top: -14, right: 2, width: 42, height: 42, borderRadius: '50%', background: '#1D1D1D' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#E51937', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🔒</div>
        </div>
        <h2 style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 24, margin: '0 0 6px', color: '#1D1D1D' }}>Panel de administración</h2>
        <p style={{ color: '#8a6d3b', margin: '0 0 20px', fontSize: 14 }}>Solo para los papás de Pablo 💛</p>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') doLogin(); }}
          type="password"
          placeholder="Contraseña"
          style={{ width: '100%', border: '2px solid #FFE2A6', borderRadius: 14, padding: '14px 16px', fontFamily: "'Nunito'", fontSize: 16, textAlign: 'center', outline: 'none' }}
        />
        {!!authError && (
          <div style={{ color: '#C1121F', fontSize: 14, marginTop: 10, fontFamily: "'Fredoka'" }}>🚫 {authError}</div>
        )}
        <button type="button" onClick={doLogin} disabled={loading} style={{ width: '100%', marginTop: 16, background: '#E51937', color: '#fff', border: '3px solid #FFD100', borderRadius: 999, padding: 15, fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 17, cursor: loading ? 'wait' : 'pointer' }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <button type="button" onClick={onBackPublic} style={{ marginTop: 14, background: 'none', border: 'none', color: '#c9b48c', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
          ← Volver a la invitación
        </button>
      </div>
    </div>
  );
}
