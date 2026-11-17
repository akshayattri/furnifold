import test from 'node:test';
import assert from 'node:assert/strict';
import {walls,openingError,structureError,roomOpenings,swingHits} from '../src/structure.mjs';
import {sample,issues} from '../src/model.mjs';
const project={rooms:[{id:'a',x:0,y:0,w:4000,h:4000},{id:'b',x:4000,y:1000,w:3000,h:2000}]};
const shared=walls(project).find(w=>w.adjacent.length===2);
const door={id:'d',wallId:shared.id,type:'door',offset:100,width:800,height:2100,sill:0,hinge:'start',swing:-1};
test('partial adjacency splits edges and creates one shared wall',()=>{
  assert.equal(shared.length,2000);
  assert.equal(walls(project).filter(w=>w.axis==='v'&&w.line===4000).length,3);
  assert.equal(walls(project).reduce((n,w)=>n+w.length,0),24000);
});
test('valid openings round-trip; bounds, overlap and height reject',()=>{
  const p=JSON.parse(JSON.stringify({...project,openings:[door]}));
  assert.equal(structureError(p),null);
  for(const changes of [{offset:0},{width:2000},{height:2800},{sill:100}])assert.ok(openingError(p,{...door,...changes}));
  assert.ok(openingError(p,{...door,id:'other',offset:950}));
});
test('geometry edits cannot orphan anchored openings',()=>{
  const p={...project,openings:[door],rooms:project.rooms.map(r=>r.id==='b'?{...r,y:1100}:r)};
  assert.ok(structureError(p));
});
test('shared opening resolves into both room coordinate systems',()=>{
  const p={...project,openings:[door]};
  const [a]=roomOpenings(p,p.rooms[0]),[b]=roomOpenings(p,p.rooms[1]);
  assert.equal(a.wall.line,4000);assert.equal(b.wall.line,0);
  assert.equal(a.wall.start,1000);assert.equal(b.wall.start,0);
  assert.ok(swingHits(a,{x:3500,y:1200,w:400,h:400}));
  assert.ok(!swingHits(b,{x:100,y:200,w:400,h:400}));
});
test('legacy standalone room and layouts retain checks',()=>{
  const room=sample();assert.ok(issues(room,room.layouts[0]).some(i=>i.text.includes('clearance')||i.text.includes('in front')));
  assert.equal(walls(project).length,9);assert.equal(structureError(project),null);
});
test('both hinge positions and swing directions check the correct quarter circle',()=>{
  const wall={axis:'h',line:0,start:0};
  for(const hinge of ['start','end'])for(const swing of [-1,1]){
    const opening={...door,wall,offset:100,hinge,swing};
    assert.ok(swingHits(opening,{x:400,y:swing===1?100:-300,w:100,h:100}));
    assert.ok(!swingHits(opening,{x:400,y:swing===1?-300:100,w:100,h:100}));
    assert.ok(!swingHits(opening,{x:2000,y:100,w:100,h:100}));
  }
});
test('floor doors participate in fit checks across layout variants',()=>{
  const r={...sample(),door:0,structuralOpenings:[{...door,wall:{axis:'h',line:0,start:0},swing:1}]};
  const item={id:'chair',name:'Chair',kind:'chair',x:200,y:100,w:300,h:300,rotation:0};
  assert.ok(issues(r,{items:[item]}).some(i=>i.text.includes('door swing')));
  assert.ok(!issues(r,{items:[{...item,x:2000}]}).some(i=>i.text.includes('door swing')));
});
