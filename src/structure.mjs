// Plan coordinates and opening dimensions are integer millimetres. Wall offsets
// increase left-to-right (horizontal) or top-to-bottom (vertical).
export function walls(project) {
  const lines=new Map();
  for(const r of project.rooms) for(const [axis,line,start,end,side] of [
    ['h',r.y,r.x,r.x+r.w,'top'],['h',r.y+r.h,r.x,r.x+r.w,'bottom'],
    ['v',r.x,r.y,r.y+r.h,'left'],['v',r.x+r.w,r.y,r.y+r.h,'right']]){
    const key=axis+':'+line;
    if(!lines.has(key))lines.set(key,[]);
    lines.get(key).push({start,end,roomId:r.id,side});
  }
  const result=[];
  for(const [key,edges] of lines){
    const [axis,line]=key.split(':');
    const points=[...new Set(edges.flatMap(e=>[e.start,e.end]))].sort((a,b)=>a-b);
    for(let i=0;i<points.length-1;i++){
      const start=points[i],end=points[i+1];
      const adjacent=edges.filter(e=>e.start<=start&&e.end>=end);
      if(adjacent.length)result.push({id:key+':'+start+':'+end,axis,line:Number(line),start,end,length:end-start,adjacent});
    }
  }
  return result;
}
export function openingError(project,opening,all=project.openings||[]) {
  const wall=walls(project).find(w=>w.id===opening.wallId);
  if(!wall)return 'This wall changed. Remove or relocate its openings before changing the room.';
  if(!['door','window'].includes(opening.type)||!['start','end'].includes(opening.hinge)||![1,-1].includes(opening.swing))return 'Choose a valid opening type, hinge and swing.';
  if(![opening.offset,opening.width,opening.height,opening.sill].every(Number.isInteger)||opening.width<300||opening.height<300||opening.sill<0||opening.sill+opening.height>2700||opening.type==='door'&&opening.sill!==0)return 'Use valid dimensions within the 2.7 m wall height (minimum width and height 0.3 m).';
  if(opening.offset<100||opening.offset+opening.width>wall.length-100)return 'Leave at least 0.1 m of wall at each end.';
  if(all.some(o=>o.id!==opening.id&&o.wallId===opening.wallId&&opening.offset<o.offset+o.width+100&&opening.offset+opening.width+100>o.offset))return 'Leave at least 0.1 m between openings.';
  return null;
}
export function structureError(project){
  return (project.openings||[]).map(o=>openingError(project,o)).find(Boolean)||null;
}
export function pointOnWall(w,offset){return w.axis==='h'?{x:w.start+offset,y:w.line}:{x:w.line,y:w.start+offset};}
export function openingPlan(w,o,attributes=''){
  const a=pointOnWall(w,o.offset),b=pointOnWall(w,o.offset+o.width);
  let symbol;
  if(o.type==='window')symbol='<path d="M'+a.x+' '+a.y+' L'+b.x+' '+b.y+'" stroke="#53819b" stroke-width="45"/>';
  else{
    const hinge=o.hinge==='end'?b:a,tip=o.hinge==='end'?a:b;
    const end=w.axis==='h'?{x:hinge.x,y:hinge.y+o.swing*o.width}:{x:hinge.x+o.swing*o.width,y:hinge.y};
    const cross=(tip.x-hinge.x)*(end.y-hinge.y)-(tip.y-hinge.y)*(end.x-hinge.x);
    symbol='<path d="M'+hinge.x+' '+hinge.y+' L'+end.x+' '+end.y+' M'+tip.x+' '+tip.y+' A'+o.width+' '+o.width+' 0 0 '+(cross>0?1:0)+' '+end.x+' '+end.y+'" fill="none" stroke="#735d49" stroke-width="25"/>';
  }
  return '<g '+attributes+'><path d="M'+a.x+' '+a.y+' L'+b.x+' '+b.y+'" stroke="#fafafa" stroke-width="135"/>'+symbol+'</g>';
}

export function roomOpenings(project,room){
  return (project.openings||[]).flatMap(o=>{
    const w=walls(project).find(w=>w.id===o.wallId&&w.adjacent.some(a=>a.roomId===room.id));
    return w?[{...o,wall:{...w,line:w.line-(w.axis==='h'?room.y:room.x),start:w.start-(w.axis==='h'?room.x:room.y)}}]:[];
  });
}
export function swingHits(o,box){
  const w=o.wall,hinge=pointOnWall(w,o.offset+(o.hinge==='end'?o.width:0));
  const dx=w.axis==='h'?(o.hinge==='end'?-1:1):o.swing;
  const dy=w.axis==='v'?(o.hinge==='end'?-1:1):o.swing;
  const xs=[(box.x-hinge.x)*dx,(box.x+box.w-hinge.x)*dx].sort((a,b)=>a-b);
  const ys=[(box.y-hinge.y)*dy,(box.y+box.h-hinge.y)*dy].sort((a,b)=>a-b);
  return xs[1]>0&&ys[1]>0&&Math.hypot(Math.max(0,xs[0]),Math.max(0,ys[0]))<o.width;
}
