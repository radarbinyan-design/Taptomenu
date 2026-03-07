// ===== TapMenu Armenia — Main JavaScript =====

// ===== CONFIG =====
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID';

// ===== TRANSLATIONS =====
const translations = {
  ru: {
    // Navigation
    nav_home: 'Главная',
    nav_pricing: 'Тарифы',
    nav_how: 'Как работает',
    nav_luxe: '✦ LUXE',
    nav_contact: 'Контакты',
    nav_start: 'Начать',
    // Footer
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
    // Hero
    hero_label: '🇦🇲 Платформа для ресторанов Армении',
    hero_title_1: 'Цифровое меню',
    hero_title_2: 'для вашего ресторана',
    hero_subtitle: 'Одно касание NFC — и гость видит меню. Никаких приложений. Никаких задержек.',
    hero_cta_1: '🚀 Начать бесплатный тест',
    hero_cta_2: 'Посмотреть тарифы',
    hero_badge_1: '⚡ Быстро',
    hero_badge_2: '🌍 20+ языков',
    hero_badge_3: '🤖 Автоматизировано',
    hero_badge_4: '✓ 7 дней бесплатно',
    // Stats
    stats_restaurants: 'Ресторанов подключено',
    stats_languages: 'Языков меню',
    stats_guests: 'Гостей воспользовались',
    stats_satisfied: 'Довольных клиентов',
    // Why section
    why_label: 'Почему TapMenu?',
    why_title: 'Зачем TapMenu вашему ресторану?',
    why_subtitle: 'Решаем реальные проблемы, с которыми сталкивается каждый ресторан',
    why_was: 'Было',
    why_became: 'Стало',
    why_p1_problem: 'Бумажные меню дорогие и устаревают',
    why_p1_solution: 'Цифровое меню от $15/мес, обновляется мгновенно',
    why_p2_problem: 'Гости долго ждут, пока найдут официанта',
    why_p2_solution: 'Кнопка вызова прямо в меню',
    why_p3_problem: 'Иностранные гости ничего не понимают',
    why_p3_solution: 'Авто-перевод на 20+ языков',
    why_more_reasons: '💡 Ещё 3 причины выбрать TapMenu',
    // Block 1: Convenience
    why_b1_title: 'Клиентам удобно пользоваться',
    why_b1_text: 'Одно касание — и меню уже на экране телефона. Без скачивания приложений, без QR-сканера, без ожидания. Гость сразу видит блюда, цены и фото.',
    why_b1_trend_label: '📈 NFC-тренд 2024–2025',
    why_b1_trend_text: 'Клиенты всё чаще требуют NFC — особенно молодёжь и туристы. Рестораны без NFC-меню начинают проигрывать в конкуренции за современного гостя.',
    // Block 2: Time saving
    why_b2_title: 'Экономим время — обслуживаем больше',
    why_b2_text: 'Мы предлагаем экономить время и обслуживать больше клиентов, чем сейчас. Официант тратит колоссальное время на рутину — а не на продажи.',
    why_b2_stat_label: '📊 Сколько теряет официант в неделю?',
    why_b2_stat1: '🚶 Принести/убрать меню (×40 раз/день)',
    why_b2_stat1_val: '~2 ч/день',
    why_b2_stat2: '🗣️ Объяснять состав блюд',
    why_b2_stat2_val: '~1 ч/день',
    why_b2_stat3: '🔍 Искать свободный стол и меню',
    why_b2_stat3_val: '~30 мин/день',
    why_b2_total: '⚡ Итого потери в неделю (6 дней)',
    why_b2_total_val: '~21 час',
    why_b2_result: 'С TapMenu гость сам читает меню, сам вызывает официанта — официант тратит время только на обслуживание.',
    // Block 3: Margin
    why_b3_title: 'Маржа растёт на 10%',
    why_b3_text: 'Больше столиков в час, меньше ошибок в заказах, меньше потерь на рутину. Рестораны, подключившие TapMenu, фиксируют рост маржи в среднем на 10%.',
    why_b3_how_label: '💹 Как это работает?',
    why_b3_check1: 'Официант обслуживает больше столиков за смену',
    why_b3_check2: 'Гость видит фото и описание — заказывает больше',
    why_b3_check3: 'Не нужно печатать меню — нулевые расходы на полиграфию',
    why_b3_check4: 'Меньше ошибок = меньше возвратов и конфликтов',
    // How it works
    how_label: 'Просто',
    how_title: 'Как это работает?',
    how_step1_num: 'ШАГ 1',
    how_step1_title: 'Подключаетесь',
    how_step1_text: 'Регистрируетесь и выбираете тариф',
    how_step2_num: 'ШАГ 2',
    how_step2_title: 'Получаете NFC-метки',
    how_step2_text: 'Доставка за 3 рабочих дня',
    how_step3_num: 'ШАГ 3',
    how_step3_title: 'Гость касается',
    how_step3_text: 'Телефон касается метки на столе',
    how_step4_num: 'ШАГ 4',
    how_step4_title: 'Видит меню',
    how_step4_text: 'Моментально открывается ваше меню',
    // Pricing section
    pricing_label: 'Тарифы',
    pricing_title: 'Выберите свой план',
    pricing_subtitle: 'Начните с 7 дней бесплатно. Без привязки карты.',
    pricing_monthly: 'Ежемесячно',
    pricing_yearly: 'Годовая — скидка 20%',
    pricing_per_month: '/ мес',
    pricing_cta: 'Начать 7 дней бесплатно',
    pricing_contact: 'Связаться',
    // Reviews
    reviews_label: 'Отзывы',
    reviews_title: 'Что говорят наши клиенты',
    // CTA
    cta_title: 'Готовы попробовать TapMenu?',
    cta_subtitle: '7 дней бесплатно. Без карты. Отменить можно в любой момент.',
    cta_btn: '🚀 Начать бесплатно',
    cta_demo: 'Посмотреть демо',
  },
  en: {
    // Navigation
    nav_home: 'Home',
    nav_pricing: 'Pricing',
    nav_how: 'How it works',
    nav_luxe: '✦ LUXE',
    nav_contact: 'Contact',
    nav_start: 'Get started',
    // Footer
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
    // Hero
    hero_label: '🇦🇲 Platform for Armenian restaurants',
    hero_title_1: 'Digital menu',
    hero_title_2: 'for your restaurant',
    hero_subtitle: 'One NFC tap — and the guest sees the menu. No apps. No delays.',
    hero_cta_1: '🚀 Start free trial',
    hero_cta_2: 'View pricing',
    hero_badge_1: '⚡ Fast',
    hero_badge_2: '🌍 20+ languages',
    hero_badge_3: '🤖 Automated',
    hero_badge_4: '✓ 7 days free',
    // Stats
    stats_restaurants: 'Restaurants connected',
    stats_languages: 'Menu languages',
    stats_guests: 'Guests served',
    stats_satisfied: 'Satisfied customers',
    // Why section
    why_label: 'Why TapMenu?',
    why_title: 'Why does your restaurant need TapMenu?',
    why_subtitle: 'We solve real problems every restaurant faces',
    why_was: 'Before',
    why_became: 'After',
    why_p1_problem: 'Paper menus are expensive and outdated',
    why_p1_solution: 'Digital menu from $15/mo, instant updates',
    why_p2_problem: 'Guests wait a long time to find a waiter',
    why_p2_solution: 'Call button right in the menu',
    why_p3_problem: 'Foreign guests understand nothing',
    why_p3_solution: 'Auto-translation into 20+ languages',
    why_more_reasons: '💡 3 more reasons to choose TapMenu',
    // Block 1: Convenience
    why_b1_title: 'Easy for customers to use',
    why_b1_text: 'One tap — and the menu is on their phone screen. No app downloads, no QR scanner, no waiting. The guest immediately sees dishes, prices and photos.',
    why_b1_trend_label: '📈 NFC trend 2024–2025',
    why_b1_trend_text: 'Customers are increasingly demanding NFC — especially young people and tourists. Restaurants without NFC menus are losing the competition for modern guests.',
    // Block 2: Time saving
    why_b2_title: 'Save time — serve more',
    why_b2_text: 'We offer you the opportunity to save time and serve more customers than you do now. Waiters spend enormous time on routine — not on sales.',
    why_b2_stat_label: '📊 How much time does a waiter lose per week?',
    why_b2_stat1: '🚶 Bring/remove menu (×40 times/day)',
    why_b2_stat1_val: '~2 h/day',
    why_b2_stat2: '🗣️ Explaining dish ingredients',
    why_b2_stat2_val: '~1 h/day',
    why_b2_stat3: '🔍 Finding free table and menu',
    why_b2_stat3_val: '~30 min/day',
    why_b2_total: '⚡ Total losses per week (6 days)',
    why_b2_total_val: '~21 hours',
    why_b2_result: 'With TapMenu guests read the menu themselves, call the waiter themselves — the waiter spends time only on service.',
    // Block 3: Margin
    why_b3_title: 'Margin grows by 10%',
    why_b3_text: 'More tables per hour, fewer order errors, less routine waste. Restaurants using TapMenu report an average margin increase of 10%.',
    why_b3_how_label: '💹 How does it work?',
    why_b3_check1: 'Waiter serves more tables per shift',
    why_b3_check2: 'Guest sees photos and description — orders more',
    why_b3_check3: 'No need to print menus — zero printing costs',
    why_b3_check4: 'Fewer errors = fewer returns and conflicts',
    // How it works
    how_label: 'Simple',
    how_title: 'How does it work?',
    how_step1_num: 'STEP 1',
    how_step1_title: 'Connect',
    how_step1_text: 'Register and choose a plan',
    how_step2_num: 'STEP 2',
    how_step2_title: 'Get NFC tags',
    how_step2_text: 'Delivery in 3 business days',
    how_step3_num: 'STEP 3',
    how_step3_title: 'Guest taps',
    how_step3_text: 'Phone touches the table tag',
    how_step4_num: 'STEP 4',
    how_step4_title: 'Sees the menu',
    how_step4_text: 'Your menu opens instantly',
    // Pricing section
    pricing_label: 'Pricing',
    pricing_title: 'Choose your plan',
    pricing_subtitle: 'Start with 7 days free. No card required.',
    pricing_monthly: 'Monthly',
    pricing_yearly: 'Yearly — 20% off',
    pricing_per_month: '/ mo',
    pricing_cta: 'Start 7 days free',
    pricing_contact: 'Contact us',
    // Reviews
    reviews_label: 'Reviews',
    reviews_title: 'What our clients say',
    // CTA
    cta_title: 'Ready to try TapMenu?',
    cta_subtitle: '7 days free. No card. Cancel anytime.',
    cta_btn: '🚀 Start free',
    cta_demo: 'View demo',
  },
  hy: {
    // Navigation
    nav_home: 'Գլխավոր',
    nav_pricing: 'Սակագներ',
    nav_how: 'Ինչպես է աշխատում',
    nav_luxe: '✦ LUXE',
    nav_contact: 'Կապ',
    nav_start: 'Սկսել',
    // Footer
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
    // Hero
    hero_label: '🇦🇲 Հայաստանի ռեստորանների հարթակ',
    hero_title_1: 'Թվային մենյու',
    hero_title_2: 'ձեր ռեստորանի համար',
    hero_subtitle: 'NFC-ի մեկ հպում — և հյուրը տեսնում է մենյուն: Ոչ հավելված: Ոչ ուշացում:',
    hero_cta_1: '🚀 Սկսել անվճար փորձաշրջան',
    hero_cta_2: 'Տեսնել սակագները',
    hero_badge_1: '⚡ Արագ',
    hero_badge_2: '🌍 20+ լեզու',
    hero_badge_3: '🤖 Ավտոմատ',
    hero_badge_4: '✓ 7 օր անվճար',
    // Stats
    stats_restaurants: 'Ռեստորաններ միացված',
    stats_languages: 'Մենյուի լեզուներ',
    stats_guests: 'Հյուրեր օգտվել են',
    stats_satisfied: 'Գոհ հաճախորդներ',
    // Why section
    why_label: 'Ինչու՞ TapMenu',
    why_title: 'Ինչու՞ է TapMenu-ն անհրաժեշտ ձեր ռեստորանին',
    why_subtitle: 'Մենք լուծում ենք իրական խնդիրներ, որոնց բախվում է յուրաքանչյուր ռեստորան',
    why_was: 'Նախկինում',
    why_became: 'Հիմա',
    why_p1_problem: 'Թղթային մենյուները թանկ են և հնանում են',
    why_p1_solution: 'Թվային մենյու $15/ամ-ից, ակնթարթային թարմացումներ',
    why_p2_problem: 'Հյուրերը երկար սպասում են մատուցողին',
    why_p2_solution: 'Կանչի կոճակ հենց մենյուում',
    why_p3_problem: 'Օտարերկրյա հյուրերը ոչինչ չեն հասկանում',
    why_p3_solution: 'Ավտոթարգմանություն 20+ լեզվով',
    why_more_reasons: '💡 TapMenu-ն ընտրելու ևս 3 պատճառ',
    // Block 1: Convenience
    why_b1_title: 'Հարմար է հաճախորդների համար',
    why_b1_text: 'Մեկ հպում — և մենյուն արդեն հեռախոսի էկրանին: Առանց հավելված ներբեռնելու, QR սկաների, սպասելու: Հյուրն անմիջապես տեսնում է ուտեստները, գները և լուսանկարները:',
    why_b1_trend_label: '📈 NFC-ի միտում 2024–2025',
    why_b1_trend_text: 'Հաճախորդներն ավելի ու ավելի պահանջում են NFC — հատկապես երիտասարդությունը և զբոսաշրջիկները: NFC-մենյուից զուրկ ռեստորանները կորցնում են մրցակցությունը:',
    // Block 2: Time saving
    why_b2_title: 'Խնայում ենք ժամանակ — սպասարկում ավելի շատ',
    why_b2_text: 'Մենք առաջարկում ենք ժամանակ խնայել և ավելի շատ հաճախորդների սպասարկել: Մատուցողն ահռելի ժամանակ է ծախসում սովորական գործողությունների վրա:',
    why_b2_stat_label: '📊 Որքա՞ն ժամանակ է կորցնում մատուցողը շաբաթում',
    why_b2_stat1: '🚶 Մենյու բերել/տանել (×40 անգամ/օր)',
    why_b2_stat1_val: '~2 ժ/օր',
    why_b2_stat2: '🗣️ Բաղադրությունը բացատրել',
    why_b2_stat2_val: '~1 ժ/օր',
    why_b2_stat3: '🔍 Ազատ սեղան գտնել',
    why_b2_stat3_val: '~30 ր/օր',
    why_b2_total: '⚡ Ընդամենը կորուստ շաբաթում (6 օր)',
    why_b2_total_val: '~21 ժամ',
    why_b2_result: 'TapMenu-ով հյուրն ինքը կարդում է մենյուն, ինքը կանչում մատուցողին — մատուցողը ժամանակ է ծախսում միայն սպասարկման վրա:',
    // Block 3: Margin
    why_b3_title: 'Շահույթը աճում է 10%-ով',
    why_b3_text: 'Ժամում ավելի շատ սեղան, ավելի քիչ սխալ, ավելի քիչ կորուստ: TapMenu-ն կցած ռեստորանները ֆիքսում են շահույթի աճ՝ միջինը 10%-ով:',
    why_b3_how_label: '💹 Ինչպե՞ս է դա աշխատում',
    why_b3_check1: 'Մատուցողը սպասարկում է ավելի շատ սեղան հերթափոխում',
    why_b3_check2: 'Հյուրը տեսնում է լուսանկար — պատվիրում ավելի շատ',
    why_b3_check3: 'Պետք չէ տպել մենյու — զրոյական ծախս',
    why_b3_check4: 'Ավելի քիչ սխալ = ավելի քիչ վերադարձ',
    // How it works
    how_label: 'Պարզ',
    how_title: 'Ինչպե՞ս է աշխատում',
    how_step1_num: 'ՔԱՅԼ 1',
    how_step1_title: 'Միանում եք',
    how_step1_text: 'Գրանցվեք և ընտրեք սակագին',
    how_step2_num: 'ՔԱՅԼ 2',
    how_step2_title: 'Ստանում եք NFC-պիտակներ',
    how_step2_text: 'Առաքում 3 աշխատանքային օրում',
    how_step3_num: 'ՔԱՅԼ 3',
    how_step3_title: 'Հյուրը հպում է',
    how_step3_text: 'Հեռախոսը հպում է սեղանի պիտակին',
    how_step4_num: 'ՔԱՅԼ 4',
    how_step4_title: 'Տեսնում է մենյուն',
    how_step4_text: 'Ձեր մենյուն բացվում է ակնթարթորեն',
    // Pricing section
    pricing_label: 'Սակագներ',
    pricing_title: 'Ընտրեք ձեր պլանը',
    pricing_subtitle: 'Սկսեք 7 օր անվճար: Առանց քարտ կապելու:',
    pricing_monthly: 'Ամսական',
    pricing_yearly: 'Տարեկան — 20% զեղչ',
    pricing_per_month: '/ ամ',
    pricing_cta: 'Սկսել 7 օր անվճար',
    pricing_contact: 'Կապ հաստատել',
    // Reviews
    reviews_label: 'Կարծիքներ',
    reviews_title: 'Ինչ են ասում մեր հաճախորդները',
    // CTA
    cta_title: 'Պատրա՞ստ եք փորձել TapMenu-ն',
    cta_subtitle: '7 օր անվճար: Առանց քարտ: Կարելի է ցանկացած պահի չեղարկել:',
    cta_btn: '🚀 Սկսել անվճար',
    cta_demo: 'Տեսնել դեմո',
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
