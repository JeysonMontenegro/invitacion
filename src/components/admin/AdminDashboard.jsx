import { useMemo, useRef, useState } from 'react';
import { useGuests } from '../../hooks/useGuests.js';
import { useLinkClicks } from '../../hooks/useLinkClicks.js';
import { createGuest, updateGuest, deleteGuest, bulkInsertGuests, adminSignOut } from '../../lib/guestsApi.js';
import { readWorkbookRows, parseGuestRows, downloadGuestTemplate } from '../../lib/importExcel.js';
import { filterBtnStyle, badgeStyle, statusLabel, fmtDate } from '../../lib/adminStyles.js';
import GuestModal from './GuestModal.jsx';
import ClickLogModal from './ClickLogModal.jsx';
import SettingsModal from './SettingsModal.jsx';

function linkFor(token) {
  return `${location.origin}${location.pathname}?inv=${token}`;
}

function invitationMessage(token) {
  return '¡Hola! 🎉 Estás invitado al primer cumpleaños de Pablo Antonio. Confirma tu asistencia aquí: ' + linkFor(token);
}

export default function AdminDashboard({ onBackPublic }) {
  const { guests, loading } = useGuests(true);
  const clicks = useLinkClicks(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [viewingClicksFor, setViewingClicksFor] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);
  const fileInputRef = useRef(null);

  const clickCounts = useMemo(() => {
    const map = {};
    for (const c of clicks) map[c.guestId] = (map[c.guestId] || 0) + 1;
    return map;
  }, [clicks]);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  }

  async function handleLogout() {
    await adminSignOut();
    onBackPublic();
  }

  function effAdults(g) { return g.status === 'attending' ? (g.confirmedAdults != null ? g.confirmedAdults : (g.expectedAdults || 0)) : 0; }
  function effChildren(g) { return g.status === 'attending' ? (g.confirmedChildren != null ? g.confirmedChildren : (g.expectedChildren || 0)) : 0; }

  const stats = useMemo(() => {
    const attendingGuests = guests.filter((g) => g.status === 'attending');
    const sAdults = attendingGuests.reduce((a, g) => a + effAdults(g), 0);
    const sChildren = attendingGuests.reduce((a, g) => a + effChildren(g), 0);
    const sPending = guests.filter((g) => g.status === 'pending').length;
    const sNo = guests.filter((g) => g.status === 'not_attending').length;
    return { total: guests.length, sAdults, sChildren, sPeople: sAdults + sChildren, sPending, sNo, sAttending: attendingGuests.length };
  }, [guests]);

  const rows = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = guests.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    if (filter === 'attending') list = list.filter((g) => g.status === 'attending');
    else if (filter === 'pending') list = list.filter((g) => g.status === 'pending');
    else if (filter === 'not_attending') list = list.filter((g) => g.status === 'not_attending');
    if (q) list = list.filter((g) => (g.name || '').toLowerCase().includes(q));
    return list;
  }, [guests, filter, search]);

  function openNew() { setEditingGuest(null); setModalOpen(true); }
  function openEdit(g) { setEditingGuest(g); setModalOpen(true); }
  function closeModal() { setModalOpen(false); }

  async function handleSave(formData) {
    if (editingGuest) {
      await updateGuest(editingGuest.id, formData);
    } else {
      await createGuest(formData);
    }
    setModalOpen(false);
    showToast('✅ Invitado guardado');
  }

  async function handleDelete(g) {
    if (!window.confirm(`¿Eliminar a "${g.name}"?`)) return;
    await deleteGuest(g.id);
    showToast('🗑️ Invitado eliminado');
  }

  function copyLink(g) {
    const url = linkFor(g.token);
    try {
      navigator.clipboard.writeText(url).then(
        () => showToast('🔗 ¡Enlace copiado!'),
        () => showToast('🔗 ' + url)
      );
    } catch (e) {
      showToast('🔗 ' + url);
    }
  }

  function whatsapp(g) {
    const text = encodeURIComponent(invitationMessage(g.token));
    const phone = (g.phone || '').replace(/\D/g, '');
    const base = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(base, '_blank');
  }

  function copyMessage(g) {
    const text = invitationMessage(g.token);
    try {
      navigator.clipboard.writeText(text).then(
        () => showToast('📋 ¡Mensaje copiado!'),
        () => showToast('📋 ' + text)
      );
    } catch (e) {
      showToast('📋 ' + text);
    }
  }

  async function handleDownloadTemplate() {
    try {
      await downloadGuestTemplate();
    } catch (e) {
      showToast('⚠️ No se pudo generar la plantilla');
    }
  }

  async function onImportFile(e) {
    const file = e.target.files && e.target.files[0];
    if (e.target) e.target.value = '';
    if (!file) return;
    try {
      const arr = await readWorkbookRows(file);
      const parsed = parseGuestRows(arr);
      if (!parsed.length) {
        showToast('⚠️ No se encontraron filas válidas');
        return;
      }
      await bulkInsertGuests(parsed);
      showToast(`✅ ${parsed.length} invitado(s) importados`);
    } catch (err) {
      showToast('⚠️ No se pudo leer el archivo');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FBF6EC', paddingBottom: 60 }}>
      <div style={{ background: '#1D1D1D', color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20, boxShadow: '0 6px 20px rgba(0,0,0,.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', width: 34, height: 34 }}>
            <div style={{ position: 'absolute', top: -6, left: -2, width: 16, height: 16, borderRadius: '50%', background: '#E51937' }} />
            <div style={{ position: 'absolute', top: -6, right: -2, width: 16, height: 16, borderRadius: '50%', background: '#E51937' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#E51937' }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 17, lineHeight: 1 }}>Panel · Pablo Antonio</div>
            <div style={{ fontSize: 12, color: '#FFD100' }}>Control de invitados</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setSettingsOpen(true)} style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: 'none', borderRadius: 999, padding: '9px 16px', fontFamily: "'Fredoka'", fontSize: 13, cursor: 'pointer' }}>⚙️ Configuración</button>
          <button type="button" onClick={handleLogout} style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: 'none', borderRadius: 999, padding: '9px 16px', fontFamily: "'Fredoka'", fontSize: 13, cursor: 'pointer' }}>Salir</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '22px 18px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 12 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 18, boxShadow: '0 8px 22px rgba(0,0,0,.05)', borderTop: '4px solid #1D1D1D' }}>
            <div style={{ fontSize: 22 }}>📨</div>
            <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 32, color: '#1D1D1D', lineHeight: 1.1 }}>{stats.total}</div>
            <div style={{ color: '#8a6d3b', fontSize: 13, fontFamily: "'Fredoka'" }}>Invitaciones</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, padding: 18, boxShadow: '0 8px 22px rgba(0,0,0,.05)', borderTop: '4px solid #1E9E5A' }}>
            <div style={{ fontSize: 22 }}>🧑‍🤝‍🧑</div>
            <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 32, color: '#1E9E5A', lineHeight: 1.1 }}>{stats.sPeople}</div>
            <div style={{ color: '#8a6d3b', fontSize: 13, fontFamily: "'Fredoka'" }}>Personas confirmadas</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, padding: 18, boxShadow: '0 8px 22px rgba(0,0,0,.05)', borderTop: '4px solid #E51937' }}>
            <div style={{ fontSize: 22 }}>👤</div>
            <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 32, color: '#E51937', lineHeight: 1.1 }}>{stats.sAdults}</div>
            <div style={{ color: '#8a6d3b', fontSize: 13, fontFamily: "'Fredoka'" }}>Adultos confirmados</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, padding: 18, boxShadow: '0 8px 22px rgba(0,0,0,.05)', borderTop: '4px solid #F5B700' }}>
            <div style={{ fontSize: 22 }}>🧒</div>
            <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 32, color: '#C98A00', lineHeight: 1.1 }}>{stats.sChildren}</div>
            <div style={{ color: '#8a6d3b', fontSize: 13, fontFamily: "'Fredoka'" }}>Niños confirmados</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, padding: 18, boxShadow: '0 8px 22px rgba(0,0,0,.05)', borderTop: '4px solid #C9A227' }}>
            <div style={{ fontSize: 22 }}>⏳</div>
            <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 32, color: '#1D1D1D', lineHeight: 1.1 }}>{stats.sPending}</div>
            <div style={{ color: '#8a6d3b', fontSize: 13, fontFamily: "'Fredoka'" }}>Pendientes</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, padding: 18, boxShadow: '0 8px 22px rgba(0,0,0,.05)', borderTop: '4px solid #9aa0a6' }}>
            <div style={{ fontSize: 22 }}>🚫</div>
            <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 32, color: '#6b7075', lineHeight: 1.1 }}>{stats.sNo}</div>
            <div style={{ color: '#8a6d3b', fontSize: 13, fontFamily: "'Fredoka'" }}>No asistirán</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button type="button" onClick={() => setFilter('all')} style={filterBtnStyle(filter === 'all')}>Todos <span style={{ opacity: .7 }}>{stats.total}</span></button>
            <button type="button" onClick={() => setFilter('attending')} style={filterBtnStyle(filter === 'attending')}>Confirmados <span style={{ opacity: .7 }}>{stats.sAttending}</span></button>
            <button type="button" onClick={() => setFilter('pending')} style={filterBtnStyle(filter === 'pending')}>Pendientes <span style={{ opacity: .7 }}>{stats.sPending}</span></button>
            <button type="button" onClick={() => setFilter('not_attending')} style={filterBtnStyle(filter === 'not_attending')}>No asistirán <span style={{ opacity: .7 }}>{stats.sNo}</span></button>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input ref={fileInputRef} id="xlsx-import" type="file" accept=".xlsx,.xls,.csv" onChange={onImportFile} style={{ display: 'none' }} />
            <button type="button" onClick={handleDownloadTemplate} style={{ background: '#fff', color: '#8a6d3b', border: '2px solid #EFE3C7', borderRadius: 999, padding: '11px 18px', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>📥 Plantilla</button>
            <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: '#1D1D1D', color: '#FFD100', border: 'none', borderRadius: 999, padding: '11px 18px', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>📄 Importar Excel</button>
            <button type="button" onClick={openNew} style={{ background: '#E51937', color: '#fff', border: 'none', borderRadius: 999, padding: '11px 20px', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 18px rgba(229,25,55,.3)' }}>+ Agregar</button>
          </div>
        </div>

        <div style={{ marginTop: 14, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔎</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre..." style={{ width: '100%', border: '2px solid #EFE3C7', borderRadius: 14, padding: '13px 16px 13px 42px', fontFamily: "'Nunito'", fontSize: 15, outline: 'none', background: '#fff' }} />
        </div>

        <div style={{ marginTop: 16, background: '#fff', borderRadius: 22, boxShadow: '0 10px 28px rgba(0,0,0,.05)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ background: '#FBF3E0', textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', fontFamily: "'Fredoka'", fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8a6d3b' }}>Invitado</th>
                  <th style={{ padding: '14px 10px', fontFamily: "'Fredoka'", fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8a6d3b' }}>Estado</th>
                  <th style={{ padding: '14px 10px', fontFamily: "'Fredoka'", fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8a6d3b', textAlign: 'center' }}>Adultos</th>
                  <th style={{ padding: '14px 10px', fontFamily: "'Fredoka'", fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8a6d3b', textAlign: 'center' }}>Niños</th>
                  <th style={{ padding: '14px 10px', fontFamily: "'Fredoka'", fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8a6d3b' }}>Mensaje / notas</th>
                  <th style={{ padding: '14px 10px', fontFamily: "'Fredoka'", fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8a6d3b' }}>Confirmó</th>
                  <th style={{ padding: '14px 10px', fontFamily: "'Fredoka'", fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8a6d3b', textAlign: 'center' }}>Clics</th>
                  <th style={{ padding: '14px 16px', fontFamily: "'Fredoka'", fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8a6d3b', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((g) => (
                  <tr key={g.id} style={{ borderTop: '1px solid #F3EAD6' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 16, color: '#1D1D1D' }}>{g.name}</div>
                      <div style={{ color: '#a08a63', fontSize: 13 }}>{g.phone || 'Sin teléfono'}</div>
                    </td>
                    <td style={{ padding: '14px 10px' }}><span style={badgeStyle(g.status)}>{statusLabel(g.status)}</span></td>
                    <td style={{ padding: '14px 10px', textAlign: 'center', fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 16, color: '#1D1D1D' }}>
                      {String(g.status === 'attending' ? (g.confirmedAdults != null ? g.confirmedAdults : g.expectedAdults) : (g.expectedAdults || 0))}
                    </td>
                    <td style={{ padding: '14px 10px', textAlign: 'center', fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 16, color: '#1D1D1D' }}>
                      {String(g.status === 'attending' ? (g.confirmedChildren != null ? g.confirmedChildren : g.expectedChildren) : (g.expectedChildren || 0))}
                    </td>
                    <td style={{ padding: '14px 10px', maxWidth: 180, color: '#5b4a3a', fontSize: 13 }}>
                      {[g.message ? `💌 ${g.message}` : '', g.comments || ''].filter(Boolean).join('  ·  ') || '—'}
                    </td>
                    <td style={{ padding: '14px 10px', color: '#8a6d3b', fontSize: 13, whiteSpace: 'nowrap' }}>{fmtDate(g.confirmedAt)}</td>
                    <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                      <button
                        type="button"
                        title="Ver historial de clics"
                        onClick={() => setViewingClicksFor(g)}
                        style={{
                          minWidth: 36, height: 32, padding: '0 10px', border: 'none', borderRadius: 999,
                          background: clickCounts[g.id] ? '#E7EEFB' : '#F3EAD6',
                          color: clickCounts[g.id] ? '#2B4C9B' : '#a08a63',
                          fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 14, cursor: 'pointer',
                        }}
                      >
                        👁️ {clickCounts[g.id] || 0}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button type="button" title="Copiar link" onClick={() => copyLink(g)} style={{ width: 36, height: 36, border: 'none', borderRadius: 10, background: '#FFF1D6', cursor: 'pointer', fontSize: 15 }}>🔗</button>
                        <button type="button" title="Copiar mensaje de invitación" onClick={() => copyMessage(g)} style={{ width: 36, height: 36, border: 'none', borderRadius: 10, background: '#F1E9FB', cursor: 'pointer', fontSize: 15 }}>📋</button>
                        <button type="button" title="WhatsApp" onClick={() => whatsapp(g)} style={{ width: 36, height: 36, border: 'none', borderRadius: 10, background: '#DDF3E4', cursor: 'pointer', fontSize: 15 }}>💬</button>
                        <button type="button" title="Editar" onClick={() => openEdit(g)} style={{ width: 36, height: 36, border: 'none', borderRadius: 10, background: '#E7EEFB', cursor: 'pointer', fontSize: 15 }}>✏️</button>
                        <button type="button" title="Eliminar" onClick={() => handleDelete(g)} style={{ width: 36, height: 36, border: 'none', borderRadius: 10, background: '#FBE0E3', cursor: 'pointer', fontSize: 15 }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && rows.length === 0 && (
            <div style={{ padding: '44px 20px', textAlign: 'center', color: '#a08a63' }}>
              <div style={{ fontSize: 38 }}>🎈</div>
              <div style={{ fontFamily: "'Fredoka'", marginTop: 8 }}>No hay invitados en esta vista</div>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <GuestModal guest={editingGuest} onClose={closeModal} onSave={handleSave} />
      )}

      {viewingClicksFor && (
        <ClickLogModal
          guest={viewingClicksFor}
          clicks={clicks.filter((c) => c.guestId === viewingClicksFor.id).sort((a, b) => (b.clickedAt || 0) - (a.clickedAt || 0))}
          onClose={() => setViewingClicksFor(null)}
        />
      )}

      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} showToast={showToast} />
      )}

      {!!toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 80, background: '#1D1D1D', color: '#fff', padding: '13px 22px', borderRadius: 999, fontFamily: "'Fredoka'", fontSize: 14, boxShadow: '0 12px 30px rgba(0,0,0,.3)', animation: 'popIn .3s ease both' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
