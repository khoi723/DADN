// Debounce helper
function debounce(fn, wait) {
  let t;
  return function(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

// Save motor settings to server
async function saveMotorSettings() {
  try {
    const onCondition = document.getElementById('onCondition')?.value || 'above';
    const onValue = parseFloat(document.getElementById('onValue')?.value || 40);
    const offCondition = document.getElementById('offCondition')?.value || 'below';
    const offValue = parseFloat(document.getElementById('offValue')?.value || 55);
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
  const autoCard    = document.getElementById('autoCard');
  const manualCard  = document.getElementById('manualCard');
  const autoRadio   = document.getElementById('autoRadio');
  const manualRadio = document.getElementById('manualRadio');

  if (!autoCard || !manualCard) return;

  if (mode === 'auto') {
    autoCard.classList.add('selected');
    autoCard.classList.remove('disabled');
    autoRadio.classList.add('active');

    manualCard.classList.remove('selected');
    manualCard.classList.add('disabled');
    manualRadio.classList.remove('active');
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
  const onValue = document.getElementById('onValue')?.value || '40';
  const offCondition = document.getElementById('offCondition')?.value || 'below';
  const offValue = document.getElementById('offValue')?.value || '55';
  
  document.getElementById('currentMoisture').innerText = currentMoisture;
  document.getElementById('moistureWarningText').innerText = message;
  document.getElementById('configuredRange').innerText = `${onCondition} ${onValue}% / ${offCondition} ${offValue}%`;
  
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
  const profileBtn      = document.getElementById('profileBtn');
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


