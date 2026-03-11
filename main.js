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
});


