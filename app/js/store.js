// store.js — the tracker state: which trophies are earned, the progress counters for the
// trophies PlayStation tracks a count for, and the reader's settings. State lives in the
// browser's localStorage, can be exported to a JSON file, and can be imported back.

export const STORAGE_KEY = 'leonida-ledger-v1';

export function emptyState() {
  return {
    earned: {},
    counts: {},
    settings: { spoilerShield: false, hideEarned: false },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    const state = emptyState();
    if (parsed && typeof parsed === 'object') {
      if (parsed.earned && typeof parsed.earned === 'object') state.earned = parsed.earned;
      if (parsed.counts && typeof parsed.counts === 'object') state.counts = parsed.counts;
      if (parsed.settings && typeof parsed.settings === 'object') {
        state.settings.spoilerShield = parsed.settings.spoilerShield === true;
        state.settings.hideEarned = parsed.settings.hideEarned === true;
      }
    }
    return state;
  } catch {
    return emptyState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: the tracker keeps working for this session.
  }
}

export function isEarned(state, id) {
  return state.earned[id] === true;
}

export function setEarned(state, id, on) {
  if (on) state.earned[id] = true;
  else delete state.earned[id];
}

export function countOf(state, trophy) {
  const n = Number(state.counts[trophy.id]);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (trophy.target != null && n > trophy.target) return trophy.target;
  return Math.floor(n);
}

export function setCount(state, trophy, n) {
  const clamped = Math.max(0, Math.floor(Number(n) || 0));
  state.counts[trophy.id] = trophy.target != null ? Math.min(clamped, trophy.target) : clamped;
  if (trophy.target != null && state.counts[trophy.id] >= trophy.target) state.earned[trophy.id] = true;
}

export function exportState(state) {
  const payload = JSON.stringify({ app: 'leonida-ledger', version: 1, exported: new Date().toISOString(), ...state }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-ledger-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function importStateFile(file) {
  return file.text().then((text) => {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || typeof parsed.earned !== 'object' || parsed.earned === null) {
      throw new Error('That file does not look like a Leonida Ledger progress export.');
    }
    const state = emptyState();
    state.earned = parsed.earned;
    if (parsed.counts && typeof parsed.counts === 'object') state.counts = parsed.counts;
    if (parsed.settings && typeof parsed.settings === 'object') {
      state.settings.spoilerShield = parsed.settings.spoilerShield === true;
      state.settings.hideEarned = parsed.settings.hideEarned === true;
    }
    return state;
  });
}

// A fixed, honest demo state used only by the ?shot= screenshot scenes: it never touches
// localStorage, it just shows the tracker the way a real player mid-run would see it.
export function demoState() {
  const state = emptyState();
  for (const id of [2, 3, 8, 16, 20, 21, 35, 36, 39, 41, 46, 51, 55]) state.earned[id] = true;
  state.counts = { 15: 87, 17: 19, 25: 3, 28: 7, 31: 34, 42: 21, 48: 212, 52: 64000 };
  state.earned[55] = true;
  state.counts[55] = 10;
  return state;
}
