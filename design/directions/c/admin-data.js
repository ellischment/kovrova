/* Кабинет Ирины: общая нижняя навигация и демо-данные. Использует window.KVR (booking-data.js). */
(function (global) {
  'use strict';
  var K = global.KVR;

  var NAV = [
    { id: 'segodnya', title: 'Сегодня', href: 'segodnya.html' },
    { id: 'mesyac', title: 'Месяц', href: 'mesyac.html' },
    { id: 'zapisi', title: 'Записи', href: 'zapisi.html' },
    { id: 'list-ozhidaniya', title: 'Лист', href: 'list-ozhidaniya.html' },
    { id: 'more', title: 'Ещё', href: '#' },
  ];
  var MORE = [
    { id: 'ceny', title: 'Услуги и цены', href: 'ceny.html' },
    { id: 'gosti', title: 'Гости', href: 'gosti.html' },
    { id: 'sobytiya', title: 'События и сертификаты', href: 'sobytiya.html' },
    { id: 'sertifikaty', title: 'Сертификаты', href: 'sertifikaty.html' },
    { id: 'soobshcheniya', title: 'Сообщения', href: 'soobshcheniya.html' },
    { id: 'otchety', title: 'Отчёты', href: 'otchety.html' },
    { id: 'nastrojki', title: 'Настройки', href: 'nastrojki.html' },
  ];

  function mountNav(active) {
    var root = document.getElementById('tabs-root');
    if (!root) return;
    var isMoreActive = MORE.some(function (m) { return m.id === active; });
    root.innerHTML = '<nav class="tabs" role="tablist" aria-label="Разделы кабинета">' +
      NAV.map(function (n) {
        if (n.id === 'more') return '<button role="tab" id="moreBtn" aria-selected="' + isMoreActive + '" aria-haspopup="true" aria-expanded="false">' + n.title + '</button>';
        return '<a role="tab" href="' + n.href + '" aria-current="' + (n.id === active ? 'page' : 'false') + '">' + n.title + '</a>';
      }).join('') + '</nav>' +
      '<div class="more-menu" id="moreMenu" hidden>' + MORE.map(function (m) {
        return '<a href="' + m.href + '"' + (m.id === active ? ' aria-current="page"' : '') + '>' + m.title + '</a>';
      }).join('') + '</div>';
    var moreBtn = document.getElementById('moreBtn'), moreMenu = document.getElementById('moreMenu');
    if (moreBtn) {
      moreBtn.addEventListener('click', function () {
        var open = moreMenu.hidden;
        moreMenu.hidden = !open;
        moreBtn.setAttribute('aria-expanded', String(open));
        if (open) { var first = moreMenu.querySelector('a'); if (first) first.focus(); }
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !moreMenu.hidden) { moreMenu.hidden = true; moreBtn.setAttribute('aria-expanded', 'false'); moreBtn.focus(); } });
      document.addEventListener('click', function (e) { if (!moreMenu.hidden && !moreMenu.contains(e.target) && e.target !== moreBtn) { moreMenu.hidden = true; moreBtn.setAttribute('aria-expanded', 'false'); } });
    }
  }

  /* демо-данные: расписание месяца по датам (использует ту же hash-логику, что и booking) */
  function monthSchedule(year, month) {
    var days = new Date(year, month + 1, 0).getDate();
    var out = [];
    for (var d = 1; d <= days; d++) { var iso = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'); out.push({ day: d, iso: iso, loc: K.dayLocation(iso) }); }
    return out;
  }

  var GUESTS = [
    { name: 'Анна', phone: '+7 916 000-11-22', visits: 5, regular: true, lastVisit: 'массаж 90 · лимфодренажный', consent: { pdn: true, marketing: true, rasprostranenie: false } },
    { name: 'Мария', phone: '+7 916 222-33-44', visits: 1, regular: false, lastVisit: 'первичный приём', consent: { pdn: true, marketing: false, rasprostranenie: false } },
    { name: 'Ольга', phone: '+7 916 333-44-55', visits: 2, regular: false, lastVisit: 'остеопрактика', consent: { pdn: true, marketing: true, rasprostranenie: true } },
    { name: 'Елена', phone: '+7 916 444-55-66', visits: 8, regular: true, lastVisit: 'массаж 90 · стоун-массаж', consent: { pdn: true, marketing: true, rasprostranenie: true } },
  ];

  var WAITLIST = [
    { name: 'Елена', tag: 'reg', loc: 'lesnoe', svc: 'Массаж 90', windows: 'выходные утром', horizon: '31 окт.', position: 1 },
    { name: 'Дарья', tag: 'new', loc: 'lesnoe', svc: 'Первичный приём', windows: 'будни вечером', horizon: '15 окт.', position: 1 },
    { name: 'Ксения', tag: '', loc: 'moskva', svc: 'Остеопрактика', windows: 'любые дни', horizon: '30 нояб.', position: 2 },
  ];

  global.KVRA = { mountNav: mountNav, monthSchedule: monthSchedule, GUESTS: GUESTS, WAITLIST: WAITLIST };
})(window);
