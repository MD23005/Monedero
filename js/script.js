// ── Contraseña (login) ─────────────────────────
const toggleBtn = document.getElementById('toggle-pswrd');
if (toggleBtn) {
  const pwInput = document.getElementById('password');
  toggleBtn.addEventListener('click', () => {
    const visible = pwInput.type === 'text';
    pwInput.type = visible ? 'password' : 'text';
    toggleBtn.className = visible
      ? 'fa-regular fa-eye toggle-icon'
      : 'fa-regular fa-eye-slash toggle-icon';
  });
}

// ── Redirigir al dashboard (login) ────────────────────
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    window.location.href = 'dashboard.html';
  });
}

const btnGuest = document.getElementById('btn-guest');
if (btnGuest) {
  btnGuest.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
}

// ── Fecha actual en topbar (dashboard) ────────────────
const topbarDate = document.getElementById('topbar-date');
if (topbarDate) {
  topbarDate.textContent = new Date().toLocaleDateString('es-SV', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ── Gráfico de barras de ejemplo (dashboard) ──────────
const barChart = document.getElementById('bar-chart');
if (barChart) {
  const meses  = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const datos  = [40, 65, 30, 80, 55, 90, 45, 70, 60, 50, 75, 248];
  const maxVal = Math.max(...datos);
  const mesActual = new Date().getMonth();

  barChart.innerHTML = datos.map((v, i) => {
    const h = Math.max(4, Math.round((v / maxVal) * 120));
    return `<div class="bar-col">
      <div class="bar${i === mesActual ? ' active' : ''}" style="height:${h}px;" title="${meses[i]}: $${v}"></div>
      <span class="bar-lbl">${meses[i]}</span>
    </div>`;
  }).join('');
}

// ── Abrir / cerrar modal (dashboard) ─────────────────
const modalBackdrop = document.getElementById('modal-backdrop');
const btnAddGasto   = document.getElementById('btn-add-gasto');
const modalClose    = document.getElementById('modal-close');
const modalCancel   = document.getElementById('modal-cancel');

if (modalBackdrop) {
  btnAddGasto.addEventListener('click', () => modalBackdrop.classList.add('open'));
  modalClose.addEventListener('click',  () => modalBackdrop.classList.remove('open'));
  modalCancel.addEventListener('click', () => modalBackdrop.classList.remove('open'));
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) modalBackdrop.classList.remove('open');
  });
}