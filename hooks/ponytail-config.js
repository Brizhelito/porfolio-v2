// ponytail-config — Shared configuration for ponytail modes.
//
// Provides default mode resolution and mode normalization.

const VALID_MODES = ['off', 'lite', 'full', 'ultra'];
const DEFAULT_MODE = 'full';

function getDefaultMode() {
  const envMode = process.env.PONYTAIL_DEFAULT_MODE;
  if (envMode && VALID_MODES.includes(envMode)) return envMode;
  return DEFAULT_MODE;
}

function normalizePersistedMode(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const mode = raw.trim().toLowerCase();
  if (VALID_MODES.includes(mode)) return mode;
  // aliases
  if (mode === 'none' || mode === 'disabled') return 'off';
  if (mode === 'normal' || mode === 'default') return getDefaultMode();
  return null;
}

module.exports = { getDefaultMode, normalizePersistedMode };