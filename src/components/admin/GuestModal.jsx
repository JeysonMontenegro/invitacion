import { useEffect, useState } from 'react';
import { segStyle } from '../../lib/adminStyles.js';

const emptyForm = { name: '', phone: '', adults: 1, children: 0, status: 'pending', comments: '', message: '' };

export default function GuestModal({ guest, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (guest) {
      setForm({
        name: guest.name || '',
        phone: guest.phone || '',
        adults: (guest.confirmedAdults != null ? guest.confirmedAdults : guest.expectedAdults) || 0,
        children: (guest.confirmedChildren != null ? guest.confirmedChildren : guest.expectedChildren) || 0,
        status: guest.status || 'pending',
        comments: guest.comments || '',
        message: guest.message || '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [guest]);

  const clamp = (n) => Math.max(0, Math.min(30, n));

  async function handleSave() {
    const name = form.name.trim();
    if (!name) {
      setError('El nombre es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      const attending = form.status === 'attending';
      const notAtt = form.status === 'not_attending';
      await onSave({
        name,
        phone: form.phone,
        expectedAdults: form.adults,
        expectedChildren: form.children,
        confirmedAdults: attending ? form.adults : (notAtt ? 0 : (guest?.confirmedAdults ?? null)),
        confirmedChildren: attending ? form.children : (notAtt ? 0 : (guest?.confirmedChildren ?? null)),
        status: form.status,
        comments: form.comments,
        message: form.message,
        confirmedAt: (attending || notAtt) ? (guest?.confirmedAt || Date.now()) : (guest?.confirmedAt ?? null),
      });
    } catch (e) {
      setError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(29,29,29,.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: '#fff', borderRadius: '26px 26px 0 0', padding: '24px 22px 30px', boxShadow: '0 -10px 40px rgba(0,0,0,.2)', animation: 'fadeUp .3s ease both', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ width: 46, height: 5, borderRadius: 3, background: '#EBDFC4', margin: '0 auto 18px' }} />
        <h2 style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 22, margin: '0 0 18px', color: '#1D1D1D' }}>{guest ? 'Editar invitado' : 'Nuevo invitado'}</h2>
        <div style={{ display: 'grid', gap: 14 }}>
          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', fontFamily: "'Fredoka'", fontSize: 13, color: '#8a6d3b', marginBottom: 6 }}>Nombre del invitado *</span>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Familia Pérez" style={{ width: '100%', border: '2px solid #EFE3C7', borderRadius: 12, padding: '12px 14px', fontFamily: "'Nunito'", fontSize: 15, outline: 'none' }} />
          </label>
          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', fontFamily: "'Fredoka'", fontSize: 13, color: '#8a6d3b', marginBottom: 6 }}>Teléfono / WhatsApp</span>
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} inputMode="tel" placeholder="Ej: 5555 5555" style={{ width: '100%', border: '2px solid #EFE3C7', borderRadius: 12, padding: '12px 14px', fontFamily: "'Nunito'", fontSize: 15, outline: 'none' }} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <span style={{ display: 'block', fontFamily: "'Fredoka'", fontSize: 13, color: '#8a6d3b', marginBottom: 6 }}>Adultos esperados</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '2px solid #EFE3C7', borderRadius: 12, padding: 5 }}>
                <button type="button" onClick={() => setForm((f) => ({ ...f, adults: clamp(f.adults - 1) }))} style={{ width: 32, height: 32, border: 'none', borderRadius: 8, background: '#FFF1D6', color: '#C1121F', fontSize: 19, fontWeight: 700, cursor: 'pointer' }}>−</button>
                <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 19 }}>{form.adults}</span>
                <button type="button" onClick={() => setForm((f) => ({ ...f, adults: clamp(f.adults + 1) }))} style={{ width: 32, height: 32, border: 'none', borderRadius: 8, background: '#FFD100', color: '#1D1D1D', fontSize: 19, fontWeight: 700, cursor: 'pointer' }}>+</button>
              </div>
            </div>
            <div>
              <span style={{ display: 'block', fontFamily: "'Fredoka'", fontSize: 13, color: '#8a6d3b', marginBottom: 6 }}>Niños esperados</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '2px solid #EFE3C7', borderRadius: 12, padding: 5 }}>
                <button type="button" onClick={() => setForm((f) => ({ ...f, children: clamp(f.children - 1) }))} style={{ width: 32, height: 32, border: 'none', borderRadius: 8, background: '#FFF1D6', color: '#C1121F', fontSize: 19, fontWeight: 700, cursor: 'pointer' }}>−</button>
                <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 19 }}>{form.children}</span>
                <button type="button" onClick={() => setForm((f) => ({ ...f, children: clamp(f.children + 1) }))} style={{ width: 32, height: 32, border: 'none', borderRadius: 8, background: '#FFD100', color: '#1D1D1D', fontSize: 19, fontWeight: 700, cursor: 'pointer' }}>+</button>
              </div>
            </div>
          </div>
          <div>
            <span style={{ display: 'block', fontFamily: "'Fredoka'", fontSize: 13, color: '#8a6d3b', marginBottom: 6 }}>Estado de asistencia</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              <button type="button" onClick={() => setForm((f) => ({ ...f, status: 'pending' }))} style={segStyle(form.status === 'pending', '#C9A227')}>Pendiente</button>
              <button type="button" onClick={() => setForm((f) => ({ ...f, status: 'attending' }))} style={segStyle(form.status === 'attending', '#1E9E5A')}>Asistirá</button>
              <button type="button" onClick={() => setForm((f) => ({ ...f, status: 'not_attending' }))} style={segStyle(form.status === 'not_attending', '#C1121F')}>No asistirá</button>
            </div>
          </div>
          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', fontFamily: "'Fredoka'", fontSize: 13, color: '#8a6d3b', marginBottom: 6 }}>💌 Mensaje para Pablito</span>
            <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={2} placeholder="Mensaje que dejó el invitado" style={{ width: '100%', border: '2px solid #EFE3C7', borderRadius: 12, padding: '12px 14px', fontFamily: "'Nunito'", fontSize: 15, outline: 'none', resize: 'vertical' }} />
          </label>
          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', fontFamily: "'Fredoka'", fontSize: 13, color: '#8a6d3b', marginBottom: 6 }}>Comentarios / notas internas</span>
            <textarea value={form.comments} onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))} rows={2} placeholder="Notas internas o de logística" style={{ width: '100%', border: '2px solid #EFE3C7', borderRadius: 12, padding: '12px 14px', fontFamily: "'Nunito'", fontSize: 15, outline: 'none', resize: 'vertical' }} />
          </label>
          {!!error && (
            <div style={{ color: '#C1121F', fontSize: 13, fontFamily: "'Fredoka'" }}>⚠️ {error}</div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, background: '#F3EAD6', color: '#8a6d3b', border: 'none', borderRadius: 999, padding: 13, fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Cancelar</button>
            <button type="button" onClick={handleSave} disabled={saving} style={{ flex: 2, background: '#E51937', color: '#fff', border: 'none', borderRadius: 999, padding: 13, fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, cursor: saving ? 'wait' : 'pointer' }}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
