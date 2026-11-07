/* Mide ventanas de visualización; no modifica las ilustraciones originales.
   Ejecutar con Node.js y Sharp disponibles en NODE_PATH. */
const fs=require('fs'),path=require('path'),vm=require('vm'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),app=path.join(root,'Mayor_Menor_Objetos');
const context={window:{}};vm.createContext(context);
for(const file of ['objetos.js','caracteristicas.js','capacidades.js'])vm.runInContext(fs.readFileSync(path.join(app,file),'utf8'),context);
const assets=[...context.window.OBJETOS_TAMANOS.map(a=>({...a,categoria:'tamano',columnas:2,src:'imagenes/'+a.archivo})),...context.window.VARIANTES_OBJETOS,...context.window.EJERCICIOS_CAPACIDAD];
const fixed=new Set(['clima','cantidad','separacion','distancia','orden','capacidad']);
function maskPixel(data,p,alpha){const a=data[p+3];if(alpha)return a>24;const lo=Math.min(data[p],data[p+1],data[p+2]),hi=Math.max(data[p],data[p+1],data[p+2]);return a>24&&(lo<165||(lo<242&&hi-lo>22));}
async function medir(asset){
  const file=path.resolve(app,asset.src),image=sharp(file),meta=await image.metadata(),{data,info}=await image.ensureAlpha().raw().toBuffer({resolveWithObject:true}),w=info.width,h=info.height;
  const alpha=asset.tipo==='sprite',columns=alpha?1:asset.columnas,projection=new Array(w).fill(0);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(maskPixel(data,(y*w+x)*4,alpha))projection[x]++;
  const cuts=[0],cell=w/columns,scene=asset.categoria==='clima';
  for(let i=1;i<columns;i++){
    let cut=Math.round(cell*i);
    if(!fixed.has(asset.categoria)){
      const begin=Math.max(cuts.at(-1)+8,Math.round(cell*(i-.46))),end=Math.min(w-8,Math.round(cell*(i+.46))),gaps=[];
      let start=-1;for(let x=begin;x<=end;x++){if(projection[x]<=Math.max(1,h*.002)){if(start<0)start=x;}else if(start>=0){gaps.push([start,x-1]);start=-1;}}
      if(start>=0)gaps.push([start,end]);
      const best=gaps.map(([l,r])=>({mid:(l+r)/2,score:(r-l+1)/(1+Math.abs((l+r)/2-cut)/cell)})).sort((a,b)=>b.score-a.score)[0];
      if(best)cut=Math.round(best.mid);
    }
    cuts.push(cut);
  }
  cuts.push(w);
  const regiones=[],warnings=[];
  for(let i=0;i<columns;i++){
    const left=cuts[i],right=cuts[i+1];let x0=right,y0=h,x1=left,y1=0;
    for(let y=0;y<h;y++)for(let x=left;x<right;x++)if(maskPixel(data,(y*w+x)*4,alpha)){
      x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
    }
    if(scene){x0=left;x1=right-1;y0=0;y1=h-1;}
    if(x1<x0||y1<y0)throw Error('Región vacía: '+asset.id+' / '+i);
    if(!scene&&(x0<=left+1||x1>=right-2))warnings.push(i);
    // Un margen corto conserva el antialias sin admitir el objeto vecino.
    const pad=2,rx=Math.max(left,x0-pad),ry=Math.max(0,y0-pad),rx1=Math.min(right-1,x1+pad),ry1=Math.min(h-1,y1+pad);
    regiones.push({x:rx,y:ry,w:rx1-rx+1,h:ry1-ry+1,base:scene?h-1:y1});
  }
  // Las tres toallas comparten cuerpo y altura en el original. El charco
  // de la tercera se conserva por debajo de la base, sin levantar la toalla.
  if(asset.id==='toallas')regiones[2].base=Math.round((regiones[0].base+regiones[1].base)/2);
  return {ancho:w,alto:h,regiones,escena:scene,cortes:cuts,advertencias:warnings};
}
(async()=>{
  const result={};for(const a of assets){result[a.id]=await medir(a);if(result[a.id].advertencias.length)console.log('Revisar bordes:',a.id,result[a.id].advertencias);}
  fs.writeFileSync(path.join(app,'recortes.js'),'// Generado por tools/medir_recortes_objetos.cjs. Coordenadas sobre las imágenes originales.\nwindow.RECORTES_OBJETOS = '+JSON.stringify(result,null,2)+';\n');
  if(process.argv.includes('--revision')){
    for(let sheet=0;sheet<Math.ceil(assets.length/8);sheet++){
      const group=assets.slice(sheet*8,sheet*8+8),layers=[];
      for(let j=0;j<group.length;j++){
        const a=group[j],m=result[a.id],rs=m.regiones,maxW=Math.max(...rs.map(r=>r.w)),maxH=Math.max(...rs.map(r=>r.h)),scale=Math.min(156/maxW,150/maxH),base=Math.floor(j/4)*205;
        for(let i=0;i<rs.length;i++){
          const r=rs[i],ww=Math.max(1,Math.round(r.w*scale)),hh=Math.max(1,Math.round(r.h*scale)),xx=j%4*480+i*160+Math.round((160-ww)/2);
          const tile=await sharp(path.resolve(app,a.src)).extract({left:r.x,top:r.y,width:r.w,height:r.h}).resize(ww,hh).flatten({background:'#fff'}).png().toBuffer();
          layers.push({input:tile,left:xx,top:base+158-hh});
        }
        const label=Buffer.from(`<svg width="480" height="40"><path d="M0 1h480" stroke="#9dbacb"/><rect y="8" width="480" height="30" fill="#edf3f7"/><text x="6" y="28" font-family="Arial" font-size="15">${a.id}</text></svg>`);
        layers.push({input:label,left:j%4*480,top:base+160});
      }
      await sharp({create:{width:1920,height:410,channels:3,background:'#fff'}}).composite(layers).png().toFile(path.join(app,`.recortes-revision-${sheet}.png`));
    }
  }
  console.log(assets.length+' imágenes medidas.');
})().catch(e=>{console.error(e);process.exitCode=1;});
