import * as T from 'https://esm.sh/three@0.180.0';
import { OrbitControls } from 'https://esm.sh/three@0.180.0/examples/jsm/controls/OrbitControls.js';

export const models=[
  {name:'Sofa',kind:'sofa',w:2100,h:900,z:820},
  {name:'Bed',kind:'bed',w:1600,h:2000,z:620},
  {name:'Desk',kind:'desk',w:1200,h:650,z:750},
  {name:'Chair',kind:'chair',w:510,h:520,z:850},
  {name:'Wardrobe',kind:'storage',w:1500,h:600,z:2100},
  {name:'Coffee table',kind:'custom',w:1100,h:600,z:430}
];
const defaults={sofa:820,bed:620,desk:750,chair:850,storage:2100,rug:20};
const mm=n=>Math.round(n/50)*50;
const metres=n=>n/1000;

export function startSandbox(host,{project,getItems,commit,select,status}){
  const scene=new T.Scene();
  scene.background=new T.Color(0xf7f8fa);
  const camera=new T.PerspectiveCamera(45,1,.03,600);
  const renderer=new T.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFSoftShadowMap;
  const canvas=renderer.domElement;
  canvas.setAttribute('aria-label','Interactive 3D floor plan');
  canvas.tabIndex=0;
  host.prepend(canvas);
  const controls=new OrbitControls(camera,canvas);
  controls.enableDamping=true;
  controls.maxPolarAngle=Math.PI*.485;
  const span=metres(Math.max(project.w,project.h));
  const cx=metres(project.w)/2,cz=metres(project.h)/2;
  scene.add(new T.HemisphereLight(0xffffff,0xb8b8bd,2.1));
  const light=new T.DirectionalLight(0xfff9f2,2.3);
  light.position.set(cx-span*.6,span*1.6,cz-span*.5);
  light.target.position.set(cx,0,cz);
  light.castShadow=true;
  Object.assign(light.shadow.camera,{left:-span,right:span,top:span,bottom:-span,far:span*5});
  light.shadow.mapSize.set(1024,1024);
  light.shadow.normalBias=.02;
  scene.add(light,light.target);
  const objects=new T.Group(), solid=new T.Group();
  scene.add(objects,solid);
  const materials=new Map();
  function box(parent,x,y,z,w,h,d,color,shadow=true){
    if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.8}));
    const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),materials.get(color));
    mesh.position.set(x,y,z);
    mesh.castShadow=shadow;mesh.receiveShadow=true;
    parent.add(mesh);
    return mesh;
  }
  function clear(group){
    group.traverse(node=>node.geometry?.dispose());
    group.clear();
  }
  box(solid,cx,-.075,cz,metres(project.w),.14,metres(project.h),0xdcdee3,false);
  for(const r of project.rooms){
    const w=metres(r.w),d=metres(r.h), x=metres(r.x),z=metres(r.y);
    const floor={Bathroom:0xe5e9ed,Kitchen:0xefeee9,Hallway:0xe9e9e9}[r.type]||0xece6dd;
    box(solid,x+w/2,-.018,z+d/2,w,.04,d,floor,false);
    for(const edge of [[x+w/2,z,w,.065],[x+w/2,z+d,w,.065],[x,z+d/2,.065,d],[x+w,z+d/2,.065,d]]){
      box(solid,edge[0],.16,edge[1],edge[2],.32,edge[3],0xfdfdff);
    }
  }
  function mesh(item){
    const w=metres(item.w),d=metres(item.h),h=metres(item.z??defaults[item.kind]??700);
    const group=new T.Group();
    const fill={bed:0xb6aba1,sofa:0x899996,desk:0xb18d6e,chair:0x88939d,storage:0xb29b86,rug:0xc9c4bb}[item.kind]||0xb5a18f;
    if(item.kind==='sofa'){
      box(group,0,h*.23,0,w,h*.46,d,fill);
      box(group,0,h*.66,-d*.4,w,h*.68,d*.2,fill);
      for(const x of [-w*.44,w*.44])box(group,x,h*.49,0,w*.12,h*.43,d,fill);
    }else if(item.kind==='bed'){
      box(group,0,h*.28,0,w,h*.55,d,fill);
      box(group,0,h*.57,d*.12,w*.93,h*.37,d*.69,0xeae4da);
      for(const x of [-w*.23,w*.23])box(group,x,h*.69,-d*.32,w*.37,h*.23,d*.22,0xf5f3ee);
    }else if(item.kind==='desk'||item.kind==='custom'){
      box(group,0,h*.94,0,w,h*.12,d,fill);
      for(const x of [-w*.4,w*.4])for(const z of [-d*.36,d*.36])box(group,x,h*.46,z,w*.055,h*.92,d*.08,fill);
    }else if(item.kind==='chair'){
      box(group,0,h*.46,0,w,h*.13,d,fill);
      box(group,0,h*.73,-d*.42,w,h*.54,d*.16,fill);
      for(const x of [-w*.38,w*.38])for(const z of [-d*.36,d*.36])box(group,x,h*.21,z,w*.09,h*.42,d*.09,fill);
    }else box(group,0,h/2,0,w,h,d,fill,item.kind!=='rug');
    group.rotation.y=-(item.rotation||0)*Math.PI/180;
    return group;
  }
  const dimensions=item=>item.rotation%180===90?[item.h,item.w]:[item.w,item.h];
  function place(group,room,item){
    const [w,d]=dimensions(item);
    group.position.set(metres(room.x+item.x+w/2),0,metres(room.y+item.y+d/2));
  }
  function refresh(){
    clear(objects);
    for(const room of project.rooms)for(const item of getItems(room)){
      const group=mesh(item);
      group.userData={room,item};
      place(group,room,item);
      objects.add(group);
    }
  }
  function reset(){
    controls.target.set(cx,0,cz);
    camera.position.set(cx+span*.85,span*.95,cz+span*.8);
    controls.minDistance=.45;
    controls.maxDistance=span*4;
    controls.update();
    camera.updateMatrixWorld();
  }
  reset();refresh();
  const resize=new ResizeObserver(()=>{
    const w=host.clientWidth,h=host.clientHeight;
    if(!w||!h)return;
    renderer.setSize(w,h,false);
    camera.aspect=w/h;
    camera.updateProjectionMatrix();
  });
  resize.observe(host);
  renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});

  const ray=new T.Raycaster(),plane=new T.Plane(new T.Vector3(0,1,0),0);
  let armed=null,drag=null;
  function cast(e){
    const r=canvas.getBoundingClientRect();
    ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);
    return ray.ray.intersectPlane(plane,new T.Vector3());
  }
  function candidate(point,item){
    if(!point)return null;
    const x=point.x*1000,y=point.z*1000;
    const room=project.rooms.find(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);
    if(!room)return null;
    const [w,d]=dimensions(item);
    if(w>room.w||d>room.h)return null;
    return {room,item:{...item,
      x:Math.max(0,Math.min(room.w-w,mm(x-room.x-w/2))),
      y:Math.max(0,Math.min(room.h-d,mm(y-room.y-d/2)))}};
  }
  function add(index,point){
    const model=models[index];
    if(!model)return;
    const hit=candidate(point,{...model,id:crypto.randomUUID(),x:0,y:0,rotation:0,owned:true,locked:false});
    if(!hit){status('Choose a room with enough space for '+model.name.toLowerCase()+'.');return;}
    if(!commit(hit.room,hit.item))return;
    refresh();armed=null;status(model.name+' placed in '+hit.room.name+'.');
  }
  function down(e){
    if(e.button!==0 || e.altKey || e.shiftKey || drag)return;
    const point=cast(e);
    if(armed!==null){
      e.stopImmediatePropagation();
      add(armed,point);
      return;
    }
    const hit=ray.intersectObjects(objects.children,true)[0];
    if(!hit || !point)return;
    let node=hit.object;
    while(node.parent!==objects)node=node.parent;
    select(node.userData.room);
    if(node.userData.item.locked){status('This item is locked in the room editor.');return;}
    e.stopImmediatePropagation();
    const offset=node.position.clone().sub(point);
    drag={node,offset,id:e.pointerId,startX:e.clientX,startY:e.clientY};
    controls.enabled=false;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('moving');
  }
  function move(e){
    if(!drag||e.pointerId!==drag.id||Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<3)return;
    const point=cast(e);
    const next=point?candidate(point.add(drag.offset),drag.node.userData.item):null;
    drag.next=next?.room.id===drag.node.userData.room.id?next:null;
    if(drag.next){
      place(drag.node,drag.next.room,drag.next.item);
      status('Move to '+drag.next.room.name);
    }else status('Keep this item within its room.');
  }
  function end(e){
    if(!drag||e.pointerId!==drag.id)return;
    const {node,next}=drag;
    drag=null;controls.enabled=true;canvas.classList.remove('moving');
    if(next&&e.type==='pointerup'){
      if(commit(next.room,next.item))status(next.item.name+' moved.');
    }else if(e.type==='pointerup')status(node.userData.item.name+' selected. Drag it to reposition.');
    refresh();
  }
  function over(e){if(e.dataTransfer.types.includes('application/x-furnifold-item')){e.preventDefault();e.dataTransfer.dropEffect='copy';}}
  function drop(e){
    const value=e.dataTransfer.getData('application/x-furnifold-item');
    if(!value)return;
    e.preventDefault();
    add(Number(value),cast(e));
  }
  const events={pointerdown:down,pointermove:move,pointerup:end,pointercancel:end,dragover:over,drop};
  for(const [name,fn] of Object.entries(events))canvas.addEventListener(name,fn,name==='pointerdown');
  return {
    arm(index){armed=index;status('Click inside a room to place '+models[index].name.toLowerCase()+'.');},
    cancel(){armed=null;status('Placement cancelled.');},
    reset,
    dispose(){
      resize.disconnect();renderer.setAnimationLoop(null);controls.dispose();
      for(const [name,fn] of Object.entries(events))canvas.removeEventListener(name,fn,name==='pointerdown');
      clear(objects);clear(solid);
      for(const material of materials.values())material.dispose();
      light.shadow.dispose();renderer.dispose();canvas.remove();
    }
  };
}
