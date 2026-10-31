(function(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header=document.querySelector('.site-header');
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const ease=t=>1-Math.pow(1-t,3);

  // --- pinned home stage ---
  const stage=document.querySelector('[data-stage]');
  let track=null;
  if(stage){
    const floats=stage.querySelector('.stage-floats');
    track=document.createElement('div');track.className='track';
    [...floats.children].forEach(c=>track.appendChild(c));floats.appendChild(track);
  }
  // --- header hide/show + transparency ---
  let lastY=scrollY;
  // --- rails drag + progress ---
  document.querySelectorAll('.rail').forEach(r=>{
    const bar=document.createElement('div');bar.className='rail-progress';bar.innerHTML='<i></i>';r.after(bar);
    const upd=()=>{const max=r.scrollWidth-r.clientWidth||1;const i=bar.firstChild;i.style.width=(r.clientWidth/r.scrollWidth*100)+'%';i.style.transform=`translateX(${(r.scrollLeft/max)*(100/(r.clientWidth/r.scrollWidth)-100)}%)`;};
    r.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();
    let down=false,sx=0,sl=0,moved=0,v=0,lx=0,raf;
    r.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;down=true;moved=0;sx=lx=e.clientX;sl=r.scrollLeft;cancelAnimationFrame(raf);});
    addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-sx;moved=Math.abs(dx);if(moved>4)r.classList.add('dragging');v=e.clientX-lx;lx=e.clientX;r.scrollLeft=sl-dx;});
    addEventListener('pointerup',()=>{if(!down)return;down=false;setTimeout(()=>r.classList.remove('dragging'),0);
      const glide=()=>{v*=.94;r.scrollLeft-=v;if(Math.abs(v)>.4)raf=requestAnimationFrame(glide);};glide();});
  });
  // --- products: dock + to-top + title scale ---
  const dock=document.querySelector('.filter-dock'),toTop=document.querySelector('.to-top'),pills=document.querySelector('.pills-bar'),eh=document.querySelector('.explore-hero h1');
  const velvet=document.querySelector('.velvet-band .visual');

  function frame(){
    const y=scrollY,vh=innerHeight;
    if(stage){
      const top=stage.offsetTop,len=stage.offsetHeight-vh;
      const p=clamp((y-top)/len);
      const p0=clamp(p/.18), hp=ease(clamp((p-.18)/.17)), fp=clamp((p-.3)/.7);
      stage.style.setProperty('--p0',p0);stage.style.setProperty('--hp',hp);stage.style.setProperty('--fp',fp);
      stage.style.setProperty('--gs',1-fp*.12);
      stage.dataset.phase=p<.08?'0':(p<.2?'1':'2');
      if(track){const dist=track.scrollWidth;track.style.transform=`translate3d(${-fp*dist*1.0}px,0,0)`;
        [...track.children].forEach((c,i)=>{c.style.translate=`0 ${Math.sin(fp*6+i)*30}px`;});}
      const onHero=y<top+len*.3;
      header&&header.classList.toggle('on-hero',onHero);header&&header.classList.toggle('solid',!onHero);
    }
    if(header){const d=y-lastY;if(y>160&&d>6)header.classList.add('hide');else if(d<-6||y<160)header.classList.remove('hide');}
    if(dock&&pills){const away=pills.getBoundingClientRect().bottom>0&&y<200;dock.classList.toggle('away',away);toTop&&toTop.classList.toggle('away',y<vh*.6);}
    if(eh)eh.style.setProperty('--hs',1-clamp(y/400)*.35);
    if(velvet){const r=velvet.getBoundingClientRect();velvet.style.setProperty('--par',(r.top+r.height/2-vh/2)*-.12);}
    lastY=y;
  }
  let ticking=false;
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>{frame();ticking=false;});}},{passive:true});
  addEventListener('resize',frame);frame();

  // --- swatch hover swaps card image ---
  document.querySelectorAll('.fabric-card').forEach(card=>{
    const thumb=card.querySelector('.thumb');const alt=document.createElement('img');alt.className='alt';alt.alt='';thumb.appendChild(alt);
    card.querySelectorAll('.swatches i').forEach(sw=>{
      const url=(sw.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)||[])[1];
      sw.addEventListener('mouseenter',()=>{alt.src=url;thumb.classList.add('swap');sw.classList.add('on');});
      sw.addEventListener('mouseleave',()=>{thumb.classList.remove('swap');sw.classList.remove('on');});
    });
  });
  // --- animated Line/Grid + filter fade ---
  const grid=document.querySelector('.fabric-grid');
  if(grid){
    document.querySelectorAll('[data-view],[data-filter],.drop-panel button').forEach(b=>b.addEventListener('click',()=>{
      grid.classList.add('fading');
      setTimeout(()=>{grid.classList.remove('fading');[...grid.children].forEach((c,i)=>{c.style.animation='none';c.offsetWidth;c.style.animation='';c.style.animationDelay=(i%8)*40+'ms';});},250);
    },true));
  }
})();
