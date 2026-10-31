(function(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header=document.querySelector('.site-header');
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const easeOut=t=>1-Math.pow(1-t,3);
  const easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const lerp=(a,b,t)=>a+(b-a)*t;

  const stage=document.querySelector('[data-stage]');
  let track=null;
  const smooth={p0:0,hp:0,fp:0,sp:0,gs:1,hold:0,fpMid:0};
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
     0–0.07  hero settle (p0)
     0.05–0.30 soft wipe + giant rise (hp)
     0.28–0.40 type hold / breath
     0.36–1.0  cards scrub; type split lags via sp
  */
  function targets(){
    const y=scrollY,vh=innerHeight;
    let p0=0,hp=0,fp=0,sp=0,gs=1,phase='0',onHero=false,p=0;
    if(stage && !reduce){
      const top=stage.offsetTop,len=Math.max(1,stage.offsetHeight-vh);
      p=clamp((y-top)/len);
      p0=easeOut(clamp(p/0.045));
      hp=easeInOut(clamp((p-0.022)/0.28));
      /* longer type hold before cards; creamier scrub curve */
      const raw=clamp((p-0.36)/0.64);
      fp=Math.pow(easeOut(raw), 0.86);
      /* split lags scrub so early cards cross centered type */
      sp=Math.pow(clamp((fp-0.14)/0.86), 1.15);
      gs=1-fp*0.28;
      phase=p<0.045?'0':(p<0.40?'1':'2');
      onHero=hp<0.48;
    }
    return {y,vh,p0,hp,fp,sp,gs,phase,onHero,p};
  }

  let vel=0, spin=0, coast=0, lastT=performance.now();
  const over={hp:0,fp:0}; /* scrub overshoot that settles */
  function expAlpha(lambda,dt){return 1-Math.exp(-lambda*dt);}
  function apply(t,hard){
    if(stage && !reduce){
      const now=performance.now();
      const dt=Math.min(0.05, Math.max(0.008, (now-lastT)/1000));
      lastT=now;
      /* dual-stage scrub: mid then display — creamier than single lerp */
      const dy=t.y-lastY;
      const speed=Math.min(2.6, Math.abs(dy)/18);
      vel=lerp(vel,speed,hard?1:expAlpha(7.2,dt));
      spin=lerp(spin, Math.max(-1.5, Math.min(1.5, dy/34)), hard?1:expAlpha(5.4,dt));
      /* residual coast after wheel stops */
      coast=hard?0:lerp(coast + dy*0.00022, 0, expAlpha(2.4,dt));
      const boost=1+vel*0.55;
      const aHp=hard?1:expAlpha(7.6*boost,dt);
      const aFpMid=hard?1:expAlpha(5.2*boost,dt);
      const aFp=hard?1:expAlpha(3.15*boost,dt);
      smooth.p0=lerp(smooth.p0,t.p0,hard?1:expAlpha(7.8*boost,dt));
      smooth.hp=lerp(smooth.hp,t.hp,aHp);
      smooth.fpMid=lerp(smooth.fpMid,t.fp,aFpMid);
      smooth.fp=lerp(smooth.fp,smooth.fpMid,aFp);
      smooth.sp=lerp(smooth.sp,t.sp,hard?1:expAlpha(3.4*boost,dt));
      smooth.gs=lerp(smooth.gs,t.gs,hard?1:expAlpha(5.6,dt));
      /* overshoot follows scroll impulse, then decays toward 0 */
      const impulse=hard?0:Math.max(-0.038, Math.min(0.038, dy/1000));
      over.hp=hard?0:lerp(over.hp+impulse*0.55, 0, expAlpha(5.8,dt));
      over.fp=hard?0:lerp(over.fp+impulse*0.85+coast, 0, expAlpha(3.6,dt));
      const hpV=clamp(smooth.hp+over.hp);
      const fpV=clamp(smooth.fp+over.fp);
      const spV=clamp(smooth.sp);
      /* breath while type is held (wiped, cards not yet moving) */
      const holdT=(hpV>0.94 && fpV<0.06) ? (0.5+0.5*Math.sin(now*0.00155)) : 0;
      smooth.hold=lerp(smooth.hold, holdT, hard?1:expAlpha(2.8,dt));
      const pinExit=Math.max(0, fpV-0.82);
      stage.style.setProperty('--p0',smooth.p0.toFixed(4));
      stage.style.setProperty('--hp',hpV.toFixed(4));
      stage.style.setProperty('--fp',fpV.toFixed(4));
      stage.style.setProperty('--sp',spV.toFixed(4));
      stage.style.setProperty('--gs',smooth.gs.toFixed(4));
      stage.style.setProperty('--hold',smooth.hold.toFixed(4));
      stage.style.setProperty('--pin',pinExit.toFixed(4));
      stage.style.setProperty('--p',(t.p||0).toFixed(4));
      stage.dataset.phase=t.phase;
      if(track){
        const dist=Math.max(track.scrollWidth-innerWidth*0.08,1);
        track.style.transform=`translate3d(${(-fpV*dist).toFixed(2)}px,0,0)`;
        const mid=innerWidth*0.5;
        [...track.children].forEach((c,i)=>{
          const r=c.getBoundingClientRect();
          const cx=r.left+r.width*0.5;
          const nx=(cx-mid)/innerWidth;
          const prox=1-Math.min(1, Math.abs(nx)/0.55);
          const enter=clamp((innerWidth*1.08-r.left)/(innerWidth*0.38), 0.7, 1);
          const vis=clamp((r.right+48)/(r.width*0.35), 0, 1);
          const bob=Math.sin(fpV*6.2+i*1.15)*28*(0.18+0.82*Math.abs(Math.sin(i*1.45)));
          const scale=0.92+prox*0.14+Math.sin(fpV*3.4+i)*0.018;
          const z=(prox*58+Math.sin(fpV*2.4+i)*10).toFixed(1)+'px';
          const spn=(spin*(i%2===0?1:-1)*3.1).toFixed(2)+'deg';
          const tilt=(nx*-8.5).toFixed(2)+'deg';
          const ry=(nx*-14 - spin*2.2).toFixed(2)+'deg';
          c.style.setProperty('--bob',bob.toFixed(2));
          c.style.setProperty('--fs',scale.toFixed(3));
          c.style.setProperty('--z',z);
          c.style.setProperty('--spin',spn);
          c.style.setProperty('--tilt',tilt);
          c.style.setProperty('--ry',ry);
          c.style.setProperty('--prox',prox.toFixed(3));
          c.style.setProperty('--enter',enter.toFixed(3));
          c.style.setProperty('--vis',Math.max(vis, fpV>0.012?1:vis).toFixed(3));
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
    const map={hero:0.02,wipe:0.32,midwipe:0.11,peek:0.38,stage1:0.32,cards:0.52,stage2:0.52,stage0:0.02,stage3:0.94};
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
