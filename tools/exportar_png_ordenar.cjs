/* Recorta las láminas generadas y prepara PNG individuales.
   Solo normaliza con escala uniforme: nunca estira los dibujos. */
const fs=require('fs'),path=require('path'),vm=require('vm'),sharp=require('sharp');
const app=path.resolve(__dirname,'../Ordenar_Objetos_Tamano'),source=path.join(app,'imagenes/fuentes-png'),out=path.join(app,'imagenes/png');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(app,'series.js'),'utf8'),context);
const familias=context.window.ORDENAR_FAMILIAS,version='20261107-png-1',parcial=process.argv.includes('--parcial');
fs.mkdirSync(out,{recursive:true});
const alpha={r:0,g:0,b:0,alpha:0};
async function recortar(image){
 const {data,info}=await sharp(image).ensureAlpha().raw().toBuffer({resolveWithObject:true});let left=info.width,top=info.height,right=-1,bottom=-1;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>32){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 if(right<left)throw Error('Imagen vacía');
 left=Math.max(0,left-3);top=Math.max(0,top-3);right=Math.min(info.width-1,right+3);bottom=Math.min(info.height-1,bottom+3);
 const width=right-left+1,height=bottom-top+1;
 return {data:await sharp(image).extract({left,top,width,height}).png().toBuffer(),width,height};
}
const divisiones=new Map();
async function division(file){
 if(!divisiones.has(file))divisiones.set(file,(async()=>{
  const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});let inicio=-1,mejor=null;
  for(let y=Math.round(info.height*.35);y<Math.round(info.height*.75);y++){
   let pixeles=0;for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>32)pixeles++;
   if(pixeles<=2){if(inicio<0)inicio=y;}else if(inicio>=0){const fin=y-1;if(!mejor||fin-inicio>mejor.fin-mejor.inicio)mejor={inicio,fin};inicio=-1;}
  }
  if(inicio>=0){const fin=Math.round(info.height*.75)-1;if(!mejor||fin-inicio>mejor.fin-mejor.inicio)mejor={inicio,fin};}
  if(!mejor||mejor.fin-mejor.inicio<8)throw Error('Revisar separación entre filas: '+file);
  return {width:info.width,height:info.height,corte:Math.round((mejor.inicio+mejor.fin)/2)};
 })());return divisiones.get(file);
}
async function celda(file,i){const m=await division(file),left=Math.round((i%3)*m.width/3),top=i<3?0:m.corte,right=Math.round((i%3+1)*m.width/3),bottom=i<3?m.corte:m.height;return recortar(await sharp(file).extract({left,top,width:right-left,height:bottom-top}).png().toBuffer());}
async function PNG(data,width,height,frameWidth,frameHeight,file){const ww=Math.max(1,Math.round(width)),hh=Math.max(1,Math.round(height));const scaled=await sharp(data).resize(ww,hh,{fit:'inside'}).png().toBuffer();const meta=await sharp(scaled).metadata();await sharp({create:{width:frameWidth,height:frameHeight,channels:4,background:alpha}}).composite([{input:scaled,left:Math.round((frameWidth-meta.width)/2),top:frameHeight-meta.height-20}]).png({compressionLevel:9,adaptiveFiltering:true}).toFile(file);}
(async()=>{
 const reporte=[],faltan=[];
 for(const f of familias){
  if(f.archivo){const input=path.join(app,'imagenes',f.id+'.webp');await sharp(input).resize({width:512,height:512,fit:'inside',withoutEnlargement:true}).png({compressionLevel:9,adaptiveFiltering:true}).toFile(path.join(out,f.id+'.png'));reporte.push({id:f.id,original:true});continue;}
  const file=path.join(source,f.id+'.png');if(!fs.existsSync(file)){faltan.push(f.id);continue;}
  let cells=await Promise.all(Array.from({length:6},(_,i)=>celda(file,i))),dims=[];
  if(f.criterio==='tamano'){
   const master=cells[0],scale=Math.min(390/master.width,370/master.height);dims=cells.map((_,i)=>({width:master.width*scale*(1-i*.132),height:master.height*scale*(1-i*.132)}));cells=cells.map(()=>master);
  }else if(f.criterio==='inclinacion'){
   const master=cells[5],buf=await sharp(master.data).resize({height:355}).png().toBuffer();cells=await Promise.all(Array.from({length:6},async(_,i)=>recortar(await sharp(buf).rotate(65-i*13,{background:alpha}).png().toBuffer())));dims=cells.map(c=>({width:c.width,height:c.height}));
  }else{
   const isHeight=f.criterio==='altura',target=f.criterio==='longitud'?72:360;
   dims=cells.map(c=>{const s=isHeight?125/c.width:target/c.height;return {width:c.width*s,height:c.height*s};});
   const common=Math.min(1,450/Math.max(...dims.map(d=>d.width)),430/Math.max(...dims.map(d=>d.height)));dims=dims.map(d=>({width:d.width*common,height:d.height*common}));
  }
  const fw=Math.ceil(Math.max(...dims.map(d=>d.width)))+40,fh=Math.ceil(Math.max(...dims.map(d=>d.height)))+40;
  for(let rank=0;rank<6;rank++)await PNG(cells[rank].data,dims[rank].width,dims[rank].height,fw,fh,path.join(out,f.id+'-'+rank+'.png'));
  const valores=dims.map(d=>f.criterio==='altura'?d.height:d.width);
  if(['grosor','longitud','altura','anchura','tamano'].includes(f.criterio)&&valores.some((v,i)=>i&&v>=valores[i-1]-1))throw Error('Revisar progresión: '+f.id+' '+valores.map(Math.round));
  reporte.push({id:f.id,criterio:f.criterio,frame:[fw,fh],dibujos:dims.map(d=>({width:Math.round(d.width),height:Math.round(d.height)}))});
 }
 fs.writeFileSync(path.join(source,'revision.json'),JSON.stringify({reporte,faltan},null,2));
 if(faltan.length&&!parcial)throw Error('Faltan '+faltan.length+' familias: '+faltan.join(', '));
 if(!parcial){const catalogo=familias.map(f=>f.archivo?{...f,archivo:'imagenes/png/'+f.id+'.png',version}:{...f,imagenes:Array.from({length:6},(_,i)=>'imagenes/png/'+f.id+'-'+i+'.png'),version});fs.writeFileSync(path.join(app,'series.js'),'// PNG generados con la herramienta integrada. Preparados por tools/exportar_png_ordenar.cjs.\nwindow.ORDENAR_CRITERIOS = '+JSON.stringify(context.window.ORDENAR_CRITERIOS,null,2)+';\nwindow.ORDENAR_FAMILIAS = '+JSON.stringify(catalogo,null,2)+';\n');}
 console.log(`${reporte.length} familias preparadas; ${faltan.length} pendientes.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
