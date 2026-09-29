
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

// Søgefelt: folder ud under navbaren og søger i teksten på siden
function initSearch() {
  const toggle = document.querySelector('.search-toggle');
  const panel = document.getElementById('search-panel');
  if (!toggle || !panel || toggle.dataset.bound) return;

  const input = document.getElementById('search-input');
  const closeBtn = panel.querySelector('.search-close');

  function openSearch() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    input.focus();
  }

  function closeSearch(returnFocus = true) {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    // Luppen er skjult på mobil, så fokus sendes kun tilbage, når den kan ses
    if (returnFocus && toggle.offsetParent !== null) toggle.focus();
  }

  toggle.addEventListener('click', () => {
    panel.hidden ? openSearch() : closeSearch();
  });

  closeBtn.addEventListener('click', () => closeSearch());

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) closeSearch();
  });

  // "Søg" i burgermenuen på mobil: luk menuen og åbn søgefeltet
  const mobileLink = document.querySelector('.mobile-search-link');
  const menuToggle = document.querySelector('.menu-toggle');
  if (mobileLink && menuToggle) {
    mobileLink.addEventListener('click', () => {
      menuToggle.click();
      openSearch();
    });
  }

  // Fjern tidligere markeringer
  function clearHits() {
    document.querySelectorAll('mark.search-hit').forEach(mark => {
      const parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
  }

  // Danske farveord → de engelske farvenavne, der står på siden
  const synonyms = {
    'grøn': ['green', 'sage'],
    'lysegrøn': ['green', 'sage'],
    'lyserød': ['rose'],
    'rosa': ['rose'],
    'pink': ['rose'],
    'rød': ['rose'],
    'beige': ['white', 'moonlight'],
    'hvid': ['white', 'moonlight'],
    'blå': ['lavender'],
    'lyseblå': ['lavender'],
    'lilla': ['lavender'],
    'lavendel': ['lavender']
  };

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  panel.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = input.value.trim();
    if (!term) return;

    clearHits();

    // Søgeordet plus evt. synonymer, fx "grøn" → "grøn", "green", "sage"
    const terms = [term.toLowerCase(), ...(synonyms[term.toLowerCase()] || [])];
    const pattern = new RegExp(terms.map(escapeRegExp).join('|'), 'gi');

    // Søges der på en farve, vælges den farve i produktkortet, så billede og farvenavn skifter
    const swatch = [...document.querySelectorAll('.color-swatch')].find(s => {
      const name = `${s.dataset.name} ${s.getAttribute('aria-label')}`.toLowerCase();
      return terms.some(t => name.includes(t));
    });
    if (swatch) swatch.click();

    // Find al tekst på siden, undtagen navbaren og scripts
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const el = node.parentElement;
        if (!el || el.closest('header, script, style, noscript, .visually-hidden')) return NodeFilter.FILTER_REJECT;
        pattern.lastIndex = 0;
        return pattern.test(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    // Markér hvert fund med <mark>
    const hits = [];
    nodes.forEach(node => {
      const text = node.textContent;
      const frag = document.createDocumentFragment();
      let last = 0;
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        frag.appendChild(document.createTextNode(text.slice(last, match.index)));
        const mark = document.createElement('mark');
        mark.className = 'search-hit';
        mark.textContent = match[0];
        frag.appendChild(mark);
        hits.push(mark);
        last = match.index + match[0].length;
      }
      frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });

    if (!hits.length) {
      showCartToast(`Ingen resultater for "${term}"`);
      return;
    }

    // Fold punkter i accordion ud, hvis fundet ligger i et lukket punkt
    const details = hits[0].closest('details');
    if (details) details.open = true;

    closeSearch(false);
    hits[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    showCartToast(`${hits.length} ${hits.length === 1 ? 'resultat' : 'resultater'} for "${term}"`);
  });

  toggle.dataset.bound = '1';
}

document.addEventListener('DOMContentLoaded', initSearch);

// Nyhedsbrev: viser en bekræftelse i stedet for at genindlæse siden
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form || form.dataset.bound) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#newsletter-name').value.trim();
    showCartToast(name ? `Tak, ${name}! Du er nu tilmeldt vores nyhedsbrev` : 'Tak! Du er nu tilmeldt vores nyhedsbrev');
    form.reset();
  });
  form.dataset.bound = '1';
}

document.addEventListener('DOMContentLoaded', initNewsletterForm);
