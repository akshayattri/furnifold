import {sample,catalog,footprint,issues,factor,amount,measure} from './model.mjs';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const projectRoom = params.get('room');
const key = projectRoom ? 'furnifold.project-room.' + projectRoom : 'furnifold.room.v1';
let room = sample(), view = 'Plan', selected = null, zone = null, against = 1;
let drag = null, storageError = false;
if (projectRoom) {
  const w = Number(params.get('w')), h = Number(params.get('h'));
  if (w >= 1000 && h >= 1000 && w <= 50000 && h <= 50000) {
    room = {version:1,name:params.get('name')||'Room',w,h,door:0,window:false,unit:'cm',active:0,
      layouts:[{name:'Current setup',items:[]}]};
  }
  document.body.classList.add('embedded');
}
const past = [], future = [];
try {
  const saved = JSON.parse(localStorage.getItem(key) || 'null');
  if (saved?.version === 1 && saved.layouts?.[saved.active] && saved.w > 0 && saved.h > 0) room = saved;
} catch { storageError = true; }
if (projectRoom) {
  room.w = Number(params.get('w')) || room.w;
  room.h = Number(params.get('h')) || room.h;
  room.name = params.get('name') || room.name;
}

const layout = () => room.layouts[room.active];
const current = () => layout().items.find(item=>item.id===selected);
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const save = () => {
  try { localStorage.setItem(key,JSON.stringify(room)); storageError = false; }
  catch { storageError = true; }
};

function remember(previous) {
  past.push(previous);
  if (past.length>50) past.shift();
  future.length=0;
  save();
}

function change(edit) {
  const previous = structuredClone(room);
  edit();
  zone = null;
  remember(previous);
  render();
}

function history(from,to) {
  if (!from.length) return;
  to.push(room);
  room = from.pop();
  zone = null;
  save();
  render();
}

const id = () => globalThis.crypto?.randomUUID?.() ?? String(Date.now())+Math.random();
const labels = {bed:'▤',desk:'▱',storage:'▥',chair:'⊞',rug:'▧',sofa:'▰',custom:'□'};

function furniture(item, furnished, interactive) {
  const {x,y,w,h} = footprint(item);
  const active = interactive && item.id===selected;
  const angle = item.rotation;
  const pivotX = x+w/2, pivotY = y+h/2;
  const w0 = item.w, h0=item.h;
  let detail = '';
  if (item.kind==='bed' && furnished) {
    detail = '<rect class="linen" x="'+w0*.09+'" y="'+h0*.07+'" width="'+w0*.37+'" height="'+h0*.23+'" rx="55"/><rect class="linen" x="'+w0*.54+'" y="'+h0*.07+'" width="'+w0*.37+'" height="'+h0*.23+'" rx="55"/><rect class="linen" x="'+w0*.06+'" y="'+h0*.36+'" width="'+w0*.88+'" height="'+h0*.58+'" rx="55"/>';
  } else if (item.kind==='storage') {
    detail = '<path class="join" d="M '+w0/2+' 20 V '+(h0-20)+' M 35 '+(h0-90)+' H '+(w0-35)+'"/>';
  } else if (furnished && item.kind==='desk') {
    detail = '<rect class="linen" x="'+w0*.25+'" y="'+h0*.12+'" width="'+w0*.5+'" height="'+h0*.28+'" rx="30"/>';
  }
  return '<g class="piece '+item.kind+(active?' selected':'')+'" '+(interactive?'data-piece="'+escape(item.id)+'"':'')+'><g transform="translate('+pivotX+' '+pivotY+') rotate('+angle+') translate('+(-w0/2)+' '+(-h0/2)+')"><rect width="'+w0+'" height="'+h0+'" rx="'+(furnished?55:20)+'"/>'+detail+'</g>'+(furnished?'':'<text x="'+pivotX+'" y="'+pivotY+'">'+escape(item.name.length>19?item.name.slice(0,18)+'…':item.name)+'</text>')+'</g>';
}

function scene(option, prefix, furnished=false, interactive=false) {
  const padding = Math.max(270,Math.max(room.w,room.h)*.075);
  const w = room.w, h = room.h, grid = Math.max(100,Math.ceil(Math.max(w,h)/8000)*100);
  const door = room.door?'<path class="door" d="M 200 '+h+' v -'+room.door+' a '+room.door+' '+room.door+' 0 0 1 '+room.door+' '+room.door+'"/><path class="opening" d="M 200 '+h+' h '+room.door+'"/>':'';
  const win = room.window?'<path class="window" d="M '+w*.57+' 0 H '+w*.84+'"/>':'';
  const highlighted = interactive&&zone?'<rect class="zone" x="'+zone.x+'" y="'+zone.y+'" width="'+zone.w+'" height="'+zone.h+'"/>':'';
  const ordered = [...option.items].sort((a,b)=>Number(b.kind==='rug')-Number(a.kind==='rug'));
  return '<svg class="scene '+(furnished?'furnished':'plan')+'" viewBox="'+[-padding,-padding,w+padding*2,h+padding*2].join(' ')+'" role="img" aria-label="'+escape(option.name)+' floor plan">'+
    '<defs><pattern id="'+prefix+'-grid" width="'+grid+'" height="'+grid+'" patternUnits="userSpaceOnUse"><path d="M '+grid+' 0 H 0 V '+grid+'"/></pattern></defs>'+
    '<rect class="room" width="'+w+'" height="'+h+'"/>'+
    '<rect width="'+w+'" height="'+h+'" fill="url(#'+prefix+'-grid)"/>'+
    '<path class="dimension" d="M 0 -140 H '+w+' M 0 -190 v 100 M '+w+' -190 v 100 M -140 0 V '+h+' M -190 0 h 100 M -190 '+h+' h 100"/>'+
    '<text class="dim-label" x="'+w/2+'" y="-195">'+measure(w,room.unit)+'</text>'+
    '<text class="dim-label" transform="translate(-208 '+h/2+') rotate(-90)">'+measure(h,room.unit)+'</text>'+
    door+win+highlighted+ordered.map(item=>furniture(item,furnished,interactive)).join('')+'</svg>';
}

function renderCanvas() {
  if (view!=='Compare') {
    $('canvas').innerHTML=scene(layout(),'single',view==='Furnished',true);
    return;
  }
  const alternatives=room.layouts.map((option,i)=>i===room.active?'':'<option value="'+i+'" '+(i===against?'selected':'')+'>'+escape(option.name)+'</option>').join('');
  const options=room.layouts.filter((_,i)=>i!==room.active);
  if (!options.length) {
    $('canvas').innerHTML='<div class="empty"><strong>Compare two layouts</strong><p>Duplicate this layout to create an alternative.</p><button class="button primary" data-action="duplicate">Duplicate layout</button></div>';
    return;
  }
  if (!room.layouts[against] || against===room.active) {
    against=room.layouts.findIndex((_,i)=>i!==room.active);
    renderCanvas();
    return;
  }
  const card=(option,prefix,title)=>'<div class="comparison">'+title+scene(option,prefix)+'<p>'+issues(room,option).length+' fit warnings</p></div>';
  $('canvas').innerHTML='<div class="compare">'+card(layout(),'first','<strong>'+escape(layout().name)+'</strong>')+
    card(room.layouts[against],'second','<select id="against" aria-label="Compare with">'+alternatives+'</select>')+'</div>';
}

function render() {
  $('room-name').textContent=room.name;
  $('room-details').textContent=measure(room.w,room.unit)+' × '+measure(room.h,room.unit)+' · '+room.layouts.length+' '+(room.layouts.length===1?'layout':'layouts');
  $('units').value=room.unit;
  $('save').textContent=storageError?'Browser saving unavailable':'Saved in this browser';
  $('undo').disabled=!past.length;
  $('redo').disabled=!future.length;
  document.querySelectorAll('[data-view]').forEach(btn=>btn.setAttribute('aria-pressed',String(view===btn.dataset.view)));
  $('layouts').innerHTML=room.layouts.map((option,i)=>'<button class="layout" data-layout="'+i+'" aria-pressed="'+(room.active===i)+'"><span class="layout-icon" aria-hidden="true">▣</span><span>'+escape(option.name)+'</span></button>').join('');
  $('hint').textContent=view==='Compare'?'Same scale and orientation':view==='Furnished'?'Top-down furnished view':'Drag furniture or edit its position in the inspector.';
  renderCanvas();
  const item=current();
  const picker='<label class="picker">Furniture<select id="pick-piece"><option value="">Select an item</option>'+layout().items.map(p=>'<option value="'+escape(p.id)+'" '+(p.id===selected?'selected':'')+'>'+escape(p.name)+'</option>').join('')+'</select></label>';
  if (!item) $('inspector').innerHTML='<h2>Inspector</h2><p>Select furniture on the plan to edit its size and position.</p>';
  else {
    const fields=[['Width','w'],['Depth','h'],['Height','z'],['X position','x'],['Y position','y']];
    $('inspector').innerHTML='<h2>Inspector</h2><h3>'+escape(item.name)+'</h3><div class="fields">'+fields.map(([title,field])=>
      '<label>'+title+' ('+room.unit+')<input data-field="'+field+'" type="number" step="any" value="'+amount(item[field] ?? ({bed:620,chair:850,storage:2100,sofa:820,desk:750}[item.kind] || 700),room.unit)+'" '+(item.locked?'disabled':'')+'></label>').join('')+
      '</div><label class="toggle"><input data-field="owned" type="checkbox" '+(item.owned?'checked':'')+'> Already owned</label>'+
      '<label class="toggle"><input data-field="locked" type="checkbox" '+(item.locked?'checked':'')+'> Lock placement</label>'+
      '<div class="item-actions"><button class="button" data-action="rotate" '+(item.locked?'disabled':'')+'>↻ Rotate</button><button class="button remove" data-action="remove" '+(item.locked?'disabled':'')+'>Remove</button></div>';
  }
  if (layout().items.length) $('inspector').insertAdjacentHTML('beforeend',picker);
  const warnings=issues(room,layout());
  $('issue-count').textContent=warnings.length;
  $('checks').innerHTML=(warnings.length?warnings.map((issue,index)=>'<button class="warning" data-issue="'+index+'"><span aria-hidden="true">!</span>'+escape(issue.text)+'</button>').join(''):'<p class="clear">✓ No fit warnings</p>')+
    (room.door?'':'<p>Door swing unverified. Add a door in room dimensions.</p>');
}

function duplicate() {
  change(()=>{
    const copy=structuredClone(layout());
    copy.name='Layout '+(room.layouts.length+1);
    room.layouts.push(copy);
    room.active=room.layouts.length-1;
    view='Plan';
  });
}

function add(name,w,h,kind) {
  const item={id:id(),name,w,h,kind,x:Math.max(0,Math.round((room.w-w)/2)),y:Math.max(0,Math.round((room.h-h)/2)),owned:true,rotation:0,locked:false};
  change(()=>{layout().items.push(item);selected=item.id;view='Plan';});
}

function modal(title,body,button,submit) {
  const dialog=$('dialog');
  dialog.innerHTML='<form><h2>'+title+'</h2>'+body+'<div class="dialog-actions"><button class="button" type="button" data-action="cancel">Cancel</button><button class="button primary">'+button+'</button></div></form>';
  dialog.querySelector('form').onsubmit=event=>{
    event.preventDefault();
    if (submit(new FormData(event.currentTarget))!==false) dialog.close();
  };
  dialog.showModal();
}

function numeric(label,name,mm,unit,min=100,maximum=50000) {
  return '<label>'+label+' ('+unit+')<input required type="number" step="any" name="'+name+'" min="'+amount(min,unit)+'" max="'+amount(maximum,unit)+'" value="'+amount(mm,unit)+'"></label>';
}

function roomDialog(existing) {
  const unit=room.unit;
  modal(existing?'Room dimensions':'New room','<label>Room name<input name="name" maxlength="55" required value="'+(existing?escape(room.name):'My room')+'"></label><div class="fields">'+
    numeric('Width','w',existing?room.w:4200,unit,1000)+numeric('Depth','h',existing?room.h:3600,unit,1000)+'</div>'+
    numeric('Bottom wall door width · 0 for unknown','door',existing?room.door:0,unit,0,2200)+
    '<label class="toggle"><input type="checkbox" name="window" '+(existing&&room.window?'checked':'')+'> Top wall window</label>'+
    (existing?'':'<p>Creating a room replaces the current room. Use Undo to return to it during this session.</p>')+'<p role="alert" id="room-error"></p>',existing?'Apply dimensions':'Create room',data=>{
      const [w,h,door]=['w','h','door'].map(field=>Math.round(Number(data.get(field))*factor(unit)));
      const name=String(data.get('name')).trim();
      if (!name || (door && (door+200>w || door>h))) {
        $('room-error').textContent=name?'Door swing must fit inside the room.':'Enter a room name.';
        return false;
      }
      change(()=>{
        if (!existing) {room={version:1,unit,active:0,layouts:[{name:'Current setup',items:[]}]};selected=null;view='Plan';}
        Object.assign(room,{name,w,h,door,window:data.has('window')});
      });
    });
}

$('catalog').innerHTML=catalog.map(([name,w,h,kind],i)=>'<button data-catalog="'+i+'"><span aria-hidden="true">'+labels[kind]+'</span>'+name+'</button>').join('');
$('new-room').onclick=()=>roomDialog(false);
$('edit-room').onclick=()=>roomDialog(true);
$('sample').onclick=()=>modal('Open sample bedroom','<p>This replaces the current room in the editor. Use Undo to return to it during this session.</p>','Open sample',()=>{
  change(()=>{room=sample();selected=null;view='Plan';});
});
$('custom').onclick=()=>{
  const unit=room.unit;
  modal('Add custom furniture','<label>Item name<input name="name" required maxlength="45"></label><div class="fields">'+numeric('Width','w',800,unit)+numeric('Depth','h',600,unit)+'</div><p role="alert" id="item-error"></p>','Add to layout',data=>{
    const name=String(data.get('name')).trim();
    if (!name) {$('item-error').textContent='Enter an item name.';return false;}
    add(name,...['w','h'].map(field=>Math.round(Number(data.get(field))*factor(unit))),'custom');
  });
};
$('undo').onclick=()=>history(past,future);
$('redo').onclick=()=>history(future,past);
$('units').onchange=event=>change(()=>{room.unit=event.target.value;});
$('duplicate').onclick=duplicate;

document.addEventListener('click',event=>{
  const btn=event.target.closest('button');
  if (!btn) return;
  const data=btn.dataset;
  if ('layout' in data) {
    room.active=Number(data.layout); selected=null;zone=null;save();render();
  }
  if ('catalog' in data) add(...catalog[Number(data.catalog)]);
  if (data.view) {view=data.view;zone=null;render();}
  if ('issue' in data) {
    const issue=issues(room,layout())[Number(data.issue)];
    selected=issue.id;zone=issue.zone;view='Plan';render();
  }
  if (data.action==='cancel') $('dialog').close();
  if (data.action==='duplicate') duplicate();
  const item=current();
  if (item && !item.locked && data.action==='rotate') change(()=>{item.rotation=(item.rotation+90)%360;});
  if (item && !item.locked && data.action==='remove') change(()=>{layout().items=layout().items.filter(p=>p!==item);selected=null;});
});

$('canvas').addEventListener('change',event=>{
  if (event.target.id==='against') {against=Number(event.target.value);renderCanvas();}
});

$('inspector').addEventListener('change',event=>{
  const input=event.target;
  const {field}=input.dataset;
  const item=current();
  if (input.id==='pick-piece') {selected=input.value||null;zone=null;render();$('pick-piece').focus();return;}
  if (!item || !field) return;
  if (input.type==='checkbox') {change(()=>{item[field]=input.checked;});return;}
  const value=Math.round(input.valueAsNumber*factor(room.unit));
  const size=field==='w'||field==='h'||field==='z';
  if (!Number.isFinite(value) || Math.abs(value)>(field==='z'?2500:50000) || (size && value<100)) {
    input.setCustomValidity(size?'Enter a size between '+measure(100,room.unit)+' and '+measure(field==='z'?2500:50000,room.unit)+'.':'Enter a position within '+measure(50000,room.unit)+' of the origin.');
    input.reportValidity();
    return;
  }
  change(()=>{item[field]=value;});
});
$('inspector').addEventListener('input',event=>event.target.setCustomValidity(''));

function point(svg,event) {
  return new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse());
}
$('canvas').addEventListener('pointerdown',event=>{
  if (event.button!==0 || drag || view==='Compare') return;
  const node=event.target.closest('[data-piece]');
  if (!node) {selected=null;zone=null;render();return;}
  selected=node.dataset.piece;zone=null;
  const item=current();
  if (item.locked) {render();return;}
  const svg=node.ownerSVGElement;
  const start=point(svg,event);
  drag={item,start,x:item.x,y:item.y,before:structuredClone(room),pointer:event.pointerId};
  $('canvas').setPointerCapture(event.pointerId);
  render();
});
$('canvas').addEventListener('pointermove',event=>{
  if (!drag || drag.pointer!==event.pointerId) return;
  const p=point($('canvas').querySelector('svg'),event);
  const move=(origin,delta)=>Math.max(-50000,Math.min(50000,Math.round((origin+delta)/50)*50));
  if (Math.hypot(p.x-drag.start.x,p.y-drag.start.y)<12 && drag.item.x===drag.x && drag.item.y===drag.y) return;
  drag.item.x=move(drag.x,p.x-drag.start.x);
  drag.item.y=move(drag.y,p.y-drag.start.y);
  renderCanvas();
});
function endDrag(event) {
  if (!drag || drag.pointer!==event.pointerId) return;
  if (event.type==='pointercancel') room=drag.before;
  else if (drag.item.x!==drag.x || drag.item.y!==drag.y) remember(drag.before);
  drag=null;
  render();
}
$('canvas').addEventListener('pointerup',endDrag);
$('canvas').addEventListener('pointercancel',endDrag);
document.addEventListener('keydown',event=>{
  if (event.target.closest('input,select,textarea,dialog') || drag) return;
  if ((event.ctrlKey||event.metaKey) && event.key.toLowerCase()==='z') {
    event.preventDefault();
    if (event.shiftKey) history(future,past);else history(past,future);
  }
});
save();
render();
