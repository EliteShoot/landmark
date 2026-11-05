(() => {
'use strict';
const root = document.querySelector('.build-story');
if (!root) return;
const canvas = document.getElementById('construction-film');
const ctx = canvas.getContext('2d', {alpha:false});
if (!ctx) return;
const stage = root.querySelector('.story-stage');
const copyBox = root.querySelector('.story-copy');
const progress = document.getElementById('story-progress');
const buttons = [...root.querySelectorAll('[data-stage]')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const names = ['groundwork','foundation','framing','shell','finished','entrance','interior'];
const images = names.map(name => { const im = new Image(); im.src = `assets/images/journey/${name}.webp?v=3`; im.onload = wake; return im; });
const digger = new Image(); digger.src = 'assets/images/journey/excavator-poses.webp?v=3'; digger.onload = wake;
const points = [0,.15,.31,.46,.61,.79,.94];
const destinations = [0,.31,.61,.94];
const copy = [
 ['01 / FROM THE GROUND UP','Great homes begin<br><em>right here.</em>','Michigan roots. A vision taking shape. Scroll to watch it come to life.','Groundwork'],
 ['02 / YOUR VISION TAKES SHAPE','One detail at a time.<br><em>Something lasting.</em>','From a solid foundation to the final roofline. Watch your next chapter take shape.','Structure'],
 ['03 / CRAFTED FOR MICHIGAN','Made for here.<br><em>Made for you.</em>','Warm materials. Considered spaces. A place that feels entirely your own.','Exterior'],
 ['04 / YOUR NEXT CHAPTER','Step inside.<br><em>Welcome home.</em>','Room for everyday moments. Space for everything that comes next.','Home']
];
let width=0,height=0,dpr=1,target=0,current=0,lastTime=0,raf=0,visible=true,active=-1;
const clamp = x=>Math.max(0,Math.min(1,x));
const ease = x=>{x=clamp(x);return x*x*(3-2*x);};
function ready(im){return im.complete&&im.naturalWidth>0;}
function resize(){width=stage.clientWidth;height=stage.clientHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);measure();}
function measure(){target=clamp(-root.getBoundingClientRect().top/Math.max(1,root.offsetHeight-height));wake();}
function wake(){if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(tick);}
function camera(im,zoom=1,focusX=.5,focusY=.5){if(!ready(im))return;const cover=Math.max(width/im.naturalWidth,height/im.naturalHeight);const w=im.naturalWidth*cover*zoom,h=im.naturalHeight*cover*zoom;const x=Math.min(0,Math.max(width-w,width*.5-w*focusX));const y=Math.min(0,Math.max(height-h,height*.5-h*focusY));ctx.drawImage(im,x,y,w,h);}
function construction(p){let i=0;while(i<4&&p>=points[i+1])i++;const local=clamp((p-points[i])/(points[i+1]-points[i]||1));const base=images[i];const next=images[Math.min(i+1,4)];const zoom=1+p*.045;
 camera(base,zoom,.5,.52);
 // Each construction keyframe grows upward from the foundation, continuously with scroll progress.
 // Unlike a full-screen dissolve this is a spatial reveal of the next building stage.
 if(i<4&&ready(next)){const reveal=ease((local-.22)/.78);const y=height*(1-reveal);ctx.save();ctx.beginPath();ctx.rect(0,y,width,height-y);ctx.clip();camera(next,zoom,.5,.52);ctx.restore();}
}
function flyThrough(p){if(p<.79){const u=ease((p-.61)/.18);camera(images[4],1.027+u*.72,.5-(.5-.47)*u,.52+u*.12);const blend=ease((u-.58)/.42);if(blend&&ready(images[5])){ctx.save();ctx.globalAlpha=blend;camera(images[5],1+.07*u,.5,.54);ctx.restore();}}
 else if(p<.94){const u=ease((p-.79)/.15);camera(images[5],1.07+.45*u,.5,.53);const blend=ease((u-.35)/.65);if(blend&&ready(images[6])){ctx.save();ctx.globalAlpha=blend;camera(images[6],1+u*.045,.5,.5);ctx.restore();}}
 else camera(images[6],1.045+ease((p-.94)/.06)*.025,.5,.5);
}
function excavator(p,time){if(p>.21||!ready(digger))return;const opacity=1-ease((p-.16)/.05);const mobile=width<600;const w=width*(mobile?.63:.31);const h=w*(digger.naturalHeight/2)/(digger.naturalWidth/2);const travel=ease(p/.19);const x=width*(mobile?.08:.1)+travel*width*.35;const y=height*.85-h+Math.sin(time*.015)*.45;
 // Four photographic boom poses cycle while the tracks travel across the site.
 const cycle=[0,1,2,3,2,1];const frame=cycle[Math.floor(time/240)%cycle.length];const sw=digger.naturalWidth/2,sh=digger.naturalHeight/2;
 ctx.save();ctx.globalAlpha=opacity;ctx.fillStyle='rgba(16,12,8,.22)';ctx.beginPath();ctx.ellipse(x+w*.35,y+h*.93,w*.32,h*.04,0,0,Math.PI*2);ctx.fill();ctx.drawImage(digger,(frame%2)*sw,Math.floor(frame/2)*sh,sw,sh,x,y,w,h);
 // Fine drifting dust sits behind the moving tracks, with no blur filters.
 for(let n=0;n<10;n++){const life=((time/1700+n*.113)%1);ctx.globalAlpha=opacity*(1-life)*.12;ctx.fillStyle='#bfa17b';ctx.beginPath();ctx.arc(x+w*.2-life*w*.15,y+h*.9-life*height*.04,2+life*6,0,Math.PI*2);ctx.fill();}ctx.restore();}
function labels(p){const index=p<.24?0:p<.57?1:p<.85?2:3;if(active!==index){active=index;const c=copy[index];document.getElementById('story-kicker').textContent=c[0];document.getElementById('story-title').innerHTML=c[1];document.getElementById('story-description').textContent=c[2];document.getElementById('story-phase').textContent=c[3];document.getElementById('story-number').textContent=String(index+1).padStart(2,'0');buttons.forEach((b,i)=>i===index?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'));}
 // Clear the screen while the camera travels through the entry.
 const opacity=p>.66&&p<.94?1-Math.sin(clamp((p-.66)/.28)*Math.PI):1;copyBox.style.opacity=String(opacity);copyBox.style.transform=`translateY(${(1-opacity)*-18}px)`;progress.style.width=`${p*100}%`;
}
function tick(time){raf=0;const dt=Math.min(64,time-(lastTime||time));lastTime=time;current+= (target-current)*(1-Math.exp(-dt/85));if(Math.abs(target-current)<.0001)current=target;const p=current;
 if(reduced.matches){if(ready(images[4])){camera(images[4]);canvas.classList.add('loaded');}labels(.61);return;}
 if(ready(images[0])){ctx.fillStyle='#172016';ctx.fillRect(0,0,width,height);const missing=images.slice(0,p<.61?Math.min(5,Math.floor(p/.15)+2):7).some(im=>!ready(im));if(missing){const fallback=images.slice(0,Math.min(7,Math.floor(p/.15)+1)).reverse().find(ready);if(fallback)camera(fallback);}else if(p<.61)construction(p);else flyThrough(p);excavator(p,time);canvas.classList.add('loaded');}
 labels(p);
 if(visible&&!document.hidden&&(current!==target||p<=.21))raf=requestAnimationFrame(tick);
}
buttons.forEach((b,i)=>b.addEventListener('click',()=>{const top=scrollY+root.getBoundingClientRect().top;scrollTo({top:top+destinations[i]*(root.offsetHeight-height),behavior:reduced.matches?'instant':'smooth'});}));
addEventListener('scroll',measure,{passive:true});addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else wake();});reduced.addEventListener('change',()=>{resize();wake();});
if('IntersectionObserver' in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'100px'}).observe(root);}
resize();
if('IntersectionObserver' in window&&!reduced.matches){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target);}}),{threshold:.08});document.querySelectorAll('.welcome>div,.welcome>figure,.section-heading,.service-card,.project,.approach-copy,.faq-section>div').forEach(e=>{e.classList.add('reveal-ready');observer.observe(e);});}
})();
