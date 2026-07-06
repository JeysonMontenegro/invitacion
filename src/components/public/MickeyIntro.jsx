import { useEffect, useState } from 'react';

const SESSION_KEY = 'pablo_invite_intro_shown_v1';
const OPEN_DELAY_MS = 950;
const OVERLAY_FADE_MS = 700;
const TOTAL_MS = OPEN_DELAY_MS + OVERLAY_FADE_MS + 200;

export default function MickeyIntro() {
  const [visible, setVisible] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) !== '1';
    } catch (e) {
      return true;
    }
  });
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!visible) return undefined;
    const openTimer = setTimeout(() => setOpening(true), OPEN_DELAY_MS);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch (e) {
        /* ignore */
      }
    }, TOTAL_MS);
    return () => {
      clearTimeout(openTimer);
      clearTimeout(hideTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      onClick={() => setOpening(true)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: '#1D1D1D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
        animation: opening ? `mickeyOverlayOut ${OVERLAY_FADE_MS}ms ease forwards` : 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 190,
          height: 190,
          animation: 'mickeyPopIn .6s cubic-bezier(.34,1.56,.64,1) both',
        }}
      >
        <div
          style={{
            position: 'absolute', top: -54, left: -32, width: 100, height: 100, borderRadius: '50%',
            background: '#1D1D1D', border: '5px solid #2a2a2a', boxShadow: '0 10px 26px rgba(0,0,0,.5)',
            animation: opening ? 'mickeyEarOpenLeft .75s ease forwards' : 'none',
          }}
        />
        <div
          style={{
            position: 'absolute', top: -54, right: -32, width: 100, height: 100, borderRadius: '50%',
            background: '#1D1D1D', border: '5px solid #2a2a2a', boxShadow: '0 10px 26px rgba(0,0,0,.5)',
            animation: opening ? 'mickeyEarOpenRight .75s ease forwards' : 'none',
          }}
        />
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(160deg,#E51937,#C1121F)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            boxShadow: '0 14px 34px rgba(0,0,0,.4)', border: '4px solid #FFD100',
            animation: opening ? 'mickeyFaceOpen .65s ease forwards' : 'none',
          }}
        >
          <div>
            <div style={{ fontSize: 30 }}>🎉</div>
            <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, color: '#FFD100', fontSize: 14, marginTop: 2, lineHeight: 1.2 }}>
              ¡Mi primer<br />añito!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
