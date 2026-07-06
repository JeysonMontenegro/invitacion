import { useCountdown } from '../../hooks/useCountdown.js';
import RsvpCard from './RsvpCard.jsx';

const TARGET = new Date('2026-08-08T08:00:00').getTime();

export default function PublicInvitation({ guest, token, loading, notFound, onGoLogin, photoUrl, rsvpDeadline, isClosed }) {
  const cd = useCountdown(TARGET);
  const personalized = !!guest;

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", color: '#1D1D1D', minHeight: '100vh', overflowX: 'hidden' }}>
      <div style={{ position: 'relative', background: 'radial-gradient(1200px 600px at 50% -10%, #FFE7A6 0%, rgba(255,231,166,0) 60%), linear-gradient(180deg, #FFF7E9 0%, #FFF1D6 55%, #FDEFE6 100%)', overflow: 'hidden', paddingBottom: 60 }}>

        {/* floating decorations */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '8%', left: '6%', width: 44, height: 56, borderRadius: '50%', background: 'linear-gradient(160deg,#E51937,#C1121F)', animation: 'floatYbig 7s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '14%', right: '8%', width: 40, height: 52, borderRadius: '50%', background: 'linear-gradient(160deg,#FFD100,#F5B700)', animation: 'floatYbig 6s ease-in-out infinite .6s' }} />
          <div style={{ position: 'absolute', top: '30%', left: '3%', width: 34, height: 44, borderRadius: '50%', background: 'linear-gradient(160deg,#2b2b2b,#111)', animation: 'floatY 8s ease-in-out infinite .3s' }} />
          <div style={{ position: 'absolute', top: '4%', left: '46%', width: 14, height: 14, borderRadius: 3, background: '#E51937', animation: 'confetti 9s linear infinite' }} />
          <div style={{ position: 'absolute', top: 0, left: '22%', width: 12, height: 12, borderRadius: '50%', background: '#FFD100', animation: 'confetti 7s linear infinite 1s' }} />
          <div style={{ position: 'absolute', top: 0, left: '70%', width: 12, height: 12, borderRadius: 3, background: '#1D1D1D', animation: 'confetti 10s linear infinite 2s' }} />
          <div style={{ position: 'absolute', top: 0, left: '84%', width: 14, height: 14, borderRadius: '50%', background: '#E51937', animation: 'confetti 8s linear infinite .4s' }} />
          <div style={{ position: 'absolute', top: 0, left: '12%', width: 12, height: 12, borderRadius: 3, background: '#FFD100', animation: 'confetti 11s linear infinite 3s' }} />
          <div style={{ position: 'absolute', top: 0, left: '58%', width: 12, height: 12, borderRadius: '50%', background: '#1D1D1D', animation: 'confetti 9s linear infinite 1.6s' }} />
          <div style={{ position: 'absolute', top: '22%', right: '4%', fontSize: 26, animation: 'floatY 6.5s ease-in-out infinite .2s' }}>⭐</div>
          <div style={{ position: 'absolute', top: '40%', left: '8%', fontSize: 20, animation: 'floatY 7.5s ease-in-out infinite 1.2s' }}>✨</div>
        </div>

        {/* HERO */}
        <div style={{ position: 'relative', maxWidth: 620, margin: '0 auto', padding: '44px 22px 8px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1D1D1D', color: '#FFD100', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 14, letterSpacing: '.14em', textTransform: 'uppercase', padding: '8px 18px', borderRadius: 999, animation: 'popIn .6s ease both' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#E51937', display: 'inline-block' }} />
            Mi primer añito
          </div>

          <div style={{ position: 'relative', width: 224, height: 224, margin: '26px auto 8px', animation: 'popIn .7s ease both .1s' }}>
            <div style={{ position: 'absolute', top: -34, left: -8, width: 104, height: 104, borderRadius: '50%', background: '#1D1D1D', boxShadow: '0 8px 18px rgba(0,0,0,.18)' }} />
            <div style={{ position: 'absolute', top: -34, right: -8, width: 104, height: 104, borderRadius: '50%', background: '#1D1D1D', boxShadow: '0 8px 18px rgba(0,0,0,.18)' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: photoUrl ? '#fff' : 'repeating-linear-gradient(135deg,#FFE7A6 0 14px,#FFDF8C 14px 28px)', border: '7px solid #1D1D1D', boxShadow: '0 16px 34px rgba(0,0,0,.16)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {photoUrl ? (
                <img src={photoUrl} alt="Pablo Antonio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  <div style={{ fontSize: 44 }}>👶</div>
                  <div style={{ fontFamily: "'Baloo 2'", fontWeight: 700, color: '#C1121F', fontSize: 16, marginTop: 2 }}>Pablo Antonio</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#8a6d3b', marginTop: 2 }}>[ foto del bebé ]</div>
                </>
              )}
            </div>
            <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', width: 44, height: 24, borderRadius: '50%', background: '#E51937', boxShadow: '0 4px 10px rgba(229,25,55,.4)' }} />
          </div>

          <div style={{ fontFamily: "'Fredoka'", fontWeight: 700, color: '#8a6d3b', fontSize: 'clamp(19px,5vw,24px)', letterSpacing: '.02em', marginTop: 12, animation: 'fadeUp .7s ease both .1s' }}>
            Pablo Antonio Montenegro Casados
          </div>

          <h1 style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 'clamp(34px, 9vw, 56px)', lineHeight: 1.02, margin: '10px 0 4px', color: '#E51937', textShadow: '0 3px 0 rgba(0,0,0,.06)', animation: 'fadeUp .7s ease both .15s' }}>
            ¡Pablo Antonio<br />cumple <span style={{ color: '#1D1D1D' }}>1 año!</span>
          </h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, margin: '6px 0 0', animation: 'fadeUp .7s ease both .2s' }}>
            <span style={{ height: 2, width: 26, background: '#FFD100', borderRadius: 2 }} />
            <span style={{ fontFamily: "'Fredoka'", fontWeight: 500, color: '#C1121F', letterSpacing: '.05em' }}>🎉 ¡Estás invitado! 🎈</span>
            <span style={{ height: 2, width: 26, background: '#FFD100', borderRadius: 2 }} />
          </div>
          <p style={{ fontFamily: "'Nunito'", fontSize: 'clamp(16px,4.4vw,19px)', color: '#5b4a3a', maxWidth: 440, margin: '14px auto 0', lineHeight: 1.5, animation: 'fadeUp .7s ease both .25s' }}>
            Nos encantaría que nos acompañes a celebrar este día tan especial.
          </p>

          {personalized && (
            <div style={{ margin: '20px auto 0', maxWidth: 440, background: '#fff', border: '2px dashed #FFD100', borderRadius: 20, padding: '14px 18px', boxShadow: '0 8px 22px rgba(0,0,0,.06)', animation: 'popIn .6s ease both .3s' }}>
              <span style={{ fontFamily: "'Fredoka'", color: '#1D1D1D' }}>Invitación especial para </span>
              <span style={{ fontFamily: "'Baloo 2'", fontWeight: 700, color: '#E51937' }}>{guest.name}</span> 💌
            </div>
          )}

          <a href="#rsvp" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 26, background: '#E51937', color: '#fff', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 18, textDecoration: 'none', padding: '16px 30px', borderRadius: 999, animation: 'pulseBtn 2.4s ease-in-out infinite', border: '3px solid #FFD100' }}>
            Confirmar asistencia
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#FFD100', color: '#1D1D1D', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>✓</span>
          </a>
        </div>

        {/* COUNTDOWN */}
        <div style={{ position: 'relative', maxWidth: 620, margin: '46px auto 0', padding: '0 22px' }}>
          <div style={{ background: 'linear-gradient(160deg,#1D1D1D,#2a2a2a)', borderRadius: 28, padding: '26px 20px 28px', textAlign: 'center', boxShadow: '0 20px 44px rgba(0,0,0,.22)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(229,25,55,.25)' }} />
            <div style={{ position: 'absolute', bottom: -24, right: -24, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,209,0,.18)' }} />
            <div style={{ fontFamily: "'Fredoka'", color: '#FFD100', letterSpacing: '.14em', textTransform: 'uppercase', fontSize: 13, position: 'relative' }}>Cuenta regresiva</div>
            {cd.isPast && (
              <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, color: '#fff', fontSize: 26, marginTop: 10, position: 'relative' }}>🎂 ¡Ya lo celebramos! 🎉</div>
            )}
            {cd.isUpcoming && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 16, position: 'relative' }}>
                {[['Días', cd.days], ['Horas', cd.hours], ['Min', cd.mins], ['Seg', cd.secs]].map(([label, value]) => (
                  <div key={label} style={{ background: '#fff', borderRadius: 18, padding: '14px 6px' }}>
                    <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 'clamp(26px,8vw,40px)', color: '#E51937', lineHeight: 1 }}>{value}</div>
                    <div style={{ fontFamily: "'Fredoka'", fontSize: 12, color: '#8a6d3b', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* EVENT DETAILS */}
        <div style={{ maxWidth: 620, margin: '40px auto 0', padding: '0 22px' }}>
          <h2 style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 28, textAlign: 'center', color: '#1D1D1D', margin: '0 0 6px' }}>Detalles del evento</h2>
          <p style={{ textAlign: 'center', color: '#8a6d3b', margin: '0 0 22px', fontSize: 15 }}>Toma nota para no perderte la fiesta 🎈</p>

          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 22, padding: '18px 20px', boxShadow: '0 10px 26px rgba(0,0,0,.06)', border: '1px solid #FFE9C2' }}>
              <div style={{ flex: '0 0 auto', width: 56, height: 56, borderRadius: '50%', background: '#FFF1D6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>📅</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: "'Fredoka'", textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 12, color: '#C1121F' }}>Fecha</div>
                <div style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 19, color: '#1D1D1D' }}>Sábado 8 de agosto de 2026</div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 22, padding: '18px 20px', boxShadow: '0 10px 26px rgba(0,0,0,.06)', border: '1px solid #FFE9C2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: '0 0 auto', width: 56, height: 56, borderRadius: '50%', background: '#FFF1D6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>⛪</div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontFamily: "'Fredoka'", textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 12, color: '#C1121F' }}>Bautizo · 8:00 a. m.</div>
                  <div style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 19, color: '#1D1D1D' }}>Parroquia Cristo Rey</div>
                  <div style={{ color: '#8a6d3b', fontSize: 14 }}>Zona 15, Ciudad de Guatemala</div>
                </div>
              </div>
              <a href="https://www.google.com/maps/search/?api=1&query=Parroquia+Cristo+Rey+Zona+15+Guatemala" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, background: '#FFF1D6', color: '#1D1D1D', textDecoration: 'none', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 14, padding: 12, borderRadius: 999 }}>
                🗺️ Ubicación de la parroquia
              </a>
            </div>

            <div style={{ background: '#fff', borderRadius: 22, padding: '18px 20px', boxShadow: '0 10px 26px rgba(0,0,0,.06)', border: '1px solid #FFE9C2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: '0 0 auto', width: 56, height: 56, borderRadius: '50%', background: '#FFF1D6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🎂</div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontFamily: "'Fredoka'", textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 12, color: '#C1121F' }}>Fiesta · 9:30 a. m. a 12:30 p. m.</div>
                  <div style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 19, color: '#1D1D1D' }}>Museo de los Niños</div>
                  <div style={{ color: '#8a6d3b', fontSize: 14 }}>Zona 13, Ciudad de Guatemala</div>
                </div>
              </div>
              <a href="https://www.google.com/maps/search/?api=1&query=Museo+de+los+Ni%C3%B1os+Zona+13+Guatemala" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, background: '#1D1D1D', color: '#fff', textDecoration: 'none', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 14, padding: 12, borderRadius: 999 }}>
                🗺️ Ubicación del museo
              </a>
            </div>
          </div>
        </div>

        {/* RSVP */}
        <RsvpCard guest={guest} token={token} loading={loading} notFound={notFound} rsvpDeadline={rsvpDeadline} isClosed={isClosed} />

        {/* FOOTER */}
        <div style={{ textAlign: 'center', marginTop: 44, padding: '0 22px' }}>
          <div style={{ fontFamily: "'Baloo 2'", fontWeight: 700, color: '#E51937', fontSize: 20 }}>Con mucho cariño,</div>
          <div style={{ fontFamily: "'Fredoka'", color: '#8a6d3b', marginTop: 2 }}>la familia de Pablo Antonio 💛</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#1D1D1D' }} />
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#1D1D1D' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#1D1D1D' }} />
          </div>
          <button type="button" onClick={onGoLogin} style={{ marginTop: 26, background: 'none', border: 'none', color: '#c9b48c', fontFamily: "'Nunito'", fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
            Panel de administración
          </button>
        </div>
      </div>
    </div>
  );
}
