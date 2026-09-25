(function(){
 var D=JSON.parse(document.getElementById('mkdata').textContent), C=D.cfg;
 var frame=document.getElementById('f'), ttl=document.getElementById('ttl'), backBtn=document.getElementById('back'), all=document.getElementById('all'), allBtn=document.getElementById('allbtn');
 var cache={}, current=null, stack=[], narrow={};
 Object.keys(C.wide).forEach(function(k){ narrow[C.wide[k]]=k; });
 function u8b64(t){ var b=new TextEncoder().encode(t),s='',i; for(i=0;i<b.length;i+=8192) s+=String.fromCharCode.apply(null,b.subarray(i,i+8192)); return btoa(s); }
 function url(k){ if(cache[k]) return cache[k]; var a=D.assets[k]; if(!a) return ''; return cache[k]='data:'+a.m+';base64,'+(a.b?a.b:u8b64(css(a.t))); }
 function css(t){ return t.replace(/@import\s+url\(\s*["']?\{\{a:([^}]+)\}\}["']?\s*\)\s*;?/g,function(_,k){ var a=D.assets[k]; return a&&a.t?css(a.t):''; }).replace(/\{\{a:([^}]+)\}\}/g,function(_,k){ return url(k); }); }
 function txt(k){ var a=D.assets[k]; return a&&a.t?css(a.t):''; }
 function fill(h){
   h=h.replace(/<link\b[^>]*rel=["']?preload[^>]*>/gi,'');
   h=h.replace(/<link\b[^>]*href=["']\{\{a:([^}]+\.css)\}\}["'][^>]*>/gi,function(_,k){ return '<style>'+txt(k)+'</style>'; });
   h=h.replace(/<script\b([^>]*?)\s*src=["']\{\{a:([^}]+)\}\}["']([^>]*)>\s*<\/script>/gi,function(_,a1,k,a2){ return '<script'+a1+a2+'>'+txt(k).replace(/<\/script/gi,'<\\/script')+'<\/script>'; });
   return css(h); }
 function norm(p){ var o=[]; p.split('/').forEach(function(s){ if(s==='..')o.pop(); else if(s&&s!=='.')o.push(s); }); return o.join('/'); }
 function rel(u,page){ if(/^#p:/.test(u)) return u.slice(3); return norm(page.replace(/[^/]*$/,'')+u); }
 function split(t){ var m=/^([^?#]*)(\?[^#]*)?(#.*)?$/.exec(t); return {k:m[1],q:m[2]||'',h:m[3]||''}; }
 function isWide(){ return window.innerWidth>=900; }
 function fit(k){ if(isWide()&&C.wide[k]) return C.wide[k]; if(!isWide()&&narrow[k]) return narrow[k]; return k; }
 var label={}; C.groups.forEach(function(g){ g[1].forEach(function(p){ label[p[0]]=p[1]; }); });
 function open(target,noPush){
   if(target==='@back'){ goBack(); return; }
   var s=split(target), k=fit(s.k);
   var html=D.pages[k]; if(!html){ ttl.textContent='Экран не найден'; return; }
   if(current&&!noPush) stack.push(current); current=k+s.q+s.h; backBtn.disabled=!stack.length;
   all.hidden=true; allBtn.setAttribute('aria-expanded','false'); allBtn.classList.remove('on');
   ttl.textContent=label[s.k]||label[k]||'';
   var shim='<script>window.__QS='+JSON.stringify(s.q)+';window.__PAGE='+JSON.stringify(k)+';(function(h){["pushState","replaceState"].forEach(function(n){var f=h[n].bind(h);h[n]=function(a,b,u){try{f(a,b,u)}catch(e){} if(u&&String(u).indexOf("?")>=0){window.__QS=String(u).slice(String(u).indexOf("?"))}}})})(history);<\/script>'+(C.css?'<style>'+C.css+'</style>':'');
   frame.__hash=s.h.slice(1);
   frame.srcdoc=fill(html).replace(/<head[^>]*>/i,function(m){return m+shim;});
 }
 function goBack(){ var u=stack.pop(); if(u) open(u,true); backBtn.disabled=!stack.length; }
 window.__mkGo=function(u,page){ open(rel(u,page||split(current).k)); };
 frame.addEventListener('load',function(){
   var d; try{ d=frame.contentDocument; }catch(e){ return; } if(!d||!d.body) return;
   if(!ttl.textContent&&d.title) ttl.textContent=d.title.split(' — ')[0];
   if(frame.__hash){ var el=d.getElementById(frame.__hash); if(el) el.scrollIntoView(); }
   d.addEventListener('click',function(e){
     var g=e.target.closest&&e.target.closest('[data-go]');
     if(g){ e.preventDefault(); open(rel(g.getAttribute('data-go'),split(current).k)); return; }
     var btn=e.target.closest&&e.target.closest('button');
     if(btn&&btn.parentElement&&!btn.closest('a')){ var sib=[].filter.call(btn.parentElement.children,function(x){return x.tagName==='BUTTON';});
       if(sib.some(function(x){return x.hasAttribute('aria-pressed');})){ var multi=btn.parentElement.getAttribute('role')==='group'&&false;
         sib.forEach(function(x){ x.setAttribute('aria-pressed',String(x===btn)); x.classList.toggle('on',x===btn); }); } }
     var a=e.target.closest&&e.target.closest('a[href]'); if(!a) return; var h=a.getAttribute('href');
     if(/^#p:/.test(h)){ e.preventDefault(); open(h.slice(3)); return; }
     if(/^https?:/.test(h)){ a.target='_blank'; a.rel='noopener'; return; }
     if(/^(tel:|mailto:|sms:)/.test(h)) return;
     if(h==='#'||h===''){ e.preventDefault(); return; }
     if(/^#/.test(h)){ e.preventDefault(); var id=decodeURIComponent(h.slice(1)), el=id==='top'?d.body:d.getElementById(id); if(el) el.scrollIntoView({behavior:'smooth'}); else if(id==='top') frame.contentWindow.scrollTo(0,0); return; }
     if(/\.html([?#]|$)/.test(h)){ e.preventDefault(); open(rel(h,split(current).k)); }
   });
   d.addEventListener('submit',function(e){ setTimeout(function(){},0); },true);
   frame.contentWindow.addEventListener('submit',function(e){ if(!e.defaultPrevented) e.preventDefault(); });
 });
 backBtn.onclick=goBack;
 document.getElementById('adm').onclick=function(){ open(C.admin); };
 document.getElementById('site').onclick=function(){ open(C.entry); };
 allBtn.onclick=function(){ var show=all.hidden; all.hidden=!show; allBtn.setAttribute('aria-expanded',String(show)); allBtn.classList.toggle('on',show);
   [].forEach.call(all.querySelectorAll('a'),function(a){ if(a.dataset.k===split(current||'').k||C.wide[a.dataset.k]===split(current||'').k) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); }); };
 var gw=document.getElementById('groups');
 C.groups.forEach(function(g){ if(!g[1].length) return; var s=document.createElement('section'), h=document.createElement('h3'), ul=document.createElement('ul');
   h.textContent=g[0]+' · '+g[1].length; s.appendChild(h);
   g[1].forEach(function(p){ var li=document.createElement('li'), a=document.createElement('a'); a.href='#'; a.dataset.k=p[0]; a.textContent=p[1];
     a.onclick=function(e){ e.preventDefault(); open(p[0]); }; li.appendChild(a); ul.appendChild(li); });
   s.appendChild(ul); gw.appendChild(s); });
 var lastWide=isWide(); window.addEventListener('resize',function(){ if(isWide()!==lastWide){ lastWide=isWide(); if(current) open(current,true); } });
 open(C.entry);
})();
