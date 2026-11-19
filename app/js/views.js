// views.js — everything the reader sees: the progress panel, the checklist rows, the guide
// card for the selected trophy, and the roadmap. Rendering is plain DOM built from the
// trophy data; nothing here fetches anything.

import { KIND_LABELS, isMasked, earnedByGrade, gradeTotals } from './filters.js';
import { countOf, isEarned } from './store.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

export function formatCount(trophy, state) {
  if (trophy.target == null) return null;
  const n = countOf({ counts: state.counts }, trophy);
  const unit = trophy.unit === '$' ? '$' : '';
  const shown = unit + n.toLocaleString('en-US');
  const goal = unit + trophy.target.toLocaleString('en-US');
  return `${shown} / ${goal}${trophy.unit === '%' ? '%' : ''}`;
}

export function renderProgress(trophies, state, root) {
  const earned = trophies.filter((t) => isEarned(state, t.id)).length;
  root.querySelector('#earned-count').textContent = String(earned);
  const pct = Math.round((earned / trophies.length) * 100);
  root.querySelector('#progress-pct').textContent = `${pct}% of the list`;
  root.querySelector('#progress-fill').style.width = `${pct}%`;
  const byGrade = earnedByGrade(trophies, state);
  const totals = gradeTotals(trophies);
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    root.querySelector(`#count-${grade}`).textContent = `${byGrade[grade]} / ${totals[grade]}`;
  }
  const openMissables = trophies.filter((t) => t.missable && !isEarned(state, t.id)).length;
  root.querySelector('#missable-note').textContent =
    openMissables > 0 ? `Missables still open: ${openMissables} — flagged in the list and the roadmap` : 'Every flagged missable is earned';
}

function badge(text, className) {
  return el('span', `badge ${className}`, text);
}

export function renderChecklist(trophies, ui, state, onSelect, onToggle, onCount) {
  const list = document.getElementById('trophy-list');
  list.replaceChildren();
  for (const trophy of trophies) {
    const masked = isMasked(trophy, state);
    const row = el('li', `trophy-row grade-row-${trophy.grade}${isEarned(state, trophy.id) ? ' is-earned' : ''}`);
    row.dataset.id = String(trophy.id);

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = isEarned(state, trophy.id);
    check.setAttribute('aria-label', `Mark ${trophy.name} earned`);
    check.addEventListener('change', () => onToggle(trophy, check.checked));
    row.appendChild(check);

    const medal = el('span', `medal grade-${trophy.grade}`);
    medal.title = trophy.grade;
    row.appendChild(medal);

    const main = el('div', 'trophy-main');
    const title = el('button', 'trophy-name', masked ? 'Hidden story trophy' : trophy.name);
    title.type = 'button';
    title.addEventListener('click', () => onSelect(trophy));
    main.appendChild(title);
    main.appendChild(el('p', 'trophy-desc', masked ? 'Name and description hidden by the spoiler shield until earned.' : trophy.description));

    const meta = el('div', 'trophy-meta');
    meta.appendChild(badge(trophy.grade, `badge-grade grade-text-${trophy.grade}`));
    meta.appendChild(badge(KIND_LABELS[trophy.kind] ?? trophy.kind, 'badge-kind'));
    if (trophy.hidden) meta.appendChild(badge('Hidden on PSN', 'badge-hidden'));
    if (trophy.missable) meta.appendChild(badge('Possibly missable', 'badge-missable'));
    const count = formatCount(trophy, state);
    if (count) {
      const counter = el('span', 'trophy-count', count);
      meta.appendChild(counter);
      const minus = el('button', 'count-btn', '−');
      minus.type = 'button';
      minus.addEventListener('click', () => onCount(trophy, countOf(state, trophy) - stepFor(trophy)));
      const plus = el('button', 'count-btn', '+');
      plus.type = 'button';
      plus.addEventListener('click', () => onCount(trophy, countOf(state, trophy) + stepFor(trophy)));
      const stepper = el('span', 'count-stepper');
      stepper.append(minus, plus);
      meta.appendChild(stepper);
    }
    main.appendChild(meta);
    row.appendChild(main);
    list.appendChild(row);
  }
  const status = document.getElementById('list-status');
  status.textContent = `Showing ${trophies.length} of 55 trophies`;
  document.getElementById('empty-note').hidden = trophies.length !== 0;
}

function stepFor(trophy) {
  if (trophy.unit === '$') return 1000;
  if (trophy.target != null && trophy.target >= 250) return 10;
  return 1;
}

export function renderGuide(trophy, data, state, onToggle, onCount) {
  const card = document.getElementById('guide-card');
  const empty = document.getElementById('guide-empty');
  if (!trophy) {
    card.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  card.hidden = false;
  card.replaceChildren();

  const masked = isMasked(trophy, state);
  card.appendChild(el('p', 'guide-kicker', `Roadmap stage ${trophy.stage} · ${KIND_LABELS[trophy.kind] ?? trophy.kind}`));
  card.appendChild(el('h2', 'guide-title', masked ? 'Hidden story trophy' : trophy.name));

  const badges = el('div', 'trophy-meta');
  badges.appendChild(badge(trophy.grade, `badge-grade grade-text-${trophy.grade}`));
  if (trophy.hidden) badges.appendChild(badge('Hidden on PSN', 'badge-hidden'));
  if (trophy.missable) badges.appendChild(badge('Possibly missable', 'badge-missable'));
  const count = formatCount(trophy, state);
  if (count) badges.appendChild(badge(`Progress ${count}`, 'badge-count'));
  card.appendChild(badges);

  card.appendChild(el('p', 'guide-official-label', 'Official description'));
  card.appendChild(el('blockquote', 'guide-official', masked ? 'Hidden by the spoiler shield until this trophy is earned.' : trophy.description));

  if (trophy.target != null) {
    const stepper = el('div', 'guide-stepper');
    stepper.appendChild(el('span', null, 'Your progress: '));
    const minus = el('button', 'count-btn', '−');
    minus.type = 'button';
    minus.addEventListener('click', () => onCount(trophy, countOf(state, trophy) - stepFor(trophy)));
    const plus = el('button', 'count-btn', '+');
    plus.type = 'button';
    plus.addEventListener('click', () => onCount(trophy, countOf(state, trophy) + stepFor(trophy)));
    stepper.append(minus, el('strong', null, count ?? ''), plus);
    card.appendChild(stepper);
  }

  card.appendChild(el('h3', null, 'Guide'));
  card.appendChild(el('p', 'guide-text', trophy.guide));

  if (trophy.missable && trophy.missableReason) {
    const note = el('div', 'missable-note');
    note.appendChild(el('strong', null, 'Missable flag. '));
    note.appendChild(document.createTextNode(trophy.missableReason));
    card.appendChild(note);
  }

  const stage = data.stages.find((s) => s.n === trophy.stage);
  if (stage) card.appendChild(el('p', 'guide-stage', `Roadmap: ${stage.title}. ${stage.blurb}`));

  card.appendChild(el('h3', null, 'Sources'));
  const sources = el('ul', 'guide-sources');
  for (const source of trophy.sources ?? []) {
    const item = el('li');
    const link = el('a', null, source.label);
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    item.appendChild(link);
    sources.appendChild(item);
  }
  const noteItem = el('li', null, 'Guide text: this guide’s own advice, worked out from the official description above; anything inferred is marked as inferred in the text.');
  sources.appendChild(noteItem);
  card.appendChild(sources);

  const toggle = el('button', 'guide-toggle', isEarned(state, trophy.id) ? 'Earned ✓ — tap to undo' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => onToggle(trophy, !isEarned(state, trophy.id)));
  card.appendChild(toggle);
}

export function renderRoadmap(data, state, onSelect) {
  const wrap = document.getElementById('roadmap-stages');
  wrap.replaceChildren();
  for (const stage of data.stages) {
    const trophies = data.trophies.filter((t) => t.stage === stage.n);
    const earned = trophies.filter((t) => isEarned(state, t.id)).length;
    const section = el('section', 'stage');
    const head = el('div', 'stage-head');
    head.appendChild(el('h3', null, `Stage ${stage.n} — ${stage.title}`));
    head.appendChild(el('span', 'stage-progress', `${earned} / ${trophies.length}`));
    section.appendChild(head);
    const bar = el('div', 'progress-bar stage-bar');
    const fill = el('div', 'progress-fill');
    fill.style.width = `${trophies.length ? Math.round((earned / trophies.length) * 100) : 0}%`;
    bar.appendChild(fill);
    section.appendChild(bar);
    section.appendChild(el('p', 'stage-blurb', stage.blurb));
    const chips = el('div', 'stage-chips');
    for (const trophy of trophies) {
      const masked = isMasked(trophy, state);
      const chip = el('button', `stage-chip grade-chip-${trophy.grade}${isEarned(state, trophy.id) ? ' is-earned' : ''}`,
        `${masked ? 'Hidden story trophy' : trophy.name}${trophy.missable ? ' ⚠' : ''}`);
      chip.type = 'button';
      chip.title = trophy.missable ? `${trophy.name} — possibly missable` : trophy.name;
      chip.addEventListener('click', () => onSelect(trophy));
      chips.appendChild(chip);
    }
    section.appendChild(chips);
    const missables = trophies.filter((t) => t.missable);
    if (missables.length) {
      section.appendChild(el('p', 'stage-missables', `Watch out in this stage: ${missables.map((t) => t.name).join(', ')} — flagged possibly missable, see each guide for why.`));
    }
    wrap.appendChild(section);
  }
}
