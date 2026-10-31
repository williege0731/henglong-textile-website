(function(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header=document.querySelector('.site-header');
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const ease=t=>1-Math.pow(1-t,3);
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
      tip.style.width=(ratio*100)+'%';
      tip.style.transform=`translateX(${(r.scrollLeft/max)*(1/ratio-1)*100}%)`;
    };
    r.addEventListener('scroll',upd,{passive:true});
    addEventListener('resize',upd);upd();
    let down=false,sx=0,sl=0,v=0,lx=0,raf;
    r.addEventListener('pointerdown',e=>{
      if(e.pointerType!=='mouse')return;
      down=true;sx=lx=e.clientX;sl=r.scrollLeft;v=0;cancelAnimationFrame(raf);
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
      const glide=()=>{v*=.93;r.scrollLeft-=v;if(Math.abs(v)>.35)raf=requestAnimationFrame(glide);};
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
      p0=clamp(p/0.16);
      hp=ease(clamp((p-0.14)/0.18));
      fp=clamp((p-0.28)/0.72);
      gs=1-fp*0.14;
      phase=p<0.1?'0':(p<0.22?'1':'2');
      onHero=y<top+len*0.32;
    }
    return {y,vh,p0,hp,fp,gs,phase,onHero};
  }

  function apply(t,hard){
    if(stage && !reduce){
      const k=hard?1:0.14;
      smooth.p0=lerp(smooth.p0,t.p0,k);
      smooth.hp=lerp(smooth.hp,t.hp,k);
      smooth.fp=lerp(smooth.fp,t.fp,k);
      smooth.gs=lerp(smooth.gs,t.gs,k);
      stage.style.setProperty('--p0',smooth.p0.toFixed(4));
      stage.style.setProperty('--hp',smooth.hp.toFixed(4));
      stage.style.setProperty('--fp',smooth.fp.toFixed(4));
      stage.style.setProperty('--gs',smooth.gs.toFixed(4));
      stage.dataset.phase=t.phase;
      if(track){
        const dist=track.scrollWidth;
        track.style.transform=`translate3d(${(-smooth.fp*dist).toFixed(1)}px,0,0)`;
        [...track.children].forEach((c,i)=>{
          const bob=Math.sin(smooth.fp*5.5+i*0.9)*28;
          c.style.setProperty('--bob',bob.toFixed(1));
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
      // keep header visible through early hero stage
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
    if(eh)eh.style.setProperty('--hs',(1-clamp(t.y/420)*0.38).toFixed(3));
    if(velvet){
      const r=velvet.getBoundingClientRect();
      velvet.style.setProperty('--par',((r.top+r.height/2-t.vh/2)*-0.14).toFixed(1));
    }
    lastY=t.y;
  }

  let ticking=false;
  function tick(hard){
    apply(targets(),hard);
    ticking=false;
    if(!hard && stage && !reduce){
      const need=Math.abs(smooth.hp-targets().hp)>0.001 || Math.abs(smooth.fp-targets().fp)>0.001;
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
            c.style.animation='none';c.offsetWidth;c.style.animation='';
            c.style.animationDelay=(i%8)*42+'ms';
          });
        },240);
      },true);
    });
  }
})();
