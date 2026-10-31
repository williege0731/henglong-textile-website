(function(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header=document.querySelector('.site-header');
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const easeOut=t=>1-Math.pow(1-t,3);
  const easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const lerp=(a,b,t)=>a+(b-a)*t;

  const stage=document.querySelector('[data-stage]');
  let track=null;
  const smooth={p0:0,hp:0,fp:0,sp:0,gs:1,hold:0,pop:0};
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
     0–0.06  hero settle (p0)
     0.04–0.26 soft wipe + giant rise (hp)
     0.26–0.38 type hold / breath / pop settle
     0.34–1.0  cards scrub; type split lags via sp
  */
  function targets(){
    const y=scrollY,vh=innerHeight;
    let p0=0,hp=0,fp=0,sp=0,gs=1,phase='0',onHero=false,p=0;
    if(stage && !reduce){
      const top=stage.offsetTop,len=Math.max(1,stage.offsetHeight-vh);
      p=clamp((y-top)/len);
      p0=easeOut(clamp(p/0.04));
      hp=easeInOut(clamp((p-0.018)/0.24));
      /* longer type hold; ease-in scrub so first cards crawl then accelerate */
      const raw=clamp((p-0.34)/0.66);
      fp=Math.pow(easeInOut(raw), 0.92);
      sp=Math.pow(clamp((fp-0.18)/0.82), 1.2);
      gs=1-fp*0.26;
      phase=p<0.04?'0':(p<0.38?'1':'2');
      onHero=hp<0.5;
    }
    return {y,vh,p0,hp,fp,sp,gs,phase,onHero,p};
  }

  let vel=0, spin=0, coast=0, lastT=performance.now();
  const over={hp:0,fp:0};
  const spring={fp:0,v:0,sp:0,sv:0}; /* critically-damped-ish scrub */
  function expAlpha(lambda,dt){return 1-Math.exp(-lambda*dt);}
  function springStep(x, v, target, dt, omega){
    const zeta=1.08, w=omega;
    const a=-2*zeta*w*v - w*w*(x-target);
    const nv=v+a*dt;
    return {x:x+nv*dt, v:nv};
  }
  function apply(t,hard){
    if(stage && !reduce){
      const now=performance.now();
      const dt=Math.min(0.05, Math.max(0.008, (now-lastT)/1000));
      lastT=now;
      const dy=t.y-lastY;
      const speed=Math.min(2.8, Math.abs(dy)/16);
      vel=lerp(vel,speed,hard?1:expAlpha(6.8,dt));
      spin=lerp(spin, Math.max(-1.6, Math.min(1.6, dy/32)), hard?1:expAlpha(5.0,dt));
      coast=hard?0:lerp(coast + dy*0.00018, 0, expAlpha(2.1,dt));
      const boost=1+vel*0.48;
      smooth.p0=lerp(smooth.p0,t.p0,hard?1:expAlpha(8.0*boost,dt));
      smooth.hp=lerp(smooth.hp,t.hp,hard?1:expAlpha(8.2*boost,dt));
      /* spring scrub for cards + lagging type split */
      if(hard){spring.fp=t.fp;spring.v=0;spring.sp=t.sp;spring.sv=0;}
      else{
        const s1=springStep(spring.fp, spring.v, t.fp + coast, dt, 7.2*boost);
        spring.fp=s1.x; spring.v=s1.v;
        const s2=springStep(spring.sp, spring.sv, t.sp, dt, 5.6*boost);
        spring.sp=s2.x; spring.sv=s2.v;
      }
      smooth.fp=spring.fp;
      smooth.sp=spring.sp;
      smooth.gs=lerp(smooth.gs,t.gs,hard?1:expAlpha(5.2,dt));
      const impulse=hard?0:Math.max(-0.032, Math.min(0.032, dy/1100));
      over.hp=hard?0:lerp(over.hp+impulse*0.5, 0, expAlpha(6.0,dt));
      over.fp=hard?0:lerp(over.fp+impulse*0.7, 0, expAlpha(3.8,dt));
      const hpV=clamp(smooth.hp+over.hp);
      const fpV=clamp(smooth.fp+over.fp);
      const spV=clamp(smooth.sp);
      /* settle pop just as wipe completes, before cards */
      const popT=(hpV>0.88 && fpV<0.05) ? Math.sin(clamp((hpV-0.88)/0.12)*Math.PI) : 0;
      smooth.pop=lerp(smooth.pop, popT, hard?1:expAlpha(4.5,dt));
      const holdT=(hpV>0.96 && fpV<0.05) ? (0.5+0.5*Math.sin(now*0.0014)) : 0;
      smooth.hold=lerp(smooth.hold, holdT, hard?1:expAlpha(2.6,dt));
      stage.style.setProperty('--p0',smooth.p0.toFixed(4));
      stage.style.setProperty('--hp',hpV.toFixed(4));
      stage.style.setProperty('--fp',fpV.toFixed(4));
      stage.style.setProperty('--sp',spV.toFixed(4));
      stage.style.setProperty('--gs',smooth.gs.toFixed(4));
      stage.style.setProperty('--hold',smooth.hold.toFixed(4));
      stage.style.setProperty('--pop',smooth.pop.toFixed(4));
      stage.style.setProperty('--p',(t.p||0).toFixed(4));
      stage.dataset.phase=t.phase;
      if(track){
        const dist=Math.max(track.scrollWidth-innerWidth*0.06,1);
        track.style.transform=`translate3d(${(-fpV*dist).toFixed(2)}px,0,0)`;
        const mid=innerWidth*0.5;
        [...track.children].forEach((c,i)=>{
          const r=c.getBoundingClientRect();
          const cx=r.left+r.width*0.5;
          const nx=(cx-mid)/innerWidth;
          const prox=1-Math.min(1, Math.abs(nx)/0.52);
          const enter=clamp((innerWidth*1.12-r.left)/(innerWidth*0.42), 0.68, 1);
          const vis=clamp((r.right+56)/(r.width*0.32), 0, 1);
          const bob=Math.sin(fpV*5.6+i*1.1)*22*(0.15+0.85*Math.abs(Math.sin(i*1.4)));
          const lift=prox*18;
          const scale=0.91+prox*0.16+Math.sin(fpV*3.1+i)*0.016;
          const z=(prox*72+(i%2===0?8:-6)+Math.sin(fpV*2.2+i)*12).toFixed(1)+'px';
          const spn=(spin*(i%2===0?1:-1)*3.4).toFixed(2)+'deg';
          const tilt=(nx*-9.5).toFixed(2)+'deg';
          const ry=(nx*-16 - spin*2.5).toFixed(2)+'deg';
          const rx=(prox*-3.5 + Math.sin(fpV*2+i)*1.2).toFixed(2)+'deg';
          c.style.setProperty('--bob',bob.toFixed(2));
          c.style.setProperty('--lift',lift.toFixed(2));
          c.style.setProperty('--fs',scale.toFixed(3));
          c.style.setProperty('--z',z);
          c.style.setProperty('--spin',spn);
          c.style.setProperty('--tilt',tilt);
          c.style.setProperty('--ry',ry);
          c.style.setProperty('--rx',rx);
          c.style.setProperty('--prox',prox.toFixed(3));
          c.style.setProperty('--enter',enter.toFixed(3));
          c.style.setProperty('--vis',Math.max(vis, fpV>0.01?1:vis).toFixed(3));
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
    const map={hero:0.02,wipe:0.30,midwipe:0.10,peek:0.36,stage1:0.30,cards:0.55,stage2:0.55,stage0:0.02,stage3:0.94};
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
