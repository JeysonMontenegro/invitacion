import { parseDevice, fmtDate } from '../../lib/adminStyles.js';

export default function ClickLogModal({ guest, clicks, onClose, onDelete }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(29,29,29,.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: '#fff', borderRadius: '26px 26px 0 0', padding: '24px 22px 30px', boxShadow: '0 -10px 40px rgba(0,0,0,.2)', animation: 'fadeUp .3s ease both', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ width: 46, height: 5, borderRadius: 3, background: '#EBDFC4', margin: '0 auto 18px' }} />
        <h2 style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 22, margin: '0 0 4px', color: '#1D1D1D' }}>👁️ Clics al enlace</h2>
        <p style={{ color: '#8a6d3b', fontSize: 14, margin: '0 0 18px' }}>{guest.name} · {clicks.length} {clicks.length === 1 ? 'clic' : 'clics'}</p>

        {clicks.length === 0 && (
          <div style={{ textAlign: 'center', color: '#a08a63', padding: '20px 0' }}>
            <div style={{ fontSize: 34 }}>🔗</div>
            <div style={{ fontFamily: "'Fredoka'", marginTop: 8 }}>Todavía no ha abierto su enlace</div>
          </div>
        )}

        <div style={{ display: 'grid', gap: 10 }}>
          {clicks.map((c) => (
            <div key={c.id} style={{ background: '#FBF3E0', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <div style={{ fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 14, color: '#1D1D1D' }}>{fmtDate(c.clickedAt)}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4, fontSize: 13, color: '#8a6d3b' }}>
                  <span>📱 {parseDevice(c.userAgent)}</span>
                  <span>🌐 {c.ip || 'desconocida'}</span>
                </div>
              </div>
              <button
                type="button"
                title="Eliminar este clic (no lo contará en las estadísticas)"
                onClick={() => onDelete(c)}
                style={{ flex: '0 0 auto', width: 30, height: 30, border: 'none', borderRadius: 8, background: '#FBE0E3', color: '#C1121F', cursor: 'pointer', fontSize: 13 }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={onClose} style={{ width: '100%', marginTop: 18, background: '#F3EAD6', color: '#8a6d3b', border: 'none', borderRadius: 999, padding: 13, fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
