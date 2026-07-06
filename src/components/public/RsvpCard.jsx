import { useEffect, useState } from 'react';
import { submitRsvp } from '../../lib/guestsApi.js';

function rsvpSeg(active, bg) {
  return {
    padding: '14px 8px',
    borderRadius: 14,
    border: 'none',
    fontFamily: "'Fredoka'",
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    background: active ? bg : 'rgba(255,255,255,.16)',
    color: active ? '#1D1D1D' : '#fff',
    boxShadow: active ? '0 6px 16px rgba(0,0,0,.15)' : 'none',
  };
}

export default function RsvpCard({ guest, token, loading, notFound }) {
  const personalized = !!guest;
  const maxAdults = guest?.expectedAdults ?? 0;
  const maxChildren = guest?.expectedChildren ?? 0;

  const [status, setStatus] = useState('attending');
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!guest) return;
    setStatus(guest.status === 'not_attending' ? 'not_attending' : 'attending');
    setAdults(Math.min(guest.expectedAdults, guest.confirmedAdults ?? guest.expectedAdults));
    setChildren(Math.min(guest.expectedChildren, guest.confirmedChildren ?? guest.expectedChildren));
    setMessage(guest.message || '');
  }, [guest]);

  const isAttendingForm = status === 'attending';

  async function handleSubmit() {
    setFormError('');
    setSubmitting(true);
    try {
      await submitRsvp(token, {
        status,
        adults: status === 'attending' ? adults : 0,
        children: status === 'attending' ? children : 0,
        message,
        comments: guest?.comments || '',
      });
      setSubmitted(true);
    } catch (e) {
      setFormError('No se pudo guardar tu confirmación. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  const submitBtnStyle = {
    width: '100%',
    marginTop: 4,
    background: '#FFD100',
    color: '#1D1D1D',
    border: 'none',
    borderRadius: 999,
    padding: 17,
    fontFamily: "'Fredoka'",
    fontWeight: 700,
    fontSize: 18,
    cursor: submitting ? 'wait' : 'pointer',
    boxShadow: '0 10px 24px rgba(0,0,0,.18)',
    opacity: submitting ? 0.8 : 1,
  };

  const thankMessage = status === 'attending'
    ? 'Nos alegra mucho compartir este día contigo. ¡Te esperamos con globos y pastel! 🎂'
    : 'Lamentamos que no puedas acompañarnos. ¡Gracias por avisarnos con cariño! 💛';

  const maxAdultsLabel = personalized ? `Máximo ${maxAdults} ${maxAdults === 1 ? 'adulto' : 'adultos'}` : 'Indica cuántos asistirán';
  const maxChildrenLabel = personalized ? (maxChildren > 0 ? `Máximo ${maxChildren} ${maxChildren === 1 ? 'niño' : 'niños'}` : 'Sin cupo de niños') : 'Indica cuántos asistirán';

  return (
    <div id="rsvp" style={{ maxWidth: 620, margin: '46px auto 0', padding: '0 22px', scrollMarginTop: 20 }}>
      <div style={{ background: 'linear-gradient(160deg,#E51937,#C1121F)', borderRadius: 30, padding: '30px 22px', boxShadow: '0 22px 46px rgba(229,25,55,.28)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
        <div style={{ position: 'absolute', top: -10, right: 14, width: 44, height: 44, borderRadius: '50%', background: '#1D1D1D' }} />
        <div style={{ position: 'absolute', top: -10, right: 64, width: 44, height: 44, borderRadius: '50%', background: '#1D1D1D' }} />

        {!submitted && (
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontFamily: "'Baloo 2'", fontWeight: 800, color: '#fff', fontSize: 27, textAlign: 'center', margin: '0 0 4px' }}>Confirma tu asistencia</h2>
            <p style={{ textAlign: 'center', color: '#FFE7A6', margin: '0 0 10px', fontSize: 15 }}>Ayúdanos a preparar todo para recibirte 🎁</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0 auto 20px', background: '#FFD100', color: '#1D1D1D', width: 'fit-content', padding: '8px 16px', borderRadius: 999, fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 14 }}>
              🗓️ Confirma antes del 28 de julio
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              {!personalized && (
                <div style={{ background: 'rgba(255,255,255,.14)', borderRadius: 16, padding: '20px 18px', textAlign: 'center' }}>
                  <div style={{ fontSize: 34 }}>💌</div>
                  <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, color: '#fff', fontSize: 19, marginTop: 6 }}>Abre tu invitación personal</div>
                  <div style={{ fontFamily: "'Nunito'", color: '#FFE7A6', fontSize: 14, marginTop: 6, lineHeight: 1.5 }}>
                    {loading ? 'Cargando tu invitación...' : notFound
                      ? 'No encontramos esta invitación. Verifica el enlace que te enviamos por WhatsApp 💛'
                      : 'Para confirmar, entra desde el enlace personalizado que te enviamos por WhatsApp 💛'}
                  </div>
                </div>
              )}

              {personalized && (
                <>
                  <div style={{ background: 'rgba(255,255,255,.14)', borderRadius: 16, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Fredoka'", color: '#fff', fontSize: 15 }}>¡Hola,</div>
                    <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, color: '#FFD100', fontSize: 24, lineHeight: 1.1, marginTop: 2 }}>{guest.name}! 👋</div>
                    {!!(guest.phone && guest.phone.trim()) && (
                      <div style={{ fontFamily: "'Nunito'", color: '#FFE7A6', fontSize: 14, marginTop: 6 }}>📱 WhatsApp: {guest.phone}</div>
                    )}
                  </div>

                  <div>
                    <span style={{ display: 'block', fontFamily: "'Fredoka'", color: '#fff', fontSize: 14, marginBottom: 8 }}>¿Nos acompañarás? *</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <button type="button" onClick={() => setStatus('attending')} style={rsvpSeg(status === 'attending', '#FFD100')}>✅ Sí asistiré</button>
                      <button type="button" onClick={() => setStatus('not_attending')} style={rsvpSeg(status === 'not_attending', '#fff')}>😔 No podré</button>
                    </div>
                  </div>

                  {isAttendingForm && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={{ background: 'rgba(255,255,255,.14)', borderRadius: 16, padding: 12 }}>
                        <span style={{ display: 'block', fontFamily: "'Fredoka'", color: '#fff', fontSize: 13, textAlign: 'center', marginBottom: 8 }}>👤 Adultos</span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 12, padding: 6 }}>
                          <button type="button" onClick={() => setAdults((n) => Math.max(0, n - 1))} style={{ width: 34, height: 34, border: 'none', borderRadius: 9, background: '#FFF1D6', color: '#C1121F', fontSize: 20, fontWeight: 700, cursor: 'pointer' }}>−</button>
                          <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 22, color: '#1D1D1D' }}>{adults}</span>
                          <button type="button" onClick={() => setAdults((n) => Math.min(maxAdults, n + 1))} style={{ width: 34, height: 34, border: 'none', borderRadius: 9, background: '#FFD100', color: '#1D1D1D', fontSize: 20, fontWeight: 700, cursor: 'pointer' }}>+</button>
                        </div>
                        <div style={{ textAlign: 'center', fontFamily: "'Fredoka'", color: '#FFE7A6', fontSize: 11, marginTop: 6 }}>{maxAdultsLabel}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,.14)', borderRadius: 16, padding: 12 }}>
                        <span style={{ display: 'block', fontFamily: "'Fredoka'", color: '#fff', fontSize: 13, textAlign: 'center', marginBottom: 8 }}>🧒 Niños</span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 12, padding: 6 }}>
                          <button type="button" onClick={() => setChildren((n) => Math.max(0, n - 1))} style={{ width: 34, height: 34, border: 'none', borderRadius: 9, background: '#FFF1D6', color: '#C1121F', fontSize: 20, fontWeight: 700, cursor: 'pointer' }}>−</button>
                          <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 22, color: '#1D1D1D' }}>{children}</span>
                          <button type="button" onClick={() => setChildren((n) => Math.min(maxChildren, n + 1))} style={{ width: 34, height: 34, border: 'none', borderRadius: 9, background: '#FFD100', color: '#1D1D1D', fontSize: 20, fontWeight: 700, cursor: 'pointer' }}>+</button>
                        </div>
                        <div style={{ textAlign: 'center', fontFamily: "'Fredoka'", color: '#FFE7A6', fontSize: 11, marginTop: 6 }}>{maxChildrenLabel}</div>
                      </div>
                    </div>
                  )}

                  <label style={{ display: 'block' }}>
                    <span style={{ display: 'block', fontFamily: "'Fredoka'", color: '#fff', fontSize: 14, marginBottom: 6 }}>💌 Mensaje para Pablito (opcional)</span>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={2}
                      placeholder="Escríbele unas lindas palabras de cumpleaños..."
                      style={{ width: '100%', border: 'none', borderRadius: 14, padding: '14px 16px', fontFamily: "'Nunito'", fontSize: 16, color: '#1D1D1D', outline: 'none', resize: 'vertical', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}
                    />
                  </label>

                  {!!formError && (
                    <div style={{ background: '#1D1D1D', color: '#FFD100', borderRadius: 12, padding: '12px 14px', fontFamily: "'Fredoka'", fontSize: 14, textAlign: 'center' }}>⚠️ {formError}</div>
                  )}

                  <button type="button" onClick={handleSubmit} disabled={submitting} style={submitBtnStyle}>
                    {submitting ? (
                      <>
                        <span style={{ display: 'inline-block', width: 18, height: 18, border: '3px solid rgba(29,29,29,.25)', borderTopColor: '#1D1D1D', borderRadius: '50%', animation: 'spinSlow .7s linear infinite', verticalAlign: 'middle', marginRight: 8 }} />
                        Enviando...
                      </>
                    ) : '🎉 Confirmar asistencia'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {submitted && (
          <div style={{ position: 'relative', textAlign: 'center', padding: '14px 6px' }}>
            <div style={{ width: 88, height: 88, margin: '0 auto 16px', borderRadius: '50%', background: '#FFD100', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, boxShadow: '0 10px 24px rgba(0,0,0,.2)', animation: 'popIn .6s ease both' }}>🎈</div>
            <h2 style={{ fontFamily: "'Baloo 2'", fontWeight: 800, color: '#fff', fontSize: 26, margin: '0 0 10px' }}>¡Gracias por confirmar!</h2>
            <p style={{ color: '#FFE7A6', fontSize: 16, maxWidth: 360, margin: '0 auto 18px', lineHeight: 1.5 }}>{thankMessage}</p>
            <button type="button" onClick={() => setSubmitted(false)} style={{ background: 'rgba(255,255,255,.16)', color: '#fff', border: '2px solid rgba(255,255,255,.4)', borderRadius: 999, padding: '12px 24px', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
              ✏️ Editar mi respuesta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
