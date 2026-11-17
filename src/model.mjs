import {swingHits} from './structure.mjs';
export const catalog = [
  ['Bed',1600,2000,'bed'], ['Desk',1200,600,'desk'], ['Wardrobe',1500,600,'storage'],
  ['Chair',500,500,'chair'], ['Rug',2000,2400,'rug'], ['Sofa',1800,850,'sofa']
];

const piece = (id, index, x, y) => {
  const [name,w,h,kind] = catalog[index];
  return {id,name,w,h,kind,x,y,rotation:0,owned:true,locked:false};
};

export function sample() {
  const pieces = [piece('rug',4,300,450),piece('bed',0,500,600),piece('desk',1,2700,280),
    piece('wardrobe',2,2450,2200),piece('chair',3,2800,2900)];
  return {version:1, name:'Sample bedroom', w:4200,h:3600,door:850,window:true,unit:'cm',
    active:0, layouts:[
      {name:'Current setup',items:pieces},
      {name:'Sample · Open walkway',items:pieces.map(p=>p.id==='chair'?{...p,x:3290,y:1000}:p)},
      {name:'Sample · Work nook',items:pieces.map(p=>{
        const pos = {bed:[500,200],rug:[300,100],desk:[2600,300],chair:[2920,970],wardrobe:[2450,2200]}[p.id];
        return {...p,x:pos[0],y:pos[1]};
      })}
    ]};
}

export function footprint(item) {
  const rotated = item.rotation % 180 === 90;
  return {...item,w:rotated?item.h:item.w,h:rotated?item.w:item.h};
}

const overlaps = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;

function swingIntersects(room, box) {
  const hingeX = 200, hingeY = room.h;
  if(room.structuralOpenings?.some(o=>o.type==='door'&&swingHits(o,box)))return true;
  if (!room.door || box.x+box.w <= hingeX || box.y >= hingeY) return false;
  return Math.hypot(Math.max(0,box.x-hingeX), Math.max(0,hingeY-box.y-box.h)) < room.door;
}

export function clearance(item, depth=700) {
  const {x,y,w,h,rotation} = footprint(item);
  switch (rotation) {
    case 90: return {x:x-depth,y,w:depth,h};
    case 180: return {x,y:y-depth,w,h:depth};
    case 270: return {x:x+w,y,w:depth,h};
    default: return {x,y:y+h,w,h:depth};
  }
}

const outside = (room,b) => b.x<0 || b.y<0 || b.x+b.w>room.w || b.y+b.h>room.h;
export function issues(room, layout) {
  const solid = layout.items.filter(p=>p.kind!=='rug').map(footprint);
  const result = [];
  for (const [i,item] of layout.items.entries()) {
    if (outside(room,footprint(item))) result.push({id:item.id,text:item.name+' extends outside the room.'});
    if (item.kind!=='rug' && swingIntersects(room,footprint(item))) result.push({id:item.id,text:item.name+' blocks the door swing.'});
    if (item.kind==='storage') {
      const zone = clearance(item);
      const blocker = solid.find(other=>other.id!==item.id&&overlaps(zone,other));
      if (blocker || outside(room,zone)) result.push({id:item.id,zone,text:item.name+' needs '+measure(700,room.unit)+' in front'+(blocker?' · '+blocker.name+' is in the way.':' · the wall limits clearance.')});
    }
    if (item.kind!=='rug') for (const other of layout.items.slice(i+1)) {
      if (other.kind!=='rug' && overlaps(footprint(item),footprint(other))) result.push({id:item.id,text:item.name+' overlaps '+other.name+'.'});
    }
  }
  return result;
}

export const factor = unit => unit==='in'?25.4:10;
export const amount = (mm,unit) => Number((mm/factor(unit)).toFixed(2));
export const measure = (mm,unit) => amount(mm,unit).toLocaleString('en-US')+' '+unit;
