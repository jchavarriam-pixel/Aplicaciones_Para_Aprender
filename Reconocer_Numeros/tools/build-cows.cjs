// Original vector artwork and rigs. Render 24 transparent frames per animation.
const sharp=require('sharp');
const fs=require('node:fs');
const path=require('node:path');
const out=path.join(__dirname,'..','assets');
const styles=[
  {id:'clasica',body:'#fffdf4',spot:'#3e475e',edge:'#30394e',muzzle:'#f4b5c3',ear:'#edc4ce',hoof:'#424452'},
  {id:'caramelo',body:'#c58b58',spot:'#fff0cf',edge:'#754e36',muzzle:'#edb8a6',ear:'#e9baa3',hoof:'#704d3a'},
  {id:'dorada',body:'#edc569',spot:'#fff8df',edge:'#8e6535',muzzle:'#f0b3b7',ear:'#eeb6ad',hoof:'#8b633e'},
  {id:'lavanda',body:'#b7a6e4',spot:'#f8f1ff',edge:'#69558f',muzzle:'#edb6d4',ear:'#e0b8e0',hoof:'#675581'}
];
function cow(s,phase,walking){
  const swing=walking?Math.sin(phase)*17:0,bob=walking?Math.sin(phase*2)*2:.6*Math.sin(phase),head=walking?Math.sin(phase)*2.5:Math.sin(phase)*1.2;
  const leg=(x,y,angle,back)=>`<g transform="translate(${x} ${y}) rotate(${angle})"><rect x="-8" y="-2" width="17" height="47" rx="8" fill="${back?s.spot:s.body}" stroke="${s.edge}" stroke-width="4"/><path d="M-9 33 Q1 29 11 34 L12 44 Q1 49 -10 44Z" fill="${s.hoof}" stroke="${s.edge}" stroke-width="3"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">
  <defs><clipPath id="body"><ellipse cx="145" cy="133" rx="81" ry="49"/></clipPath></defs>
  <ellipse cx="158" cy="215" rx="112" ry="8" fill="#254731" opacity=".12"/>
  <g transform="translate(0 ${bob})" stroke-linecap="round" stroke-linejoin="round">
    <g transform="rotate(${Math.sin(phase)*27} 72 124)"><path d="M72 124 C44 130 37 108 35 84" fill="none" stroke="${s.edge}" stroke-width="8"/><path d="M35 90 Q18 77 31 65 Q47 68 42 86Z" fill="${s.hoof}" stroke="${s.edge}" stroke-width="3"/></g>
    ${leg(109,158,-swing,true)}${leg(190,158,swing,true)}
    <ellipse cx="145" cy="133" rx="81" ry="49" fill="${s.body}" stroke="${s.edge}" stroke-width="5"/>
    <g clip-path="url(#body)" fill="${s.spot}"><path d="M62 102 Q84 90 104 104 Q115 120 99 134 Q82 145 67 130Z"/><path d="M138 85 Q172 85 180 102 Q190 119 174 126 Q151 136 140 119 Q124 110 138 85Z"/><path d="M106 161 Q118 144 137 152 Q157 159 153 181 L103 187Z"/><path d="M197 140 Q228 133 234 165 L193 188 Q180 163 197 140Z"/></g>
    <path d="M81 135 Q74 119 86 109" fill="none" stroke="white" stroke-width="6" opacity=".55"/>
    <ellipse cx="170" cy="176" rx="20" ry="9" fill="${s.muzzle}" stroke="${s.edge}" stroke-width="3"/>
    ${leg(88,162,swing,false)}${leg(168,162,-swing,false)}
    <g transform="rotate(${head} 224 112)">
      <path d="M208 72 Q197 53 210 48 L222 76 M239 69 Q239 47 251 48 L253 78" fill="#f8e4b5" stroke="${s.edge}" stroke-width="4"/>
      <ellipse cx="200" cy="86" rx="23" ry="12" transform="rotate(-25 200 86)" fill="${s.body}" stroke="${s.edge}" stroke-width="4"/>
      <ellipse cx="259" cy="86" rx="22" ry="12" transform="rotate(25 259 86)" fill="${s.body}" stroke="${s.edge}" stroke-width="4"/>
      <path d="M184 87 Q198 80 212 83 Q200 94 190 93" fill="${s.ear}"/><path d="M246 84 Q262 82 275 91 Q258 97 246 84" fill="${s.ear}"/>
      <ellipse cx="230" cy="105" rx="34" ry="39" fill="${s.body}" stroke="${s.edge}" stroke-width="5"/>
      <path d="M204 83 Q204 70 218 69 Q226 77 218 86 Q210 91 204 83" fill="${s.spot}"/>
      <path d="M215 70 Q225 57 229 69 Q241 58 244 73 Q229 68 215 74" fill="${s.spot}" stroke="${s.edge}" stroke-width="3"/>
      <ellipse cx="219" cy="102" rx="7" ry="10" fill="#28313f"/><ellipse cx="244" cy="102" rx="7" ry="10" fill="#28313f"/>
      <circle cx="221" cy="98" r="2.6" fill="white"/><circle cx="246" cy="98" r="2.6" fill="white"/>
      <ellipse cx="238" cy="130" rx="35" ry="23" fill="${s.muzzle}" stroke="${s.edge}" stroke-width="4"/>
      <ellipse cx="224" cy="127" rx="4" ry="5" fill="${s.edge}" transform="rotate(-15 224 127)"/><ellipse cx="250" cy="127" rx="4" ry="5" fill="${s.edge}" transform="rotate(15 250 127)"/>
      <path d="M229 140 Q240 148 250 138" fill="none" stroke="${s.edge}" stroke-width="3"/>
      <ellipse cx="215" cy="135" rx="7" ry="4" fill="white" opacity=".25"/>
    </g>
  </g></svg>`;
}
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  for(const s of styles){
    fs.writeFileSync(path.join(out,`vaca-${s.id}.svg`),cow(s,0,false));
    for(const walking of [false,true]){
      const frames=[];
      for(let i=0;i<24;i++)frames.push({input:Buffer.from(cow(s,i/24*Math.PI*2,walking)),left:0,top:i*240});
      await sharp({create:{width:320,height:240*24,channels:4,background:'#00000000'}}).composite(frames).png().toFile(path.join(out,`.vaca-${s.id}-${walking?'caminar':'quieta'}-frames.png`));
    }
  }
  console.log('Vector rigs and frame sheets ready.');
})();
