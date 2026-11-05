(() => {
'use strict';
const root=document.querySelector('.build-story');
if(!root)return;
const scenes=[...root.querySelectorAll('.story-scene')];
const buttons=[...root.querySelectorAll('[data-stage]')];
const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
const toggle=document.getElementById('motion-toggle');
let paused=motion.matches, scheduled=false, active=-1;
const copy=[
 ['01 / A STRONG BEGINNING','Every home starts<br>with <em>a vision.</em>','From the first line on a plan to the place you call home. Build your next chapter with Landmark.','Foundation'],
 ['02 / YOUR VISION TAKES SHAPE','Built with purpose.<br><em>Every single detail.</em>','A framework for your future. Thoughtful planning and careful workmanship, from the ground up.','Structure'],
 ['03 / CRAFTED FOR MICHIGAN','Made for here.<br><em>Made for you.</em>','Warm materials. Considered spaces. A home that belongs in Michigan and feels entirely your own.','Exterior'],
 ['04 / ROOM FOR YOUR NEXT CHAPTER','Step inside.<br><em>Welcome home.</em>','The everyday moments. The big milestones. This is where your next chapter begins.','Home']
];
function setCopy(index){if(active===index)return;active=index;const c=copy[index];document.getElementById('story-kicker').textContent=c[0];document.getElementById('story-title').innerHTML=c[1];document.getElementById('story-description').textContent=c[2];document.getElementById('story-phase').textContent=c[3];document.getElementById('story-number').textContent=String(index+1).padStart(2,'0');buttons.forEach((b,i)=>i===index?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'));}
function render(){scheduled=false;const distance=Math.max(1,root.offsetHeight-innerHeight);const p=Math.max(0,Math.min(1,-root.getBoundingClientRect().top/distance));const position=p*3;const index=Math.min(3,Math.floor(position));const fraction=position-index;
 if(paused){scenes.forEach((s,i)=>{s.style.opacity=i===2?'1':'0';s.style.transform='none';});setCopy(2);}else{scenes.forEach((s,i)=>{s.style.opacity=i===index?'1':i===index+1?String(Math.max(0,Math.min(1,(fraction-.55)/.45))):'0';s.style.transform=`scale(${1.02+(i===index?fraction:0)*.08})`;});setCopy(Math.min(3,index+(fraction>.8?1:0)));}
 document.getElementById('story-progress').style.width=`${p*100}%`;
}
function request(){if(!scheduled){scheduled=true;requestAnimationFrame(render);}}
function updateToggle(){toggle.textContent=paused?'Enable motion':'Pause motion';toggle.setAttribute('aria-pressed',String(paused));}
toggle.addEventListener('click',()=>{paused=!paused;updateToggle();request();});
motion.addEventListener('change',()=>{paused=motion.matches;updateToggle();request();});
buttons.forEach(b=>b.addEventListener('click',()=>{paused=false;updateToggle();const start=root.getBoundingClientRect().top+scrollY;scrollTo({top:start+(root.offsetHeight-innerHeight)*Number(b.dataset.stage)/3,behavior:motion.matches?'instant':'smooth'});}));
addEventListener('scroll',request,{passive:true});addEventListener('resize',request);scenes.forEach(s=>s.addEventListener('load',request));updateToggle();render();
if('IntersectionObserver' in window&&!motion.matches){const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target);}});},{threshold:.08});document.querySelectorAll('.welcome>div,.welcome>figure,.section-heading,.service-card,.project,.approach-copy,.faq-section>div').forEach(e=>{e.classList.add('reveal-ready');observer.observe(e);});}
})();
