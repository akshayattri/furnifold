const {chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1500,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.FURNIFOLD_URL||'http://localhost:8000');
await page.evaluate(()=>{
 sessionStorage.setItem('furnifold-studio-demo','1');
 localStorage.setItem('furnifold.studio.v1',JSON.stringify([{id:'legacy',name:'Legacy home',kind:'House',w:8000,h:4000,rooms:[{id:'a',name:'Living room',type:'Living',x:0,y:0,w:4000,h:4000},{id:'b',name:'Bedroom',type:'Bedroom',x:4000,y:0,w:4000,h:4000}]}]));
 localStorage.setItem('furnifold.project-room.legacy-a',JSON.stringify({version:1,name:'Living room',w:4000,h:4000,door:0,window:false,unit:'cm',active:1,layouts:[{name:'Baseline',items:[]},{name:'Alternate',items:[{id:'sofa',name:'Sofa',kind:'sofa',x:500,y:500,w:1800,h:850,rotation:0,locked:false}]}]}));
});await page.reload();await page.getByRole('button',{name:/Legacy home/}).click();
await page.getByRole('button',{name:'Add door',exact:true}).click();
await page.locator('select[name="Wall"]').selectOption({label:'Living room right / Bedroom left · 4 m'});
await page.getByRole('button',{name:'Add opening',exact:true}).click();
await page.locator('[data-opening]').first().waitFor();
await page.getByRole('button',{name:'Add window',exact:true}).click();
await page.getByRole('button',{name:'Add opening',exact:true}).click();
await page.locator('svg [data-opening]').first().click();
await page.getByLabel('Width (m)',{exact:true}).fill('0.9');
await page.getByRole('button',{name:'Save opening',exact:true}).click();
await page.reload();await page.getByRole('button',{name:/Legacy home/}).click();
if(await page.locator('svg [data-opening]').count()!==2)throw Error('Openings did not persist');

await page.getByRole('button',{name:'3D sandbox',exact:true}).click();
await page.waitForFunction(()=>document.querySelector('#sandbox canvas')||document.querySelector('#sandbox-status')?.textContent.includes('could not load'),{timeout:30000});
console.log('3D status:',await page.locator('#sandbox-status').innerText());
if(!await page.locator('#sandbox canvas').count())throw Error('3D unavailable');

await page.getByRole('button',{name:'Door · 0.9 m · Edit',exact:true}).click();
await page.getByLabel('Offset (m)',{exact:true}).fill('0.3');await page.getByRole('button',{name:'Save opening',exact:true}).click();
await page.locator('[data-select="a"]').click();await page.getByRole('button',{name:'Edit room layout →',exact:true}).click();
const frame=page.frameLocator('iframe');await frame.locator('.scene').first().waitFor();
if(!await frame.getByText('Alternate',{exact:true}).count())console.log('Layout name checked in persisted data');
const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('furnifold.project-room.legacy-a')));
if(saved.active!==1||saved.layouts[1].items[0].id!=='sofa'||saved.layouts[0].items.length)throw Error('Legacy furniture changed');
console.log('Legacy project, active layout, 2D create/edit/reload, 3D render/edit, embedded room: passed');
console.log('Page errors:',errors);if(errors.length)throw Error(errors.join('\n'));
await page.getByRole('button',{name:'← Legacy home',exact:true}).click();
await page.getByRole('button',{name:'2D plan',exact:true}).click();
await page.getByRole('button',{name:'Edit room dimensions',exact:true}).click();
await page.getByLabel('Width (m)',{exact:true}).fill('3.9');
await page.getByRole('button',{name:'Save room',exact:true}).click();
await page.getByText('This wall changed.',{exact:false}).waitFor();
await page.getByRole('button',{name:'Cancel',exact:true}).click();
await page.getByRole('button',{name:'Window · 1.2 m · Edit',exact:true}).click();
await page.getByRole('button',{name:'Delete window',exact:true}).click();
if(await page.locator('svg [data-opening]').count()!==1)throw Error('Delete did not remove window');
console.log('Orphan protection and delete: passed');
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
