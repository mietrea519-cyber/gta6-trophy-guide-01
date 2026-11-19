// filters.js — which trophies the checklist shows, and how the spoiler shield masks them.
// Kinds come straight from the trophy data: story, collectibles, activities, platinum.
// "missable" and "online" are filter views of their own: missable matches the flag the data
// carries, and online matches trophies whose kind is online — the official list has none,
// which the page says out loud rather than hiding.

export const KIND_LABELS = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
  platinum: 'Platinum',
};

export function matchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  return trophy.kind === kind;
}

export function matchesGrade(trophy, grade) {
  return grade === 'all' || trophy.grade === grade;
}

export function matchesSearch(trophy, query) {
  if (!query) return true;
  const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function visibleTrophies(trophies, ui, state) {
  return trophies.filter((trophy) => {
    if (!matchesKind(trophy, ui.kind)) return false;
    if (!matchesGrade(trophy, ui.grade)) return false;
    if (!matchesSearch(trophy, ui.query)) return false;
    if (state.settings.hideEarned && state.earned[trophy.id] === true) return false;
    return true;
  });
}

// The spoiler shield hides the names and descriptions of story trophies until they are
// earned. A masked trophy still shows its grade and its place in the list, so the shape of
// the story stays visible without giving its beats away.
export function isMasked(trophy, state) {
  return state.settings.spoilerShield === true && trophy.kind === 'story' && state.earned[trophy.id] !== true;
}

export function gradeTotals(trophies) {
  const totals = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
  for (const grade of Object.keys(totals)) {
    totals[grade] = trophies.filter((t) => t.grade === grade).length;
  }
  return totals;
}

export function earnedByGrade(trophies, state) {
  const earned = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (state.earned[trophy.id] === true && earned[trophy.grade] !== undefined) earned[trophy.grade] += 1;
  }
  return earned;
}
