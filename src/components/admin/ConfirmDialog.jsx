export default function ConfirmDialog({ title, message, confirmLabel = 'Eliminar', cancelLabel = 'Cancelar', onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(29,29,29,.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0 }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: '26px 26px 0 0', padding: '24px 22px 28px', boxShadow: '0 -10px 40px rgba(0,0,0,.25)', animation: 'fadeUp .3s ease both', textAlign: 'center' }}>
        <div style={{ width: 46, height: 5, borderRadius: 3, background: '#EBDFC4', margin: '0 auto 18px' }} />
        <div style={{ width: 64, height: 64, margin: '0 auto 14px', borderRadius: '50%', background: '#FBE0E3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🗑️</div>
        <h2 style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 20, margin: '0 0 8px', color: '#1D1D1D' }}>{title}</h2>
        <p style={{ color: '#8a6d3b', fontSize: 14, margin: '0 0 22px', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onCancel} style={{ flex: 1, background: '#F3EAD6', color: '#8a6d3b', border: 'none', borderRadius: 999, padding: 13, fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} style={{ flex: 1, background: '#C1121F', color: '#fff', border: 'none', borderRadius: 999, padding: 13, fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
