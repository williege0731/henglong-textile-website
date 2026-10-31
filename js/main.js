(function(){
  const header=document.querySelector('.site-header');
  const drawer=document.querySelector('.nav-drawer');
  const overlay=document.querySelector('.nav-overlay');
  const openBtn=document.querySelector('[data-menu-open]');
  const closeAll=()=>{drawer&&drawer.classList.remove('open');overlay&&overlay.classList.remove('open');document.body.style.overflow='';};
  const openMenu=()=>{drawer&&drawer.classList.add('open');overlay&&overlay.classList.add('open');document.body.style.overflow='hidden';};
  openBtn&&openBtn.addEventListener('click',openMenu);
  document.querySelectorAll('[data-menu-close]').forEach(el=>el.addEventListener('click',closeAll));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll();});

  const hero=document.querySelector('.hero');
  const onScroll=()=>{
    if(!header)return;
    if(hero){
      const past=window.scrollY>hero.offsetHeight-80;
      header.classList.toggle('on-hero',!past);
      header.classList.toggle('solid',past);
    }else if(!document.querySelector('[data-stage]')){
      header.classList.add('solid');
      header.classList.remove('on-hero');
    }
  };
  onScroll();
  window.addEventListener('scroll',onScroll,{passive:true});

  const pills=[...document.querySelectorAll('[data-filter]')];
  const cards=[...document.querySelectorAll('[data-cat]')];
  const dims={pattern:'all',cat:'all',use:'all'};
  let pillKey='all';
  const countEl=document.querySelector('[data-result-count]');

  function applyFilters(){
    let n=0;
    cards.forEach(c=>{
      const byPill=pillKey==='all'||c.getAttribute('data-cat')===pillKey;
      const byPat=dims.pattern==='all'||c.getAttribute('data-pattern')===dims.pattern;
      const byCat=dims.cat==='all'||c.getAttribute('data-cat')===dims.cat;
      const byUse=dims.use==='all'||c.getAttribute('data-use')===dims.use;
      const ok=byPill&&byPat&&byCat&&byUse;
      c.hidden=!ok;
      c.style.display=ok?'':'none';
      if(ok)n++;
    });
    if(countEl) countEl.textContent=n?`${n} fabrics`:'No matches';
    const empty=document.querySelector('[data-empty]');
    if(empty) empty.hidden=n>0;
  }

  pills.forEach(p=>p.addEventListener('click',()=>{
    pills.forEach(x=>x.classList.remove('is-active'));
    p.classList.add('is-active');
    pillKey=p.getAttribute('data-filter')||'all';
    applyFilters();
  }));

  document.querySelectorAll('.drop').forEach(drop=>{
    const btn=drop.querySelector(':scope > button');
    btn&&btn.addEventListener('click',e=>{
      e.stopPropagation();
      document.querySelectorAll('.drop').forEach(d=>{if(d!==drop)d.classList.remove('open');});
      drop.classList.toggle('open');
    });
    drop.querySelectorAll('.drop-panel button').forEach(opt=>{
      opt.addEventListener('click',()=>{
        drop.querySelectorAll('.drop-panel button').forEach(b=>b.classList.remove('is-on'));
        opt.classList.add('is-on');
        const label=btn.querySelector('[data-label]');
        if(label) label.textContent=opt.textContent.trim();
        const dim=drop.getAttribute('data-dim');
        const val=opt.getAttribute('data-val')||'all';
        if(dim) dims[dim]=val;
        drop.classList.remove('open');
        applyFilters();
      });
    });
  });
  document.addEventListener('click',()=>document.querySelectorAll('.drop').forEach(d=>d.classList.remove('open')));

  const grid=document.querySelector('.fabric-grid');
  document.querySelectorAll('[data-view]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      grid&&grid.classList.toggle('is-list', btn.getAttribute('data-view')==='list');
    });
  });

  if(cards.length) applyFilters();

  const io=new IntersectionObserver(ents=>{
    ents.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
})();
