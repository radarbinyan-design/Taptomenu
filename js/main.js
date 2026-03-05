// ===== TapMenu Armenia — Main JavaScript =====

// ===== CONFIG =====
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID';

// ===== TRANSLATIONS =====
const translations = {
  ru: {
    nav_home: 'Главная',
    nav_pricing: 'Тарифы',
    nav_how: 'Как работает',
    nav_luxe: '✦ LUXE',
    nav_contact: 'Контакты',
    nav_start: 'Начать',
    footer_slogan: 'Одно касание — меню и сервис',
    footer_nav: 'Навигация',
    footer_contacts: 'Контакты',
    footer_home: 'Главная',
    footer_pricing: 'Тарифы',
    footer_how: 'Как работает',
    footer_luxe: '✦ LUXE',
    footer_contact: 'Контакты',
    footer_privacy: 'Политика конфиденциальности',
    footer_rights: '© 2025 TapMenu Armenia',
  },
  en: {
    nav_home: 'Home',
    nav_pricing: 'Pricing',
    nav_how: 'How it works',
    nav_luxe: '✦ LUXE',
    nav_contact: 'Contact',
    nav_start: 'Get started',
    footer_slogan: 'One tap — menu & service',
    footer_nav: 'Navigation',
    footer_contacts: 'Contacts',
    footer_home: 'Home',
    footer_pricing: 'Pricing',
    footer_how: 'How it works',
    footer_luxe: '✦ LUXE',
    footer_contact: 'Contact',
    footer_privacy: 'Privacy Policy',
    footer_rights: '© 2025 TapMenu Armenia',
  },
  hy: {
    nav_home: 'Գլխավոր',
    nav_pricing: 'Սակագներ',
    nav_how: 'Ինչպես է աշխատում',
    nav_luxe: '✦ LUXE',
    nav_contact: 'Կապ',
    nav_start: 'Սկսել',
    footer_slogan: 'Մեկ հպում — ցանկ և սպասարկում',
    footer_nav: 'Նավիգացիա',
    footer_contacts: 'Կապ',
    footer_home: 'Գլխավոր',
    footer_pricing: 'Սակագներ',
    footer_how: 'Ինչպես է աշխատում',
    footer_luxe: '✦ LUXE',
    footer_contact: 'Կապ',
    footer_privacy: 'Գաղտնիության Քաղաքականություն',
    footer_rights: '© 2025 TapMenu Armenia',
  }
};

let currentLang = localStorage.getItem('tapmenu_lang') || 'ru';

function applyTranslations(lang) {
  currentLang = lang;
  localStorage.setItem('tapmenu_lang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

function initLangSwitcher() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTranslations(btn.getAttribute('data-lang'));
    });
  });
  applyTranslations(currentLang);
}

// ===== HEADER SCROLL =====
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ===== MOBILE MENU =====
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      toggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ===== FAQ ACCORDION =====
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) other.classList.remove('open');
      });
      item.classList.toggle('open', !isOpen);
    });
  });
}

// ===== BACK TO TOP =====
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== PRELOADER =====
function initPreloader() {
  const preloader = document.querySelector('.preloader');
  if (!preloader) return;
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
      setTimeout(() => preloader.remove(), 500);
    }, 400);
  });
}

// ===== PRICING TOGGLE =====
function initPricingToggle() {
  const toggleBtns = document.querySelectorAll('.billing-toggle-btn');
  if (!toggleBtns.length) return;

  const prices = {
    starter: { monthly: 15, yearly: 12 },
    pro: { monthly: 25, yearly: 20 },
    premium: { monthly: 45, yearly: 36 },
    luxe: { monthly: 50, yearly: 40 },
  };

  let isYearly = false;

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      isYearly = btn.getAttribute('data-billing') === 'yearly';
      toggleBtns.forEach(b => b.classList.toggle('active', b === btn));

      // Update prices
      Object.keys(prices).forEach(plan => {
        const priceEl = document.querySelector(`[data-price="${plan}"]`);
        if (priceEl) {
          const val = isYearly ? prices[plan].yearly : prices[plan].monthly;
          priceEl.textContent = `$${val}`;
        }
      });

      // Show/hide yearly badge
      document.querySelectorAll('.yearly-badge').forEach(el => {
        el.style.display = isYearly ? 'inline-flex' : 'none';
      });
    });
  });
}

// ===== TELEGRAM SEND =====
async function sendToTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    return response.ok;
  } catch (err) {
    console.error('Telegram send error:', err);
    return false;
  }
}

// ===== CONTACT FORM =====
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate
    let valid = true;
    const required = form.querySelectorAll('[required]');
    required.forEach(field => {
      const errEl = document.getElementById(field.id + '-error');
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = '#fc8181';
        if (errEl) errEl.classList.add('visible');
      } else {
        field.style.borderColor = '';
        if (errEl) errEl.classList.remove('visible');
      }
    });

    if (!valid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';

    const name = form.querySelector('#contact-name')?.value || '';
    const contact = form.querySelector('#contact-email')?.value || '';
    const restaurant = form.querySelector('#contact-restaurant')?.value || '—';
    const plan = form.querySelector('#contact-plan')?.value || '—';
    const message = form.querySelector('#contact-message')?.value || '—';
    const datetime = new Date().toLocaleString('ru-RU');

    const text = `📩 <b>НОВАЯ ЗАЯВКА С САЙТА</b>
Имя: ${name}
Контакт: ${contact}
Ресторан: ${restaurant}
Тариф: ${plan}
Сообщение: ${message}
Время: ${datetime}`;

    const success = await sendToTelegram(text);

    submitBtn.disabled = false;
    submitBtn.textContent = 'Отправить сообщение';

    const successEl = document.getElementById('contact-success');
    if (successEl) {
      successEl.classList.add('visible');
      form.reset();
    }
  });
}

// ===== LUXE FORM =====
function initLuxeForm() {
  const form = document.getElementById('luxe-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let valid = true;
    const required = form.querySelectorAll('[required]');
    required.forEach(field => {
      const errEl = document.getElementById(field.id + '-error');
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = '#fc8181';
        if (errEl) errEl.classList.add('visible');
      } else {
        field.style.borderColor = '';
        if (errEl) errEl.classList.remove('visible');
      }
    });

    if (!valid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';

    const name = form.querySelector('#luxe-name')?.value || '';
    const restaurant = form.querySelector('#luxe-restaurant')?.value || '';
    const contact = form.querySelector('#luxe-contact')?.value || '';
    const tables = form.querySelector('#luxe-tables')?.value || '—';
    const comment = form.querySelector('#luxe-comment')?.value || '—';
    const datetime = new Date().toLocaleString('ru-RU');

    const text = `✦ <b>НОВАЯ ЗАЯВКА LUXE</b>
Имя: ${name}
Ресторан: ${restaurant}
Контакт: ${contact}
Столов: ${tables}
Комментарий: ${comment}
Время: ${datetime}`;

    const success = await sendToTelegram(text);

    submitBtn.disabled = false;
    submitBtn.textContent = '✦ Отправить заявку на LUXE';

    const successEl = document.getElementById('luxe-success');
    if (successEl) {
      successEl.classList.add('visible');
      form.reset();
    }
  });
}

// ===== LUXE PARTICLES =====
function initLuxeParticles() {
  const canvas = document.getElementById('luxe-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.6 + 0.1,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: -Math.random() * 0.3 - 0.1,
    };
  }

  function init() {
    particles = Array.from({ length: 80 }, createParticle);
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
      ctx.fill();

      p.x += p.speedX;
      p.y += p.speedY;
      p.opacity -= 0.0005;

      if (p.y < -10 || p.opacity <= 0) {
        particles[i] = createParticle();
        particles[i].y = canvas.height + 10;
      }
    });
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => { resize(); init(); });
  resize();
  init();
  animate();
}

// ===== MOBILE PRICING CAROUSEL (Swiper) =====
function initPricingCarousel() {
  if (typeof Swiper === 'undefined') return;
  if (window.innerWidth > 768) return;

  new Swiper('.pricing-swiper', {
    slidesPerView: 1.1,
    spaceBetween: 16,
    centeredSlides: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      480: { slidesPerView: 1.3 },
      600: { slidesPerView: 1.8 },
    }
  });
}

// ===== ACTIVE NAV LINK =====
function initActiveNav() {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    // Normalize paths
    const linkPath = href.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
    const pagePath = currentPath.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
    if (linkPath === pagePath || (href.includes('index.html') && (currentPath === '/' || currentPath.endsWith('index.html')))) {
      link.classList.add('active');
    }
  });
}

// ===== SMOOTH ANCHOR SCROLL =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ===== HERO COUNTER ANIMATION =====
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target + (el.dataset.suffix || '');
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start) + (el.dataset.suffix || '');
    }
  }, 16);
}

function initCounters() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          animateCounter(el, parseInt(el.dataset.count));
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
}

// ===== INIT ALL =====
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initHeader();
  initMobileMenu();
  initScrollReveal();
  initFAQ();
  initBackToTop();
  initLangSwitcher();
  initPricingToggle();
  initContactForm();
  initLuxeForm();
  initLuxeParticles();
  initPricingCarousel();
  initActiveNav();
  initSmoothScroll();
  initCounters();
});
