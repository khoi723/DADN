// Debounce helper
function debounce(fn, wait) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function t(key) {
  return window.SAIWS_PREFS && typeof window.SAIWS_PREFS.t === 'function'
    ? window.SAIWS_PREFS.t(key)
    : key;
}

const MANUAL_TIMER_STORAGE_KEY = 'saiws.manual.turnoff';
let manualAutoOffTimer = null;

// Save motor settings to server
async function saveMotorSettings() {
  try {
    const onCondition = document.getElementById('onCondition')?.value || 'above';
    const onValue = parseFloat(document.getElementById('onValue')?.value || 30);
    const offCondition = document.getElementById('offCondition')?.value || 'below';
    const offValue = parseFloat(document.getElementById('offValue')?.value || 40);
    const enabled = document.getElementById('autoCard')?.classList.contains('selected') ?? true;

    const res = await fetch('/api/motor/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onCondition, onValue, offCondition, offValue, enabled })
    });

    const data = await res.json();
    // settings saved
  } catch (err) {
    console.error('Error saving motor settings:', err);
  }
}

// Debounced wrapper to avoid frequent calls
const scheduleSaveMotorSettings = debounce(saveMotorSettings, 700);

function clearManualAutoOffTimer() {
  if (manualAutoOffTimer) {
    clearTimeout(manualAutoOffTimer);
    manualAutoOffTimer = null;
  }
}

function getManualTurnOffConfig() {
  const valueEl = document.getElementById('turnOffAfterValue');
  const unitEl = document.getElementById('turnOffAfterUnit');
  const value = Math.max(1, Math.min(720, parseInt(valueEl?.value || '30', 10) || 30));
  const unit = unitEl?.value || 'minutes';
  return { value, unit };
}

function getManualTurnOffMs() {
  const cfg = getManualTurnOffConfig();
  if (cfg.unit === 'never') return null;
  const multiplier = cfg.unit === 'hours' ? 60 * 60 * 1000 : 60 * 1000;
  return cfg.value * multiplier;
}

function persistManualTurnOffConfig() {
  const cfg = getManualTurnOffConfig();
  localStorage.setItem(MANUAL_TIMER_STORAGE_KEY, JSON.stringify(cfg));
}

function hydrateManualTurnOffConfig() {
  const valueEl = document.getElementById('turnOffAfterValue');
  const unitEl = document.getElementById('turnOffAfterUnit');
  if (!valueEl || !unitEl) return;

  try {
    const raw = localStorage.getItem(MANUAL_TIMER_STORAGE_KEY);
    if (!raw) return;
    const cfg = JSON.parse(raw);
    if (Number.isFinite(Number(cfg?.value))) {
      valueEl.value = String(Math.max(1, Math.min(720, Number(cfg.value))));
    }
    if (cfg?.unit && ['minutes', 'hours', 'never'].includes(cfg.unit)) {
      unitEl.value = cfg.unit;
    }
  } catch (err) {
    // Ignore invalid stored state.
  }
}

function syncTurnOffInputsState() {
  const valueEl = document.getElementById('turnOffAfterValue');
  const unitEl = document.getElementById('turnOffAfterUnit');
  const decBtn = document.getElementById('turnOffDecrease');
  const incBtn = document.getElementById('turnOffIncrease');
  if (!valueEl || !unitEl) return;

  const disabled = unitEl.value === 'never';
  valueEl.disabled = disabled;
  if (decBtn) decBtn.disabled = disabled;
  if (incBtn) incBtn.disabled = disabled;
}

async function setManualPumpState(isOn) {
  try {
    const action = isOn ? 'on' : 'off';
    const res = await fetch('/api/motor/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, triggerType: 'manual' })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Failed to control motor');
    }

    if (window.setMotorRunningState) {
      window.setMotorRunningState(isOn);
    }
    return true;
  } catch (err) {
    console.error('Error controlling motor manually:', err);
    return false;
  }
}

function scheduleManualAutoOffIfNeeded() {
  clearManualAutoOffTimer();
  const pumpToggle = document.getElementById('pumpToggle');
  if (!pumpToggle || !pumpToggle.checked) return;

  const delay = getManualTurnOffMs();
  if (!delay) return;

  manualAutoOffTimer = setTimeout(async () => {
    const ok = await setManualPumpState(false);
    if (ok) {
      pumpToggle.checked = false;
      clearManualAutoOffTimer();
    }
  }, delay);
}

function bindManualTurnOffControls() {
  const valueEl = document.getElementById('turnOffAfterValue');
  const unitEl = document.getElementById('turnOffAfterUnit');
  const decBtn = document.getElementById('turnOffDecrease');
  const incBtn = document.getElementById('turnOffIncrease');
  const pumpToggle = document.getElementById('pumpToggle');
  if (!valueEl || !unitEl || !pumpToggle) return;

  const clampValue = () => {
    const n = parseInt(valueEl.value || '30', 10) || 30;
    valueEl.value = String(Math.max(1, Math.min(720, n)));
  };

  const onConfigChanged = () => {
    clampValue();
    syncTurnOffInputsState();
    persistManualTurnOffConfig();
    if (pumpToggle.checked) {
      scheduleManualAutoOffIfNeeded();
    }
  };

  valueEl.addEventListener('input', onConfigChanged);
  unitEl.addEventListener('change', onConfigChanged);

  if (decBtn) {
    decBtn.addEventListener('click', () => {
      valueEl.value = String(Math.max(1, (parseInt(valueEl.value || '30', 10) || 30) - 1));
      onConfigChanged();
    });
  }

  if (incBtn) {
    incBtn.addEventListener('click', () => {
      valueEl.value = String(Math.min(720, (parseInt(valueEl.value || '30', 10) || 30) + 1));
      onConfigChanged();
    });
  }

  syncTurnOffInputsState();
}

async function syncPumpToggleFromServer() {
  const pumpToggle = document.getElementById('pumpToggle');
  if (!pumpToggle) return;

  try {
    const res = await fetch('/api/motor/status', { cache: 'no-store' });
    const data = await res.json();
    const isRunning = Boolean(data?.motor && data.motor.status === 'running');
    pumpToggle.checked = isRunning;
    if (window.setMotorRunningState) {
      window.setMotorRunningState(isRunning);
    }
    if (isRunning) {
      scheduleManualAutoOffIfNeeded();
    }
  } catch (err) {
    console.error('Error syncing motor status:', err);
  }
}

function bindManualPumpToggle() {
  const pumpToggle = document.getElementById('pumpToggle');
  if (!pumpToggle) return;

  pumpToggle.addEventListener('change', async () => {
    const nextState = pumpToggle.checked;
    const ok = await setManualPumpState(nextState);
    if (!ok) {
      pumpToggle.checked = !nextState;
      return;
    }

    if (nextState) {
      scheduleManualAutoOffIfNeeded();
    } else {
      clearManualAutoOffTimer();
    }
  });
}

// Load motor settings from server and apply to UI
async function loadMotorSettings() {
  try {
    const res = await fetch('/api/motor/settings');
    const data = await res.json();
    if (data.ok && data.settings) {
      const s = data.settings;
      const onValueEl = document.getElementById('onValue');
      const offValueEl = document.getElementById('offValue');
      const onConditionEl = document.getElementById('onCondition');
      const offConditionEl = document.getElementById('offCondition');

      if (onValueEl) onValueEl.value = s.onValue ?? onValueEl.value;
      if (offValueEl) offValueEl.value = s.offValue ?? offValueEl.value;
      if (onConditionEl) onConditionEl.value = s.onCondition || onConditionEl.value;
      if (offConditionEl) offConditionEl.value = s.offCondition || offConditionEl.value;

      // Apply mode
      if (s.enabled) selectMode('auto'); else selectMode('manual');
    }
  } catch (err) {
    console.error('Error loading motor settings:', err);
  }
}

// ── MODE SWITCHING (Home page) ──
function selectMode(mode) {
  const autoCard = document.getElementById('autoCard');
  const manualCard = document.getElementById('manualCard');
  const autoRadio = document.getElementById('autoRadio');
  const manualRadio = document.getElementById('manualRadio');

  if (!autoCard || !manualCard) return;

  if (mode === 'auto') {
    autoCard.classList.add('selected');
    autoCard.classList.remove('disabled');
    autoRadio.classList.add('active');

    manualCard.classList.remove('selected');
    manualCard.classList.add('disabled');
    manualRadio.classList.remove('active');
    clearManualAutoOffTimer();
  } else {
    manualCard.classList.add('selected');
    manualCard.classList.remove('disabled');
    manualRadio.classList.add('active');

    autoCard.classList.remove('selected');
    autoCard.classList.add('disabled');
    autoRadio.classList.remove('active');
  }
  // Persist mode change to server
  saveMotorSettings();
}

// ── WATERING NEEDED ICON ──
function showWateringNeededIcon(currentMoisture) {
  const icon = document.getElementById('wateringNeededIcon');
  if (icon) {
    icon.classList.add('show');
  }
}

function hideWateringNeededIcon() {
  const icon = document.getElementById('wateringNeededIcon');
  if (icon) {
    icon.classList.remove('show');
  }
}

// ── MOISTURE WARNING MODAL ──
function showMoistureWarning(currentMoisture, message) {
  const modal = document.getElementById('moistureWarningModal');
  const onCondition = document.getElementById('onCondition')?.value || 'above';
  const onValue = document.getElementById('onValue')?.value || '30';
  const offCondition = document.getElementById('offCondition')?.value || 'below';
  const offValue = document.getElementById('offValue')?.value || '40';
  const onConditionLabel = t(onCondition === 'above' ? 'condition_above' : 'condition_below');
  const offConditionLabel = t(offCondition === 'above' ? 'condition_above' : 'condition_below');

  document.getElementById('currentMoisture').innerText = currentMoisture;
  document.getElementById('moistureWarningText').innerText = message;
  document.getElementById('configuredRange').innerText = `${onConditionLabel} ${onValue}% / ${offConditionLabel} ${offValue}%`;

  modal.style.display = 'flex';
}

function closeMoistureWarning() {
  const modal = document.getElementById('moistureWarningModal');
  modal.style.display = 'none';
}

// Recheck moisture when settings change
function recheckMoisture() {
  const currentMoisture = document.getElementById('lblMoisture')?.innerText || '0';
  if (window.updateMoistureWarning) {
    window.updateMoistureWarning(currentMoisture);
  }
}

// Make functions globally accessible
window.showMoistureWarning = showMoistureWarning;
window.closeMoistureWarning = closeMoistureWarning;
window.recheckMoisture = recheckMoisture;
window.showWateringNeededIcon = showWateringNeededIcon;
window.hideWateringNeededIcon = hideWateringNeededIcon;

// ── PROFILE DROPDOWN ──
document.addEventListener('DOMContentLoaded', () => {
  // ── AUTOMATIC MODE SETTINGS CHANGE ──
  const onCondition = document.getElementById('onCondition');
  const onValue = document.getElementById('onValue');
  const offCondition = document.getElementById('offCondition');
  const offValue = document.getElementById('offValue');

  if (onCondition) onCondition.addEventListener('change', recheckMoisture);
  if (onValue) onValue.addEventListener('input', recheckMoisture);
  if (offCondition) offCondition.addEventListener('change', recheckMoisture);
  if (offValue) offValue.addEventListener('input', recheckMoisture);
  // Save settings to server when changed (debounced)
  if (onCondition) onCondition.addEventListener('change', scheduleSaveMotorSettings);
  if (onValue) onValue.addEventListener('input', scheduleSaveMotorSettings);
  if (offCondition) offCondition.addEventListener('change', scheduleSaveMotorSettings);
  if (offValue) offValue.addEventListener('input', scheduleSaveMotorSettings);
  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('open');
    });

    // Close when clicking anywhere else
    document.addEventListener('click', () => {
      profileDropdown.classList.remove('open');
    });

    // Prevent dropdown clicks from closing it
    profileDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Handle logout consistently across pages.
  const logoutLinks = document.querySelectorAll('[data-logout]');
  logoutLinks.forEach((logoutLink) => {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();

      // Clear common client-side auth storage keys.
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('jwt');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('jwt');

      window.location.assign('/views/login.html');
    });
  });

  // ── ACTIVE SIDEBAR LINK ──
  const links = document.querySelectorAll('.sidebar a');
  links.forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  // Load current motor settings from server on page load
  hydrateManualTurnOffConfig();
  bindManualTurnOffControls();
  bindManualPumpToggle();
  syncPumpToggleFromServer();
  loadMotorSettings();

  // Close moisture warning modal when user presses Escape
  document.addEventListener('keydown', (e) => {
    const key = e.key || e.keyCode;
    if (key === 'Escape' || key === 'Esc' || key === 27) {
      const modal = document.getElementById('moistureWarningModal');
      if (modal && modal.style && modal.style.display === 'flex') {
        closeMoistureWarning();
      }
    }
  });
});


