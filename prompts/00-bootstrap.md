# Фаза 00: Bootstrap (шаблон, навыки, окружение)

> Запуск: `/phase 00` или вставьте этот текст в новую сессию Claude Code в репозитории `kovrova`.
> Человек нужен: нет (только если упадёт установка).

## Роль
Ты — оркестратор проекта. Прочитай `CLAUDE.md` и `docs/07-agentnyj-pajplajn.md`.

## Цель
Поставить в репозиторий основу из шаблона **di-sukharev/vibe** (ветка `master`, без мобильного), не потеряв нашу документацию, агентов и прототип, и подготовить окружение для агентного конвейера.

## Задачи
1. **Шаблон.** Склонируй `https://github.com/di-sukharev/vibe` (master) во временную папку. Скопируй его содержимое в корень репозитория **без перезаписи** наших `CLAUDE.md`, `README.md`, `docs/`, `prompts/`, `prototype/`, `.claude/`, `content/`. Их `CLAUDE.md` и `README.md` сохрани как `docs/vibe/CLAUDE.template.md` и `docs/vibe/README.template.md`. Их `AGENTS.md` оставь в корне: наш `CLAUDE.md` ссылается на него.
2. **Настройка шаблона.** Выполни раздел «Agent setup instructions» из README шаблона: web без mobile; `CHECKLIST.md` заполни на русском (имя проекта «Ирина Протченко: сайт и запись», slug `protchenko`); хостинг — **Yandex Cloud** (аудитория и данные в РФ), папку и гайд DigitalOcean удали. Переименуй демо-идентификаторы (`web_app_demo` и т. п.) → `protchenko`. Remote `origin` шаблона не подключай: наш origin уже настроен.
3. **Зависимости.** `bun install`; подними PostgreSQL через Docker Compose, если Docker доступен (если нет — зафиксируй в STATUS и продолжай без БД). Сгенерируй локальные `.env` из примеров (**не коммить**).
4. **Навыки.** Установи маркетинговые навыки в `.claude/skills/`:
   ```bash
   npx skills add coreyhaines31/marketingskills -a claude-code --skill \
     product-marketing cro copywriting copy-editing popups signup onboarding \
     site-architecture seo-audit schema ai-seo analytics sms emails referrals \
     offers pricing marketing-psychology customer-research content-strategy events churn-prevention
   ```
   Если CLI не работает в песочнице — клонируй репозиторий и скопируй нужные папки из `skills/` в `.claude/skills/`. Проверь, что наши `phase`, `review-5`, `done-check` не перезаписаны.
5. **Команды.** Заполни раздел «Команды» в `CLAUDE.md`: установка, dev (backend, webapp, website), тесты (unit, e2e), lint, typecheck, миграции, сборка.
6. **CI.** Если в шаблоне есть CI — оставь; добавь шаг e2e-проверки «нет запросов к Google» (пока как TODO-тест, заработает с фазы 03).
7. **Проверки.** Запусти фокусные проверки шаблона (typecheck, unit backend, сборка website). Всё зелёное, или причина зафиксирована.

## Ограничения
- Не удаляй и не переписывай `docs/`, `prompts/`, `prototype/`, `.claude/agents/`.
- Секреты — только в `.env` (в `.gitignore`).

## Критерии приёмки
- `bun install` проходит; сборка `website` проходит; typecheck зелёный.
- `CLAUDE.md` содержит реальные команды.
- В `.claude/skills/` есть маркетинговые навыки и наши три навыка.
- `docs/progress/STATUS.md`: фаза 00 завершена, следующая — 01.

## Отчёт
Что установлено, какие команды работают, что не получилось и почему (с логом), что дальше.
