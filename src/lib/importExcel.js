function toNum(v) {
  const n = parseInt(String(v).replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

// Parses a sheet's rows (array-of-arrays, as produced by sheet_to_json with
// header:1) into guest objects ready to insert. Mirrors the original
// standalone app's column-detection logic (Nombre, Teléfono, Adultos, Niños,
// Mensaje), so any spreadsheet the family already prepared keeps working.
export function parseGuestRows(arr) {
  if (!arr || !arr.length) return [];

  let headerIdx = -1;
  for (let i = 0; i < Math.min(arr.length, 6); i++) {
    const row = (arr[i] || []).map((c) => String(c).toLowerCase());
    if (row.some((c) => c.includes('nombre') || c.includes('name'))) {
      headerIdx = i;
      break;
    }
  }

  let map = { name: 0, phone: 1, adults: 2, children: 3, message: 4 };
  let start = 0;
  if (headerIdx >= 0) {
    const hdr = (arr[headerIdx] || []).map((c) => String(c).toLowerCase().trim());
    map = { name: -1, phone: -1, adults: -1, children: -1, message: -1 };
    hdr.forEach((h, i) => {
      if ((h.includes('nombre') || h.includes('name')) && map.name < 0) map.name = i;
      else if ((h.includes('tel') || h.includes('whats') || h.includes('cel') || h.includes('phone')) && map.phone < 0) map.phone = i;
      else if (h.includes('adult') && map.adults < 0) map.adults = i;
      else if ((h.includes('niñ') || h.includes('nin') || h.includes('child') || h.includes('kid')) && map.children < 0) map.children = i;
      else if ((h.includes('mensaje') || h.includes('coment') || h.includes('message') || h.includes('nota')) && map.message < 0) map.message = i;
    });
    start = headerIdx + 1;
  }

  const at = (row, key, fallbackIdx) => (map[key] >= 0 ? row[map[key]] : (fallbackIdx != null ? row[fallbackIdx] : ''));

  const guests = [];
  for (let i = start; i < arr.length; i++) {
    const row = arr[i];
    if (!row) continue;
    const name = String(at(row, 'name', 0) || '').trim();
    if (!name) continue;
    const adults = toNum(at(row, 'adults', 2));
    const children = toNum(at(row, 'children', 3));
    guests.push({
      name,
      phone: String(at(row, 'phone', 1) || '').trim(),
      expectedAdults: adults > 0 ? adults : 1,
      expectedChildren: children,
      confirmedAdults: null,
      confirmedChildren: null,
      status: 'pending',
      comments: '',
      message: String(at(row, 'message', null) || '').trim(),
    });
  }
  return guests;
}

export async function readWorkbookRows(file) {
  const XLSX = await import('xlsx');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const arr = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        resolve(arr);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}
