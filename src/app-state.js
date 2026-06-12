const APP_STATE_KEY = 'histoiren_app_state_v2';

const DEFAULT_APP_STATE = {
  hasVisited: false,
  onboardingSeen: false,
  lastView: 'presentation'
};

function safeParse(rawValue) {
  if (!rawValue) return { ...DEFAULT_APP_STATE };
  try {
    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_APP_STATE };
    return {
      ...DEFAULT_APP_STATE,
      ...parsed
    };
  } catch {
    return { ...DEFAULT_APP_STATE };
  }
}

export function readAppState() {
  if (typeof window === 'undefined') return { ...DEFAULT_APP_STATE };
  return safeParse(window.localStorage.getItem(APP_STATE_KEY));
}

export function writeAppState(patch) {
  if (typeof window === 'undefined') return { ...DEFAULT_APP_STATE, ...patch };
  const current = readAppState();
  const next = { ...current, ...patch };
  window.localStorage.setItem(APP_STATE_KEY, JSON.stringify(next));
  return next;
}

export function markAppVisited() {
  return writeAppState({
    hasVisited: true
  });
}

export function markOnboardingSeen() {
  return writeAppState({
    hasVisited: true,
    onboardingSeen: true
  });
}

export function setLastView(viewName) {
  return writeAppState({
    lastView: viewName
  });
}

