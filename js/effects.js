(function(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header=document.querySelector('.site-header');
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const easeOut=t=>1-Math.pow(1-t,3);
  const easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const lerp=(a,b,t)=>a+(b-a)*t;

  const stage=document.querySelector('[data-stage]');
  let track=null;
  const smooth={p0:0,hp:0,fp:0,gs:1};
  if(stage && !reduce){
    const floats=stage.querySelector('.stage-floats');
    if(floats && !floats.querySelector('.track')){
      track=document.createElement('div');track.className='track';
      [...floats.children].forEach(c=>track.appendChild(c));
      floats.appendChild(track);
    }else{
      track=floats&&floats.querySelector('.track');
    }
  }

  let lastY=scrollY;
  document.querySelectorAll('.rail').forEach(r=>{
    const bar=document.createElement('div');bar.className='rail-progress';bar.innerHTML='<i></i>';
    r.after(bar);
    const tip=bar.firstChild;
    const upd=()=>{
      const max=r.scrollWidth-r.clientWidth||1;
      const ratio=r.clientWidth/r.scrollWidth;
      tip.style.width=Math.max(12,ratio*100)+'%';
      tip.style.transform=`translateX(${(r.scrollLeft/max)*(1/ratio-1)*100}%)`;
    };
    r.addEventListener('scroll',upd,{passive:true});
    addEventListener('resize',upd);upd();
    let down=false,sx=0,sl=0,v=0,lx=0,raf;
    r.addEventListener('pointerdown',e=>{
      if(e.pointerType!=='mouse')return;
      down=true;sx=lx=e.clientX;sl=r.scrollLeft;v=0;cancelAnimationFrame(raf);
      try{r.setPointerCapture(e.pointerId)}catch(_){}
    });
    addEventListener('pointermove',e=>{
      if(!down)return;
      const dx=e.clientX-sx;
      if(Math.abs(dx)>4)r.classList.add('dragging');
      v=e.clientX-lx;lx=e.clientX;r.scrollLeft=sl-dx;
    });
    addEventListener('pointerup',()=>{
      if(!down)return;down=false;
      setTimeout(()=>r.classList.remove('dragging'),0);
      const glide=()=>{v*=.92;r.scrollLeft-=v;if(Math.abs(v)>.4)raf=requestAnimationFrame(glide);};
      glide();
    });
  });

  const dock=document.querySelector('.filter-dock');
  const toTop=document.querySelector('.to-top');
  const pills=document.querySelector('.pills-bar');
  const eh=document.querySelector('.explore-hero h1');
  const velvet=document.querySelector('.velvet-band .visual');

  /* Progress map (of stage scroll 0..1):
     0–0.10  hero settle (p0)
     0.10–0.32 wipe + giant type rise (hp)
     0.28–1.0  cards scrub across type (fp)
  */
  function targets(){
    const y=scrollY,vh=innerHeight;
    let p0=0,hp=0,fp=0,gs=1,phase='0',onHero=false;
    if(stage && !reduce){
      const top=stage.offsetTop,len=Math.max(1,stage.offsetHeight-vh);
      const p=clamp((y-top)/len);
      p0=easeOut(clamp(p/0.07));
      hp=easeInOut(clamp((p-0.05)/0.28));
      /* hold giant type, then cards cross through */
      fp=easeOut(clamp((p-0.32)/0.68));
      gs=1-fp*0.26;
      phase=p<0.07?'0':(p<0.34?'1':'2');
      onHero=hp<0.58;
    }
    return {y,vh,p0,hp,fp,gs,phase,onHero};
  }

  let vel=0;
  function apply(t,hard){
    if(stage && !reduce){
      /* velocity-aware lerp: catch up faster when scrubbing hard */
      const speed=Math.min(1.8, Math.abs(t.y-lastY)/28);
      vel=lerp(vel,speed,0.2);
      const boost=1+vel*0.55;
      const k=hard?1:Math.min(0.16,0.068*boost);
      smooth.p0=lerp(smooth.p0,t.p0,hard?1:Math.min(0.18,0.1*boost));
      smooth.hp=lerp(smooth.hp,t.hp,k);
      smooth.fp=lerp(smooth.fp,t.fp,hard?1:Math.min(0.14,0.055*boost));
      smooth.gs=lerp(smooth.gs,t.gs,hard?1:0.085);
      stage.style.setProperty('--p0',smooth.p0.toFixed(4));
      stage.style.setProperty('--hp',smooth.hp.toFixed(4));
      stage.style.setProperty('--fp',smooth.fp.toFixed(4));
      stage.style.setProperty('--gs',smooth.gs.toFixed(4));
      stage.dataset.phase=t.phase;
      if(track){
        const dist=Math.max(track.scrollWidth-innerWidth*0.2,1);
        track.style.transform=`translate3d(${(-smooth.fp*dist).toFixed(2)}px,0,0)`;
        [...track.children].forEach((c,i)=>{
          const bob=Math.sin(smooth.fp*7.1+i*1.1)*52*(0.4+0.6*Math.abs(Math.sin(i*1.35)));
          const scale=1+Math.sin(smooth.fp*3.4+i*0.8)*0.055;
          const z=(Math.sin(smooth.fp*2.2+i)*18).toFixed(1)+'px';
          c.style.setProperty('--bob',bob.toFixed(2));
          c.style.setProperty('--fs',scale.toFixed(3));
          c.style.setProperty('--z',z);
        });
      }
      if(header){
        header.classList.toggle('on-hero',t.onHero);
        header.classList.toggle('solid',!t.onHero);
      }
    }else if(header && !stage){
      header.classList.add('solid');
      header.classList.remove('on-hero');
    }

    if(header){
      const d=t.y-lastY;
      const inEarly=stage && t.phase!=='2' && t.onHero;
      if(!inEarly && t.y>200 && d>8) header.classList.add('hide');
      else if(d<-6 || t.y<160 || inEarly) header.classList.remove('hide');
    }
    if(dock && pills){
      const pr=pills.getBoundingClientRect();
      dock.classList.toggle('away',pr.bottom>48 && t.y<240);
      pills.classList.toggle('stuck',pr.top<=76 && pr.bottom>0);
    }
    if(toTop) toTop.classList.toggle('away',t.y<t.vh*0.7);
    if(eh) eh.style.setProperty('--hs',(1-clamp(t.y/480)*0.42).toFixed(3));
    if(velvet){
      const r=velvet.getBoundingClientRect();
      velvet.style.setProperty('--par',((r.top+r.height/2-t.vh/2)*-0.16).toFixed(1));
    }
    lastY=t.y;
  }

  let running=false;
  function loop(){
    apply(targets(),false);
    running=true;
    requestAnimationFrame(loop);
  }
  function kick(){if(!running){running=true;requestAnimationFrame(loop);}}
  addEventListener('scroll',kick,{passive:true});
  addEventListener('resize',()=>{apply(targets(),true);});
  apply(targets(),true);
  if(stage && !reduce) kick();

  /* QA frames: ?shot=hero|wipe|cards — hard scrub after layout */
  function goShot(name){
    if(!stage||reduce)return;
    const top=stage.offsetTop,len=Math.max(1,stage.offsetHeight-innerHeight);
    const map={hero:0.02,wipe:0.26,midwipe:0.15,stage1:0.26,cards:0.56,stage2:0.56,stage0:0.02,stage3:0.86};
    const p=map[name];
    if(p==null)return;
    scrollTo(0, top+len*p);
    apply(targets(),true);
    requestAnimationFrame(()=>{apply(targets(),true);document.documentElement.dataset.shotReady='1';});
  }
  const shot=(location.search.match(/[?&]shot=([\w-]+)/)||[])[1];
  if(shot){
    const wait=()=>{
      const imgs=[...document.images];
      if(imgs.some(i=>!i.complete)){setTimeout(wait,80);return;}
      goShot(shot);
      setTimeout(()=>goShot(shot),200);
    };
    wait();
  }

  document.querySelectorAll('.fabric-card').forEach(card=>{
    const thumb=card.querySelector('.thumb');
    if(!thumb)return;
    const alt=document.createElement('img');alt.className='alt';alt.alt='';
    thumb.appendChild(alt);
    card.querySelectorAll('.swatches i').forEach(sw=>{
      const url=(sw.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)||[])[1];
      if(!url)return;
      const show=()=>{alt.src=url;thumb.classList.add('swap');sw.classList.add('on');};
      const hide=()=>{thumb.classList.remove('swap');sw.classList.remove('on');};
      sw.addEventListener('mouseenter',show);
      sw.addEventListener('mouseleave',hide);
      sw.addEventListener('focus',show);
      sw.addEventListener('blur',hide);
      sw.tabIndex=0;
      sw.setAttribute('role','button');
      sw.setAttribute('aria-label','预览色号');
    });
  });

  const grid=document.querySelector('.fabric-grid');
  if(grid){
    document.querySelectorAll('[data-view],[data-filter],.drop-panel button').forEach(b=>{
      b.addEventListener('click',()=>{
        grid.classList.add('fading');
        setTimeout(()=>{
          grid.classList.remove('fading');
          [...grid.children].forEach((c,i)=>{
            if(c.hidden||c.style.display==='none')return;
            c.style.animation='none';c.offsetWidth;c.style.animation='';
            c.style.animationDelay=(i%10)*38+'ms';
          });
        },220);
      },true);
    });
  }
})();
