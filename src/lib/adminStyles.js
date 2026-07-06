export function filterBtnStyle(active) {
  return active
    ? { padding: '11px 14px', border: 'none', borderRadius: 999, background: '#1D1D1D', color: '#FFD100', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }
    : { padding: '11px 14px', border: '2px solid #EFE3C7', borderRadius: 999, background: '#fff', color: '#8a6d3b', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' };
}

export function segStyle(active, color) {
  return active
    ? { padding: '11px 6px', border: `2px solid ${color}`, borderRadius: 12, background: color, color: '#fff', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 13, cursor: 'pointer' }
    : { padding: '11px 6px', border: '2px solid #EFE3C7', borderRadius: 12, background: '#fff', color: '#8a6d3b', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 13, cursor: 'pointer' };
}

export function badgeStyle(status) {
  if (status === 'attending') return { display: 'inline-block', padding: '5px 12px', borderRadius: 999, background: '#DDF3E4', color: '#1E7E43', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 12 };
  if (status === 'not_attending') return { display: 'inline-block', padding: '5px 12px', borderRadius: 999, background: '#FBE0E3', color: '#C1121F', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 12 };
  return { display: 'inline-block', padding: '5px 12px', borderRadius: 999, background: '#FFF1D6', color: '#B58500', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 12 };
}

export function statusLabel(status) {
  return status === 'attending' ? '✅ Asistirá' : (status === 'not_attending' ? '🚫 No asistirá' : '⏳ Pendiente');
}

export function fmtDate(ts) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '—';
  }
}
