'use strict';
/* Mon Coin — balades et lieux autour de chez moi.
   Données : localStorage (lieux, balades, réglages) + IndexedDB (photos). */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const NATIVE = window.AndroidCoin || null;
const KEY = 'moncoin.v1';
const VIEW_KEY = 'moncoin.view';
const REC_KEY = 'moncoin.rec';

const DEFAULT_CATS = [
  { id: 'eau', emoji: '💧', name: "Cours d'eau", color: '#2b7bb9' },
  { id: 'source', emoji: '⛲', name: 'Source / fontaine', color: '#4aa3c8' },
  { id: 'ferme', emoji: '🐄', name: 'Ferme', color: '#8a5a2b' },
  { id: 'boucher', emoji: '🥩', name: 'Boucher', color: '#b23a3a' },
  { id: 'boulangerie', emoji: '🥖', name: 'Boulangerie', color: '#c98a2b' },
  { id: 'producteur', emoji: '🥕', name: 'Producteur', color: '#e07a1f' },
  { id: 'marche', emoji: '🧺', name: 'Marché', color: '#9c5bb5' },
  { id: 'vue', emoji: '🏞️', name: 'Point de vue', color: '#3a8f6b' },
  { id: 'foret', emoji: '🌳', name: 'Forêt / bois', color: '#2f6b2f' },
  { id: 'cueillette', emoji: '🍄', name: 'Cueillette', color: '#a0522d' },
  { id: 'peche', emoji: '🎣', name: 'Pêche', color: '#1f6f8b' },
  { id: 'piquenique', emoji: '🥪', name: 'Pique-nique', color: '#7a9a2e' },
  { id: 'patrimoine', emoji: '⛪', name: 'Patrimoine', color: '#6b6b6b' },
  { id: 'parking', emoji: '🅿️', name: 'Parking / départ', color: '#3b5ba5' },
  { id: 'autre', emoji: '📍', name: 'Autre', color: '#555555' },
];
const WALK = { emoji: '🥾', name: 'Balade', color: '#e8590c' };
const DIFF = ['Facile', 'Moyenne', 'Difficile'];
const MODES = ['À pied', 'À vélo', 'Les deux'];

/* ================= Icônes (Material) ================= */
const ICONS = {
  menu: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
  search: 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  close: 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  locate: 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.99 8.99 0 0 0 13 3.06V1h-2v2.06A8.99 8.99 0 0 0 3.06 11H1v2h2.06A8.99 8.99 0 0 0 11 20.94V23h2v-2.06A8.99 8.99 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z',
  layers: 'M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z',
  add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  bookmark: 'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z',
  settings: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  map: 'M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z',
  directions: 'M21.71 11.29l-9-9a1 1 0 0 0-1.41 0l-9 9a1 1 0 0 0 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9a1 1 0 0 0 0-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z',
  check: 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  link: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z',
  copy: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
  delete: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  tune: 'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z',
  walk: 'M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9 7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7',
  record: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
  draw: 'M4.59 6.89c.7-.71 1.4-1.35 1.71-1.22.5.2 0 1.03-.3 1.52-.25.42-2.86 3.89-2.86 6.31 0 1.28.48 2.34 1.34 2.98.75.56 1.74.73 2.64.46 1.07-.31 1.95-1.4 3.06-2.77 1.21-1.49 2.83-3.44 4.08-3.44 1.63 0 1.65 1.01 1.76 1.79-3.78.64-5.38 3.67-5.38 5.37 0 1.7 1.44 3.09 3.21 3.09 1.63 0 4.29-1.33 4.69-6.1H21v-2.5h-2.47c-.15-1.65-1.09-4.2-4.03-4.2-2.25 0-4.18 1.91-4.94 2.84-.58.73-2.06 2.48-2.29 2.72-.25.3-.68.84-1.11.84-.45 0-.72-.83-.36-1.92.35-1.09 1.4-2.86 1.85-3.52.78-1.14 1.3-1.92 1.3-3.28C8.95 3.69 7.31 3 6.44 3 5.12 3 3.97 4 3.72 4.25c-.36.36-.66.66-.88.93l1.75 1.71zm9.29 11.66c-.31 0-.74-.26-.74-.72 0-.6.73-2.2 2.87-2.76-.3 2.69-1.43 3.48-2.13 3.48z',
  upload: 'M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z',
  download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
  photo: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z',
  place: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  history: 'M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.95 8.95 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',
  clock: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
  phone: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
  notes: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
  open: 'M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z',
  star: 'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  label: 'M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z',
  target: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[n]}"/></svg>`;
function paintIcons(root = document) { $$('[data-ic]', root).forEach(e => { e.innerHTML = ic(e.dataset.ic) + (e.dataset.icKeep || ''); e.removeAttribute('data-ic'); }); }
paintIcons();

/* ================= Données ================= */
let S = load();
function blank() { return { home: null, homeUpdated: 0, cats: DEFAULT_CATS.map(c => ({ ...c })), catsUpdated: 0, places: [], walks: [], deleted: {}, layer: 'Plan', recent: [], filter: null }; }
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && Array.isArray(d.places)) { const s = Object.assign(blank(), d); if (s.filter && !s.filter.only) s.filter = null; delete s.view; return s; }
  } catch (e) {}
  return blank();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('Impossible d\'enregistrer : ' + e.message); }
  if (typeof Sync !== 'undefined') Sync.soon();
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const cat = id => S.cats.find(c => c.id === id) || S.cats.find(c => c.id === 'autre') || DEFAULT_CATS.at(-1);
const findItem = id => S.places.find(p => p.id === id) || S.walks.find(w => w.id === id);
const isWalk = it => !!it.track;
const look = it => isWalk(it) ? WALK : cat(it.cat);

/* Photos dans IndexedDB (une entrée par photo, en dataURL JPEG compressé) */
const Photos = {
  db: null, cache: new Map(),
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((ok, ko) => {
      const r = indexedDB.open('moncoin-photos', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('p');
      r.onsuccess = () => ok(this.db = r.result);
      r.onerror = () => ko(r.error);
    });
  },
  async tx(mode, fn) {
    const db = await this.open();
    return new Promise((ok, ko) => {
      const t = db.transaction('p', mode), r = fn(t.objectStore('p'));
      t.oncomplete = () => ok(r && r.result);
      t.onerror = () => ko(t.error);
    });
  },
  async get(id) {
    if (this.cache.has(id)) return this.cache.get(id);
    let d = await this.tx('readonly', s => s.get(id));
    if (!d && typeof Sync !== 'undefined') { d = await Sync.fetchPhoto(id); if (d) await this.tx('readwrite', s => s.put(d, id)); } // photo prise sur l'autre appareil
    if (d) this.cache.set(id, d);
    return d;
  },
  put(id, data) { this.cache.set(id, data); return this.tx('readwrite', s => s.put(data, id)); },
  del(id) { this.cache.delete(id); return this.tx('readwrite', s => s.delete(id)); },
};
function compressImage(file, max = 1400) {
  return new Promise((ok, ko) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', 0.78));
    };
    img.onerror = () => { URL.revokeObjectURL(url); ko(new Error('image illisible')); };
    img.src = url;
  });
}

/* ================= Outils ================= */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function haversine(a, b) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b[0] - a[0]) * r, dLng = (b[1] - a[1]) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const trackLength = t => t.reduce((s, p, i) => i ? s + haversine(t[i - 1], p) : 0, 0);
const fmtDist = m => m < 1000 ? Math.round(m) + ' m' : (m / 1000).toFixed(m < 10000 ? 1 : 0).replace('.', ',') + ' km';
function fmtDur(sec) { sec = Math.round(sec); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60); return h ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`; }
const fmtClock = sec => { sec = Math.floor(sec); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return (h ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); };
const fmtDate = t => new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const stars = n => n ? `<span class="stars-ro">${'★'.repeat(n)}</span>` : '';
const posOf = it => isWalk(it) ? it.track[0] : [it.lat, it.lng];
const homeLL = () => S.home ? [S.home.lat, S.home.lng] : null;
const distHome = it => S.home ? haversine(homeLL(), posOf(it)) : null;
const estDur = w => trackLength(w.track) / (w.mode === 1 ? 15000 : 4000) * 3600; // 4 km/h à pied, 15 km/h à vélo
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

let toastT;
function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, ms);
}
function saveFile(name, mime, text) {
  if (NATIVE && NATIVE.saveFile) {
    const r = NATIVE.saveFile(name, mime, text);
    toast(r && r.startsWith('ok') ? 'Enregistré dans Téléchargements : ' + name : 'Erreur : ' + r, 4000);
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: mime }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function openExternal(url) { if (NATIVE && NATIVE.openUrl) NATIVE.openUrl(url); else window.open(url, '_blank'); }

/* ================= Carte ================= */
const tileOpts = { keepBuffer: 4, updateWhenZooming: false, crossOrigin: true };
const TILES = {
  Plan: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { ...tileOpts, maxZoom: 19, attribution: '© OpenStreetMap' }),
  Relief: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { ...tileOpts, maxZoom: 17, attribution: '© OpenTopoMap © OpenStreetMap' }),
  Satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { ...tileOpts, maxZoom: 19, attribution: '© Esri' }),
};
const LAYER_PREVIEW = { Plan: 'https://tile.openstreetmap.org/13/4199/2917.png', Relief: 'https://a.tile.opentopomap.org/13/4199/2917.png', Satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/2917/4199' };
let savedView = null;
try { savedView = JSON.parse(localStorage.getItem(VIEW_KEY)); } catch (e) {}
const startView = savedView || (S.home ? { c: homeLL(), z: 14 } : { c: [46.6, 2.4], z: 6 });
const map = L.map('map', { zoomControl: false, preferCanvas: true, attributionControl: true, tap: false, zoomSnap: 0.5, wheelPxPerZoomLevel: 90 }).setView(startView.c, startView.z);
let tileLayer = (TILES[S.layer] || TILES.Plan).addTo(map);
const itemsLayer = L.layerGroup().addTo(map);
const tempLayer = L.layerGroup().addTo(map);
const searchLayer = L.layerGroup().addTo(map);
let homeMarker = null, meMarker = null, selectedId = null;
const markers = new Map();

let viewT;
map.on('moveend', () => {
  clearTimeout(viewT);
  viewT = setTimeout(() => { const c = map.getCenter(); try { localStorage.setItem(VIEW_KEY, JSON.stringify({ c: [c.lat, c.lng], z: map.getZoom() })); } catch (e) {} }, 400);
});
const zoomClass = () => map.getContainer().classList.toggle('z-low', map.getZoom() < 12.5);
map.on('zoomend', zoomClass); zoomClass();

function pinIcon(emoji, color, extra = '') {
  return L.divIcon({ className: 'pin ' + extra, html: `<div class="pin-in" style="--c:${color}"><span>${emoji}</span></div>`, iconSize: [34, 34], iconAnchor: [17, 41] });
}

/* Filtre rapide (puces au-dessus de la carte) : only = catégories gardées ('walk' = balades), fav, fresh = jamais visités */
const F = () => S.filter || (S.filter = { only: [], fav: false, fresh: false });
const filterActive = () => { const f = F(); return f.only.length || f.fav || f.fresh; };
function shownOnMap(it) {
  const f = F();
  if (f.only.length && !f.only.includes(isWalk(it) ? 'walk' : it.cat)) return false;
  if (f.fav && !it.fav) return false;
  if (f.fresh && (it.visits || []).length) return false;
  return true;
}
function drawItems() {
  itemsLayer.clearLayers(); markers.clear();
  for (const w of S.walks) {
    if (!shownOnMap(w)) continue;
    L.polyline(w.track, { color: WALK.color, weight: 5, opacity: .85 }).on('click', () => select(w.id)).addTo(itemsLayer);
    markers.set(w.id, L.marker(w.track[0], { icon: pinIcon(WALK.emoji, WALK.color, (w.fav ? 'fav' : '') + (w.id === selectedId ? ' sel' : '')) }).on('click', () => select(w.id)).addTo(itemsLayer));
  }
  for (const p of S.places) {
    if (!shownOnMap(p)) continue;
    const c = cat(p.cat);
    markers.set(p.id, L.marker([p.lat, p.lng], { icon: pinIcon(c.emoji, c.color, (p.fav ? 'fav' : '') + (p.id === selectedId ? ' sel' : '')), title: p.name }).on('click', () => select(p.id)).addTo(itemsLayer));
  }
  if (homeMarker) homeMarker.remove();
  homeMarker = S.home ? L.marker(homeLL(), { icon: pinIcon('🏠', '#1a73e8', 'home'), zIndexOffset: 1000 }).on('click', () => showHomeCard()).addTo(map) : null;
  renderMapChips();
}
function highlight(id) {
  const prev = selectedId && markers.get(selectedId);
  if (prev) prev._icon?.classList.remove('sel');
  selectedId = id;
  const m = id && markers.get(id);
  if (m) { m._icon?.classList.add('sel'); m.setZIndexOffset(500); }
}
function select(id) { searchLayer.clearLayers(); showDetail(id); }

function renderMapChips() {
  const f = F(), used = new Set(S.places.map(p => p.cat));
  const box = $('#mapchips');
  if (!S.places.length && !S.walks.length) { box.innerHTML = ''; return; }
  const chips = [];
  if (filterActive()) chips.push(`<button class="chip" data-k="clear">${ic('close')}Tout afficher</button>`);
  if (S.walks.length) chips.push(`<button class="chip ${f.only.includes('walk') ? 'sel' : ''}" data-k="walk">${WALK.emoji} Balades</button>`);
  for (const c of S.cats) if (used.has(c.id)) chips.push(`<button class="chip ${f.only.includes(c.id) ? 'sel' : ''}" data-k="${c.id}">${c.emoji} ${esc(c.name)}</button>`);
  chips.push(`<button class="chip ${f.fav ? 'sel' : ''}" data-k="fav">⭐ Coups de cœur</button>`);
  chips.push(`<button class="chip ${f.fresh ? 'sel' : ''}" data-k="fresh">🆕 À découvrir</button>`);
  box.innerHTML = chips.join('');
}
$('#mapchips').onclick = e => {
  const k = e.target.closest('[data-k]')?.dataset.k; if (!k) return;
  const f = F();
  if (k === 'clear') S.filter = null;
  else if (k === 'fav' || k === 'fresh') f[k] = !f[k];
  else f.only = f.only.includes(k) ? f.only.filter(x => x !== k) : [...f.only, k];
  save(); drawItems();
  const all = [...S.places, ...S.walks], vis = all.filter(shownOnMap);
  if (filterActive()) toast(vis.length ? `${vis.length} lieu${vis.length > 1 ? 'x' : ''} affiché${vis.length > 1 ? 's' : ''}` : 'Aucun lieu avec ce filtre', 1500);
  // Recadre sur les lieux affichés s'ils sont hors de l'écran
  if (filterActive() && vis.length && !vis.some(it => map.getBounds().contains(posOf(it)))) map.flyToBounds(L.latLngBounds(vis.map(posOf)), { padding: [60, 60], maxZoom: 15, duration: .6 });
};

function setLayer(name) { map.removeLayer(tileLayer); tileLayer = TILES[name].addTo(map); S.layer = name; save(); }
$('#btn-layers').onclick = () => {
  openSheet(`<h2>Type de carte</h2>
    <div class="layers">${Object.keys(TILES).map(k => `<button class="layer ${S.layer === k ? 'sel' : ''}" data-l="${k}"><span class="lt" style="background-image:url('${LAYER_PREVIEW[k]}')"></span>${k}</button>`).join('')}</div>
    <p class="sub" style="margin-top:14px">Relief : chemins de randonnée et courbes de niveau.</p>`, null, { modal: false });
  $('#sheet').onclick = e => { const l = e.target.closest('[data-l]')?.dataset.l; if (l) { setLayer(l); closeSheet(); } };
};
function goHome() {
  if (!S.home) return openSearch('home');
  showView('map'); map.flyTo(homeLL(), Math.max(map.getZoom(), 15), { duration: .6 });
}
$('#btn-home').onclick = goHome;
function showHomeCard() {
  openSheet(`<h2>🏠 Ma maison</h2><div class="sub">${esc(S.home.address || 'Adresse non renseignée')}</div>
    <div class="actions"><button class="act" id="hc-edit">${ic('edit')}Changer l'adresse</button><button class="act" id="hc-add">${ic('add')}Ajouter un lieu ici</button></div>`, null, { modal: false });
  $('#hc-edit').onclick = () => { closeSheet(); openSearch('home'); };
  $('#hc-add').onclick = () => editPlace(null, homeLL());
}

/* --- Ma position --- */
function getPosition() {
  return new Promise((ok, ko) => {
    if (!navigator.geolocation) return ko(new Error('Géolocalisation indisponible'));
    navigator.geolocation.getCurrentPosition(p => ok([p.coords.latitude, p.coords.longitude, p.coords.accuracy]),
      e => ko(new Error(e.code === 1 ? 'Autorise la localisation pour Mon Coin' : 'Position introuvable (GPS activé ?)')),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
  });
}
async function locate(move) {
  const b = $('#btn-locate'); b.classList.add('busy');
  try {
    const [lat, lng] = await getPosition();
    if (meMarker) meMarker.setLatLng([lat, lng]);
    else meMarker = L.marker([lat, lng], { icon: L.divIcon({ className: '', html: '<div class="me-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), interactive: false, zIndexOffset: 900 }).addTo(map);
    b.classList.add('on');
    if (move) map.flyTo([lat, lng], Math.max(map.getZoom(), 16), { duration: .6 });
    return [lat, lng];
  } catch (e) { toast(e.message); throw e; }
  finally { b.classList.remove('busy'); }
}
$('#btn-locate').onclick = () => locate(true).catch(() => {});
map.on('dragstart', () => $('#btn-locate').classList.remove('on'));

/* ================= Recherche (plein écran, façon Google Maps) ================= */
/* Adresses : Base Adresse Nationale (rapide, France) ; lieux, commerces, lieux-dits : OpenStreetMap (Nominatim). */
const geoCache = new Map();
let banCtl = null, osmCtl = null, banT = null, osmT = null, searchPurpose = 'go', lastRemote = { q: '', ban: null, osm: null };
async function getJSON(url, signal) { const r = await fetch(url, { signal }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
const biasLL = () => S.home ? homeLL() : (() => { const c = map.getCenter(); return [c.lat, c.lng]; })();
function banSearch(q, signal) {
  const [la, ln] = biasLL();
  return getJSON(`https://api-adresse.data.gouv.fr/search/?limit=6&autocomplete=1&lat=${la}&lon=${ln}&q=${encodeURIComponent(q)}`, signal)
    .then(j => (j.features || []).map(f => ({ kind: 'addr', label: f.properties.label.replace(' ' + f.properties.postcode + ' ' + f.properties.city, '') || f.properties.label, sub: [`${f.properties.postcode || ''} ${f.properties.city || ''}`.trim(), f.properties.context?.split(', ')[1]].filter(Boolean).join(', '), full: f.properties.label, ll: [f.geometry.coordinates[1], f.geometry.coordinates[0]] })));
}
function osmSearch(q, signal) {
  const [la, ln] = biasLL();
  // Autour de la maison (≈ 50 km) en priorité : c'est là que sont tes commerces et tes coins
  return getJSON(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=fr&accept-language=fr&viewbox=${ln - .6},${la + .45},${ln + .6},${la - .45}${S.home ? '&bounded=1' : ''}&q=${encodeURIComponent(q)}`, signal)
    .then(j => j.map(r => {
      let parts = r.display_name.split(', ');
      let label;
      if (r.name) { label = r.name; if (parts[0] === r.name) parts = parts.slice(1); }
      else { const n = /^\d+\w?$/.test(parts[0]) ? 2 : 1; label = parts.slice(0, n).join(' '); parts = parts.slice(n); }
      parts = parts.filter(p => !/^\d{5}$/.test(p) && p !== 'France' && !/^(France métropolitaine|Auvergne-Rhône-Alpes|.*Occitanie|Bretagne|Normandie|Grand Est|Hauts-de-France|Île-de-France|Nouvelle-Aquitaine|Pays de la Loire|Centre-Val de Loire|Bourgogne-Franche-Comté|Provence-Alpes-Côte d'Azur|Corse)$/.test(p));
      return { kind: 'osm', label, sub: parts.slice(0, 3).join(', '), full: [label, ...parts.slice(0, 2)].join(', '), ll: [+r.lat, +r.lon] };
    }));
}
function mergeRemote(q, A, B) {
  const out = [], seen = [];
  for (const r of (/^\s*\d/.test(q) ? [...(A || []), ...(B || [])] : [...(B || []), ...(A || [])])) {
    if (seen.some(s => haversine(s, r.ll) < 40)) continue;
    seen.push(r.ll); out.push(r);
  }
  // Ce qui est près de chez moi passe devant ; très loin = à la fin (ordre conservé dans chaque groupe)
  const ref = biasLL(), band = r => { const d = haversine(ref, r.ll); return d < 30000 ? 0 : d < 120000 ? 1 : 2; };
  let ranked = out.map((r, i) => [band(r), i, r]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (ranked.filter(x => x[0] < 2).length >= 3) ranked = ranked.filter(x => x[0] < 2); // assez de résultats proches : on oublie les lointains
  return ranked.map(x => x[2]).slice(0, 10);
}
function highlightQ(text, q) {
  let h = esc(text);
  for (const w of q.split(/\s+/).filter(w => w.length > 1)) {
    const i = norm(text).indexOf(norm(w));
    if (i >= 0) { const raw = text.slice(i, i + w.length); h = h.replace(esc(raw), `<mark>${esc(raw)}</mark>`); }
  }
  return h;
}
function distLabel(ll) { const ref = homeLL() || (meMarker && [meMarker.getLatLng().lat, meMarker.getLatLng().lng]); return ref ? fmtDist(haversine(ref, ll)) : ''; }

function openSearch(purpose = 'go', initial = '') {
  if (mode && purpose === 'go' && $('#crosshair').hidden) return toast('Termine d\'abord ce que tu fais sur la carte');
  if (!$('#sheet').hidden && !dismissSheet()) return;
  closeDrawer();
  searchPurpose = purpose;
  const inp = $('#sp-input');
  inp.placeholder = purpose === 'home' ? 'Tape ton adresse…' : 'Rechercher une adresse, un lieu…';
  inp.value = initial;
  $('#search-panel').hidden = false;
  inp.focus(); // tout de suite, dans le geste de l'utilisateur, pour que le clavier s'ouvre sur téléphone
  renderSearch();
}
function closeSearch() { $('#search-panel').hidden = true; $('#sp-input').blur(); banCtl?.abort(); osmCtl?.abort(); clearTimeout(banT); clearTimeout(osmT); }
$('#btn-search').onclick = () => openSearch('go');
$('#sp-back').onclick = closeSearch;
$('#sp-clear').onclick = () => { $('#sp-input').value = ''; renderSearch(); $('#sp-input').focus(); };
$('#sp-input').addEventListener('input', () => renderSearch());
$('#sp-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') { const first = $('#sp-body [data-r]'); if (first) first.click(); else $('#sp-input').blur(); }
});

function searchRows(list, q) {
  return list.map(r => `<button class="row" data-r="${r._i}"><span class="ri ${r.kind === 'mine' ? '' : r.kind === 'gps' ? 'blue' : ''}">${r.icon || ic(r.kind === 'addr' || r.kind === 'osm' ? 'place' : 'history')}</span>
    <span class="rt"><b>${highlightQ(r.label, q)}</b><span>${esc(r.sub || '')}</span></span><span class="rd">${r.dist ?? ''}</span></button>`).join('');
}
let spItems = [];
function renderSearch() {
  const q = $('#sp-input').value.trim(), body = $('#sp-body');
  $('#sp-clear').hidden = !q;
  spItems = [];
  const add = r => { r._i = spItems.length; spItems.push(r); return r; };
  let html = '';
  if (!q) {
    banCtl?.abort(); osmCtl?.abort(); clearTimeout(banT); clearTimeout(osmT);
    const quick = [];
    if (searchPurpose === 'home') {
      quick.push(add({ kind: 'act', act: 'gps', icon: ic('locate'), label: 'Utiliser ma position actuelle', sub: 'Je suis chez moi en ce moment' }));
      quick.push(add({ kind: 'act', act: 'pick', icon: ic('target'), label: 'Placer sur la carte', sub: 'Déplacer la carte sous l\'épingle' }));
    } else {
      quick.push(add(S.home ? { kind: 'act', act: 'home', icon: ic('home'), label: 'Maison', sub: S.home.address || 'Ma maison' } : { kind: 'act', act: 'sethome', icon: ic('home'), label: 'Définir ma maison', sub: 'Pour voir la distance de chaque lieu' }));
      quick.push(add({ kind: 'act', act: 'me', icon: ic('locate'), label: 'Ma position', sub: 'Centrer la carte sur moi' }));
    }
    html += searchRows(quick, '');
    if (S.recent.length) {
      html += '<div class="sp-sec">Récents</div>' + searchRows(S.recent.map(r => add({ ...r, kind: 'recent', icon: ic('history'), dist: distLabel(r.ll) })), '');
    }
    if (searchPurpose === 'go' && (S.places.length || S.walks.length)) {
      const mine = [...S.places, ...S.walks].sort((a, b) => (b.updated || b.created) - (a.updated || a.created)).slice(0, 5);
      html += '<div class="sp-sec">Mes lieux récents</div>' + searchRows(mine.map(it => add(mineRow(it))), '');
    }
    body.innerHTML = html;
    return;
  }
  // 1) Coordonnées GPS ou lien collé
  const ll = parseLocation(q);
  if (ll) html += searchRows([add({ kind: 'gps', icon: ic('place'), label: 'Point GPS', sub: ll[0].toFixed(5) + ', ' + ll[1].toFixed(5), full: 'Point GPS ' + ll[0].toFixed(5) + ', ' + ll[1].toFixed(5), ll, dist: distLabel(ll) })], '');
  // 2) Mes lieux (instantané)
  if (searchPurpose === 'go') {
    const nq = norm(q);
    const mine = [...S.places, ...S.walks].filter(it => norm([it.name, it.notes, it.info, look(it).name].join(' ')).includes(nq)).slice(0, 6);
    if (mine.length) html += '<div class="sp-sec">Mes lieux</div>' + searchRows(mine.map(it => add(mineRow(it))), q);
  }
  // 3) Adresses et lieux (internet), affichés dès que la première réponse arrive
  if (!ll && q.length >= 3) {
    const cached = geoCache.get(q.toLowerCase());
    const remote = cached || (lastRemote.q && q.toLowerCase().startsWith(lastRemote.q) ? mergeRemote(q, lastRemote.ban, lastRemote.osm) : []);
    html += `<div class="sp-sec">Adresses et lieux</div>${cached ? '' : '<div class="loadbar"></div>'}<div id="sp-remote">${searchRows(remote.map(r => add({ ...r, dist: distLabel(r.ll) })), q)}</div>`;
    if (!cached) queueRemote(q);
  } else if (!ll && !html) html = '<div class="sp-msg">Continue à taper…</div>';
  body.innerHTML = html;
}
function mineRow(it) {
  const c = look(it), d = distHome(it);
  return { kind: 'mine', id: it.id, icon: `<span style="font-size:20px">${c.emoji}</span>`, label: it.name, sub: c.name + (it.info ? ' · ' + it.info : ''), dist: d != null ? fmtDist(d) : '' };
}
function queueRemote(q) {
  const key = q.toLowerCase();
  lastRemote = { q: key, ban: null, osm: null };
  clearTimeout(banT); clearTimeout(osmT); banCtl?.abort(); osmCtl?.abort();
  const update = () => {
    if ($('#sp-input').value.trim().toLowerCase() !== key) return;
    const list = mergeRemote(q, lastRemote.ban, lastRemote.osm);
    const done = lastRemote.ban !== null && lastRemote.osm !== null;
    if (done) { geoCache.set(key, list); $('.loadbar')?.remove(); }
    const box = $('#sp-remote'); if (!box) return;
    // Les résultats internet sont toujours en fin de liste : on remplace juste cette fin
    spItems = spItems.filter(r => r.kind !== 'addr' && r.kind !== 'osm');
    const rows = list.map(r => { const o = { ...r, dist: distLabel(r.ll) }; o._i = spItems.length; spItems.push(o); return o; });
    box.innerHTML = rows.length ? searchRows(rows, q) : (done ? '<div class="sp-msg">Aucune adresse trouvée. Essaie avec le nom de la commune.</div>' : '');
  };
  banT = setTimeout(() => {
    banCtl = new AbortController();
    banSearch(q, banCtl.signal).then(r => { lastRemote.ban = r; update(); }).catch(e => { if (e.name !== 'AbortError') { lastRemote.ban = []; update(); } });
  }, 180);
  // OpenStreetMap : un peu plus tard (1 requête par seconde maximum demandée par le service)
  osmT = setTimeout(() => {
    osmCtl = new AbortController();
    osmSearch(q, osmCtl.signal).then(r => { lastRemote.osm = r; update(); }).catch(e => { if (e.name !== 'AbortError') { lastRemote.osm = []; update(); } });
  }, 650);
}
$('#sp-body').onclick = e => {
  const i = e.target.closest('[data-r]')?.dataset.r; if (i == null) return;
  const r = spItems[+i]; if (!r) return;
  if (r.kind === 'act') {
    closeSearch();
    if (r.act === 'home') goHome();
    if (r.act === 'sethome') openSearch('home');
    if (r.act === 'me') locate(true).catch(() => {});
    if (r.act === 'gps') getPosition().then(ll => { setHome(ll.slice(0, 2), S.home?.address); map.flyTo(ll.slice(0, 2), 15); }).catch(err => toast(err.message));
    if (r.act === 'pick') pickPosition('Place l\'épingle sur ta maison', ll => setHome(ll, S.home?.address));
    return;
  }
  if (r.kind === 'mine') {
    closeSearch(); showView('map');
    const it = findItem(r.id);
    if (isWalk(it)) map.flyToBounds(L.latLngBounds(it.track), { padding: [60, 60], duration: .6 }); else map.flyTo(posOf(it), 16, { duration: .6 });
    setTimeout(() => showDetail(r.id), 50);
    return;
  }
  // Adresse / lieu / point GPS
  pushRecent(r);
  closeSearch();
  if (searchPurpose === 'home') { setHome(r.ll, r.full || r.label); showView('map'); map.flyTo(r.ll, 15, { duration: .6 }); return; }
  if (mode && !$('#crosshair').hidden) { map.flyTo(r.ll, 17, { duration: .5 }); return; } // en train de placer : on amène juste la carte
  showResultCard(r);
};
function pushRecent(r) {
  const o = { label: r.label, sub: r.sub, full: r.full, ll: r.ll };
  S.recent = [o, ...(S.recent || []).filter(x => x.label !== o.label || haversine(x.ll, o.ll) > 40)].slice(0, 8);
  save();
}
/* Fiche d'un résultat de recherche (pas encore dans mes lieux) */
function showResultCard(r) {
  showView('map');
  searchLayer.clearLayers();
  L.marker(r.ll, { icon: L.divIcon({ className: '', html: '<div class="redpin"></div>', iconSize: [30, 40], iconAnchor: [15, 38] }), zIndexOffset: 2000 }).addTo(searchLayer);
  map.flyTo(r.ll, Math.max(map.getZoom(), 16), { duration: .6 });
  const d = distLabel(r.ll);
  openSheet(`<h2>${esc(r.label)}</h2><div class="sub">${esc(r.sub || '')}${d ? `<span class="dot"></span>${S.home ? 'à ' + d + ' de chez toi' : d}` : ''}</div>
    <div class="actions">
      <button class="act primary" id="rc-add">${ic('add')}Ajouter à mes lieux</button>
      <button class="act" id="rc-go">${ic('directions')}Itinéraire</button>
      <button class="act" id="rc-home">${ic('home')}C'est ma maison</button>
    </div>`, () => searchLayer.clearLayers(), { modal: false });
  $('#rc-add').onclick = () => { searchLayer.clearLayers(); editPlace(null, r.ll, null, { name: /^\d/.test(r.label) || r.kind === 'gps' ? '' : r.label, info: '' }); };
  $('#rc-go').onclick = () => openExternal(`geo:${r.ll[0]},${r.ll[1]}?q=${r.ll[0]},${r.ll[1]}(${encodeURIComponent(r.label)})`);
  $('#rc-home').onclick = () => { searchLayer.clearLayers(); closeSheet(); setHome(r.ll, r.full || r.label); };
}

/* ================= Ma maison ================= */
function setHome(ll, address) {
  S.home = { lat: ll[0], lng: ll[1], address: address || '' }; S.homeUpdated = Date.now();
  save(); drawItems(); if (currentView === 'settings') renderSettings();
  toast('Maison enregistrée');
}

/* ================= Menu ☰ ================= */
function openDrawer() {
  $('#drawer').innerHTML = `
    <div class="dh"><b>Mon Coin</b><span>${S.places.length} lieu${S.places.length > 1 ? 'x' : ''} · ${S.walks.length} balade${S.walks.length > 1 ? 's' : ''}</span></div>
    <button class="mi" data-a="point">${ic('place')}Ajouter un lieu</button>
    <button class="mi" data-a="link">${ic('link')}Lieu depuis un lien ou un point GPS</button>
    <button class="mi" data-a="record">${ic('record')}Enregistrer une balade</button>
    <button class="mi" data-a="draw">${ic('draw')}Tracer une balade</button>
    <button class="mi" data-a="gpx">${ic('upload')}Importer un fichier GPX</button>
    <hr>
    <h4>Type de carte</h4>
    ${Object.keys(TILES).map(k => `<button class="mi ${S.layer === k ? 'sel' : ''}" data-a="layer:${k}">${ic(k === 'Satellite' ? 'layers' : k === 'Relief' ? 'walk' : 'map')}${k}</button>`).join('')}
    <hr>
    <button class="mi" data-a="home">${ic('home')}${S.home ? 'Aller à la maison' : 'Définir ma maison'}</button>
    ${S.home ? `<button class="mi" data-a="homeaddr">${ic('edit')}Changer mon adresse</button>` : ''}
    <button class="mi" data-a="list">${ic('bookmark')}Mes lieux</button>
    <button class="mi" data-a="cats">${ic('label')}Catégories</button>
    <hr>
    <button class="mi" data-a="sync">${ic('link')}${syncCfg ? 'Relier un autre appareil' : 'Relier PC et téléphone'}</button>
    <button class="mi" data-a="export">${ic('download')}Sauvegarder tout</button>
    <button class="mi" data-a="import">${ic('upload')}Restaurer une sauvegarde</button>`;
  $('#drawer').hidden = false; $('#drawer-bg').hidden = false;
}
function closeDrawer() { $('#drawer').hidden = true; $('#drawer-bg').hidden = true; }
$('#btn-menu').onclick = openDrawer;
$('#drawer-bg').onclick = closeDrawer;
$('#drawer').onclick = e => { const a = e.target.closest('[data-a]')?.dataset.a; if (a) { closeDrawer(); runAction(a); } };

/* Actions communes au menu ☰ et au bouton Ajouter */
function runAction(a) {
  if (mode && !a.startsWith('layer:')) return toast('Termine d\'abord ce que tu fais sur la carte');
  if (!$('#sheet').hidden && !dismissSheet()) return;
  if (a === 'point') pickPosition('Déplace la carte pour mettre l\'épingle sur le lieu', ll => editPlace(null, ll));
  else if (a === 'link') addFromLink();
  else if (a === 'sync') openLinkSheet();
  else if (a === 'search') openSearch('go');
  else if (a === 'record') startRecording();
  else if (a === 'draw') startDrawing();
  else if (a === 'gpx') pickImport();
  else if (a.startsWith('layer:')) { showView('map'); setLayer(a.slice(6)); }
  else if (a === 'home') goHome();
  else if (a === 'homeaddr') openSearch('home');
  else if (a === 'list') showView('list');
  else if (a === 'cats') { showView('settings'); setTimeout(() => $('#s-cats')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }
  else if (a === 'export') exportAll();
  else if (a === 'import') pickImport();
}

/* ================= Vues ================= */
let currentView = 'map';
function showView(v) {
  if (currentView === v) return;
  currentView = v;
  $$('.view').forEach(e => e.classList.toggle('active', e.id === 'view-' + v));
  $$('.navbar button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  if (v === 'map') requestAnimationFrame(() => map.invalidateSize());
  if (v === 'list') renderList();
  if (v === 'settings') renderSettings();
}
$$('.navbar button').forEach(b => b.onclick = () => {
  if (mode && b.dataset.view !== 'map') return toast('Termine d\'abord ce que tu fais sur la carte');
  if (!$('#sheet').hidden && !dismissSheet()) return;
  showView(b.dataset.view);
});

/* ================= Feuille du bas ================= */
let sheetBack = null, sheetModal = true;
/* modal: voile sombre et carte bloquée (formulaires) ; sinon carte utilisable derrière (fiches) */
function openSheet(html, onBack, opts = {}) {
  const sh = $('#sheet');
  sh.onclick = sh.oninput = sh.onchange = null;
  sh.innerHTML = '<div class="grip"></div>' + html;
  sh.style.transform = ''; sh.classList.remove('snap', 'drag');
  sheetModal = opts.modal !== false;
  sh.hidden = false; $('#overlay').hidden = !sheetModal; sh.scrollTop = 0;
  sh.style.animation = 'none'; sh.offsetHeight; sh.style.animation = '';
  sheetBack = onBack || null;
  return sh;
}
function closeSheet() { $('#sheet').hidden = true; $('#overlay').hidden = true; sheetBack = null; highlight(null); }
/* Fermeture par l'utilisateur : confirme si une saisie est en cours, puis exécute le « retour » de la feuille */
function dismissSheet() {
  if (formDirty && !confirm('Fermer sans enregistrer ?')) return false;
  formDirty = false;
  const b = sheetBack; closeSheet(); if (b) b();
  return true;
}
$('#overlay').onclick = dismissSheet;
map.on('click', () => { if (!mode && !$('#sheet').hidden && !sheetModal) dismissSheet(); });

/* Glisser la feuille vers le bas pour la fermer */
(() => {
  const sh = $('#sheet'); let y0 = null, dy = 0;
  sh.addEventListener('touchstart', e => {
    if (sh.scrollTop > 0 || e.target.closest('input, textarea, select, .catgrid, .photos, .actions, .layers')) { y0 = null; return; }
    y0 = e.touches[0].clientY; dy = 0;
  }, { passive: true });
  sh.addEventListener('touchmove', e => {
    if (y0 == null) return;
    dy = e.touches[0].clientY - y0;
    if (dy > 0) { sh.classList.add('drag'); sh.style.transform = `translateY(${dy}px)`; }
  }, { passive: true });
  sh.addEventListener('touchend', () => {
    if (y0 == null) return;
    sh.classList.remove('drag');
    if (dy > 110) { sh.style.transform = ''; if (!dismissSheet()) sh.style.transform = ''; }
    else { sh.classList.add('snap'); sh.style.transform = ''; }
    y0 = null;
  });
})();

/* Bouton retour Android */
window.onBack = function () {
  if (!$('#viewer').hidden) { $('#viewer').hidden = true; return true; }
  if (!$('#search-panel').hidden) { closeSearch(); return true; }
  if (!$('#drawer').hidden) { closeDrawer(); return true; }
  if (!$('#sheet').hidden) { dismissSheet(); return true; }
  if (searchLayer.getLayers().length) { searchLayer.clearLayers(); return true; }
  if (mode && mode.cancel) { mode.cancel(); return true; }
  if (currentView !== 'map') { showView('map'); return true; }
  return false;
};

/* ================= Modes carte (placer / tracer / enregistrer) ================= */
let mode = null;
function setModebar(html) {
  const m = $('#modebar'); m.innerHTML = html; m.hidden = !html;
  $('.bottomright').hidden = !!html;
}
function endMode() { mode = null; tempLayer.clearLayers(); $('#crosshair').hidden = true; setModebar(''); map.off('click', onMapClickDraw); }

$('#fab').onclick = () => {
  if (mode) return toast('Termine d\'abord ce que tu fais sur la carte');
  openSheet(`<h2>Ajouter</h2>
    <div class="opts">
      <button class="row" data-a="point"><span class="ri green">${ic('place')}</span><span class="rt"><b>Un lieu sur la carte</b><span>Ferme, cours d'eau, boucher, coin à champignons…</span></span></button>
      <button class="row" data-a="search"><span class="ri green">${ic('search')}</span><span class="rt"><b>Un lieu depuis une adresse</b><span>Chercher une adresse ou un commerce</span></span></button>
      <button class="row" data-a="link"><span class="ri green">${ic('link')}</span><span class="rt"><b>Un lien Google Maps ou un point GPS</b><span>Coller un lien ou des coordonnées</span></span></button>
      <button class="row" data-a="record"><span class="ri" style="background:#fde8dc;color:#c2410c">${ic('record')}</span><span class="rt"><b>Enregistrer une balade</b><span>Le GPS suit ton chemin, même écran éteint</span></span></button>
      <button class="row" data-a="draw"><span class="ri" style="background:#fde8dc;color:#c2410c">${ic('draw')}</span><span class="rt"><b>Tracer une balade</b><span>Dessiner le chemin sur la carte</span></span></button>
      <button class="row" data-a="gpx"><span class="ri" style="background:#fde8dc;color:#c2410c">${ic('upload')}</span><span class="rt"><b>Importer un fichier GPX</b><span>Visorando, Komoot, Strava…</span></span></button>
    </div>`, null, { modal: true });
  $('#sheet').onclick = e => { const a = e.target.closest('[data-a]')?.dataset.a; if (a) { closeSheet(); runAction(a); } };
};

// Appui long sur la carte = nouveau lieu à cet endroit
map.on('contextmenu', e => { if (!mode) { searchLayer.clearLayers(); editPlace(null, [e.latlng.lat, e.latlng.lng]); } });

function pickPosition(hint, done, onCancel) {
  showView('map');
  mode = { cancel: () => { endMode(); onCancel && onCancel(); } };
  $('#crosshair').hidden = false;
  setModebar(`<div class="hint">${esc(hint)}</div>
    <div class="mrow"><button class="btn" id="m-cancel">Annuler</button><button class="btn" id="m-gps">${ic('locate')}Ici</button><button class="btn primary" id="m-ok">${ic('check')}Valider</button></div>`);
  $('#m-cancel').onclick = mode.cancel;
  $('#m-ok').onclick = () => { const c = map.getCenter(); endMode(); done([c.lat, c.lng]); };
  $('#m-gps').onclick = () => locate(true).catch(() => {});
}

/* --- Tracer une balade à la main --- */
let draft = [];
function onMapClickDraw(e) { draft.push([e.latlng.lat, e.latlng.lng]); renderDraft(); }
function renderDraft() {
  tempLayer.clearLayers();
  if (draft.length) L.polyline(draft, { color: WALK.color, weight: 5, dashArray: '8 6' }).addTo(tempLayer);
  draft.forEach(p => L.marker(p, { icon: L.divIcon({ className: '', html: '<div class="vertex"></div>', iconSize: [12, 12], iconAnchor: [6, 6] }), interactive: false }).addTo(tempLayer));
  $('#m-len').textContent = fmtDist(trackLength(draft));
  $('#m-done').disabled = draft.length < 2;
}
function startDrawing(existing) {
  showView('map');
  draft = existing ? existing.track.map(p => p.slice()) : [];
  mode = { cancel: () => { if (draft.length > 1 && !confirm('Abandonner ce tracé ?')) return; endMode(); } };
  setModebar(`<div class="hint">Touche la carte pour poser chaque point du chemin</div>
    <div class="big" id="m-len">0 m</div>
    <div class="mrow" style="margin-top:12px"><button class="btn" id="m-cancel">Annuler</button><button class="btn" id="m-undo">Retirer</button><button class="btn" id="m-loop">Boucler</button><button class="btn primary" id="m-done">OK</button></div>`);
  $('#m-cancel').onclick = mode.cancel;
  $('#m-undo').onclick = () => { draft.pop(); renderDraft(); };
  $('#m-loop').onclick = () => { if (draft.length > 2) { draft.push(draft[0].slice()); renderDraft(); } };
  $('#m-done').onclick = () => {
    const track = draft.slice(); endMode();
    if (existing) { existing.track = track; existing.updated = Date.now(); save(); drawItems(); showDetail(existing.id); }
    else editWalk(null, { track });
  };
  map.on('click', onMapClickDraw);
  renderDraft();
  if (existing) map.fitBounds(L.latLngBounds(draft), { padding: [40, 40] });
}

/* --- Enregistrer une balade au GPS --- */
let rec = null, recTimer = null, recWatch = null, recLine = null, recDot = null;
function startRecording() {
  showView('map');
  rec = { start: Date.now(), track: [] };
  if (NATIVE && NATIVE.trackStart) {
    const r = NATIVE.trackStart();
    if (r !== 'ok') { rec = null; return toast(r === 'perm' ? 'Autorise la localisation puis réessaie' : 'Erreur : ' + r, 4000); }
  } else if (navigator.geolocation) {
    recWatch = navigator.geolocation.watchPosition(p => {
      if (p.coords.accuracy > 40) return;
      rec.track.push([p.coords.latitude, p.coords.longitude]); saveRec();
    }, e => toast('GPS : ' + e.message), { enableHighAccuracy: true, maximumAge: 0 });
  } else { rec = null; return toast('Pas de GPS disponible'); }
  saveRec(); recordingUI();
}
function saveRec() { try { localStorage.setItem(REC_KEY, JSON.stringify(rec)); } catch (e) {} }
function pullNative() {
  if (!(NATIVE && NATIVE.trackPoints) || !rec) return;
  try { const pts = JSON.parse(NATIVE.trackPoints(rec.track.length)); if (pts.length) { rec.track.push(...pts); saveRec(); } } catch (e) {}
}
function recordingUI() {
  mode = { cancel: () => toast('Appuie sur « Terminer » pour arrêter l\'enregistrement') };
  setModebar(`<div class="hint" id="m-hint">Enregistrement en cours · tu peux éteindre l'écran</div>
    <div class="mrow" style="text-align:center"><div><div class="big" id="m-time">0:00</div><div class="sub">durée</div></div><div><div class="big" id="m-len">0 m</div><div class="sub">distance</div></div></div>
    <div class="mrow" style="margin-top:12px"><button class="btn" id="m-here">${ic('place')}Noter un lieu</button><button class="btn walk" id="m-stop">Terminer</button></div>`);
  $('#m-stop').onclick = stopRecording;
  $('#m-here').onclick = async () => {
    let p = rec.track.at(-1); try { p = await getPosition(); } catch (e) {}
    if (!p) return toast('Pas encore de position GPS');
    editPlace(null, [p[0], p[1]]);
  };
  recLine = L.polyline([], { color: WALK.color, weight: 5 }).addTo(tempLayer);
  recDot = null;
  let followed = false, drawn = 0;
  const tick = () => {
    if (!rec) return;
    pullNative();
    $('#m-time').textContent = fmtClock((Date.now() - rec.start) / 1000);
    if (rec.track.length !== drawn) {
      drawn = rec.track.length;
      $('#m-len').textContent = fmtDist(trackLength(rec.track));
      recLine.setLatLngs(rec.track);
      const last = rec.track.at(-1);
      if (recDot) recDot.setLatLng(last);
      else recDot = L.marker(last, { icon: L.divIcon({ className: '', html: '<div class="me-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), interactive: false }).addTo(tempLayer);
      if (!followed) { map.setView(last, 16); followed = true; }
    }
    if (NATIVE && NATIVE.trackRunning && !NATIVE.trackRunning()) $('#m-hint').textContent = 'Le GPS s\'est arrêté — appuie sur Terminer';
  };
  clearInterval(recTimer); recTimer = setInterval(tick, 1000); tick();
}
function stopRecording() {
  if (!confirm('Terminer l\'enregistrement de la balade ?')) return;
  pullNative();
  if (NATIVE && NATIVE.trackStop) NATIVE.trackStop();
  if (recWatch != null) navigator.geolocation.clearWatch(recWatch);
  clearInterval(recTimer); recWatch = null;
  const r = rec; rec = null; localStorage.removeItem(REC_KEY); endMode();
  if (r.track.length < 2) return toast('Trop peu de points GPS, balade non enregistrée', 4000);
  editWalk(null, { track: r.track, duration: Math.round((Date.now() - r.start) / 1000), recorded: true, date: r.start });
}
function resumeRecording() {
  try { rec = JSON.parse(localStorage.getItem(REC_KEY)); } catch (e) { rec = null; }
  if (!rec) return;
  if (!(NATIVE && NATIVE.trackRunning && NATIVE.trackRunning())) {
    if (!NATIVE && navigator.geolocation) recWatch = navigator.geolocation.watchPosition(p => { if (p.coords.accuracy <= 40) { rec.track.push([p.coords.latitude, p.coords.longitude]); saveRec(); } }, () => {}, { enableHighAccuracy: true });
    else toast('L\'enregistrement a été interrompu — termine-le pour garder le tracé', 5000);
  }
  recordingUI();
}

/* ================= Formulaires ================= */
let formDirty = false;
const starsInput = n => `<div class="stars" id="f-stars">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-s="${i}" class="${i <= n ? 'on' : ''}">★</button>`).join('')}</div>`;
function bindStars(get, set) {
  $('#f-stars').onclick = e => {
    const s = +e.target.dataset.s; if (!s) return;
    set(get() === s ? 0 : s); formDirty = true;
    $$('#f-stars button').forEach(b => b.classList.toggle('on', +b.dataset.s <= get()));
  };
}

/* Photos d'un formulaire : liste d'ids ; les nouvelles sont écrites en base tout de suite, supprimées si on annule */
let formPhotos = [], formNewPhotos = [], formDelPhotos = [];
function renderPhotoStrip(el, ids, editable) {
  el.innerHTML = ids.map(id => `<div class="ph" data-id="${id}"><img alt="">${editable ? `<button class="del" type="button">${ic('close')}</button>` : ''}</div>`).join('')
    + (editable ? `<button class="add" type="button" id="f-addphoto">${ic('photo')}Ajouter</button>` : '');
  for (const ph of $$('.ph', el)) {
    Photos.get(ph.dataset.id).then(d => { if (d) $('img', ph).src = d; });
    $('img', ph).onclick = () => { const vw = $('#viewer'); $('img', vw).src = $('img', ph).src; vw.hidden = false; };
    const del = $('.del', ph);
    if (del) del.onclick = () => { formPhotos = formPhotos.filter(x => x !== ph.dataset.id); formDelPhotos.push(ph.dataset.id); formDirty = true; renderPhotoStrip(el, formPhotos, true); };
  }
  const add = $('#f-addphoto', el);
  if (add) add.onclick = () => {
    const inp = $('#file-photo'); inp.value = '';
    inp.onchange = async () => {
      for (const f of inp.files) {
        try { const d = await compressImage(f); const id = 'ph_' + uid(); await Photos.put(id, d); formPhotos.push(id); formNewPhotos.push(id); formDirty = true; }
        catch (e) { toast('Photo ignorée : ' + e.message); }
      }
      renderPhotoStrip(el, formPhotos, true);
    };
    inp.click();
  };
}
function initFormPhotos(ids) { formPhotos = (ids || []).slice(); formNewPhotos = []; formDelPhotos = []; }
function commitPhotos() { formDelPhotos.forEach(id => Photos.del(id)); }
function rollbackPhotos() { formNewPhotos.forEach(id => Photos.del(id)); formNewPhotos = []; }
$('#viewer').onclick = () => $('#viewer').hidden = true;

/* --- Liens Google Maps / coordonnées GPS --- */
const okLL = (a, b) => isFinite(a) && isFinite(b) && Math.abs(a) <= 90 && Math.abs(b) <= 180 && !(a === 0 && b === 0);
/* Trouve une position dans un lien Google Maps, un lien geo:, ou des coordonnées tapées (décimales ou degrés-minutes-secondes) */
function parseLocation(text) {
  let t = String(text || '').trim();
  try { t = decodeURIComponent(t.replace(/\+/g, ' ')); } catch (e) {}
  const num = '(-?\\d{1,3}(?:[.,]\\d+)?)';
  const tries = [
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,                                  // lien « place » : position exacte du lieu
    new RegExp('[?&](?:q|query|ll|destination|daddr|center)=(?:loc:)?' + num + '\\s*,\\s*' + num),
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,                                      // centre de la carte
    new RegExp('geo:' + num + ',' + num),
  ];
  for (const re of tries) {
    const m = t.match(re);
    if (m) { const a = +m[1].replace(',', '.'), b = +m[2].replace(',', '.'); if (okLL(a, b)) return [a, b]; }
  }
  // Degrés minutes secondes : 45°45'36.2"N 4°24'12.1"E
  const dms = /(\d{1,3})°\s*(\d{1,2})?['′]?\s*(\d{1,2}(?:[.,]\d+)?)?["″]?\s*([NS])[\s,;]*(\d{1,3})°\s*(\d{1,2})?['′]?\s*(\d{1,2}(?:[.,]\d+)?)?["″]?\s*([EOW])/i;
  const d = t.match(dms);
  if (d) {
    const v = (g, m, s) => +g + (+m || 0) / 60 + (+(s || '0').replace(',', '.')) / 3600;
    const a = v(d[1], d[2], d[3]) * (/S/i.test(d[4]) ? -1 : 1), b = v(d[5], d[6], d[7]) * (/[OW]/i.test(d[8]) ? -1 : 1);
    if (okLL(a, b)) return [a, b];
  }
  // Deux nombres décimaux : « 45.76012, 4.40031 » ou « 45,76012 4,40031 »
  const m = t.match(/(-?\d{1,2}\.\d{3,})\s*[,;\s]\s*(-?\d{1,3}\.\d{3,})/) || t.match(/(-?\d{1,2},\d{3,})[\s;]+(-?\d{1,3},\d{3,})/);
  if (m) { const a = +m[1].replace(',', '.'), b = +m[2].replace(',', '.'); if (okLL(a, b)) return [a, b]; }
  return null;
}
const firstUrl = t => (String(t || '').match(/https?:\/\/\S+/) || [null])[0];
/* Nom du lieu proposé : ligne de texte partagée par Google Maps, ou /place/Nom/ dans le lien */
function guessName(text, url) {
  const line = String(text || '').split('\n').map(s => s.trim()).find(s => s && !/https?:\/\//.test(s) && !parseLocation(s));
  if (line) return line.slice(0, 80);
  const m = (url || '').match(/\/place\/([^/@?]+)/);
  if (m) { try { return decodeURIComponent(m[1].replace(/\+/g, ' ')).slice(0, 80); } catch (e) {} }
  return '';
}
/* Comme parseLocation, mais suit d'abord les liens courts (maps.app.goo.gl) quand on est dans l'appli */
async function resolveLocation(text) {
  let ll = parseLocation(text);
  const url = firstUrl(text);
  let full = url;
  if (!ll && url && NATIVE && NATIVE.resolveUrl) {
    full = await new Promise(ok => setTimeout(() => ok(NATIVE.resolveUrl(url)), 0));
    ll = parseLocation(full);
  }
  return { ll, url, full };
}
/* Nouveau lieu à partir d'un lien ou de coordonnées (menu, ou partage depuis Google Maps) */
function addFromLink(initial) {
  openSheet(`<h2>Lien ou point GPS</h2>
    <p class="sub">Colle un lien Google Maps (bouton « Partager » dans Google Maps) ou des coordonnées : <i>45.7601, 4.4003</i> ou <i>45°45'36"N 4°24'01"E</i>.</p>
    <label class="field"><textarea id="l-text" style="min-height:80px" placeholder="Colle ici…">${esc(initial || '')}</textarea></label>
    <div class="hint-line" id="l-status"></div>
    <div class="btn-row end"><button class="btn" id="l-cancel">Annuler</button><button class="btn primary" id="l-go">Continuer</button></div>`);
  $('#l-cancel').onclick = closeSheet;
  const go = async () => {
    const text = $('#l-text').value.trim();
    if (!text) return toast('Colle un lien ou des coordonnées');
    $('#l-status').textContent = 'Recherche de la position…';
    const { ll, url, full } = await resolveLocation(text);
    const pre = { link: url || '', name: guessName(text, full) };
    closeSheet();
    if (ll) { map.setView(ll, 16); editPlace(null, ll, null, pre); }
    else {
      toast(url ? 'Pas de position dans ce lien : place le lieu sur la carte' : 'Coordonnées non reconnues : place le lieu sur la carte', 4000);
      pickPosition('Déplace la carte pour mettre l\'épingle sur le lieu', p => editPlace(null, p, null, pre));
    }
  };
  $('#l-go').onclick = go;
  if (initial) go(); else setTimeout(() => $('#l-text')?.focus(), 250);
}
/* Texte partagé vers Mon Coin depuis une autre appli (Google Maps → Partager → Mon Coin) */
window.checkShared = function () {
  const t = NATIVE && NATIVE.takeShared ? NATIVE.takeShared() : '';
  if (!t) return;
  if (mode) return toast('Lien reçu, mais termine d\'abord ce que tu fais sur la carte', 4000);
  closeSearch(); showView('map'); addFromLink(t);
};

/* Catégorie devinée d'après le nom (résultat de recherche, lien partagé) */
const CAT_WORDS = [
  ['boulangerie', /boulang|patisser|fournil/], ['boucher', /boucher|charcut|volaill/], ['ferme', /ferme|elevage|chevrerie|fromagerie|gaec|earl/],
  ['marche', /marche|halle/], ['producteur', /producteur|maraich|verger|primeur|vigne|domaine|cave/], ['eau', /riviere|ruisseau|fleuve|etang|lac|cascade|gue|bief|canal/],
  ['source', /source|fontaine|lavoir/], ['vue', /belvedere|point de vue|panorama|table d.orientation|col /], ['foret', /foret|bois |bois$/],
  ['peche', /peche/], ['piquenique', /pique.nique|aire de repos/], ['patrimoine', /eglise|chapelle|chateau|abbaye|croix|moulin|tour |musee/], ['parking', /parking/],
];
const guessCat = name => { const n = norm(name); const hit = CAT_WORDS.find(([id, re]) => re.test(n) && S.cats.some(c => c.id === id)); return hit ? hit[0] : 'autre'; };

/* --- Lieu --- */
function editPlace(id, ll, snap, prefill) {
  const old = id ? findItem(id) : null;
  const p = snap ? snap.p : old ? JSON.parse(JSON.stringify(old)) : Object.assign({ id: uid(), cat: guessCat(prefill?.name), name: '', notes: '', info: '', link: '', rating: 0, fav: false, lat: ll[0], lng: ll[1], photos: [], visits: [], created: Date.now() }, prefill);
  if (ll) { p.lat = ll[0]; p.lng = ll[1]; }
  if (snap) { formPhotos = snap.photos; formNewPhotos = snap.nw; formDelPhotos = snap.dl; formDirty = true; }
  else { initFormPhotos(p.photos); formDirty = !old; }
  const back = old ? () => { rollbackPhotos(); showDetail(old.id); } : () => rollbackPhotos();
  openSheet(`
    <h2>${old ? 'Modifier le lieu' : 'Nouveau lieu'}</h2>
    <label class="field"><span>Nom</span><input id="f-name" value="${esc(p.name)}" placeholder="ex : Ferme des Grillons, le gué du moulin…"></label>
    <div class="field"><span>Catégorie</span></div>
    <div class="catgrid" id="f-cats">${S.cats.map(c => `<button type="button" class="catbtn ${c.id === p.cat ? 'sel' : ''}" style="--c:${c.color}" data-c="${c.id}"><b>${c.emoji}</b>${esc(c.name)}</button>`).join('')}</div>
    <label class="field"><span>Note pour me rappeler</span><textarea id="f-notes" placeholder="Ce qu'il y a à savoir, ce que tu y as trouvé, la saison…">${esc(p.notes)}</textarea></label>
    <div class="field"><span>Photos</span></div>
    <div class="photos" id="f-photos"></div>
    <label class="field"><span>Lien Google Maps ou point GPS</span><input id="f-link" value="${esc(p.link || '')}" placeholder="Coller un lien ou des coordonnées" inputmode="url"></label>
    <div class="hint-line" id="f-linkst"></div>
    <div class="field"><span>Position</span></div>
    <div class="poscard">${ic('place')}<span class="pt" id="f-pos">${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}</span><button class="btn small" id="f-move" type="button">Déplacer</button><button class="btn small" id="f-here" type="button" aria-label="Ma position">${ic('locate')}</button></div>
    <div class="field"><span>Mon avis</span></div>${starsInput(p.rating)}
    <label class="switch">Coup de cœur<input type="checkbox" id="f-fav" ${p.fav ? 'checked' : ''}></label>
    <label class="field"><span>Horaires, jours, prix…</span><input id="f-info" value="${esc(p.info)}" placeholder="ex : vente à la ferme ven. 16h-19h"></label>
    <label class="field"><span>Téléphone ou site</span><input id="f-contact" value="${esc(p.contact || '')}" inputmode="tel"></label>
    <div class="sticky-save"><button class="btn" id="f-cancel">Annuler</button><button class="btn primary" id="f-save">Enregistrer</button></div>`, back);
  renderPhotoStrip($('#f-photos'), formPhotos, true);
  $('#sheet').oninput = () => formDirty = true;
  $('#f-cats').onclick = e => {
    const b = e.target.closest('[data-c]'); if (!b) return;
    p.cat = b.dataset.c; formDirty = true;
    $$('#f-cats .catbtn').forEach(x => x.classList.toggle('sel', x === b));
  };
  $('#f-cats .sel')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  bindStars(() => p.rating, s => p.rating = s);
  const collect = () => { p.name = $('#f-name').value.trim(); p.link = $('#f-link').value.trim(); p.notes = $('#f-notes').value; p.info = $('#f-info').value.trim(); p.contact = $('#f-contact').value.trim(); p.fav = $('#f-fav').checked; p.photos = formPhotos.slice(); };
  // Lien collé → on y cherche la position (en suivant les liens courts dans l'appli)
  let linkT;
  $('#f-link').addEventListener('input', () => {
    clearTimeout(linkT);
    linkT = setTimeout(async () => {
      const text = $('#f-link').value.trim(), st = $('#f-linkst');
      st.classList.remove('ok');
      if (!text) { st.textContent = ''; return; }
      st.textContent = 'Recherche de la position…';
      const { ll, url, full } = await resolveLocation(text);
      if ($('#f-link')?.value.trim() !== text) return;
      if (ll) {
        p.lat = ll[0]; p.lng = ll[1];
        $('#f-pos').textContent = ll[0].toFixed(5) + ', ' + ll[1].toFixed(5);
        st.textContent = '✓ Position trouvée et mise à jour'; st.classList.add('ok');
        if (!$('#f-name').value.trim()) $('#f-name').value = guessName(text, full);
      } else st.textContent = url ? 'Lien gardé, mais sans position dedans : utilise « Déplacer »' : 'Coordonnées non reconnues';
    }, 400);
  });
  $('#f-move').onclick = () => {
    collect(); const snap = { p, photos: formPhotos, nw: formNewPhotos, dl: formDelPhotos };
    formDirty = false; closeSheet(); map.setView([p.lat, p.lng], Math.max(map.getZoom(), 16));
    const reopen = ll => editPlace(id, ll, snap); // on rouvre le formulaire en gardant la saisie et les photos
    pickPosition('Déplace la carte pour mettre l\'épingle sur le lieu', reopen, () => reopen(null));
  };
  $('#f-here').onclick = async () => {
    try { const [la, ln] = await getPosition(); p.lat = la; p.lng = ln; formDirty = true; $('#f-pos').textContent = la.toFixed(5) + ', ' + ln.toFixed(5); }
    catch (e) { toast(e.message); }
  };
  $('#f-cancel').onclick = () => { formDirty = false; closeSheet(); back(); };
  $('#f-save').onclick = () => {
    collect();
    if (!p.name) p.name = cat(p.cat).name;
    p.updated = Date.now();
    if (old) Object.assign(old, p); else S.places.push(p);
    commitPhotos(); formNewPhotos = []; formDirty = false;
    save(); drawItems(); closeSheet(); showDetail(p.id);
    toast(old ? 'Lieu modifié' : 'Lieu ajouté');
  };
  if (!old && !snap && !p.name) setTimeout(() => $('#f-name')?.focus(), 300);
}

/* --- Balade --- */
function editWalk(id, init) {
  const old = id ? findItem(id) : null;
  const w = old ? JSON.parse(JSON.stringify(old)) : Object.assign({ id: uid(), name: '', notes: '', rating: 0, fav: false, diff: 0, mode: 0, photos: [], visits: [], created: Date.now() }, init);
  if (!old && init.recorded) w.visits = [init.date];
  initFormPhotos(w.photos); formDirty = !old;
  const len = trackLength(w.track), loop = haversine(w.track[0], w.track.at(-1)) < 150;
  const back = old ? () => { rollbackPhotos(); showDetail(old.id); } : () => rollbackPhotos();
  if (!old) { tempLayer.clearLayers(); L.polyline(w.track, { color: WALK.color, weight: 5 }).addTo(tempLayer); map.fitBounds(L.latLngBounds(w.track), { padding: [30, 30] }); }
  openSheet(`
    <h2>${old ? 'Modifier la balade' : 'Nouvelle balade'}</h2>
    <div class="facts"><span class="fact">${fmtDist(len)}</span>${w.duration ? `<span class="fact">${fmtDur(w.duration)}</span>` : ''}<span class="fact">${loop ? 'Boucle' : 'Aller simple'}</span></div>
    <label class="field"><span>Nom</span><input id="f-name" value="${esc(w.name)}" placeholder="ex : Tour de l'étang par les bois"></label>
    <div class="field"><span>Difficulté</span></div><div class="seg" id="f-diff">${DIFF.map((d, i) => `<button type="button" data-i="${i}" class="${i === w.diff ? 'sel' : ''}">${d}</button>`).join('')}</div>
    <div class="field"><span>Pratique</span></div><div class="seg" id="f-mode">${MODES.map((d, i) => `<button type="button" data-i="${i}" class="${i === w.mode ? 'sel' : ''}">${d}</button>`).join('')}</div>
    <label class="field"><span>Note pour me rappeler</span><textarea id="f-notes" placeholder="Par où passer, boue, poussettes, chiens, plus belle saison…">${esc(w.notes)}</textarea></label>
    <div class="field"><span>Photos</span></div><div class="photos" id="f-photos"></div>
    ${w.recorded ? '' : `<label class="field"><span>Durée habituelle en minutes</span><input id="f-dur" type="number" inputmode="numeric" min="0" value="${w.duration ? Math.round(w.duration / 60) : ''}" placeholder="environ ${Math.round(estDur(w) / 60)}"></label>`}
    <div class="field"><span>Mon avis</span></div>${starsInput(w.rating)}
    <label class="switch">Coup de cœur<input type="checkbox" id="f-fav" ${w.fav ? 'checked' : ''}></label>
    <div class="sticky-save"><button class="btn" id="f-cancel">Annuler</button><button class="btn primary" id="f-save">Enregistrer</button></div>`, () => { tempLayer.clearLayers(); back(); });
  renderPhotoStrip($('#f-photos'), formPhotos, true);
  $('#sheet').oninput = () => formDirty = true;
  const seg = (sel, key) => $(sel).onclick = e => { const i = e.target.dataset.i; if (i == null) return; w[key] = +i; formDirty = true; $$(sel + ' button').forEach(b => b.classList.toggle('sel', b === e.target)); };
  seg('#f-diff', 'diff'); seg('#f-mode', 'mode');
  bindStars(() => w.rating, s => w.rating = s);
  $('#f-cancel').onclick = () => { formDirty = false; closeSheet(); tempLayer.clearLayers(); back(); };
  $('#f-save').onclick = () => {
    w.name = $('#f-name').value.trim() || 'Balade du ' + fmtDate(w.created);
    w.notes = $('#f-notes').value; w.fav = $('#f-fav').checked; w.photos = formPhotos.slice(); w.updated = Date.now();
    const d = $('#f-dur'); if (d) w.duration = d.value ? Math.max(0, +d.value) * 60 : null;
    if (old) Object.assign(old, w); else S.walks.push(w);
    commitPhotos(); formNewPhotos = []; formDirty = false;
    save(); tempLayer.clearLayers(); drawItems(); closeSheet(); showDetail(w.id);
    toast(old ? 'Balade modifiée' : 'Balade ajoutée');
  };
}

/* ================= Fiche d'un lieu ================= */
let detailId = null;
function showDetail(id) {
  const it = findItem(id); if (!it) return;
  detailId = id;
  const walk = isWalk(it), c = look(it), dh = distHome(it), visits = it.visits || [];
  const [la, ln] = posOf(it);
  const today = new Date().toDateString(), doneToday = visits.some(t => new Date(t).toDateString() === today);
  const facts = walk ? [fmtDist(trackLength(it.track)), it.duration ? fmtDur(it.duration) : '≈ ' + fmtDur(estDur(it)), DIFF[it.diff || 0], MODES[it.mode || 0], haversine(it.track[0], it.track.at(-1)) < 150 ? 'Boucle' : 'Aller simple'] : [];
  const rows = [];
  if (it.notes) rows.push(`<div class="irow">${ic('notes')}<div class="it">${esc(it.notes)}</div></div>`);
  if (it.info) rows.push(`<div class="irow">${ic('clock')}<div class="it">${esc(it.info)}</div></div>`);
  if (it.contact) rows.push(`<div class="irow">${ic('phone')}<div class="it">${/^[+\d][\d .]{5,}$/.test(it.contact) ? `<a href="tel:${esc(it.contact.replace(/\s/g, ''))}">${esc(it.contact)}</a>` : esc(it.contact)}</div></div>`);
  if (it.link) rows.push(`<div class="irow">${ic('link')}<div class="it"><a href="#" id="d-link">${/google\.|goo\.gl/.test(it.link) ? 'Ouvrir dans Google Maps' : esc(it.link)}</a></div></div>`);
  if (!walk) rows.push(`<div class="irow">${ic('place')}<div class="it" id="d-ll">${la.toFixed(5)}, ${ln.toFixed(5)}</div><button class="ib" id="d-copy" aria-label="Copier">${ic('copy')}</button></div>`);
  rows.push(`<div class="irow">${ic('history')}<div class="it">${visits.length ? `${walk ? 'Faite' : 'Visité'} ${visits.length} fois · dernière fois le ${fmtDate(Math.max(...visits))}` : 'Ajouté le ' + fmtDate(it.created)}</div></div>`);
  openSheet(`
    <h2>${esc(it.name)}</h2>
    <div class="sub">${c.emoji} ${esc(c.name)}${it.rating ? `<span class="dot"></span>${stars(it.rating)}` : ''}${it.fav ? '<span class="dot"></span>Coup de cœur' : ''}${dh != null ? `<span class="dot"></span>${fmtDist(dh)}` : ''}</div>
    ${facts.length ? `<div class="facts">${facts.map(f => `<span class="fact">${esc(f)}</span>`).join('')}</div>` : ''}
    <div class="actions">
      <button class="act primary" id="d-go">${ic('directions')}Itinéraire</button>
      <button class="act ${doneToday ? 'done' : ''}" id="d-visit">${ic('check')}${doneToday ? (walk ? 'Faite' : 'Visité') + " aujourd'hui" : (walk ? 'Je l\'ai faite' : 'J\'y suis allé')}</button>
      <button class="act" id="d-edit">${ic('edit')}Modifier</button>
      ${walk ? `<button class="act" id="d-retrace">${ic('draw')}Tracé</button><button class="act" id="d-gpx">${ic('download')}GPX</button>` : ''}
    </div>
    ${it.photos?.length ? '<div class="photos big" id="d-photos"></div>' : ''}
    <div class="info">${rows.join('')}</div>
    <button class="danger-link" id="d-del">${ic('delete')}Supprimer</button>`, null, { modal: false });
  highlight(id);
  if (it.photos?.length) renderPhotoStrip($('#d-photos'), it.photos, false);
  if (it.link) $('#d-link').onclick = e => { e.preventDefault(); openExternal(firstUrl(it.link) || `https://www.google.com/maps/search/?api=1&query=${la},${ln}`); };
  if (!walk) $('#d-copy').onclick = async () => {
    const txt = $('#d-ll').textContent;
    try { await navigator.clipboard.writeText(txt); toast('Coordonnées copiées'); }
    catch (e) { const r = document.createRange(); r.selectNodeContents($('#d-ll')); getSelection().removeAllRanges(); getSelection().addRange(r); toast('Sélectionné : fais « Copier »'); }
  };
  $('#d-go').onclick = () => openExternal(`geo:${la},${ln}?q=${la},${ln}(${encodeURIComponent(it.name)})`);
  $('#d-visit').onclick = () => {
    if (doneToday) return toast('Déjà noté aujourd\'hui');
    it.visits = [...visits, Date.now()]; it.updated = Date.now(); save(); showDetail(id); toast('Noté');
  };
  $('#d-edit').onclick = () => walk ? editWalk(id) : editPlace(id);
  if (walk) {
    $('#d-retrace').onclick = () => { closeSheet(); startDrawing(it); };
    $('#d-gpx').onclick = () => saveFile(safeName(it.name) + '.gpx', 'application/gpx+xml', toGPX(it));
  }
  $('#d-del').onclick = () => {
    if (!confirm(`Supprimer « ${it.name} » ? C'est définitif.`)) return;
    (it.photos || []).forEach(p => Photos.del(p));
    S.places = S.places.filter(x => x.id !== id); S.walks = S.walks.filter(x => x.id !== id); S.deleted[id] = Date.now();
    save(); closeSheet(); drawItems(); if (currentView === 'list') renderList(); toast('Supprimé');
  };
}

/* ================= Mes lieux ================= */
let listFilter = 'all';
function renderList() {
  const used = new Set(S.places.map(p => p.cat));
  const chips = [['all', 'Tout'], ['fav', '⭐ Coups de cœur'], ...(S.walks.length ? [['walk', '🥾 Balades']] : []), ...S.cats.filter(c => used.has(c.id)).map(c => [c.id, c.emoji + ' ' + c.name])];
  if (!chips.some(c => c[0] === listFilter)) listFilter = 'all';
  $('#chips').innerHTML = chips.map(([k, l]) => `<button class="chip ${k === listFilter ? 'sel' : ''}" data-k="${k}">${esc(l)}</button>`).join('');
  const q = norm($('#search').value.trim());
  const items = [...S.walks, ...S.places].filter(it => {
    if (listFilter === 'fav' && !it.fav) return false;
    if (listFilter === 'walk' && !isWalk(it)) return false;
    if (!['all', 'fav', 'walk'].includes(listFilter) && it.cat !== listFilter) return false;
    return !q || norm([it.name, it.notes, it.info, look(it).name].join(' ')).includes(q);
  });
  const sort = $('#sort').value, byName = (a, b) => a.name.localeCompare(b.name, 'fr');
  if (sort === 'near' && S.home) items.sort((a, b) => distHome(a) - distHome(b));
  else if (sort === 'rating') items.sort((a, b) => (b.rating || 0) - (a.rating || 0) || byName(a, b));
  else if (sort === 'name') items.sort(byName);
  else items.sort((a, b) => (b.updated || b.created) - (a.updated || a.created));
  if (!S.places.length && !S.walks.length) {
    $('#list').innerHTML = '<div class="empty"><div class="big">🌿</div>Rien pour l\'instant.<br>Sur la carte, appuie sur <b>Ajouter</b> pour noter ta première balade ou ton premier lieu.<br><br>Astuce : un appui long sur la carte ajoute un lieu à cet endroit.</div>';
    return;
  }
  $('#list').innerHTML = items.length ? items.map(it => {
    const w = isWalk(it), c = look(it), d = distHome(it);
    const meta = w ? `${fmtDist(trackLength(it.track))} · ${it.duration ? fmtDur(it.duration) : '≈ ' + fmtDur(estDur(it))} · ${DIFF[it.diff || 0]}` : c.name + (it.info ? ' · ' + it.info : '');
    return `<button class="item" data-id="${it.id}"><div class="thumb" style="--c:${c.color}" ${it.photos?.length ? `data-ph="${it.photos[0]}"` : ''}>${c.emoji}</div>
      <div class="txt"><div class="name">${esc(it.name)}</div><div class="meta">${esc(meta)}</div><div class="meta">${stars(it.rating)}${it.fav ? ' Coup de cœur' : ''}${it.notes ? (it.rating || it.fav ? ' · ' : '') + esc(it.notes.split('\n')[0]) : ''}</div></div>
      ${d != null ? `<div class="dist">${fmtDist(d)}</div>` : ''}</button>`;
  }).join('') : '<div class="empty">Aucun résultat</div>';
  // Vignettes photo chargées après coup
  $$('#list [data-ph]').forEach(t => Photos.get(t.dataset.ph).then(d => { if (d) t.innerHTML = `<img alt="" src="${d}">`; }));
}
$('#chips').onclick = e => { const k = e.target.closest('[data-k]')?.dataset.k; if (k) { listFilter = k; renderList(); } };
let listT; $('#search').oninput = () => { clearTimeout(listT); listT = setTimeout(renderList, 120); };
$('#sort').onchange = renderList;
$('#list').onclick = e => {
  const id = e.target.closest('[data-id]')?.dataset.id; if (!id) return;
  const it = findItem(id);
  showView('map');
  if (isWalk(it)) map.fitBounds(L.latLngBounds(it.track), { padding: [60, 60] }); else map.setView(posOf(it), Math.max(map.getZoom(), 16));
  showDetail(id);
};

/* ================= Réglages ================= */
function renderSettings() {
  const km = S.walks.reduce((s, w) => s + trackLength(w.track), 0);
  const row = (id, icon, title, sub) => `<button class="row" id="${id}"><span class="ri green">${ic(icon)}</span><span class="rt"><b>${title}</b>${sub ? `<span>${sub}</span>` : ''}</span></button>`;
  $('#settings').innerHTML = `
    <div class="card"><div class="stats">
      <div><b>${S.places.length}</b><span>lieux</span></div>
      <div><b>${S.walks.length}</b><span>balades</span></div>
      <div><b>${fmtDist(km)}</b><span>de chemins</span></div></div></div>
    <div class="card"><div class="ch">Ma maison</div>
      ${row('s-home-addr', 'home', S.home ? 'Changer mon adresse' : 'Saisir mon adresse', S.home ? esc(S.home.address || 'Position enregistrée, sans adresse') : 'Pour voir la distance de chaque lieu')}
      ${row('s-home-map', 'target', 'Placer sur la carte', '')}
      ${row('s-home-gps', 'locate', 'Je suis chez moi', 'Utiliser ma position actuelle')}</div>
    <div class="card" id="s-cats"><div class="ch">Catégories</div>
      ${S.cats.map(c => `<button class="row" data-edit="${c.id}"><span class="ri" style="background:color-mix(in srgb, ${c.color} 16%, white)">${c.emoji}</span><span class="rt"><b>${esc(c.name)}</b><span>${S.places.filter(p => p.cat === c.id).length} lieu(x)</span></span>${ic('edit')}</button>`).join('')}
      ${row('s-addcat', 'add', 'Nouvelle catégorie', '')}</div>
    <div class="card"><div class="ch">PC et téléphone</div>
      <p id="sync-status">${syncStatusHtml()}</p>
      ${row('s-link', 'link', syncCfg ? 'Relier un autre appareil' : 'Relier PC et téléphone', syncCfg ? 'QR code à scanner ou clé à copier' : 'Mêmes lieux partout, synchronisés tout seuls')}
      ${syncCfg ? row('s-sync', 'history', 'Synchroniser maintenant', '') + row('s-unlink', 'close', 'Délier cet appareil', '') : ''}</div>
    <div class="card"><div class="ch">Sauvegarde</div>
      <p>${syncCfg ? 'Tes lieux sont aussi copiés sur GitHub. Une sauvegarde en fichier reste possible.' : 'Tes notes restent sur cet appareil. Fais une sauvegarde de temps en temps (photos comprises).'}</p>
      ${row('s-export', 'download', 'Sauvegarder tout', 'Fichier .json dans Téléchargements')}
      ${row('s-import', 'upload', 'Restaurer ou importer', 'Sauvegarde Mon Coin ou balade .gpx')}</div>
    <div class="card"><div class="ch">Astuces</div>
      <p>Appui long sur la carte : ajouter un lieu à cet endroit.<br>Les puces sous la barre de recherche filtrent la carte.<br>Pendant l'enregistrement d'une balade, le GPS continue écran éteint.<br>La carte a besoin d'internet ; tes lieux et notes, non.</p></div>`;
  $('#s-home-addr').onclick = () => openSearch('home');
  $('#s-home-map').onclick = () => pickPosition('Place l\'épingle sur ta maison', ll => setHome(ll, S.home?.address), () => showView('settings'));
  $('#s-home-gps').onclick = async () => { try { const [la, ln] = await getPosition(); setHome([la, ln], S.home?.address); } catch (e) { toast(e.message); } };
  $('#s-addcat').onclick = () => editCat(null);
  $('#s-cats').onclick = e => { const id = e.target.closest('[data-edit]')?.dataset.edit; if (id) editCat(id); };
  $('#s-export').onclick = exportAll;
  $('#s-link').onclick = openLinkSheet;
  if (syncCfg) { $('#s-sync').onclick = () => Sync.run(true); $('#s-unlink').onclick = unlinkDevice; }
  $('#s-import').onclick = () => pickImport();
}
function editCat(id) {
  const c = id ? S.cats.find(x => x.id === id) : { id: 'c_' + uid(), emoji: '📌', name: '', color: '#1e7d4f' };
  const n = S.places.filter(p => p.cat === c.id).length;
  openSheet(`
    <h2>${id ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
    <div style="display:flex;gap:10px"><label class="field" style="width:90px"><span>Emoji</span><input id="c-emoji" value="${esc(c.emoji)}" maxlength="8" style="font-size:22px;text-align:center"></label>
    <label class="field" style="flex:1"><span>Nom</span><input id="c-name" value="${esc(c.name)}" placeholder="ex : Fromager"></label></div>
    <label class="field"><span>Couleur</span><input id="c-color" type="color" value="${c.color}" style="height:48px;padding:4px"></label>
    ${id ? `<p class="sub">${n} lieu${n > 1 ? 'x' : ''} dans cette catégorie.</p>` : ''}
    <div class="btn-row">${id && id !== 'autre' ? '<button class="btn danger" id="c-del">Supprimer</button>' : ''}<button class="btn" id="c-cancel">Annuler</button><button class="btn primary" id="c-save">Enregistrer</button></div>`);
  $('#c-cancel').onclick = closeSheet;
  $('#c-save').onclick = () => {
    c.emoji = $('#c-emoji').value.trim() || '📌'; c.name = $('#c-name').value.trim() || 'Sans nom'; c.color = $('#c-color').value;
    if (!id) S.cats.push(c);
    S.catsUpdated = Date.now();
    save(); drawItems(); closeSheet(); renderSettings();
  };
  const del = $('#c-del');
  if (del) del.onclick = () => {
    if (!confirm(n ? `Supprimer ? Les ${n} lieu(x) passeront dans « Autre ».` : 'Supprimer cette catégorie ?')) return;
    S.places.forEach(p => { if (p.cat === id) { p.cat = 'autre'; p.updated = Date.now(); } });
    S.cats = S.cats.filter(x => x.id !== id); S.catsUpdated = Date.now(); save(); drawItems(); closeSheet(); renderSettings();
  };
}

/* ================= Import / export ================= */
const safeName = s => (s || 'balade').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'balade';
function toGPX(w) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Mon Coin" xmlns="http://www.topografix.com/GPX/1/1">
<trk><name>${esc(w.name)}</name><desc>${esc(w.notes || '')}</desc><trkseg>
${w.track.map(p => `<trkpt lat="${p[0].toFixed(6)}" lon="${p[1].toFixed(6)}"/>`).join('\n')}
</trkseg></trk></gpx>`;
}
async function exportAll() {
  toast('Préparation de la sauvegarde…');
  const photos = {};
  for (const id of [...S.places, ...S.walks].flatMap(i => i.photos || [])) { const d = await Photos.get(id); if (d) photos[id] = d; }
  const d = new Date(), data = { app: 'moncoin', version: 1, date: d.toISOString(), data: S, photos };
  saveFile(`mon-coin-sauvegarde-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`, 'application/json', JSON.stringify(data));
}
function pickImport() {
  const inp = $('#file-import'); inp.value = '';
  inp.onchange = async () => {
    const f = inp.files[0]; if (!f) return;
    const text = await f.text();
    try {
      if (/^\s*</.test(text)) return importGPX(text, f.name);
      const j = JSON.parse(text);
      if (j.app !== 'moncoin' || !j.data) throw new Error('ce n\'est pas une sauvegarde Mon Coin');
      const replace = confirm(`Sauvegarde du ${fmtDate(j.date)} : ${j.data.places.length} lieux, ${j.data.walks.length} balades.\n\nOK = REMPLACER tout ce qu'il y a dans l'appli\nAnnuler = AJOUTER à l'existant`);
      for (const [id, d] of Object.entries(j.photos || {})) await Photos.put(id, d);
      if (replace) { const now = Date.now(), keep = new Set([...j.data.places, ...j.data.walks].map(y => y.id)), gone = [...S.places, ...S.walks].filter(x => !keep.has(x.id)); S = Object.assign(blank(), j.data, { layer: S.layer, homeUpdated: now, catsUpdated: now, deleted: { ...(S.deleted || {}), ...(j.data.deleted || {}) } }); gone.forEach(x => S.deleted[x.id] = now); [...S.places, ...S.walks].forEach(x => x.updated = now); }
      else {
        const have = new Set([...S.places, ...S.walks].map(i => i.id));
        S.places.push(...j.data.places.filter(p => !have.has(p.id)));
        S.walks.push(...j.data.walks.filter(w => !have.has(w.id)));
        for (const c of j.data.cats || []) if (!S.cats.some(x => x.id === c.id)) { S.cats.push(c); S.catsUpdated = Date.now(); }
        if (!S.home && j.data.home) { S.home = j.data.home; S.homeUpdated = Date.now(); }
      }
      if (S.filter && !S.filter.only) S.filter = null;
      save(); drawItems(); if (currentView === 'settings') renderSettings(); toast('Import terminé');
    } catch (e) { toast('Import impossible : ' + e.message, 4000); }
  };
  inp.click();
}
function importGPX(text, fname) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  let pts = $$('trkpt', doc); if (!pts.length) pts = $$('rtept', doc);
  const track = pts.map(p => [+p.getAttribute('lat'), +p.getAttribute('lon')]).filter(p => isFinite(p[0]) && isFinite(p[1]));
  if (track.length < 2) throw new Error('aucun tracé dans ce fichier');
  const slim = [track[0]]; // on allège les gros tracés (1 point tous les ~10 m suffit)
  for (const p of track) if (haversine(slim.at(-1), p) >= 10) slim.push(p);
  if (slim.at(-1) !== track.at(-1)) slim.push(track.at(-1));
  const name = doc.querySelector('trk > name, rte > name, metadata > name')?.textContent.trim() || fname.replace(/\.gpx$/i, '');
  showView('map');
  editWalk(null, { track: slim, name });
}

/* ================= Synchronisation PC ⇄ téléphone =================
   Les données vont dans un dépôt GitHub PRIVÉ (data.json + photos/). Chaque appareil fusionne :
   pour chaque lieu, la version la plus récente gagne ; une suppression gagne si elle est plus récente que la dernière modification. */
const SYNC_KEY = 'moncoin.sync';
const SYNC_REPO = 'Snoog43/mon-coin-data';
const TOKEN_URL = 'https://github.com/settings/personal-access-tokens/new?name=Mon+Coin&description=Synchro+Mon+Coin+(PC+et+t%C3%A9l%C3%A9phone)&target_name=Snoog43&expires_in=none&contents=write';
let syncCfg = (() => { try { return JSON.parse(localStorage.getItem(SYNC_KEY)) || null; } catch (e) { return null; } })();
const saveSyncCfg = () => { try { if (syncCfg) localStorage.setItem(SYNC_KEY, JSON.stringify(syncCfg)); else localStorage.removeItem(SYNC_KEY); } catch (e) {} };

const b64enc = str => { const b = new TextEncoder().encode(str); let bin = ''; for (let i = 0; i < b.length; i += 0x8000) bin += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(bin); };
const b64dec = str => new TextDecoder().decode(Uint8Array.from(atob(str.replace(/\s/g, '')), c => c.charCodeAt(0)));
const ts = it => it.updated || it.created || 0;
const byId = (a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
/* Partie des données qui voyage entre les appareils (fond de carte, filtres et recherches récentes restent sur chaque appareil) */
const syncPart = d => ({ home: d.home || null, homeUpdated: d.homeUpdated || 0, cats: d.cats || DEFAULT_CATS, catsUpdated: d.catsUpdated || 0, places: [...(d.places || [])].sort(byId), walks: [...(d.walks || [])].sort(byId), deleted: d.deleted || {} });
const fingerprint = d => JSON.stringify(syncPart(d));
function mergeData(L, R) {
  L = syncPart(L);
  if (!R) return L;
  R = syncPart(R);
  const deleted = { ...R.deleted };
  for (const [k, v] of Object.entries(L.deleted)) deleted[k] = Math.max(deleted[k] || 0, v);
  for (const k in deleted) if (deleted[k] < Date.now() - 365 * 864e5) delete deleted[k]; // suppressions de plus d'un an : oubliées
  const pick = (a, b) => {
    const m = new Map();
    for (const it of [...a, ...b]) { const o = m.get(it.id); if (!o || ts(it) > ts(o)) m.set(it.id, it); }
    return [...m.values()].filter(it => !(deleted[it.id] >= ts(it))).sort(byId);
  };
  // Maison : la plus récente ; à égalité, celle qui existe
  const homeL = L.homeUpdated > R.homeUpdated || (L.homeUpdated === R.homeUpdated && (!!L.home || !R.home));
  const catsL = L.catsUpdated >= R.catsUpdated;
  return {
    home: homeL ? L.home : R.home, homeUpdated: Math.max(L.homeUpdated, R.homeUpdated),
    cats: catsL ? L.cats : R.cats, catsUpdated: Math.max(L.catsUpdated, R.catsUpdated),
    places: pick(L.places, R.places), walks: pick(L.walks, R.walks), deleted,
  };
}

const Sync = {
  busy: false, again: false, applying: false, timer: null, state: 'off', msg: '',
  lastFp: (() => { try { return localStorage.getItem('moncoin.syncfp') || ''; } catch (e) { return ''; } })(),
  async api(path, opts = {}) {
    const r = await fetch(`https://api.github.com/repos/${syncCfg.repo}${path}`, {
      method: opts.method || 'GET', body: opts.body, cache: 'no-store',
      headers: { Authorization: 'Bearer ' + syncCfg.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    });
    if (r.status === 404 && opts.allow404) return null;
    if (!r.ok) { const e = new Error('GitHub ' + r.status); e.status = r.status; throw e; }
    return r.json();
  },
  set(state, msg = '') { this.state = state; this.msg = msg; const el = $('#sync-status'); if (el) el.innerHTML = syncStatusHtml(); },
  /* Après chaque enregistrement : synchro quelques secondes plus tard si quelque chose a changé */
  soon() {
    if (!syncCfg || this.applying || fingerprint(S) === this.lastFp) return;
    clearTimeout(this.timer); this.timer = setTimeout(() => this.run(), 2500);
  },
  async run(manual) {
    if (!syncCfg) return;
    if (!navigator.onLine) { this.set('offline', 'Hors connexion : synchro dès le retour d\'internet'); return; }
    if (this.busy) { this.again = true; return; }
    this.busy = true; this.set('busy');
    try {
      for (let attempt = 0; ; attempt++) {
        const meta = await this.api('/contents/data.json', { allow404: true });
        let remote = null;
        if (meta) remote = JSON.parse(meta.content ? b64dec(meta.content) : await (await fetch(meta.download_url, { cache: 'no-store' })).text()).data;
        const merged = mergeData(S, remote), fp = JSON.stringify(merged);
        if (fp !== fingerprint(S)) this.apply(merged);
        await this.pushPhotos();
        if (!remote || fp !== fingerprint(remote)) {
          try {
            await this.api('/contents/data.json', { method: 'PUT', body: JSON.stringify({ message: 'Mon Coin ' + new Date().toISOString().slice(0, 16), content: b64enc(JSON.stringify({ app: 'moncoin', version: 1, data: merged })), ...(meta ? { sha: meta.sha } : {}) }) });
          } catch (e) {
            if ((e.status === 409 || e.status === 422) && attempt < 3) continue; // l'autre appareil a écrit entre-temps : on refusionne
            throw e;
          }
        }
        this.lastFp = fingerprint(S); try { localStorage.setItem('moncoin.syncfp', this.lastFp); } catch (e) {}
        break;
      }
      syncCfg.last = Date.now(); saveSyncCfg(); this.set('ok');
      if (manual) toast('Synchronisé');
    } catch (e) {
      const msg = e.status === 401 ? 'Clé refusée par GitHub (expirée ou supprimée) : relie à nouveau cet appareil'
        : e.status === 403 || e.status === 404 ? 'La clé n\'a pas accès au dépôt mon-coin-data (droit « Contents : Read and write »)'
        : 'Synchro impossible pour l\'instant (' + (e.message || 'réseau') + ')';
      this.set('error', msg);
      if (manual) toast(msg, 5000);
    } finally {
      this.busy = false;
      if (this.again) { this.again = false; this.run(); }
    }
  },
  /* Remplace les données partagées par la fusion (le reste est propre à cet appareil) */
  apply(merged) {
    this.applying = true;
    Object.assign(S, merged); save();
    this.applying = false;
    drawItems();
    if (currentView === 'list') renderList();
    if (currentView === 'settings') renderSettings();
    if (detailId && !findItem(detailId) && !$('#sheet').hidden && !formDirty) closeSheet();
  },
  /* Envoie les photos que le dépôt n'a pas encore */
  async pushPhotos() {
    const known = new Set(syncCfg.photos || []);
    const todo = [...new Set([...S.places, ...S.walks].flatMap(i => i.photos || []))].filter(id => !known.has(id));
    if (!todo.length) return;
    for (const f of (await this.api('/contents/photos', { allow404: true })) || []) known.add(f.name.replace(/\.jpg$/, ''));
    for (const id of todo) {
      if (known.has(id)) continue;
      const d = await Photos.tx('readonly', s => s.get(id));
      if (!d) continue; // photo d'un autre appareil pas encore téléchargée ici
      await this.api(`/contents/photos/${id}.jpg`, { method: 'PUT', body: JSON.stringify({ message: 'Photo ' + id, content: d.split(',')[1] }) });
      known.add(id);
    }
    syncCfg.photos = [...known]; saveSyncCfg();
  },
  async fetchPhoto(id) {
    if (!syncCfg || !navigator.onLine) return null;
    try { const j = await this.api(`/contents/photos/${id}.jpg`, { allow404: true }); return j && j.content ? 'data:image/jpeg;base64,' + j.content.replace(/\s/g, '') : null; }
    catch (e) { return null; }
  },
};

function syncStatusHtml() {
  if (!syncCfg) return 'Pas relié : tes lieux restent sur cet appareil';
  if (Sync.state === 'busy') return 'Synchronisation…';
  if (Sync.state === 'error' || Sync.state === 'offline') return `<span style="color:var(--danger)">${esc(Sync.msg)}</span>`;
  if (!syncCfg.last) return 'Relié';
  const m = Math.round((Date.now() - syncCfg.last) / 60000);
  return 'Relié · synchronisé ' + (m < 1 ? 'à l\'instant' : m < 60 ? `il y a ${m} min` : 'le ' + new Date(syncCfg.last).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }));
}

/* Relier cet appareil avec une clé (collée, ou reçue par le QR code via moncoin://lier) */
async function linkDevice(token) {
  token = String(token || '').trim();
  if (!/^(github_pat_|ghp_)\w{20,}$/.test(token)) return toast('Ce n\'est pas une clé GitHub (elle commence par github_pat_)', 4000);
  const prev = syncCfg;
  syncCfg = { token, repo: SYNC_REPO, last: 0, photos: [] };
  try { await Sync.api(''); }
  catch (e) {
    syncCfg = prev;
    return toast(e.status === 401 ? 'Clé refusée par GitHub' : e.status === 404 || e.status === 403 ? 'Cette clé n\'a pas accès au dépôt mon-coin-data' : 'Impossible de joindre GitHub', 5000);
  }
  saveSyncCfg(); Sync.lastFp = '';
  toast('Appareil relié, synchronisation…');
  await Sync.run(true);
  if (currentView === 'settings') renderSettings();
}
function unlinkDevice() {
  if (!confirm('Délier cet appareil ? Tes lieux restent ici, mais ne seront plus synchronisés.')) return;
  syncCfg = null; saveSyncCfg(); Sync.set('off'); renderSettings();
}
/* Fenêtre « Relier PC et téléphone » */
function openLinkSheet() {
  if (syncCfg) {
    let qr = '';
    try { const q = qrcode(0, 'M'); q.addData(`moncoin://lier?k=${syncCfg.token}`); q.make(); qr = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); } catch (e) {}
    openSheet(`<h2>Relier un autre appareil</h2>
      <p class="sub">Sur le <b>téléphone</b> (appli Mon Coin installée) : ouvre l'appareil photo, vise ce code puis touche le lien proposé. L'appli s'ouvre et se relie toute seule.</p>
      ${qr ? `<div style="max-width:230px;margin:14px auto">${qr}</div>` : ''}
      <p class="sub">Sur un <b>autre PC</b>, ou si le scan ne marche pas : copie la clé, puis colle-la sur l'autre appareil dans Réglages → Relier PC et téléphone.</p>
      <div class="btn-row"><button class="btn tonal" id="lk-copy">${ic('copy')}Copier la clé</button></div>
      <p class="sub" style="margin-top:14px">Cette clé donne accès à tes lieux : ne la donne à personne.</p>`);
    $('#lk-copy').onclick = async () => { try { await navigator.clipboard.writeText(syncCfg.token); toast('Clé copiée'); } catch (e) { prompt('Copie la clé :', syncCfg.token); } };
    return;
  }
  openSheet(`<h2>Relier PC et téléphone</h2>
    <p class="sub">Tes lieux, balades et photos seront enregistrés dans ton espace GitHub <b>privé</b> (dépôt « mon-coin-data », visible par toi seul) et partagés entre tes appareils reliés.</p>
    <h3>1. Créer la clé (une seule fois, de préférence sur le PC)</h3>
    <p class="sub">Sur la page GitHub qui s'ouvre :<br>• <b>Repository access</b> : « Only select repositories » → <b>mon-coin-data</b><br>• <b>Permissions</b> → <b>Contents</b> : « Read and write »<br>• en bas : <b>Generate token</b>, puis copie la clé (elle commence par <i>github_pat_</i>).</p>
    <div class="btn-row"><button class="btn tonal" id="lk-gh">${ic('open')}Ouvrir GitHub</button></div>
    <h3>2. Colle la clé ici</h3>
    <label class="field"><input id="lk-token" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_…"></label>
    <div class="btn-row"><button class="btn primary" id="lk-go">${ic('link')}Relier cet appareil</button></div>
    <p class="sub" style="margin-top:12px">Ensuite, cet écran affichera un QR code : le téléphone n'aura qu'à le scanner.</p>`);
  $('#lk-gh').onclick = () => openExternal(TOKEN_URL);
  $('#lk-go').onclick = async () => { const t = $('#lk-token').value; closeSheet(); await linkDevice(t); if (syncCfg) openLinkSheet(); };
}
/* Lien moncoin://lier?k=… reçu par l'appli (QR code scanné avec l'appareil photo) */
window.checkLink = function () {
  const t = NATIVE && NATIVE.takeLink ? NATIVE.takeLink() : '';
  const k = t && new URLSearchParams(t.split('?')[1] || '').get('k');
  if (k) { closeSearch(); if (!$('#sheet').hidden) closeSheet(); showView('settings'); linkDevice(k); }
};
// Synchro au démarrage, au retour sur l'appli, au retour d'internet, et toutes les 2 minutes quand l'appli est ouverte
let lastAutoSync = 0;
const autoSync = () => { if (syncCfg && !document.hidden && Date.now() - lastAutoSync > 15000) { lastAutoSync = Date.now(); Sync.run(); } };
document.addEventListener('visibilitychange', autoSync);
window.addEventListener('online', autoSync);
setInterval(autoSync, 120000);

/* ================= Démarrage ================= */
drawItems();
setTimeout(window.checkShared, 400);
setTimeout(window.checkLink, 400);
setTimeout(autoSync, 800);
if (localStorage.getItem(REC_KEY)) resumeRecording();
else if (!S.home && !S.places.length) setTimeout(() => {
  openSheet(`<h2>Bienvenue dans Mon Coin 🌿</h2>
    <p class="sub" style="font-size:15px;margin-top:8px">Note tes balades et tes bonnes adresses autour de chez toi : cours d'eau, fermes, boucher, points de vue, coins à champignons…</p>
    <p class="sub" style="font-size:15px">Commence par ton adresse : chaque lieu affichera sa distance depuis chez toi.</p>
    <div class="btn-row"><button class="btn primary" id="w-addr">${ic('home')}Saisir mon adresse</button></div>
    <div class="btn-row"><button class="btn" id="w-sync">${ic('link')}J'utilise déjà Mon Coin ailleurs</button></div>
    <div class="btn-row"><button class="btn small" id="w-later" style="box-shadow:none">Plus tard</button></div>`, null, { modal: true });
  $('#w-sync').onclick = () => { closeSheet(); openLinkSheet(); };
  $('#w-addr').onclick = () => { closeSheet(); openSearch('home'); };
  $('#w-later').onclick = closeSheet;
}, 300);
// Revenu au premier plan : rafraîchir le tracé tout de suite
document.addEventListener('visibilitychange', () => { if (!document.hidden && rec) pullNative(); });
