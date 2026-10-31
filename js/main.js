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
    }else{
      header.classList.add('solid');
      header.classList.remove('on-hero');
    }
  };
  onScroll();
  window.addEventListener('scroll',onScroll,{passive:true});

  // pills
  const pills=[...document.querySelectorAll('[data-filter]')];
  const cards=[...document.querySelectorAll('[data-cat]')];
  pills.forEach(p=>p.addEventListener('click',()=>{
    pills.forEach(x=>x.classList.remove('is-active'));
    p.classList.add('is-active');
    const key=p.getAttribute('data-filter');
    cards.forEach(c=>{c.style.display=(key==='all'||c.getAttribute('data-cat')===key)?'':'none';});
  }));

  // dropdown filters
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
        const val=opt.getAttribute('data-val');
        cards.forEach(c=>{
          if(!dim||val==='all'){ if(!c.style._hideByPill) c.style.display=''; return; }
          const ok=c.getAttribute('data-'+dim)===val || val==='all';
          c.style.display=ok?'':'none';
        });
        drop.classList.remove('open');
      });
    });
  });
  document.addEventListener('click',()=>document.querySelectorAll('.drop').forEach(d=>d.classList.remove('open')));

  // view toggle
  const grid=document.querySelector('.fabric-grid');
  document.querySelectorAll('[data-view]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      grid&&grid.classList.toggle('is-list', btn.getAttribute('data-view')==='list');
    });
  });

  const io=new IntersectionObserver(ents=>{
    ents.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});
  },{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
})();