# Маршруты версии 2 (Claude Design): холст ссылается на целые холсты (*.dc.html),
# здесь каждая ссылка/кнопка получает конкретный экран, как на настоящем сайте.
import re
def has(t,*ws): return any(w.lower() in t.lower() for w in ws)
TIME=re.compile(r'\b\d{1,2}:\d{2}\b')
PREV={'zapis-gde':'c-home-390','zapis-chto':'zapis-gde','zapis-kogda':'zapis-chto','zapis-kontakty':'zapis-kogda',
      'zapis-netokon':'zapis-chto','zapis-rannij':'zapis-chto','zapis-zanyato':'zapis-chto','zapis-oshibka':'zapis-kontakty','zapis-gotovo':'c-home-390'}
def link(page,canvas,t):
    p=page.replace('.html',''); c=canvas.replace('.dc.html','')
    if c=='c-menu' : return None
    if c=='c-home' and has(t,'Закрыть меню'): return '@back'
    if c=='c-mesto':
        if has(t,'Москва','Москве'): return 'mestoM-390'
        if has(t,'Онлайн','онлайн'): return 'mestoO-390'
        return 'c-mesto-390'
    if c=='c-vid':
        return 'vidpsy-390' if has(t,'Психосомат','Эмоцион','Метафор','Биодинам') else 'c-vid-390'
    if c=='c-kontakty' and has(t,'Поделиться словами'): return 'otzF-390'
    if c=='c-zapis':
        if p.startswith('zapis-'):
            if has(t,'Назад'): return PREV.get(p)
            if t in('1 Где','Лесное'): return 'zapis-gde'
            if t=='2 Что' or has(t,'Лимфо 90','Стоун 90'): return 'zapis-chto'
            if t=='3 Когда' or t=='3 окт 11:00': return 'zapis-kogda'
            if t=='4 Вы': return 'zapis-kontakty'
            if has(t,'Добавить в календарь'): return '#'
            if p=='zapis-gde':
                if has(t,'другой человек'): return 'zapis-gde'
                if has(t,'Повторить'): return 'zapis-kogda'
                return 'zapis-chto'
            if p=='zapis-chto':
                if has(t,'прошлый раз','мин','К выбору времени'): return 'zapis-kogda'
                if has(t,'Первый раз'): return 'c-pervichnyj-390'
                return 'zapis-chto'
            if p=='zapis-kogda':
                if t=='ноябрь': return 'zapis-netokon'
                if t=='10': return 'zapis-zanyato'
                if TIME.search(t) or t=='Дальше': return 'zapis-kontakty'
                return 'zapis-kogda'
            if p=='zapis-zanyato':
                if t=='ноябрь': return 'zapis-netokon'
                if TIME.search(t) or t=='Дальше': return 'zapis-kontakty'
                return 'zapis-kogda'
            if p=='zapis-rannij':
                if TIME.search(t) or t=='Дальше': return 'zapis-kontakty'
                return 'zapis-kogda'
            if p=='zapis-netokon': return 'zapis-kogda'
            if p in('zapis-kontakty','zapis-oshibka'): return 'zapis-gotovo'
        if TIME.search(t) or has(t,'Ближайшее'): return 'zapis-kontakty'
        if page.startswith(('c-raspisanie','raspS','c-home')) and (t=='' or t=='пусто' or re.fullmatch(r'\d{1,2}',t)): return 'zapis-kogda'
        if page.startswith('c-prices') and not has(t,'Записаться'): return 'zapis-kogda'
        if page.startswith(('c-vid','vidpsy','podres','msg','c-pervichnyj')) and has(t,'Выбрать время','первичный'): return 'zapis-kogda'
        if p=='c-raspisanie-390' and has(t,'Выбрать время'): return 'zapis-kogda'
        if p=='list-predl': return 'zapis-kontakty'
        if p=='z-otmeneno': return 'zapis-kogda'
        if has(t,'Добавить в календарь'): return '#'
        if has(t,'в Лесное','в Москву','онлайн'): return 'zapis-chto'
        return 'zapis-gde'
    if c=='c-z':
        if p=='msg':
            if has(t,'Перенести'): return 'z-perenos'
            if t=='Отменить': return 'z-otmena'
            return 'z-obzor'
        if has(t,'К записи'): return 'z-obzor'
        if has(t,'Отменить и вернуть'): return 'z-otmeneno'
        if has(t,'Перенести на'): return 'z-obzor' if p=='z-perenos' else 'z-perenos'
        if has(t,'Перенести'): return 'z-perenos'
        if has(t,'Отменить'): return 'z-otmena'
        if p=='z-perenos': return 'z-perenos'
        return 'z-obzor'
    if c=='c-list':
        if p=='list-forma': return 'list-podtv'
        if has(t,'Изменить пожелания'): return 'list-forma'
        if has(t,'Выйти'): return 'c-home-390'
        if p=='list-predl' or (p=='msg' and has(t,'Не подходит')): return 'list-podtv'
        if p=='msg': return 'list-predl'
        return 'list-forma'
    if c=='c-adm':
        for w,d in [('Сегодня','adm-segodnya'),('Месяц','adm-mesyac'),('Записи','adm-zapisi'),('Цены','adm-ceny'),('Изменить несколько','adm-massovo'),
                    ('Предложить окно','adm-list'),('Применить','adm-ceny'),('Отменить','adm-ceny'),('Запланировать','adm-mesyac'),('Вручную','adm-zapisi'),('Записать','adm-zapisi'),('Написать','adm2-soobshcheniya')]:
            if has(t,w): return d
        return 'adm-segodnya'
    if c=='c-adm2':
        for w,d in [('Лист ожидания','adm-list'),('Гост','adm2-gost'),('Событи','adm2-sobytiya'),('Сертификат','adm2-sertifikaty'),('Абонемент','adm2-sertifikaty'),
                    ('Сообщени','adm2-soobshcheniya'),('Сохранить шаблон','adm2-soobshcheniya'),('Написать','adm2-soobshcheniya'),('Настройки','adm2-nastrojki'),('Юридическ','adm2-nastrojki'),
                    ('Отчёт','adm2-otchety'),('CSV','adm2-otchety'),('Контент','adm2-sostoyaniya')]:
            if has(t,w): return d
        if p=='adm-zapisi' and t!='Ещё': return 'adm2-gost'
        if p=='adm2-gost' and t!='Ещё': return 'adm2-gost'
        return 'adm2-eshche'
    return None
def button(page,t,pressed):
    p=page.replace('.html','')
    if p=='c-podbor-390': return 'podq2-390'
    if p=='podq2-390': return 'c-podbor-390' if t=='Назад' else 'podres-390'
    if p=='podres-390' and has(t,'заново'): return 'c-podbor-390'
    if p in('c-raspisanie-390',) and t=='Напомнить': return 'raspS-390'
    if p=='c-sertifikaty-390' and has(t,'Оплатить'): return 'c-sertifikat-390'
    if p=='zapis-oshibka' and t=='СБП': return None
    return None
