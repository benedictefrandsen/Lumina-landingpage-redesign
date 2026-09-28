
// Vis toast når et "Køb nu" trykkes
function showCartToast(message = 'Produktet er tilføjet til indkøbskurven') {
  // Hvis allerede en toast, fjern den først (så vi kan re-animate)
  const existing = document.querySelector('.cart-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  document.body.appendChild(toast);

  // Trigger ind/ud animation via CSS (tilføj class for synlig)
  requestAnimationFrame(() => toast.classList.add('visible'));

  // Fjern efter 3 sekunder
  setTimeout(() => {
    toast.classList.remove('visible');
    // fjern fra DOM efter overgang
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3000);
}

// Bind handler til alle buy-knapper (incl. dem med varianter)
function initBuyButtons() {
  const buyButtons = document.querySelectorAll('.buy-button');
  buyButtons.forEach(btn => {
    // Ignorer hvis allerede bundet
    if (btn.dataset.buyHandlerBound) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showCartToast();
     
    });
    btn.dataset.buyHandlerBound = '1';
  });
}

// Init ved load + re-init hvis DOM senere ændres
document.addEventListener('DOMContentLoaded', initBuyButtons);
// Hvis du dynamisk indsætter produkter kan du køre initBuyButtons() igen efter indsættelse

// Farvevælger: skifter billede og farvenavn når man klikker på en rund knap
function initColorSwatches() {
  const swatches = document.querySelectorAll('.color-swatch');
  const image = document.getElementById('product-image');
  const colorName = document.getElementById('product-color-name');
  if (!swatches.length || !image || !colorName) return;

  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => {
        s.classList.remove('active');
        s.setAttribute('aria-pressed', 'false');
      });
      swatch.classList.add('active');
      swatch.setAttribute('aria-pressed', 'true');

      image.src = swatch.dataset.image;
      image.alt = `Lumina Bloom højtaler i ${swatch.dataset.name}`;
      colorName.textContent = swatch.dataset.name;
    });
  });
}

document.addEventListener('DOMContentLoaded', initColorSwatches);

// Nyhedsbrev i footeren: viser en bekræftelse i stedet for at genindlæse siden
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form || form.dataset.bound) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showCartToast('Tak! Du er nu tilmeldt vores nyhedsbrev');
    form.reset();
  });
  form.dataset.bound = '1';
}

document.addEventListener('DOMContentLoaded', initNewsletterForm);

// Burgermenu på mobil: åbner/lukker menuen og holder skærmlæsere opdateret
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu || toggle.dataset.bound) return;

  function openMenu() {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    menu.querySelector('a').focus();
  }

  function closeMenu(returnFocus = true) {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => {
    menu.hidden ? openMenu() : closeMenu();
  });

  // Luk når man vælger et link, så man ser den sektion man hopper til
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMenu(false));
  });

  // Luk med Escape-tasten
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) closeMenu();
  });

  // Luk hvis skærmen bliver bred nok til den almindelige menu
  window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => {
    if (e.matches && !menu.hidden) closeMenu(false);
  });

  toggle.dataset.bound = '1';
}

document.addEventListener('DOMContentLoaded', initMobileMenu);
