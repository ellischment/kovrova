/* Направление C · Календарь — общие демо-данные и утилиты для booking/*.html.
   Ничего никуда не отправляется. Все факты либо из docs/08-voprosy-k-irine.md
   и content/services/catalog-known.csv, либо помечены [?] (неизвестно, настраивается в админке). */
(function (global) {
  'use strict';

  var LOCS = [
    { id: 'lesnoe', name: 'Пригород Лесное', short: 'Лесное', sub: 'ЖК «Пригород Лесное», Мисайлово, ул. Героя России Филиппова, 8', badge: 'lesnoe', cls: 'loc-lesnoe' },
    { id: 'moskva', name: 'Москва', short: 'Москва', sub: 'м. Таганская, точный адрес уточняется', badge: 'moskva', cls: 'loc-moskva', unknownAddress: true },
    { id: 'online', name: 'Онлайн', short: 'Онлайн', sub: 'По видеосвязи, из любой точки. Платформа уточняется', badge: 'online', cls: 'loc-online' },
  ];

  // Направления (5–6) → семейства. Цены только из docs/08 §C и catalog-known.csv, иначе null = [?].
  var DIRECTIONS = [
    {
      id: 'first', title: 'Первичный приём', hint: 'Знакомство, «точка А», начало работы. Особые условия.',
      families: [{ id: 'first', title: 'Первичный приём', dur: 60, durKnown: false, prices: { lesnoe: null, moskva: null, online: null } }],
    },
    {
      id: 'massage', title: 'Массаж тела', hint: 'Классический, лимфодренажный, стоун — техника не меняет цену.',
      families: [
        { id: 'massage60', title: 'Массаж', dur: 60, prices: { lesnoe: null, moskva: null },
          techs: ['Классический', 'Лимфодренажный'] },
        { id: 'massage90', title: 'Массаж', dur: 90, prices: { lesnoe: 5500, moskva: null },
          techs: ['Классический', 'Лимфодренажный', 'Стоун-массаж'] },
      ],
    },
    {
      id: 'osteo', title: 'Остеопрактика', hint: 'Мягкая работа с телом, бережно и постепенно.',
      families: [{ id: 'osteo60', title: 'Остеопрактика', dur: 60, prices: { lesnoe: 5500 } }],
    },
    {
      id: 'face', title: 'Лицо', hint: 'Массаж лица и шейно-воротниковой зоны, маски.',
      families: [
        { id: 'face45', title: 'Массаж лица и ШВЗ', dur: 45, prices: { lesnoe: 4000 } },
        { id: 'faceMasks', title: 'Маски для лица', dur: null, durKnown: false, prices: { lesnoe: null } },
      ],
    },
    {
      id: 'psy', title: 'Психосоматика', hint: 'Разбираемся, что тело пытается сказать.',
      families: [
        { id: 'psySession', title: 'Сессия психосоматики', dur: 60, prices: { lesnoe: null, online: null } },
        { id: 'psyCards', title: 'Консультация с метафорическими картами', dur: null, durKnown: false, prices: { online: null, lesnoe: null } },
      ],
    },
    {
      id: 'special', title: 'Особые', hint: 'БЭМ, биодинамика — по согласованию.',
      families: [
        { id: 'bem', title: 'БЭМ — биоэнергорегуляционный массаж', dur: 90, prices: { lesnoe: null }, note: 'Нужно оборудование — только Лесное' },
        { id: 'bio', title: 'Биодинамика', dur: null, durKnown: false, prices: { online: null }, note: 'Онлайн — по договорённости, отзывалась только со слов гостей [?]' },
      ],
    },
  ];

  var PREPAY = 1000; // ₽, [?] значение по умолчанию (docs/08 §A.3)
  var TECH_DEADLINE = '18:00 накануне';
  var ANCHORS = ['09:00', '11:00', '13:30', '16:00', '18:30']; // [?] докс/08 §B.8 (якоря по умолчанию)
  var RELEASE_DAY = 21, RELEASE_HOUR = 11; // демо: как в сентябре (docs/08 §I)
  var REGULAR_EARLY_H = 24; // docs/08 §D.20
  var MIN_LEAD_H = 3;
  var HOLD_MIN = 10;

  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rub(n) { return n == null ? '<span class="q">цена [?]</span>' : n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₽'; }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function iso(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }
  function track(name, props) { console.info('[analytics]', name, props || {}); }
  function toast(msg) {
    var t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  var MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  var WD_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  var fmtDay = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });
  var fmtShort = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });

  function qs(name) { return new URLSearchParams(location.search).get(name); }
  var DEMO = qs('demo') || 'default'; // default | no-slots | race | pay-error | early-access
  var IS_REGULAR = DEMO === 'early-access' || qs('regular') === '1';

  /* Расписание задаётся по датам (ADR 0006): каждый день детерминированно получает
     локацию по хэшу даты — так демо ведёт себя одинаково при каждом заходе. */
  function dayLocation(dateIso) {
    var h = hash(dateIso) % 100;
    if (h < 38) return null; // закрыто
    if (h < 82) return 'lesnoe'; // Лесное и онлайн в один день
    return 'moskva';
  }
  function worksOn(loc, dateObj) {
    var dl = dayLocation(iso(dateObj));
    if (!dl) return false;
    if (loc === 'online') return dl === 'lesnoe';
    return dl === loc;
  }
  function slotsFor(loc, dateObj, now) {
    var d = iso(dateObj);
    if (!worksOn(loc, dateObj)) return [];
    return ANCHORS.map(function (t) {
      var parts = t.split(':').map(Number);
      var at = new Date(dateObj); at.setHours(parts[0], parts[1], 0, 0);
      var tooSoon = (at - now) < 36e5 * MIN_LEAD_H;
      var taken = DEMO === 'no-slots' ? true : (hash(d + '|' + loc + '|' + t) % 100 < 58);
      return { time: t, at: at, free: !tooSoon && !taken };
    });
  }
  function partOf(t) { var h = +t.slice(0, 2); return h < 13 ? 'morning' : h < 17 ? 'day' : 'evening'; }

  function releaseInfo(now) {
    var opened = now.getDate() > RELEASE_DAY || (now.getDate() === RELEASE_DAY && now.getHours() >= RELEASE_HOUR);
    var openUntil = new Date(now.getFullYear(), now.getMonth() + (opened ? 2 : 1), 0, 23, 59);
    var earlyOpenUntil = new Date(openUntil); earlyOpenUntil.setDate(openUntil.getDate());
    var nextMonth = new Date(now.getFullYear(), now.getMonth() + (opened ? 2 : 1), 1);
    var nextDate = new Date(now.getFullYear(), now.getMonth() + (opened ? 1 : 0), RELEASE_DAY, RELEASE_HOUR);
    var regularOpensAt = new Date(nextDate); regularOpensAt.setHours(regularOpensAt.getHours() - REGULAR_EARLY_H);
    return { opened: opened, openUntil: openUntil, nextMonth: nextMonth, nextReleaseDate: nextDate, regularOpensAt: regularOpensAt };
  }

  function findDirection(id) { return DIRECTIONS.filter(function (d) { return d.id === id; })[0]; }
  function findFamily(dirId, famId) { var d = findDirection(dirId); if (!d) return null; return d.families.filter(function (f) { return f.id === famId; })[0]; }
  function familyAvailableIn(fam, loc) { return fam && Object.prototype.hasOwnProperty.call(fam.prices, loc); }

  function formatPhone(v) {
    var d = v.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (d && !d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    var p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
    if (!d) return '';
    return '+7' + (p[0] ? ' (' + p[0] : '') + (p[0].length === 3 ? ')' : '') + (p[1] ? ' ' + p[1] : '') + (p[2] ? '-' + p[2] : '') + (p[3] ? '-' + p[3] : '');
  }
  var MED_RE = /(бол[иья]т|боль|грыж|диагноз|давлени|беремен|операц|травм|остеохондроз|сколиоз|лечени|таблет|заболеван|протруз|онколог|гипертон)/i;

  function saveLastBooking(b) { try { localStorage.setItem('kovrova_last_booking', JSON.stringify(b)); } catch (e) {} }
  function loadLastBooking() { try { var v = localStorage.getItem('kovrova_last_booking'); return v ? JSON.parse(v) : null; } catch (e) { return null; } }

  function downloadIcs(opts) {
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    var parts = opts.date.split('-'); var y = parts[0], m = parts[1], d = parts[2];
    var tp = opts.time.split(':'); var hh = tp[0], mm = tp[1];
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//kovrova//booking//RU', 'BEGIN:VEVENT',
      'UID:' + Date.now() + '@kovrova.booking', 'DTSTAMP:' + stamp,
      'DTSTART;TZID=Europe/Moscow:' + y + m + d + 'T' + hh + mm + '00', 'DURATION:PT' + (opts.dur || 60) + 'M',
      'SUMMARY:' + opts.title + ' — Ирина Коврова', 'LOCATION:' + (opts.location || ''),
      'DESCRIPTION:Перенести или отменить — по ссылке из подтверждения.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines], { type: 'text/calendar' }));
    a.download = 'zapis-irina-kovrova.ics'; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    track('calendar_added');
  }

  function qrSvg(seed) {
    var n = 21, cells = [];
    function eye(x, y) { return (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7); }
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { if (eye(x, y)) continue; if (hash(x + ':' + y + seed) % 100 < 46) cells.push('<rect x="' + x + '" y="' + y + '" width="1" height="1"/>'); }
    function fin(x, y) { return '<rect x="' + x + '" y="' + y + '" width="7" height="7"/><rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="5" height="5" fill="#fff"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3"/>'; }
    return '<svg class="qr" viewBox="0 0 ' + n + ' ' + n + '" role="img" aria-label="QR-код СБП (демо)" shape-rendering="crispEdges"><g fill="#1F2A1A">' + cells.join('') + fin(0, 0) + fin(n - 7, 0) + fin(0, n - 7) + '</g></svg>';
  }

  function shortCode(seed) {
    var letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    var h = hash(seed);
    return 'LS-' + letters[h % letters.length] + (h % 9000 + 1000);
  }

  global.KVR = {
    LOCS: LOCS, DIRECTIONS: DIRECTIONS, PREPAY: PREPAY, TECH_DEADLINE: TECH_DEADLINE, ANCHORS: ANCHORS,
    RELEASE_DAY: RELEASE_DAY, RELEASE_HOUR: RELEASE_HOUR, REGULAR_EARLY_H: REGULAR_EARLY_H, MIN_LEAD_H: MIN_LEAD_H, HOLD_MIN: HOLD_MIN,
    DEMO: DEMO, IS_REGULAR: IS_REGULAR,
    $: $, $all: $all, esc: esc, rub: rub, iso: iso, hash: hash, track: track, toast: toast,
    MONTHS_GEN: MONTHS_GEN, MONTHS_NOM: MONTHS_NOM, WD_SHORT: WD_SHORT, fmtDay: fmtDay, fmtShort: fmtShort,
    dayLocation: dayLocation, worksOn: worksOn, slotsFor: slotsFor, partOf: partOf, releaseInfo: releaseInfo,
    findDirection: findDirection, findFamily: findFamily, familyAvailableIn: familyAvailableIn,
    formatPhone: formatPhone, MED_RE: MED_RE, saveLastBooking: saveLastBooking, loadLastBooking: loadLastBooking,
    downloadIcs: downloadIcs, qrSvg: qrSvg, shortCode: shortCode, qs: qs,
  };
})(window);
