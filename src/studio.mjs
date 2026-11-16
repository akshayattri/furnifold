const app=document.querySelector('#app');
const modal=document.querySelector('#modal');
const key='furnifold.studio.v1';
const uid=()=>crypto.randomUUID?.() || String(Date.now())+Math.random();
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const types={Living:'#f0eee8',Bedroom:'#f0ece9',Kitchen:'#f5f1ea',Bathroom:'#edf0f3',Hallway:'#f1f0f4',Other:'#f3f3f2'};
const iconPaths={
  projects:'M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z',
  draw:'M4 4h16v16H4z M4 11h8v9 M12 11h8',
  upload:'M12 15V3m-5 5 5-5 5 5 M4 15v5h16v-5',
  templates:'M3 3h8v8H3z M13 3h8v8h-8z M3 13h8v8H3z M13 13h8v8h-8z',
  plus:'M12 5v14M5 12h14',
  arrow:'M5 12h14m-6-6 6 6-6 6',
  logout:'M10 4H4v16h6m3-8h8m-3-3 3 3-3 3',
  Living:'M3 12V8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4 M3 12a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v6H3z M5 18v2m14-2v2',
  Bedroom:'M3 18V6m18 12v-5a3 3 0 0 0-3-3H3m0 6h18M6 10V7h5v3',
  Kitchen:'M4 4h16v16H4z M4 9h16 M8 6.5h.01m4 0h.01 M7 12h10v5H7z',
  Bathroom:'M3 12h18v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z M6 12V6a2 2 0 0 1 4 0m-2 0h4 M7 18l-1 2m11-2 1 2',
  Hallway:'M3 7h18M3 17h18m-7-7 2 2-2 2m2-2H8',
  Other:'M4 4h16v16H4z M8 12h8 M12 8v8'
};
const icon=name=>'<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+iconPaths[name]+'"/></svg>';
const roomNames={Living:'Living room',Bedroom:'Bedroom',Kitchen:'Kitchen',Bathroom:'Bathroom',Hallway:'Hallway',Other:'Other room'};
const roomSizes={Living:[4500,3500],Bedroom:[3500,3000],Kitchen:[3000,2400],Bathroom:[2000,1800],Hallway:[1400,3000],Other:[2500,2500]};
const roomTiles=()=>Object.keys(roomNames).map(type=>'<button class="room-tile" data-type="'+type+'" draggable="true">'+icon(type)+'<span>'+roomNames[type]+'</span></button>').join('');

const area=(w,h)=>w*h/1e6;
const sqm=n=>new Intl.NumberFormat('en',{maximumFractionDigits:2}).format(n)+' m²';
const roomKey=(p,r)=>'furnifold.project-room.'+p.id+'-'+r.id;
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
let projects=read(key,[]), signed=sessionStorage.getItem('furnifold-studio-demo')==='1';
let page=signed?'Projects':'Sign in', pid=null,rid=null,mode='2D', storageError=false;
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
let sandbox=null, renderVersion=0;
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
    (p.reference&&!thumb&&p.showReference!==false?'<image href="'+esc(p.reference)+'" width="'+p.w+'" height="'+p.h+'" preserveAspectRatio="none" opacity=".57" pointer-events="none"/>':'')+
    p.rooms.map(r=>{
      const fs=Math.min(290*scale,r.w/(Math.max(9,r.name.length)*.57),r.h*.17);
      const items=thumb?[]:furniture(p,r);
      return '<g '+(thumb?'':'data-room="'+r.id+'"')+' class="space '+(!thumb&&p.reference&&p.showReference!==false?'tracing ':'')+(!thumb&&r.id===rid?'chosen':'')+'"><rect class="room-fill" x="'+r.x+'" y="'+r.y+'" width="'+r.w+'" height="'+r.h+'" fill="'+types[r.type]+'"/>'+
      items.map(i=>{const [w,h]=dimension(i);return '<rect class="furniture" x="'+(r.x+i.x)+'" y="'+(r.y+i.y)+'" width="'+w+'" height="'+h+'" rx="65"/>';}).join('')+
      '<text x="'+(r.x+r.w/2)+'" y="'+(r.y+r.h/2)+'" font-size="'+fs+'">'+esc(r.name)+'</text>'+
      (thumb?'':'<text class="room-area" x="'+(r.x+r.w/2)+'" y="'+(r.y+r.h/2+fs*1.2)+'" font-size="'+fs*.73+'">'+sqm(area(r.w,r.h))+'</text>')+'</g>';
    }).join('')+'</svg>';
}
function updateFurniture(p,r,item){
  const key=roomKey(p,r);
  const data=read(key,{version:1,name:r.name,w:r.w,h:r.h,door:0,window:false,unit:'cm',active:0,layouts:[{name:'Current setup',items:[]}]});
  const items=data.layouts[data.active].items;
  const index=items.findIndex(i=>i.id===item.id);
  if(index<0)items.push(item);else items[index]=item;
  try{localStorage.setItem(key,JSON.stringify(data));return true;}
  catch{app.querySelector('#sandbox-status').textContent='Could not save furniture in this browser.';return false;}
}
async function mountSandbox(p,version){
  const host=app.querySelector('#sandbox');
  if(!host)return;
  const status=text=>{const node=host.querySelector('#sandbox-status');if(node)node.textContent=text;};
  try{
    const {startSandbox,models}=await import('./sandbox.mjs');
    if(version!==renderVersion)return;
    sandbox=startSandbox(host,{project:p,getItems:r=>furniture(p,r),commit:(r,i)=>{
      if(!updateFurniture(p,r,i))return false;
      selectRoom(r);
      return true;
    },select:selectRoom,status});
    const catalog=app.querySelector('#sandbox-catalog');
    catalog.innerHTML=models.map((m,i)=>'<button draggable="true" data-model="'+i+'"><strong>'+m.name+'</strong><small>'+m.w/10+' × '+m.h/10+' cm</small></button>').join('');
    catalog.addEventListener('dragstart',event=>{
      const item=event.target.closest('[data-model]');
      if(item){event.dataTransfer.setData('application/x-furnifold-item',item.dataset.model);event.dataTransfer.effectAllowed='copy';}
    });
    status('Drag the canvas to orbit · Scroll to zoom · Right-drag to pan');
  }catch(error){
    if(version!==renderVersion)return;
    status('3D could not load. Check your connection and WebGL support, or switch to 2D.');
    console.error('Furnifold 3D initialization failed',error);
  }
}
function selectRoom(r){
  rid=r.id;
  const section=app.querySelector('.properties');
  if(section)section.innerHTML=roomDetails(project(),r);
  for(const row of app.querySelectorAll('[data-select]'))row.classList.toggle('active',row.dataset.select===r.id);
}
function roomDetails(p,r){
  if(!r)return '<h2>Floor plan</h2><p>Select a room to edit its dimensions or furnish it.</p>';
  const footprint=furniture(p,r).filter(i=>i.kind!=='rug').reduce((sum,i)=>sum+area(i.w,i.h),0);
  return '<h2>'+esc(r.name)+'</h2><p>'+r.type+'</p><dl><dt>Inside dimensions</dt><dd>'+r.w/1000+' × '+r.h/1000+' m</dd><dt>Room area</dt><dd>'+sqm(area(r.w,r.h))+'</dd><dt>Furniture footprints</dt><dd>'+sqm(footprint)+'</dd></dl>'+button('room','Edit room layout →','primary wide')+button('edit','Edit room dimensions','wide')+(mode==='3D'?button('focus-room','Focus in 3D','wide'):'');
}
const button=(action,label,cls='')=>'<button class="'+cls+'" data-do="'+action+'">'+label+'</button>';
const brand='<div class="brand"><span class="logo">'+icon('draw')+'</span> Furnifold</div>';
const nav=(key,label,glyph,current=false)=>'<button data-do="'+key+'" '+(current?'class="active" aria-current="page"':'')+'>'+icon(glyph)+'<span>'+label+'</span></button>';
function render(){
  const version=++renderVersion;
  sandbox?.dispose();sandbox=null;
  if(!signed){
    app.innerHTML='<main class="login"><div class="auth">'+brand+'<div><h1>Plan a place<br>to call home.</h1><p>Open the prototype workspace to create a project, lay out rooms, and try furniture to scale.</p>'+button('login','Enter demo workspace →','primary')+'<small>Demo sign-in · projects stay in this browser</small></div></div><div class="entry-art">'+plan(preview,true)+'</div></main>';
    return;
  }
  const p=project(),r=room();
  const shell='<aside class="rail">'+brand+'<nav aria-label="Workspace"><div class="nav-section"><small>Workspace</small>'+nav('projects','Projects','projects',page!=='Templates')+'</div><div class="nav-section"><small>Create</small>'+nav('create','Draw floor plan','draw')+nav('import','Import floor plan','upload')+'</div><div class="nav-section"><small>Library</small>'+nav('templates','Templates','templates',page==='Templates')+'</div></nav><div class="account"><span class="avatar">D</span><div><strong>Demo workspace</strong><small>Browser storage</small></div><button data-do="logout" class="signout" aria-label="Sign out">'+icon('logout')+'</button></div></aside>';
  let body;
  if(page==='Room'&&p&&r){
    const query=new URLSearchParams({room:p.id+'-'+r.id,w:r.w,h:r.h,name:r.name});
    body='<header class="bar">'+button('floor','← '+esc(p.name),'plain')+'<span>/</span><strong>'+esc(r.name)+'</strong><span class="grow"></span><span>'+sqm(area(r.w,r.h))+'</span></header><iframe title="'+esc(r.name)+' furniture editor" src="./room.html?'+query+'"></iframe>';
  }else if(page==='Floor'&&p){
    const used=p.rooms.reduce((sum,r)=>sum+area(r.w,r.h),0);
    body='<header class="bar">'+button('projects','← Projects','plain')+'<span>/</span><strong>'+esc(p.name)+'</strong><span class="grow"></span>'+button('settings','Floor dimensions')+'</header>'+
      '<div class="floor-head"><div><h1>'+esc(p.name)+'</h1><p>'+p.kind+' · '+p.rooms.length+' '+(p.rooms.length===1?'room':'rooms')+'</p></div>'+'</div>'+
      '<div class="workbench"><aside class="room-list">'+(mode==='2D'?'<section class="room-tools"><h2>Add rooms</h2><p>Drag a tile onto the plan or click to set dimensions.</p><div class="room-tiles">'+roomTiles()+'</div></section>':'')+'<h2>Rooms</h2>'+(p.rooms.length?p.rooms.map(r=>'<button class="room-row '+(r.id===rid?'active':'')+'" data-select="'+r.id+'"><i style="background:'+types[r.type]+'"></i><span>'+esc(r.name)+'</span><small>'+sqm(area(r.w,r.h))+'</small></button>').join(''):'<p>Add a room to start your plan.</p>')+'</aside>'+
      '<section class="workcanvas"><header><div class="view">'+button('2D','2D plan',mode==='2D'?'active':'')+button('3D','3D sandbox',mode==='3D'?'active':'')+'</div>'+(mode==='3D'?button('reset-view','Reset view'):p.reference?button('toggle-reference',p.showReference===false?'Show reference':'Hide reference'):'<small>Dimensions in metres</small>')+'</header>'+(mode==='3D'?'<div id="sandbox" class="webgl"><p id="sandbox-status" role="status">Loading 3D canvas…</p></div><div class="catalog-tray"><h2>Furniture</h2><p>Drag into a room, or select an item and click to place it.</p><div id="sandbox-catalog"></div></div>':'<div class="drawing" id="plan-drop">'+plan(p)+'</div>')+'<footer><span>'+sqm(area(p.w,p.h))+' floor envelope</span><span>'+sqm(used)+' assigned to rooms</span></footer></section>'+
      '<aside class="properties">'+roomDetails(p,r)+'</aside></div>';
  }else{
    const templates=page==='Templates';
    const entry=(action,glyph,title,description)=>'<button class="start-card" data-do="'+action+'"><span class="start-icon">'+icon(glyph)+'</span><span><strong>'+title+'</strong><small>'+description+'</small></span>'+icon('arrow')+'</button>';
    const cards=templates?'<button class="project-card" data-do="sample"><div class="thumb">'+plan(preview,true)+'</div><strong>Linden Apartment</strong><small>Apartment · 5 rooms</small></button>':projects.map(p=>'<button class="project-card" data-open="'+p.id+'"><div class="thumb">'+plan(p,true)+'</div><strong>'+esc(p.name)+'</strong><small>'+p.kind+' · '+p.rooms.length+' '+(p.rooms.length===1?'room':'rooms')+' · '+sqm(area(p.w,p.h))+'</small></button>').join('');
    body='<header class="bar"><strong>'+page+'</strong><span class="grow"></span>'+(storageError?'<span role="alert">Browser saving unavailable</span>':'')+button('create',icon('plus')+' New project','primary with-icon')+'</header><div class="dashboard"><section class="dashboard-intro"><h1>'+(templates?'Floor plan templates':'What will you design today?')+'</h1><p>'+(templates?'Start with a furnished layout you can edit.':'Build a whole-home floor plan and work through it room by room.')+'</p></section>'+
      (templates?'':'<div class="start-grid">'+entry('create','draw','Draw a floor plan','Start with a measured canvas.')+entry('import','upload','Import a floor plan','Trace a drawing or scan to scale.')+entry('templates','templates','Use a template','Explore a furnished sample.')+'</div>')+
      '<div class="gallery-head"><h2>'+(templates?'Available templates':'Your projects')+'</h2></div><div class="cards">'+cards+(templates?'':button('create',icon('plus')+' Create a project','new-card'))+'</div></div>';
  }
  app.innerHTML='<div class="shell">'+shell+'<main class="workspace">'+body+'</main></div>';
  if(page==='Floor'&&p&&mode==='3D')mountSandbox(p,version);
}
function form(title,fields,cta,apply){
  modal.innerHTML='<form><h2>'+title+'</h2>'+fields+'<p class="error" role="alert"></p><footer><button type="button" data-do="cancel">Cancel</button><button class="primary">'+cta+'</button></footer></form>';
  const formNode=modal.querySelector('form');
  formNode.onsubmit=async e=>{
    e.preventDefault();
    const submit=formNode.querySelector('.primary');
    submit.disabled=true;
    modal.dataset.busy='true';
    try{
      const error=await apply(new FormData(formNode));
      if(error){formNode.querySelector('.error').textContent=error;return;}
      if(modal.open)modal.close();
      finish();
    }catch{
      formNode.querySelector('.error').textContent='Could not read or save the floor plan. Try a smaller PNG or JPEG.';
    }finally{submit.disabled=false;delete modal.dataset.busy;}
  };
  modal.showModal();
}
const nameInput=n=>'<label>Name<input name="name" required maxlength="48" value="'+esc(n)+'"></label>';
const number=(label,name,value,min=.01)=>'<label>'+label+' (m)<input name="'+name+'" type="number" min="'+min+'" max="50" step=".001" value="'+value/1000+'" required></label>';
const pair=(a,b)=>'<div class="pair">'+a+b+'</div>';
const size=(w,h)=>pair(number('Width','w',w,1),number('Depth','h',h,1));
const mm=(d,k)=>Math.round(Number(d.get(k))*1000);
async function referenceImage(file){
  if(!file?.size||file.size>10000000||!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Invalid plan image');
  const image=await createImageBitmap(file);
  const canvas=document.createElement('canvas');
  const scale=Math.min(1,1400/Math.max(image.width,image.height));
  canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
  try{
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(image,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/jpeg',.78);
  }finally{image.close();}
}
function projectForm(existing,importing=false){
  const p=existing?project():null;
  form(existing?'Floor dimensions':importing?'Import a floor plan':'Draw a floor plan',nameInput(p?.name||'')+'<label>Project type<select name="kind">'+['Apartment','House','Individual room'].map(x=>'<option '+(p?.kind===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label>'+size(p?.w||10000,p?.h||8000)+(importing?'<label>Floor plan image<input type="file" name="reference" accept="image/png,image/jpeg,image/webp" required></label><p>Crop to the outside edges first. Enter the real width and depth of that rectangle.</p>':''),existing?'Save changes':importing?'Import plan':'Create project',async d=>{
    const name=String(d.get('name')).trim(), w=mm(d,'w'),h=mm(d,'h'),kind=d.get('kind');
    if(!name)return 'Enter a project name.';
    if(p?.rooms.some(r=>r.x+r.w>w||r.y+r.h>h))return 'The new dimensions cut through a room. Move or resize those rooms first.';
    if(p) Object.assign(p,{name,w,h,kind});
    else {
      const id=uid(), rooms=kind==='Individual room'?[{id:uid(),type:'Other',name,x:0,y:0,w,h}]:[];
      if(importing&&kind==='Individual room')return 'Choose House or Apartment for a whole-floor reference.';
      const reference=importing?await referenceImage(d.get('reference')):null;
      const next={id,name,w,h,kind,rooms,...(reference?{reference}:{})};
      if(importing)localStorage.setItem(key,JSON.stringify([next,...projects]));
      projects.unshift(next);pid=id;rid=rooms[0]?.id??null;mode='2D';page='Floor';
    }
  });
}
function roomForm(existing,type='Living',position=null){
  const p=project(),r=existing?room():null;
  const [defaultW,defaultH]=roomSizes[type];
  const w=Math.min(p.w,defaultW),h=Math.min(p.h,defaultH);
  const x=Math.max(0,Math.min(p.w-w,position?.x??0)),y=Math.max(0,Math.min(p.h-h,position?.y??0));
  form(existing?'Edit room':'Add room',nameInput(r?.name||roomNames[type])+'<label>Room type<select name="type">'+Object.keys(types).map(x=>'<option '+((r?.type??type)===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label>'+
    size(r?.w??w,r?.h??h)+pair(number('X from left','x',r?.x??x,0),number('Y from top','y',r?.y??y,0)),existing?'Save room':'Add room',d=>{
    const next={id:r?.id||uid(),name:String(d.get('name')).trim(),type:d.get('type'),w:mm(d,'w'),h:mm(d,'h'),x:mm(d,'x'),y:mm(d,'y')};
    if(!next.name)return 'Enter a room name.';
    if(!fit(p,next))return 'Place the room inside the floor and clear of other rooms.';
    if(r) Object.assign(r,next);else p.rooms.push(next);
    rid=next.id;
  });
}
document.addEventListener('click',e=>{
  const target=e.target.closest('[data-do],[data-open],[data-select],[data-room],[data-model],[data-type]');
  if(!target)return;
  const d=target.dataset;
  if(d.type&&roomSizes[d.type])return roomForm(false,d.type);
  if(d.model!==undefined){sandbox?.arm(Number(d.model));return;}
  if(d.open){pid=d.open;rid=null;mode='2D';page='Floor';render();return;}
  if(d.select||d.room){rid=d.select||d.room;if(sandbox)selectRoom(room());else render();return;}
  switch(d.do){
    case 'login': signed=true;sessionStorage.setItem('furnifold-studio-demo','1');page='Projects';break;
    case 'logout': signed=false;sessionStorage.removeItem('furnifold-studio-demo');page='Sign in';break;
    case 'projects': page='Projects';break;
    case 'templates': page='Templates';break;
    case 'sample': {const p=example();seed(p);projects.unshift(p);pid=p.id;rid=p.rooms[0].id;mode='2D';page='Floor';finish();return;}
    case 'create': return projectForm(false);
    case 'import': return projectForm(false,true);
    case 'toggle-reference': project().showReference=project().showReference===false;finish();return;
    case 'focus-room': return sandbox?.focus(room());
    case 'settings': return projectForm(true);
    case 'add': return roomForm(false);
    case 'edit': return roomForm(true);
    case 'cancel': if(!modal.dataset.busy)modal.close();return;
    case 'floor': page='Floor';break;
    case 'room': page='Room';break;
    case '2D': case '3D': mode=d.do;break;
    case 'reset-view': return sandbox?.reset();
    default:return;
  }
  render();
});
modal.addEventListener('cancel',e=>{if(modal.dataset.busy)e.preventDefault();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.open)sandbox?.cancel();});
app.addEventListener('dragstart',e=>{
  const tile=e.target.closest('[data-type]');
  if(!tile)return;
  e.dataTransfer.setData('application/x-furnifold-room',tile.dataset.type);
  e.dataTransfer.effectAllowed='copy';
});
app.addEventListener('dragover',e=>{
  if(e.target.closest('#plan-drop')&&e.dataTransfer.types.includes('application/x-furnifold-room')){
    e.preventDefault();e.dataTransfer.dropEffect='copy';
  }
});
app.addEventListener('drop',e=>{
  const panel=e.target.closest('#plan-drop'),type=e.dataTransfer.getData('application/x-furnifold-room');
  if(!panel||!Object.hasOwn(roomSizes,type))return;
  e.preventDefault();
  const matrix=panel.querySelector('svg').getScreenCTM()?.inverse();
  if(!matrix)return;
  const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix);
  const snap=value=>Math.round(value/100)*100;
  roomForm(false,type,{x:snap(point.x),y:snap(point.y)});
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
