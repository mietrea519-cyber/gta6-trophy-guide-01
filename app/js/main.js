// main.js — boots the Leonida Ledger: loads the trophy data from this app's own files,
// wires the tracker controls, and renders. The ?shot= scenes are fixed views for taking the
// guide's screenshots; they seed a demo state and never touch the reader's saved progress.

import { loadState, saveState, setEarned, setCount, exportState, importStateFile, demoState } from './store.js';
import { visibleTrophies } from './filters.js';
import { renderProgress, renderChecklist, renderGuide, renderRoadmap } from './views.js';

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const shotMode = shot !== null;

let data = null;
let state = shotMode ? demoState() : loadState();
let selectedId = null;
const ui = { kind: 'all', grade: 'all', query: '', view: 'checklist' };

function persist() {
  if (!shotMode) saveState(state);
}

function selected() {
  return data.trophies.find((t) => t.id === selectedId) ?? null;
}

function render() {
  renderProgress(data.trophies, state, document);
  const visible = visibleTrophies(data.trophies, ui, state);
  renderChecklist(visible, ui, state, selectTrophy, toggleTrophy, changeCount);
  renderGuide(selected(), data, state, toggleTrophy, changeCount);
  renderRoadmap(data, state, (trophy) => {
    setView('checklist');
    selectTrophy(trophy);
  });
  document.getElementById('checklist-view').hidden = ui.view !== 'checklist';
  document.getElementById('roadmap-view').hidden = ui.view !== 'roadmap';
  document.getElementById('tab-checklist').classList.toggle('is-active', ui.view === 'checklist');
  document.getElementById('tab-roadmap').classList.toggle('is-active', ui.view === 'roadmap');
}

function selectTrophy(trophy) {
  selectedId = trophy.id;
  render();
  document.getElementById('guide-pane').scrollIntoView({ block: 'nearest' });
}

function toggleTrophy(trophy, on) {
  setEarned(state, trophy.id, on);
  persist();
  render();
}

function changeCount(trophy, n) {
  setCount(state, trophy, n);
  persist();
  render();
}

function setView(view) {
  ui.view = view;
  render();
}

function wireControls() {
  document.getElementById('tab-checklist').addEventListener('click', () => setView('checklist'));
  document.getElementById('tab-roadmap').addEventListener('click', () => setView('roadmap'));
  document.getElementById('search').addEventListener('input', (event) => {
    ui.query = event.target.value.trim();
    render();
  });
  document.getElementById('kind-chips').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-kind]');
    if (!chip) return;
    ui.kind = chip.dataset.kind;
    for (const c of document.querySelectorAll('#kind-chips .chip')) c.classList.toggle('is-active', c === chip);
    render();
  });
  document.getElementById('grade-filter').addEventListener('change', (event) => {
    ui.grade = event.target.value;
    render();
  });
  const spoiler = document.getElementById('spoiler-toggle');
  spoiler.checked = state.settings.spoilerShield;
  spoiler.addEventListener('change', () => {
    state.settings.spoilerShield = spoiler.checked;
    persist();
    render();
  });
  const hideEarned = document.getElementById('hide-earned-toggle');
  hideEarned.checked = state.settings.hideEarned;
  hideEarned.addEventListener('change', () => {
    state.settings.hideEarned = hideEarned.checked;
    persist();
    render();
  });
  document.getElementById('export-btn').addEventListener('click', () => exportState(state));
  document.getElementById('import-file').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    importStateFile(file).then((imported) => {
      state = imported;
      persist();
      spoiler.checked = state.settings.spoilerShield;
      hideEarned.checked = state.settings.hideEarned;
      render();
    }).catch((error) => {
      document.getElementById('list-status').textContent = error.message;
    });
    event.target.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    state = { earned: {}, counts: {}, settings: state.settings };
    persist();
    render();
  });
}

// The screenshot scenes (see shots.json): each is a fixed, honest view of the real app.
//   ?shot=cover    checklist, demo progress, the missable VCIA guide open
//   ?shot=roadmap  the roadmap with its missable flags and stage progress
//   ?shot=tracker  the missable filter with the spoiler shield on and demo progress
//   ?shot=guide    one full guide open: The Shootist, with its counter and sources
function applyShotScene() {
  if (!shotMode) return;
  if (shot === 'roadmap') {
    ui.view = 'roadmap';
  } else if (shot === 'tracker') {
    state.settings.spoilerShield = true;
    document.getElementById('spoiler-toggle').checked = true;
    ui.kind = 'missable';
    for (const c of document.querySelectorAll('#kind-chips .chip')) {
      c.classList.toggle('is-active', c.dataset.kind === 'missable');
    }
    selectedId = 37;
  } else if (shot === 'guide') {
    selectedId = 17;
  } else {
    selectedId = 37;
  }
}

fetch('data/trophies.json')
  .then((response) => response.json())
  .then((json) => {
    data = json;
    wireControls();
    applyShotScene();
    render();
  })
  .catch(() => {
    document.getElementById('list-status').textContent = 'The trophy data file could not be loaded.';
  });
