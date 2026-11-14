const assert=require('node:assert/strict');
async function arrastrarNodo(page,origen,destino){
 const a=await page.locator(`[data-nodo="${origen}"]`).boundingBox(),b=await page.locator(`[data-nodo="${destino}"]`).boundingBox();
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:8});await page.mouse.up();await page.waitForTimeout(40);
}
async function unirGrupo(page,ids){
 for(let i=1;i<ids.length;i++){
  let unido=false;
  for(const destino of ids.slice(0,i)){
   await arrastrarNodo(page,ids[i],destino);
   const a=await page.locator(`[data-nodo="${ids[i]}"]`).getAttribute('data-grupo'),b=await page.locator(`[data-nodo="${ids[0]}"]`).getAttribute('data-grupo');
   if(a===b){unido=true;break;}
  }
  assert(unido,'No se pudo unir la figura '+ids[i]);
 }
}
module.exports={arrastrarNodo,unirGrupo};
