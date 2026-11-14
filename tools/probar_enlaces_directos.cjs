const{chromium}=require('playwright'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),p=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(pathToFileURL(path.resolve('Multiplicacion/multiplicacion.html')).href);await p.waitForTimeout(120);
 await p.evaluate(()=>{
  const espacio=document.createElement('section');espacio.id='prueba-enlaces';espacio.className='espacio';espacio.style.cssText='position:fixed;z-index:500;left:30px;top:60px;width:680px;height:460px;padding:12px;background:#f5faff';
  espacio.innerHTML='<div style="height:30px">Prueba de conexiones directas</div><div class="plano-magnetico"><svg class="enlaces-grupos" aria-hidden="true"></svg><div class="nodos-grupos"></div></div><button id="prueba-separar">Separar figura</button><button id="prueba-deshacer">Deshacer</button>';document.body.append(espacio);
  window.malla=new GruposMagneticos({plano:espacio.querySelector('.plano-magnetico'),separar:espacio.querySelector('#prueba-separar'),deshacer:espacio.querySelector('#prueba-deshacer'),svgFigura:()=>'<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="19" fill="#78b6f1" stroke="#305b99" stroke-width="2"/></svg>',t:(es,en)=>es,alCambiar(){},alCompletar(){},alAvisar(){}});
  window.disponer=(puntos,enlaces,ayuda=false)=>{malla.iniciar(puntos.map((_,id)=>({id})),4,{ayuda,nombreFigura:'círculo'});Object.assign(malla.mundo,{tam:50,w:650,h:350});malla.plano.style.height='350px';malla.plano.style.setProperty('--tam-nodo','50px');malla.svg.setAttribute('viewBox','0 0 650 350');puntos.forEach(([x,y],id)=>Object.assign(malla.nodos[id],{x,y}));malla.enlaces=enlaces.map(e=>e.slice());malla.historial=[];malla.pintar();};
  window.pares=()=>[...document.querySelectorAll('#prueba-enlaces .enlace')].map(e=>[+e.dataset.a,+e.dataset.b].sort((a,b)=>a-b).join('-')).sort();
 });
 // A triangle gets all its direct sides, rather than retaining only a tree.
 await p.evaluate(()=>{disponer([[120,100],[181,100],[150.5,152.8]],[[0,1],[0,2]]);malla.actualizar();});assert.deepEqual(await p.evaluate(()=>pares()),['0-1','0-2','1-2']);assert.deepEqual(await p.evaluate(()=>malla.componentes()),[[0,1,2]]);
 // In a row, the middle shape blocks the connection between the two ends.
 await p.evaluate(()=>{disponer([[100,100],[145,100],[190,100]],[[0,1],[1,2]]);malla.actualizar();});assert.deepEqual(await p.evaluate(()=>pares()),['0-1','1-2']);assert.equal(await p.evaluate(()=>malla.conexionLibre(0,2)),false);
 // A foreign shape blocks an existing group's line too, including during drag preview.
 await p.evaluate(()=>{disponer([[100,100],[190,100],[145,100]],[[0,1]]);malla.candidato={a:0,b:1,bloqueado:false,destino:[1]};malla.pintar();});assert.deepEqual(await p.evaluate(()=>pares()),[]);assert.equal(await p.locator('#prueba-enlaces .enlace-propuesto').count(),0);assert.deepEqual(await p.evaluate(()=>malla.componentes()),[[0,1],[2]]);
 // Shapes with no group remain separate even when placed close together.
 await p.evaluate(()=>{disponer([[120,100],[181,100],[150.5,152.8]],[]);malla.actualizar();});assert.deepEqual(await p.evaluate(()=>pares()),[]);
 // Each corner in a small square can reach the other three corners directly.
 await p.evaluate(()=>{disponer([[120,100],[181,100],[181,161],[120,161]],[[0,1],[1,2],[2,3]]);malla.actualizar();});assert.deepEqual(await p.evaluate(()=>pares()),['0-1','0-2','0-3','1-2','1-3','2-3']);
 await p.screenshot({path:'.qa-enlaces-directos.png'});
 await p.evaluate(()=>{malla.seleccion=0;malla.separarSeleccion();});assert.deepEqual(await p.evaluate(()=>malla.componentes()),[[0],[1,2,3]]);assert.deepEqual(await p.evaluate(()=>pares()),['1-2','1-3','2-3']);await p.locator('#prueba-deshacer').click();assert.equal((await p.evaluate(()=>pares())).length,6);
 // Dragging a group moves the whole mesh together without changing its connections.
 const before=await p.evaluate(()=>malla.nodos.map(n=>({x:n.x,y:n.y}))),node=p.locator('#prueba-enlaces [data-nodo="0"]'),r=await node.boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.down();await p.mouse.move(r.x+r.width/2+90,r.y+r.height/2+45,{steps:8});await p.mouse.up();await p.waitForTimeout(50);const after=await p.evaluate(()=>malla.nodos.map(n=>({x:n.x,y:n.y})));after.forEach((n,i)=>{assert(Math.abs(n.x-before[i].x-90)<2);assert(Math.abs(n.y-before[i].y-45)<2);});assert.equal((await p.evaluate(()=>pares())).length,6);
 // Every shape is checked as an obstacle, even when it is not part of the group.
 await p.evaluate(()=>{disponer([[100,100],[190,100],[145,100],[145,155]],[[0,1],[1,3],[3,0]]);malla.actualizar();});const edges=await p.evaluate(()=>pares());assert(!edges.includes('0-1'));assert(edges.includes('0-3')&&edges.includes('1-3'));
 // Distant corners don't receive long lines just because they belong to the same group.
 await p.evaluate(()=>{disponer([[100,100],[161,100],[222,100],[283,100]],[[0,1],[1,2],[2,3]]);malla.actualizar();});assert.deepEqual(await p.evaluate(()=>pares()),['0-1','1-2','2-3']);
 assert.deepEqual(errors,[]);console.log('PASS: triangles/square meshes, collinear and foreign blockers, direct previews, no idle merging, short links, separate/undo, rigid group movement.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
