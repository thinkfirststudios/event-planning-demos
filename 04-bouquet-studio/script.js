(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};

  /* header condenses past 140px */
  var hdr=$('.hdr');
  function onScroll(){hdr.classList.toggle('cond',reduce||window.scrollY>140)}
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* menu overlay */
  var ovl=$('.ovl'),burger=$('.burger'),closeB=$('.ovl-close');
  function menu(open){ovl.classList.toggle('open',open);burger.setAttribute('aria-expanded',open);document.body.style.overflow=open?'hidden':'';(open?closeB:burger).focus()}
  burger.addEventListener('click',function(){menu(true)});
  closeB.addEventListener('click',function(){menu(false)});
  $$('a',ovl).forEach(function(a){a.addEventListener('click',function(){ovl.classList.remove('open');document.body.style.overflow=''})});
  addEventListener('keydown',function(e){
    if(!ovl.classList.contains('open'))return;
    if(e.key==='Escape')menu(false);
    if(e.key==='Tab'){var f=$$('a,button',ovl),a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}
      else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
  });

  /* reveals: 12px rise, 60ms stagger across a band */
  var rv=$$('.rv');
  if(reduce||!('IntersectionObserver' in window)){rv.forEach(function(e){e.classList.add('in')})}
  else{var io=new IntersectionObserver(function(es){var n=0;es.forEach(function(e){if(e.isIntersecting){e.target.style.transitionDelay=(n++*60)+'ms';e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px'});rv.forEach(function(e){io.observe(e)})}

  /* the highlight wipe: once per lockup, one lockup at a time, her line after it lands */
  var locks=$$('.lockup');
  if(reduce||!('IntersectionObserver' in window)){locks.forEach(function(l){l.classList.add('on')})}
  else{var q=[],busy=false;
    var seen=function(l){var r=l.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight};
    var next=function(){while(q.length&&!seen(q[0]))q.shift().classList.add('on');if(!q.length){busy=false;return}busy=true;q.shift().classList.add('on');setTimeout(next,600)};
    var lo=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){lo.unobserve(e.target);q.push(e.target);if(!busy)next()}})},{threshold:.2});
    locks.forEach(function(l){lo.observe(l)})}

  /* sticky mobile bar: up once the hero has left */
  var bar=$('.bar'),hero=$('.hero');
  if(reduce){bar.classList.add('show')}
  else if(hero&&'IntersectionObserver' in window){new IntersectionObserver(function(es){bar.classList.toggle('show',!es[0].isIntersecting)}).observe(hero)}
  else{var sb=function(){bar.classList.toggle('show',window.scrollY>200)};addEventListener('scroll',sb,{passive:true});sb()}

  /* filter chips */
  var chips=$$('.chip'),sheets=$$('[data-tags]'),grid=$('.sheets');
  chips.forEach(function(c){c.addEventListener('click',function(){
    var f=c.getAttribute('data-filter');
    chips.forEach(function(x){x.setAttribute('aria-pressed',x===c?'true':'false')});
    function apply(){sheets.forEach(function(s){s.hidden=!(f==='all'||s.getAttribute('data-tags').split(' ').indexOf(f)>-1)});
      $$('.rv').forEach(function(e){e.classList.add('in')});
      if(grid){grid.classList.toggle('filtered',f!=='all');grid.classList.remove('fade')}}
    if(grid&&!reduce){grid.classList.add('fade');setTimeout(apply,180)}else{apply()}
  })});

  /* a look carries into the enquiry */
  function setLook(slug){var s=$('select[name=look]');if(!s)return false;
    var ok=[].some.call(s.options,function(o){return o.value===slug});
    if(ok){s.value=slug;var n=$('#from-look');if(n){n.textContent='You’re starting from '+s.options[s.selectedIndex].text+'.';n.hidden=false}}
    return ok}
  var p=new URLSearchParams(location.search).get('look');if(p)setLook(p);
  var inline=$('#enquire');
  if(inline){$$('a[data-look]').forEach(function(a){a.addEventListener('click',function(e){
    var slug=a.getAttribute('data-look');if(!setLook(slug))return;e.preventDefault();
    try{history.replaceState(null,'','?look='+slug+'#enquire')}catch(err){}
    inline.scrollIntoView({behavior:reduce?'auto':'smooth'});
    var f=$('input[name=name]',inline);if(f)f.focus({preventScroll:true});
  })})}

  /* forms: a success state in place; nothing leaves the page on this build */
  $$('form[data-form]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();
    if(!f.reportValidity())return;var s=f.parentNode.querySelector('.sent');f.hidden=true;s.hidden=false;s.focus()})});
})();
