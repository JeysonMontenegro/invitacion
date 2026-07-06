import { useEffect, useRef, useState } from 'react';
import { fetchAdminSettings, updateRsvpDeadline, uploadPabloPhoto } from '../../lib/guestsApi.js';

function PhotoPreview({ photoUrl }) {
  return (
    <div style={{ position: 'relative', width: 160, height: 160, margin: '10px auto 4px' }}>
      <div style={{ position: 'absolute', top: -24, left: -6, width: 74, height: 74, borderRadius: '50%', background: '#1D1D1D', boxShadow: '0 8px 18px rgba(0,0,0,.18)' }} />
      <div style={{ position: 'absolute', top: -24, right: -6, width: 74, height: 74, borderRadius: '50%', background: '#1D1D1D', boxShadow: '0 8px 18px rgba(0,0,0,.18)' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: photoUrl ? '#fff' : 'repeating-linear-gradient(135deg,#FFE7A6 0 14px,#FFDF8C 14px 28px)', border: '5px solid #1D1D1D', boxShadow: '0 16px 34px rgba(0,0,0,.16)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {photoUrl ? (
          <img src={photoUrl} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <>
            <div style={{ fontSize: 32 }}>👶</div>
            <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#8a6d3b', marginTop: 2 }}>[ sin foto ]</div>
          </>
        )}
      </div>
      <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 32, height: 18, borderRadius: '50%', background: '#E51937', boxShadow: '0 4px 10px rgba(229,25,55,.4)' }} />
    </div>
  );
}

export default function SettingsModal({ onClose, showToast }) {
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [deadline, setDeadline] = useState('');
  const [uploading, setUploading] = useState(false);
  const [savingDeadline, setSavingDeadline] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAdminSettings()
      .then((s) => {
        setPhotoUrl(s.photoUrl);
        setDeadline(s.rsvpDeadline || '');
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (e.target) e.target.value = '';
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploading(true);
    try {
      const url = await uploadPabloPhoto(file);
      setPhotoUrl(`${url}?v=${Date.now()}`);
      showToast('✅ Foto actualizada');
    } catch (err) {
      showToast('⚠️ No se pudo subir la foto');
    } finally {
      setUploading(false);
      setPreviewUrl(null);
      URL.revokeObjectURL(localUrl);
    }
  }

  async function handleSaveDeadline() {
    setSavingDeadline(true);
    try {
      await updateRsvpDeadline(deadline || null);
      showToast('✅ Fecha límite guardada');
    } catch (err) {
      showToast('⚠️ No se pudo guardar la fecha');
    } finally {
      setSavingDeadline(false);
    }
  }

  let isPastDeadline = false;
  if (deadline) {
    const cutoff = new Date(`${deadline}T00:00:00`);
    cutoff.setDate(cutoff.getDate() + 1);
    isPastDeadline = new Date() >= cutoff;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(29,29,29,.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: '#fff', borderRadius: '26px 26px 0 0', padding: '24px 22px 30px', boxShadow: '0 -10px 40px rgba(0,0,0,.2)', animation: 'fadeUp .3s ease both', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ width: 46, height: 5, borderRadius: 3, background: '#EBDFC4', margin: '0 auto 18px' }} />
        <h2 style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 22, margin: '0 0 18px', color: '#1D1D1D', textAlign: 'center' }}>⚙️ Configuración</h2>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#a08a63', padding: '30px 0', fontFamily: "'Fredoka'" }}>Cargando...</div>
        ) : (
          <div style={{ display: 'grid', gap: 24 }}>
            <div>
              <span style={{ display: 'block', fontFamily: "'Fredoka'", fontSize: 13, color: '#8a6d3b', marginBottom: 4, textAlign: 'center' }}>Foto de Pablo Antonio</span>
              <p style={{ textAlign: 'center', color: '#a08a63', fontSize: 12, margin: '0 0 6px' }}>Así se verá en la tarjeta de la invitación</p>
              <PhotoPreview photoUrl={previewUrl || photoUrl} />
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{ display: 'block', margin: '14px auto 0', background: '#1D1D1D', color: '#FFD100', border: 'none', borderRadius: 999, padding: '11px 20px', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 14, cursor: uploading ? 'wait' : 'pointer' }}
              >
                {uploading ? 'Subiendo...' : (photoUrl ? '📷 Cambiar foto' : '📷 Subir foto')}
              </button>
            </div>

            <div style={{ borderTop: '1px solid #F3EAD6', paddingTop: 20 }}>
              <span style={{ display: 'block', fontFamily: "'Fredoka'", fontSize: 13, color: '#8a6d3b', marginBottom: 6 }}>Fecha límite para confirmar</span>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                style={{ width: '100%', border: '2px solid #EFE3C7', borderRadius: 12, padding: '12px 14px', fontFamily: "'Nunito'", fontSize: 15, outline: 'none' }}
              />
              <p style={{ color: '#a08a63', fontSize: 12, margin: '8px 0 0', lineHeight: 1.5 }}>
                A partir de las 00:00 del día siguiente, la invitación se cierra automáticamente y deja de aceptar confirmaciones.
                {deadline && (isPastDeadline
                  ? ' ⏰ Esta fecha ya pasó — el formulario está cerrado ahora mismo.'
                  : ' ✅ El formulario sigue abierto.')}
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                {deadline && (
                  <button type="button" onClick={() => setDeadline('')} style={{ flex: 1, background: '#F3EAD6', color: '#8a6d3b', border: 'none', borderRadius: 999, padding: 13, fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                    Quitar fecha
                  </button>
                )}
                <button type="button" onClick={handleSaveDeadline} disabled={savingDeadline} style={{ flex: 2, background: '#E51937', color: '#fff', border: 'none', borderRadius: 999, padding: 13, fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 14, cursor: savingDeadline ? 'wait' : 'pointer' }}>
                  {savingDeadline ? 'Guardando...' : 'Guardar fecha'}
                </button>
              </div>
            </div>
          </div>
        )}

        <button type="button" onClick={onClose} style={{ width: '100%', marginTop: 22, background: 'none', border: 'none', color: '#c9b48c', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
