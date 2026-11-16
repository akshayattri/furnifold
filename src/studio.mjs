const app=document.querySelector('#app');
const modal=document.querySelector('#modal');
const key='furnifold.studio.v1';
const uid=()=>crypto.randomUUID?.() || String(Date.now())+Math.random();
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const types={Living:'#dce8db',Bedroom:'#e7daca',Kitchen:'#efdfaf',Bathroom:'#d8e4ec',Hallway:'#e8e2ee',Other:'#e8e8e0'};
const area=(w,h)=>w*h/1e6;
const sqm=n=>new Intl.NumberFormat('en',{maximumFractionDigits:2}).format(n)+' m²';
const roomKey=(p,r)=>'furnifold.project-room.'+p.id+'-'+r.id;
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
let projects=read(key,[]), signed=sessionStorage.getItem('furnifold-studio-demo')==='1';
let page=signed?'Projects':'Sign in', pid=null,rid=null,mode='2D', angle=0, storageError=false;
const project=()=>projects.find(p=>p.id===pid);
const room=()=>project()?.rooms.find(r=>r.id===rid);
function save(){try{localStorage.setItem(key,JSON.stringify(projects));storageError=false;}catch{storageError=true;}}
const finish=()=>{save();render();};
const example=()=>({id:uid(),name:'The Linden Apartment',kind:'Apartment',w:10000,h:8000,rooms:[
  {id:uid(),type:'Living',name:'Living room',x:0,y:0,w:6000,h:4600},
  {id:uid(),type:'Kitchen',name:'Kitchen',x:6000,y:0,w:4000,h:3000},
  {id:uid(),type:'Bathroom',name:'Bathroom',x:7500,y:3000,w:2500,h:2500},
  {id:uid(),type:'Hallway',name:'Hallway',x:6000,y:3000,w:1500,h:5000},
  {id:uid(),type:'Bedroom',name:'Bedroom',x:0,y:4600,w:6000,h:3400}
]});
const preview=example();
function seed(p){
  const items={Living:[['Sofa','sofa',2100,900,500,650,850],['Coffee table','custom',1100,600,1100,1900,430]],
    Bedroom:[['Bed','bed',1600,2000,500,550,600],['Wardrobe','storage',1600,600,3200,2700,2100]],
    Kitchen:[['Kitchen counter','custom',2700,620,450,400,910]],Bathroom:[['Vanity','custom',800,500,300,350,900]]};
  for(const r of p.rooms){
    const furniture=(items[r.type]||[]).map(([name,kind,w,h,x,y,z])=>({id:uid(),name,kind,w,h,x,y,z,rotation:0,owned:true,locked:false}));
    if(!furniture.length) continue;
    try{localStorage.setItem(roomKey(p,r),JSON.stringify({version:1,name:r.name,w:r.w,h:r.h,door:0,window:false,unit:'cm',active:0,layouts:[{name:'Current setup',items:furniture}]}));}catch{storageError=true;}
  }
}
const furniture=(p,r)=>{
  const data=read(roomKey(p,r),null);
  return data?.layouts?.[data.active]?.items||[];
};
const fit=(p,r)=>r.x>=0&&r.y>=0&&r.x+r.w<=p.w&&r.y+r.h<=p.h&&!p.rooms.some(a=>a.id!==r.id&&r.x<a.x+a.w&&r.x+r.w>a.x&&r.y<a.y+a.h&&r.y+r.h>a.y);
function dimension(i){
  return i.rotation%180===90?[i.h,i.w]:[i.w,i.h];
}
function plan(p,thumb=false){
  const pad=Math.max(p.w,p.h)*.08;
  const scale=Math.max(p.w,p.h)/10000;
  return '<svg class="floor" viewBox="'+[-pad,-pad,p.w+pad*2,p.h+pad*2].join(' ')+'" role="img" aria-label="'+esc(p.name)+' floor plan"><rect class="boundary" width="'+p.w+'" height="'+p.h+'" fill="#f9f8f2"/>'+
    p.rooms.map(r=>{
      const fs=Math.min(290*scale,r.w/(Math.max(9,r.name.length)*.57),r.h*.17);
      const items=thumb?[]:furniture(p,r);
      return '<g '+(thumb?'':'data-room="'+r.id+'"')+' class="space '+(!thumb&&r.id===rid?'chosen':'')+'"><rect class="room-fill" x="'+r.x+'" y="'+r.y+'" width="'+r.w+'" height="'+r.h+'" fill="'+types[r.type]+'"/>'+
      items.map(i=>{const [w,h]=dimension(i);return '<rect class="furniture" x="'+(r.x+i.x)+'" y="'+(r.y+i.y)+'" width="'+w+'" height="'+h+'" rx="65"/>';}).join('')+
      '<text x="'+(r.x+r.w/2)+'" y="'+(r.y+r.h/2)+'" font-size="'+fs+'">'+esc(r.name)+'</text>'+
      (thumb?'':'<text class="room-area" x="'+(r.x+r.w/2)+'" y="'+(r.y+r.h/2+fs*1.2)+'" font-size="'+fs*.73+'">'+sqm(area(r.w,r.h))+'</text>')+'</g>';
    }).join('')+'</svg>';
}
function iso(p){
  const swap=angle%2===1;
  const width=swap?p.h:p.w,depth=swap?p.w:p.h;
  function point(x,y,z){
    const [u,v]=angle===0?[x,y]:angle===1?[y,p.w-x]:angle===2?[p.w-x,p.h-y]:[p.h-y,x];
    return [u-v,(u+v)*.52-z];
  }
  const poly=(points,fill)=>'<polygon points="'+points.map(a=>point(...a).join(',')).join(' ')+'" fill="'+fill+'" stroke="#faf9f4" stroke-width="1.5" vector-effect="non-scaling-stroke"/>';
  const flat=(x,y,w,h)=>[[x,y,0],[x+w,y,0],[x+w,y+h,0],[x,y+h,0]];
  const floors=poly(flat(0,0,p.w,p.h),'#eceae0')+p.rooms.map(r=>poly(flat(r.x,r.y,r.w,r.h),types[r.type])).join('');
  const objects=p.rooms.flatMap(r=>furniture(p,r).filter(i=>i.kind!=='rug').map(i=>{
    const [w,h]=dimension(i);
    return {x:i.x+r.x,y:i.y+r.y,w,h,z:i.z ?? ({bed:620,chair:850,storage:2100,sofa:820,desk:750}[i.kind]||700),kind:i.kind};
  })).sort((a,b)=>point(a.x+a.w/2,a.y+a.h/2,0)[1]-point(b.x+b.w/2,b.y+b.h/2,0)[1]);
  return '<svg class="floor iso" role="img" aria-label="3D axonometric furniture preview" viewBox="'+[-depth-600,-2800,width+depth+1200,(width+depth)*.52+3400].join(' ')+'">'+floors+objects.map(({x,y,w,h,z,kind})=>{
    const bottom=flat(x,y,w,h),top=bottom.map(([x,y])=>[x,y,z]);
    const visible=[[0,1],[1,2],[2,3],[3,0]].map(([a,b])=>({a,b,depth:(point(...bottom[a])[1]+point(...bottom[b])[1])/2})).sort((a,b)=>a.depth-b.depth).slice(-2);
    return visible.map(({a,b},index)=>poly([bottom[a],bottom[b],top[b],top[a]],index?'#7c9286':'#536b60')).join('')+poly(top,kind==='storage'?'#bc997e':'#a3b9a8');
  }).join('')+'</svg>';
}
const button=(action,label,cls='')=>'<button class="'+cls+'" data-do="'+action+'">'+label+'</button>';
const brand='<div class="brand"><span class="logo" aria-hidden="true">◩</span> Furnifold</div>';
function render(){
  if(!signed){
    app.innerHTML='<main class="login"><div class="auth">'+brand+'<div><h1>Plan a place<br>to call home.</h1><p>Open the prototype workspace to create a project, lay out rooms, and try furniture to scale.</p>'+button('login','Enter demo workspace →','primary')+'<small>Demo sign-in · projects stay in this browser</small></div></div><div class="entry-art">'+plan(preview,true)+'</div></main>';
    return;
  }
  const p=project(),r=room();
  const shell='<aside class="rail">'+brand+'<nav>'+button('projects','<span>▦</span> Projects',page!=='Templates'?'active':'')+button('templates','<span>◇</span> Templates',page==='Templates'?'active':'')+'</nav><div class="account"><span class="avatar">D</span><div><strong>Demo workspace</strong><small>Browser storage</small></div>'+button('logout','↗','signout')+'</div></aside>';
  let body;
  if(page==='Room'&&p&&r){
    const query=new URLSearchParams({room:p.id+'-'+r.id,w:r.w,h:r.h,name:r.name});
    body='<header class="bar">'+button('floor','← '+esc(p.name),'plain')+'<span>/</span><strong>'+esc(r.name)+'</strong><span class="grow"></span><span>'+sqm(area(r.w,r.h))+'</span></header><iframe title="'+esc(r.name)+' furniture editor" src="./room.html?'+query+'"></iframe>';
  }else if(page==='Floor'&&p){
    const used=p.rooms.reduce((sum,r)=>sum+area(r.w,r.h),0);
    const footprint=r?furniture(p,r).filter(i=>i.kind!=='rug').reduce((sum,i)=>sum+area(i.w,i.h),0):0;
    body='<header class="bar">'+button('projects','← Projects','plain')+'<span>/</span><strong>'+esc(p.name)+'</strong><span class="grow"></span>'+button('settings','Floor dimensions')+'</header>'+
      '<div class="floor-head"><div><h1>'+esc(p.name)+'</h1><p>'+p.kind+' · '+p.rooms.length+' '+(p.rooms.length===1?'room':'rooms')+'</p></div>'+button('add','＋ Add room','primary')+'</div>'+
      '<div class="workbench"><aside class="room-list"><h2>Rooms</h2>'+(p.rooms.length?p.rooms.map(r=>'<button class="room-row '+(r.id===rid?'active':'')+'" data-select="'+r.id+'"><i style="background:'+types[r.type]+'"></i><span>'+esc(r.name)+'</span><small>'+sqm(area(r.w,r.h))+'</small></button>').join(''):'<p>Add a room to start your plan.</p>')+'</aside>'+
      '<section class="workcanvas"><header><div class="view">'+button('2D','2D plan',mode==='2D'?'active':'')+button('3D','3D preview',mode==='3D'?'active':'')+'</div>'+(mode==='3D'?button('rotate','↻ Rotate view'):'<small>Top view · dimensions in metres</small>')+'</header><div class="drawing">'+(mode==='3D'?iso(p):plan(p))+'</div><footer><span>'+sqm(area(p.w,p.h))+' floor envelope</span><span>'+sqm(used)+' assigned to rooms</span></footer></section>'+
      '<aside class="properties"><h2>'+ (r?esc(r.name):'Floor plan')+'</h2>'+(r?'<p>'+r.type+'</p><dl><dt>Inside dimensions</dt><dd>'+r.w/1000+' × '+r.h/1000+' m</dd><dt>Room area</dt><dd>'+sqm(area(r.w,r.h))+'</dd><dt>Furniture footprints</dt><dd>'+sqm(footprint)+'</dd></dl>'+button('room','Open room editor →','primary wide')+button('edit','Edit room dimensions','wide'):'<p>Select a room to edit its dimensions or furnish it.</p>')+'</aside></div>';
  }else{
    const templates=page==='Templates';
    body='<header class="bar"><strong>'+page+'</strong><span class="grow"></span>'+(storageError?'<span role="alert">Browser saving unavailable</span>':'')+button('create','＋ New project','primary')+'</header><div class="dashboard">'+
      '<section class="banner"><div><h1>'+ (templates?'Start with a floor plan.':'Design your space.')+'</h1><p>Lay out a whole home, then plan the details room by room.</p>'+button('create','＋ New project','primary')+button('sample','Explore sample apartment')+'</div><div class="banner-art">'+plan(preview,true)+'</div></section>'+
      '<h2>'+(templates?'Floor plan templates':'Your projects')+'</h2><div class="cards">'+(templates?'<button class="project-card" data-do="sample"><div class="thumb">'+plan(preview,true)+'</div><strong>Linden Apartment</strong><small>Apartment · 5 rooms</small></button>':projects.map(p=>'<button class="project-card" data-open="'+p.id+'"><div class="thumb">'+plan(p,true)+'</div><strong>'+esc(p.name)+'</strong><small>'+p.kind+' · '+p.rooms.length+' '+(p.rooms.length===1?'room':'rooms')+' · '+sqm(area(p.w,p.h))+'</small></button>').join('')+'<button class="new-card" data-do="create"><span>＋</span> Create a project</button>')+'</div></div>';
  }
  app.innerHTML='<div class="shell">'+shell+'<main class="workspace">'+body+'</main></div>';
}
function form(title,fields,cta,apply){
  modal.innerHTML='<form><h2>'+title+'</h2>'+fields+'<p class="error" role="alert"></p><footer><button type="button" data-do="cancel">Cancel</button><button class="primary">'+cta+'</button></footer></form>';
  modal.querySelector('form').onsubmit=e=>{
    e.preventDefault();
    const error=apply(new FormData(e.currentTarget));
    if(error){modal.querySelector('.error').textContent=error;return;}
    modal.close();finish();
  };
  modal.showModal();
}
const nameInput=n=>'<label>Name<input name="name" required maxlength="48" value="'+esc(n)+'"></label>';
const number=(label,name,value,min=.01)=>'<label>'+label+' (m)<input name="'+name+'" type="number" min="'+min+'" max="50" step=".001" value="'+value/1000+'" required></label>';
const pair=(a,b)=>'<div class="pair">'+a+b+'</div>';
const size=(w,h)=>pair(number('Width','w',w,1),number('Depth','h',h,1));
const mm=(d,k)=>Math.round(Number(d.get(k))*1000);
function projectForm(existing){
  const p=existing?project():null;
  form(existing?'Floor dimensions':'New project',nameInput(p?.name||'')+'<label>Project type<select name="kind">'+['Apartment','House','Individual room'].map(x=>'<option '+(p?.kind===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label>'+size(p?.w||10000,p?.h||8000),'Save project',d=>{
    const name=String(d.get('name')).trim(), w=mm(d,'w'),h=mm(d,'h'),kind=d.get('kind');
    if(!name)return 'Enter a project name.';
    if(p?.rooms.some(r=>r.x+r.w>w||r.y+r.h>h))return 'The new dimensions cut through a room. Move or resize those rooms first.';
    if(p) Object.assign(p,{name,w,h,kind});
    else {
      const id=uid(), rooms=kind==='Individual room'?[{id:uid(),type:'Other',name,x:0,y:0,w,h}]:[];
      projects.unshift({id,name,w,h,kind,rooms});pid=id;rid=rooms[0]?.id??null;mode='2D';page='Floor';
    }
  });
}
function roomForm(existing){
  const p=project(),r=existing?room():null;
  form(existing?'Edit room':'Add room',nameInput(r?.name||'')+'<label>Room type<select name="type">'+Object.keys(types).map(x=>'<option '+(r?.type===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label>'+
    size(r?.w||Math.min(p.w,4000),r?.h||Math.min(p.h,3500))+pair(number('X from left','x',r?.x||0,0),number('Y from top','y',r?.y||0,0)),existing?'Save room':'Add room',d=>{
    const next={id:r?.id||uid(),name:String(d.get('name')).trim(),type:d.get('type'),w:mm(d,'w'),h:mm(d,'h'),x:mm(d,'x'),y:mm(d,'y')};
    if(!next.name)return 'Enter a room name.';
    if(!fit(p,next))return 'Place the room inside the floor and clear of other rooms.';
    if(r) Object.assign(r,next);else p.rooms.push(next);
    rid=next.id;
  });
}
document.addEventListener('click',e=>{
  const target=e.target.closest('[data-do],[data-open],[data-select],[data-room]');
  if(!target)return;
  const d=target.dataset;
  if(d.open){pid=d.open;rid=null;mode='2D';page='Floor';render();return;}
  if(d.select||d.room){rid=d.select||d.room;render();return;}
  switch(d.do){
    case 'login': signed=true;sessionStorage.setItem('furnifold-studio-demo','1');page='Projects';break;
    case 'logout': signed=false;sessionStorage.removeItem('furnifold-studio-demo');page='Sign in';break;
    case 'projects': page='Projects';break;
    case 'templates': page='Templates';break;
    case 'sample': {const p=example();seed(p);projects.unshift(p);pid=p.id;rid=p.rooms[0].id;mode='2D';page='Floor';finish();return;}
    case 'create': return projectForm(false);
    case 'settings': return projectForm(true);
    case 'add': return roomForm(false);
    case 'edit': return roomForm(true);
    case 'cancel': return modal.close();
    case 'floor': page='Floor';break;
    case 'room': page='Room';break;
    case '2D': case '3D': mode=d.do;break;
    case 'rotate': angle=(angle+1)%4;break;
    default:return;
  }
  render();
});
let drag=null,suppressClick=false;
app.addEventListener('pointerdown',e=>{
  const node=e.target.closest('[data-room]');
  if(!node||e.button!==0)return;
  const p=project(),r=p.rooms.find(r=>r.id===node.dataset.room),svg=node.ownerSVGElement;
  const matrix=svg.getScreenCTM()?.inverse();
  if(!matrix)return;
  const start=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix);
  drag={node,p,r,matrix,start,pointer:e.pointerId,x:r.x,y:r.y};
  node.setPointerCapture(e.pointerId);
});
app.addEventListener('pointermove',e=>{
  if(!drag||drag.pointer!==e.pointerId)return;
  const next=new DOMPoint(e.clientX,e.clientY).matrixTransform(drag.matrix);
  const snap=n=>Math.round(n/100)*100;
  const x=snap(drag.x+next.x-drag.start.x),y=snap(drag.y+next.y-drag.start.y);
  const valid=fit(drag.p,{...drag.r,x,y});
  drag.next={x,y,valid};
  drag.node.setAttribute('transform','translate('+(x-drag.x)+' '+(y-drag.y)+')');
  drag.node.classList.toggle('invalid',!valid);
});
function stopDrag(e){
  if(!drag||drag.pointer!==e.pointerId)return;
  const {r,next,x,y,node}=drag;drag=null;
  if(!next||next.x===x&&next.y===y){node.removeAttribute('transform');node.classList.remove('invalid');return;}
  suppressClick=true;setTimeout(()=>{suppressClick=false;},0);
  rid=r.id;
  if(e.type==='pointerup'&&next.valid){r.x=next.x;r.y=next.y;finish();}
  else render();
}
app.addEventListener('pointerup',stopDrag);
app.addEventListener('pointercancel',stopDrag);
app.addEventListener('click',e=>{if(suppressClick)e.stopPropagation();},true);
render();
