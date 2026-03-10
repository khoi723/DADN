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

// ── PROFILE DROPDOWN ──
document.addEventListener('DOMContentLoaded', () => {
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
