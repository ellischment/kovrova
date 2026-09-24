// Направление C · общий JS: меню, тема, фильтры прайса, подбор.
// Ванильный JS, без внешних запросов и без Google/Meta-сервисов.
(function () {
  "use strict";

  // --- мобильное меню ---
  var toggle = document.getElementById("nav-toggle");
  var panel = document.getElementById("site-nav-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  // --- тема (moss / night / cream), сохраняется в localStorage ---
  var root = document.documentElement;
  var THEME_KEY = "kovrova-theme";
  function applyTheme(theme) {
    if (theme === "moss") {
      root.removeAttribute("data-theme");
      root.setAttribute("data-theme", "moss");
    } else {
      root.setAttribute("data-theme", theme);
    }
    document.querySelectorAll("[data-theme-btn]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.themeBtn === theme));
    });
  }
  try {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved) applyTheme(saved);
  } catch (e) {}
  document.querySelectorAll("[data-theme-btn]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var theme = btn.dataset.themeBtn;
      applyTheme(theme);
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    });
  });

  // --- прайс: поиск + фильтры ---
  var searchInput = document.getElementById("price-search");
  var table = document.getElementById("price-table");
  var chips = document.querySelectorAll(".filter-chip");
  var locButtons = document.querySelectorAll("[data-loc-switch] button");

  function currentLoc() {
    var pressed = document.querySelector("[data-loc-switch] button[aria-pressed='true']");
    return pressed ? pressed.dataset.loc : "all";
  }
  function activeFilters() {
    var active = [];
    chips.forEach(function (c) {
      if (c.getAttribute("aria-pressed") === "true") active.push(c.dataset.filter);
    });
    return active;
  }
  function applyFilters() {
    if (!table) return;
    var q = (searchInput && searchInput.value || "").trim().toLowerCase();
    var loc = currentLoc();
    var filters = activeFilters();
    var rows = table.querySelectorAll("tbody tr");
    var visibleCount = 0;
    rows.forEach(function (row) {
      if (!row.dataset.title) return;
      var text = row.dataset.title.toLowerCase();
      var rowLoc = row.dataset.loc;
      var rowTags = (row.dataset.tags || "").split(" ");
      var matchesQuery = !q || text.indexOf(q) !== -1;
      var matchesLoc = loc === "all" || rowLoc === loc || rowLoc === "online-any" || rowLoc === "any";
      var matchesFilters = filters.every(function (f) { return rowTags.indexOf(f) !== -1; });
      var show = matchesQuery && matchesLoc && matchesFilters;
      row.hidden = !show;
      if (show) visibleCount++;
    });
    var emptyRow = document.getElementById("price-empty");
    if (emptyRow) emptyRow.hidden = visibleCount !== 0;
  }
  if (searchInput) searchInput.addEventListener("input", applyFilters);
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") === "true" ? "false" : "true");
      applyFilters();
    });
  });
  locButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      locButtons.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      applyFilters();
    });
  });
  if (table) applyFilters();

  // --- подбор «Не знаю, что выбрать» ---
  var podborForm = document.getElementById("podbor-form");
  if (podborForm) {
    var result = document.getElementById("podbor-result");
    var MAP = {
      "napryazhenie-lesnoe": "Классический массаж или лимфодренажный массаж (Пригород Лесное), 90&nbsp;минут.",
      "napryazhenie-online": "Сессия психосоматики онлайн — работа с телом через разговор и практики.",
      "otdyh-lesnoe": "Стоун-массаж (Пригород Лесное) — тёплые камни, глубокое расслабление.",
      "emocii-online": "Консультация с метафорическими картами онлайн или сессия психосоматики.",
      "emocii-lesnoe": "Сессия психосоматики очно, Пригород Лесное.",
      "lico-lesnoe": "Массаж лица и шейно-воротниковой зоны, 45&nbsp;минут.",
      "vpervye-lesnoe": "Первичный приём очно — знакомство, точка А, начало работы.",
      "vpervye-online": "Первичный приём онлайн — знакомство и проверка связи заранее."
    };
    podborForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(podborForm);
      var key = (data.get("zapros") || "") + "-" + (data.get("mesto") || "");
      result.hidden = false;
      result.querySelector("[data-podbor-text]").textContent =
        MAP[key] || "Похоже, ваш запрос особый — напишите Ирине, и она подберёт вариант лично.";
      result.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });
  }
})();
