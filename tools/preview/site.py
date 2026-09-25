import os,re,json,base64,posixpath,html as H,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import routes_v2
R=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'../..')); S=os.path.dirname(os.path.abspath(__file__)); os.chdir(R)
A='design/directions/c'; B='design/directions/c-claude-design'
MIME={'.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.txt':'text/plain','.html':'text/html','.svg':'image/svg+xml'}
def walk(d):
    for r,_,fs in os.walk(d):
        for f in fs: yield posixpath.join(r,f)
REF=re.compile(r'''(?P<pre>(?:src|href)=["'])(?P<u>[^"'#]+?)(?P<q>[?#][^"']*)?(?P<post>["'])|(?P<cpre>url\(\s*["']?)(?P<cu>[^)"'?#]+)(?P<cq>[?#][^)"']*)?(?P<cpost>["']?\s*\))|(?P<ipre>@import\s+["'])(?P<iu>[^"']+)(?P<ipost>["'])''')
def resolve(u,base):
    if re.match(r'^(https?:|data:|blob:|mailto:|tel:|javascript:|//)',u): return None
    return posixpath.normpath(posixpath.join(posixpath.dirname(base),u))
def rewrite(text,base,keys):
    def sub(m):
        if m.group('u') is not None:
            u=m.group('u'); q=m.group('q') or ''; k=resolve(u,base)
            if k and k.endswith('.html') and k in keys: return m.group('pre')+'#p:'+k+q+m.group('post')
            if k and k in keys: return m.group('pre')+'{{a:'+k+'}}'+m.group('post')
            return m.group(0)
        if m.group('cu') is not None:
            k=resolve(m.group('cu').strip(),base)
            return m.group('cpre')+'{{a:'+k+'}}'+m.group('cpost') if k and k in keys else m.group(0)
        k=resolve(m.group('iu'),base)
        return m.group('ipre')+'{{a:'+k+'}}'+m.group('ipost') if k and k in keys else m.group(0)
    return REF.sub(sub,text)
def text_of(inner,attrs):
    t=' '.join(H.unescape(re.sub(r'<[^>]+>',' ',inner)).split())
    if not t:
        m=re.search(r'aria-label="([^"]*)"',attrs); t=m.group(1) if m else ''
    return t
def route_v2(name,s):
    name={'zapisK-1280.html':'zapis-kogda.html','zapisC-1280.html':'zapis-kontakty.html','z-1280.html':'z-obzor.html','list-1280.html':'list-forma.html'}.get(name,name.replace('-1280','-390'))
    def a(m):
        attrs,inner=m.group(1),m.group(2); h=re.search(r'href="([^"]*)"',attrs)
        if not h or not h.group(1).endswith('.dc.html'): return m.group(0)
        d=routes_v2.link(name,h.group(1),text_of(inner,attrs))
        if d is None:
            base=h.group(1).replace('.dc.html',''); d={'c-menu':'c-menu-390'}.get(base, base+'-390')
        if d in('#','@back'): new=d
        else: new=d+'.html'
        return '<a'+attrs.replace(h.group(0),'href="'+new+'"')+'>'+inner+'</a>'
    s=re.sub(r'<a\b([^>]*)>(.*?)</a>',a,s,flags=re.S)
    def b(m):
        attrs,inner=m.group(1),m.group(2)
        d=routes_v2.button(name,text_of(inner,attrs),'aria-pressed' in attrs)
        return m.group(0) if not d else '<button data-go="'+d+'.html"'+attrs+'>'+inner+'</button>'
    return re.sub(r'<button\b([^>]*)>(.*?)</button>',b,s,flags=re.S)
V2L={'c-home':'Главная','c-menu':'Меню','c-prices':'Услуги и цены','c-raspisanie':'Расписание','c-pervichnyj':'Если вы впервые','c-mesto':'Где принимаю · Лесное','mestoM':'Где принимаю · Москва','mestoO':'Где принимаю · онлайн','c-ob-irine':'Об Ирине','c-sobytiya':'События и курсы','c-sobytie':'Событие','sobF':'Событие: мест нет','c-sertifikaty':'Сертификаты','c-sertifikat':'Сертификат оплачен','c-zametki':'Заметки','c-zametka':'Заметка','c-otzyvy':'Слова гостей','otzF':'Слова гостей: поделиться','c-abonementy':'Абонементы','c-voprosy':'Вопросы','c-kontakty':'Контакты','c-legal':'Документы','c-404':'Страница не найдена','c-vid':'Практика: массаж','vidpsy':'Практика: психосоматика','c-podbor':'Подбор: вопрос 1','podq2':'Подбор: вопрос 2','podres':'Подбор: результат','raspS':'Расписание: напомним','soon':'Запись скоро откроется','tech':'Техническая пауза',
 'zapis-gde':'Запись 1 · где','zapis-chto':'Запись 2 · что','zapis-kogda':'Запись 3 · когда','zapisK':'Запись 3 · когда','zapis-kontakty':'Запись 4 · контакты и оплата','zapisC':'Запись 4 · контакты и оплата','zapis-gotovo':'Вы записаны','zapis-netokon':'Запись: нет окон','zapis-zanyato':'Запись: время заняли','zapis-rannij':'Запись: ранний доступ','zapis-oshibka':'Запись: оплата не прошла',
 'list-forma':'Лист ожидания','list':'Лист ожидания','list-podtv':'Лист ожидания: вы в списке','list-predl':'Лист ожидания: окно для вас','list-ushlo':'Лист ожидания: окно ушло','z-obzor':'Моя запись','z':'Моя запись','z-perenos':'Перенести запись','z-otmena':'Отменить запись','z-otmeneno':'Запись отменена','msg':'Сообщения гостю',
 'adm-segodnya':'Кабинет: сегодня','adm-mesyac':'Кабинет: месяц','adm-zapisi':'Кабинет: записи','adm-ceny':'Кабинет: цены','adm-massovo':'Кабинет: цены массово','adm-list':'Кабинет: лист ожидания','adm2-eshche':'Кабинет: ещё','adm2-gost':'Кабинет: гостья','adm2-nastrojki':'Кабинет: настройки','adm2-otchety':'Кабинет: отчёты','adm2-sertifikaty':'Кабинет: сертификаты','adm2-sobytiya':'Кабинет: события','adm2-soobshcheniya':'Кабинет: шаблоны сообщений','adm2-sostoyaniya':'Кабинет: сбои и состояния'}
def label(k,s):
    b=re.sub(r'(-390|-1280|-cream|-night)?\.html$','',posixpath.basename(k))
    if '/c-claude-design/' in k and b in V2L: return V2L[b]
    m=re.search(r'<title>(.*?)</title>',s,re.S)
    if m and m.group(1).strip(): return H.unescape(m.group(1).split(' — ')[0].split(' · ')[0].strip())
    m=re.search(r'<h1[^>]*>(.*?)</h1>',s,re.S) or re.search(r'<h2[^>]*>(.*?)</h2>',s,re.S)
    return ' '.join(H.unescape(re.sub(r'<[^>]+>',' ',m.group(1))).split())[:60] if m else posixpath.basename(k)
def build(ver):
    root=A if ver==1 else B
    files=[f for f in walk(root) if not f.endswith(('.md','.dc.html')) and '/canvas/' not in f and 'LICENSE' not in f]
    extra=set()
    for k in files:
        if k.endswith(('.html','.css','.js')):
            for m in REF.finditer(open(k,encoding='utf-8').read()):
                u=m.group('u') or m.group('cu') or m.group('iu')
                r=resolve(u.strip(),k) if u else None
                if r and os.path.isfile(r) and r not in files and not r.endswith('.html'): extra.add(r)
    files=files+sorted(extra)
    keys=set(files); pages={}; assets={}; labels={}
    for k in sorted(files):
        ext=os.path.splitext(k)[1]; mime=MIME.get(ext,'application/octet-stream')
        if ext=='.html':
            t=open(k,encoding='utf-8').read(); name=posixpath.basename(k)
            if ver==2: t=route_v2(name,t)
            labels[k]=label(k,t)
            t=rewrite(t,k,keys)
            t=re.sub(r'href="(#|@back)"',lambda m:'href="#"' if m.group(1)=='#' else 'href="#p:@back"',t)
            if ver==1: t=t.replace('location.search','(window.__QS||location.search)')
            pages[k]=t
        elif ext in('.css','.js','.txt','.svg'):
            t=open(k,encoding='utf-8').read(); t=rewrite(t,k,keys)
            if ver==1 and ext=='.js': t=t.replace('location.search','(window.__QS||location.search)')
            if k==A+'/booking-data.js':
                t=re.sub(r'function go\(url\) \{.*?\n',"function go(url) { try { if (window.parent !== window && window.parent.__mkGo) { window.parent.__mkGo(url, window.__PAGE); return; } } catch (e) {} location.href = url; }\n",t,count=1)
            assets[k]={'m':mime,'t':t}
        else:
            assets[k]={'m':mime,'b':base64.b64encode(open(k,'rb').read()).decode()}
    P=lambda n: root+'/pages/'+n
    if ver==1:
        entry=P('index.html'); wide={}; css=''
        groups=[('Сайт',[k for k in pages if re.fullmatch(re.escape(P(''))+r'[^/]+',k)]),('Запись',[k for k in pages if '/booking/' in k]),('Кабинет Ирины',[k for k in pages if '/admin/' in k])]
        name='Вариант 1 · агенты'
    else:
        entry=P('c-home-390.html')
        wide={k:k.replace('-390','-1280') for k in pages if k.endswith('-390.html') and k.replace('-390','-1280') in pages}
        wide.update({P('zapis-kogda.html'):P('zapisK-1280.html'),P('zapis-kontakty.html'):P('zapisC-1280.html'),P('z-obzor.html'):P('z-1280.html'),P('list-forma.html'):P('list-1280.html')})
        css='html,body{margin:0;background:#E4D3BA}@media (max-width:600px){html,body{background:#F6E7D2}}.c-root{margin:0 auto;max-width:100%}.c-root[style*="width:1280px"]{width:100%!important}@media (max-width:600px){.c-root{width:100%!important}}'
        vis=[k for k in pages if not re.search(r'-1280|-cream|-night|zapisC|zapisK',k)]
        g=lambda rx:[k for k in vis if re.search(rx,posixpath.basename(k))]
        groups=[('Сайт',g(r'^c-')),('Запись',g(r'^zapis-')),('Лист ожидания',g(r'^list-')),('Моя запись',g(r'^z-')+g(r'^msg')),('Кабинет Ирины',g(r'^adm')),
                ('Варианты экранов сайта',g(r'^(mesto[MO]|otzF|podq2|podres|raspS|sobF|soon|tech|vidpsy)'))]
        name='Вариант 2 · Claude Design'
    order=[k for _,l in groups for k in l]
    cfg={'entry':entry,'admin':P('admin/segodnya.html') if ver==1 else P('adm-segodnya.html'),'wide':wide,'css':css,'groups':[[n,[[k,labels[k]] for k in sorted(l,key=lambda x:(x!=entry,labels[x]))]] for n,l in groups],'name':name}
    data=json.dumps({'assets':assets,'pages':pages,'cfg':cfg},ensure_ascii=False).replace('</','<\\/')
    shell=open(S+'/site-shell.html',encoding='utf-8').read()
    F=A+'/fonts/'
    def ff(fam,fn,w): return "@font-face{font-family:'%s';src:url(data:font/woff2;base64,%s) format('woff2');font-weight:%s;font-display:swap}"%(fam,base64.b64encode(open(F+fn,'rb').read()).decode(),w)
    fonts=ff('Geologica','geologica-cyrillic-wght-normal.woff2','100 900')+ff('Geologica','geologica-latin-wght-normal.woff2','100 900')
    js=open(S+'/site.js',encoding='utf-8').read()
    out=shell.replace('/*FONTS*/',fonts).replace('{{TITLE}}',{1:'Коврова, вариант 1',2:'Коврова, вариант 2'}[ver]).replace('{{NAME}}',name)\
        .replace('<!--DATA-->','<script type="application/json" id="mkdata">'+data+'</script>\n<script>\n'+js+'\n</script>')
    os.makedirs(R+'/design/preview',exist_ok=True); fn=R+'/design/preview/sajt-variant-%d.html'%ver; open(fn,'w',encoding='utf-8').write(out)
    print(fn, round(len(out)/1e6,2),'MB', len(pages),'pages')
for v in (sys.argv[1:] or ['1','2']): build(int(v))
