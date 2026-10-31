(function(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header=document.querySelector('.site-header');
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const ease=t=>1-Math.pow(1-t,3);
  const easeInOut=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const lerp=(a,b,t)=>a+(b-a)*t;

  const stage=document.querySelector('[data-stage]');
  let track=null;
  const smooth={p0:0,hp:0,fp:0,gs:1};
  if(stage && !reduce){
    const floats=stage.querySelector('.stage-floats');
    track=document.createElement('div');track.className='track';
    [...floats.children].forEach(c=>track.appendChild(c));
    floats.appendChild(track);
  }

  let lastY=scrollY, hideArmed=false;
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

  function targets(){
    const y=scrollY,vh=innerHeight;
    let p0=0,hp=0,fp=0,gs=1,phase='0',onHero=false;
    if(stage && !reduce){
      const top=stage.offsetTop,len=Math.max(1,stage.offsetHeight-vh);
      const p=clamp((y-top)/len);
      p0=ease(clamp(p/0.14));
      hp=easeInOut(clamp((p-0.12)/0.2));
      fp=ease(clamp((p-0.26)/0.74));
      gs=1-fp*0.18;
      phase=p<0.09?'0':(p<0.24?'1':'2');
      onHero=y<top+len*0.3;
    }
    return {y,vh,p0,hp,fp,gs,phase,onHero};
  }

  function apply(t,hard){
    if(stage && !reduce){
      const k=hard?1:0.12;
      smooth.p0=lerp(smooth.p0,t.p0,k);
      smooth.hp=lerp(smooth.hp,t.hp,hard?1:0.1);
      smooth.fp=lerp(smooth.fp,t.fp,hard?1:0.09);
      smooth.gs=lerp(smooth.gs,t.gs,k);
      stage.style.setProperty('--p0',smooth.p0.toFixed(4));
      stage.style.setProperty('--hp',smooth.hp.toFixed(4));
      stage.style.setProperty('--fp',smooth.fp.toFixed(4));
      stage.style.setProperty('--gs',smooth.gs.toFixed(4));
      stage.dataset.phase=t.phase;
      if(track){
        const dist=Math.max(track.scrollWidth-innerWidth*0.35,1);
        track.style.transform=`translate3d(${(-smooth.fp*dist).toFixed(1)}px,0,0)`;
        [...track.children].forEach((c,i)=>{
          const bob=Math.sin(smooth.fp*6.2+i*0.85)*34*(0.55+0.45*Math.sin(i));
          const scale=1+Math.sin(smooth.fp*3.2+i)*0.02;
          c.style.setProperty('--bob',bob.toFixed(1));
          c.style.setProperty('--fs',scale.toFixed(3));
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
      const inEarlyStage=stage && t.phase!=='2' && t.onHero;
      if(!inEarlyStage && t.y>180 && d>8){header.classList.add('hide');hideArmed=true;}
      else if(d<-6 || t.y<160 || inEarlyStage){header.classList.remove('hide');hideArmed=false;}
    }
    if(dock && pills){
      const pr=pills.getBoundingClientRect();
      const away=pr.bottom>48 && t.y<240;
      dock.classList.toggle('away',away);
      pills.classList.toggle('stuck',pr.top<=76 && pr.bottom>0);
    }
    if(toTop)toTop.classList.toggle('away',t.y<t.vh*0.7);
    if(eh)eh.style.setProperty('--hs',(1-clamp(t.y/480)*0.42).toFixed(3));
    if(velvet){
      const r=velvet.getBoundingClientRect();
      velvet.style.setProperty('--par',((r.top+r.height/2-t.vh/2)*-0.16).toFixed(1));
    }
    lastY=t.y;
  }

  let ticking=false;
  function tick(hard){
    apply(targets(),hard);
    ticking=false;
    if(!hard && stage && !reduce){
      const need=Math.abs(smooth.hp-targets().hp)>0.0008 || Math.abs(smooth.fp-targets().fp)>0.0008;
      if(need){ticking=true;requestAnimationFrame(()=>tick(false));}
    }
  }
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>tick(false));}},{passive:true});
  addEventListener('resize',()=>tick(true));
  tick(true);

  document.querySelectorAll('.fabric-card').forEach(card=>{
    const thumb=card.querySelector('.thumb');
    if(!thumb)return;
    const alt=document.createElement('img');alt.className='alt';alt.alt='';
    thumb.appendChild(alt);
    card.querySelectorAll('.swatches i').forEach(sw=>{
      const url=(sw.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)||[])[1];
      if(!url)return;
      sw.addEventListener('mouseenter',()=>{alt.src=url;thumb.classList.add('swap');sw.classList.add('on');});
      sw.addEventListener('mouseleave',()=>{thumb.classList.remove('swap');sw.classList.remove('on');});
      sw.addEventListener('focus',()=>{alt.src=url;thumb.classList.add('swap');sw.classList.add('on');});
      sw.addEventListener('blur',()=>{thumb.classList.remove('swap');sw.classList.remove('on');});
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
