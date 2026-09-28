/* Animate only the exposed rubber treads of robot.png; never regenerate the robot. */
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');

// Measured on this approved 1254px sprite, inside the rails and body overlaps.
// x coordinates follow the exposed belt, not the neighbouring chassis.
const OUTER = [[234,203],[300,197],[400,190],[500,185],[650,180],[800,179],[930,182],[1000,186],[1060,203]];
const INNER = [[234,327],[300,325],[400,323],[490,320],[520,308],[542,298],[638,298],[660,310],[700,315],[800,317],[950,321],[1060,328]];
const FULL_INNER = [[234,327],[400,323],[700,315],[1060,328]];
function at(points, y) {
  for (let k = 1; k < points.length; k++) {
    if (y <= points[k][0]) {
      const [y0,x0] = points[k-1], [y1,x1] = points[k];
      return x0 + (x1-x0)*(y-y0)/(y1-y0);
    }
  }
  return points.at(-1)[1];
}
function maskAt(data, width, x, y) {
  if (y < 234 || y > 1060) return 0;
  const side = x < width/2 ? 0 : 1;
  const localX = side ? width-x : x;
  const edge = Math.min(localX-at(OUTER,y), at(INNER,y)-localX, y-234, 1060-y);
  if (edge <= 1.5) return 0;
  const i = (y*width+x)*4;
  const color = data.subarray(i,i+3);
  if (data[i+3] < 245 || Math.max(...color)-Math.min(...color) > 22) return 0;
  return Math.min(1,(edge-1.5)/2);
}

async function generate() {
  const { data, info } = await sharp(path.join(root, 'robot.png')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== 1254 || info.height !== 1254) throw new Error('The crop is specific to the approved 1254 × 1254 robot.png.');
  const { width, height } = info;
  const frameCount = 16, period = 80, delay = 40;
  const pixels = [];
  const overlay = Buffer.from(data);
  for (let y = 200; y < 1080; y++) {
    for (let x = 150; x < 1110; x++) {
      const alpha = maskAt(data, width, x, y);
      if (alpha) {
        const i = (y * info.width + x) * 4;
        overlay[i] = Math.round(overlay[i]*.45); overlay[i + 1] = 150; overlay[i + 2] = Math.round(overlay[i + 2]*.45);
        const side = x < width/2 ? 0 : 1;
        const localX = side ? width-x : x;
        pixels.push({ i, y, side, alpha, u: (localX-at(OUTER,y))/(at(FULL_INNER,y)-at(OUTER,y)) });
      }
    }
  }
  function sample(u, y, side, channel) {
    const localX = at(OUTER,y) + u*(at(FULL_INNER,y)-at(OUTER,y));
    const x = side ? width-localX : localX;
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x-x0, fy = y-y0;
    const a = data[(y0*width+x0)*4+channel]*(1-fx)+data[(y0*width+x0+1)*4+channel]*fx;
    const b = data[((y0+1)*width+x0)*4+channel]*(1-fx)+data[((y0+1)*width+x0+1)*4+channel]*fx;
    return a*(1-fy)+b*fy;
  }
  let tileTop = 320, best = Infinity;
  for (let y = 300; y <= 405; y++) {
    let error = 0;
    for (let u = .03; u < .98; u += .03) {
      error += Math.abs(sample(u,y,0,0)-sample(u,y+period,0,0));
      error += Math.abs(sample(u,y,1,0)-sample(u,y+period,1,0));
    }
    if (error < best) { best = error; tileTop = y; }
  }
  function tread(u, phase, side, channel) {
    const t = ((phase%period)+period)%period;
    let value = sample(u,tileTop+t,side,channel);
    // A tiny overlap joins the last six pixels to the next tread seamlessly.
    if (t > period-6) {
      const a = (t-(period-6))/6, mix = a*a*(3-2*a);
      value = value*(1-mix)+sample(u,tileTop+t-period,side,channel)*mix;
    }
    return value;
  }
  const frames = Buffer.alloc(data.length*frameCount);
  const trackFrames = Buffer.alloc(data.length*frameCount);
  for (let frame = 0; frame < frameCount; frame++) {
    const out = frames.subarray(frame*data.length,(frame+1)*data.length);
    const tracks = trackFrames.subarray(frame*data.length,(frame+1)*data.length);
    data.copy(out);
    for (const p of pixels) {
      // Play the original sequence in reverse, without changing the crop.
      const sourceFrame = frameCount-1-frame;
      const phase = p.y-tileTop-sourceFrame*period/frameCount;
      for (let channel = 0; channel < 3; channel++) {
        const value = tread(p.u,phase,p.side,channel);
        out[p.i+channel] = Math.round(data[p.i+channel]*(1-p.alpha)+value*p.alpha);
        tracks[p.i+channel] = Math.round(value);
      }
      tracks[p.i+3] = Math.round(p.alpha*255);
      // Keep the original alpha: no black background or changing silhouette.
    }
  }
  const raw = { width, height: height*frameCount, channels: 4, pageHeight: height };
  // RobotLab overlays only this cropped belt layer on the unchanged PNG.
  const delays = Array(frameCount).fill(delay);
  await sharp(trackFrames,{raw}).webp({lossless:true,exact:true,effort:4,loop:0,delay:delays}).toFile(path.join(root,'robot_orugas_movimiento.webp'));
  await sharp(frames,{raw}).gif({colours:256,dither:0,effort:7,loop:0,delay:delays,interFrameMaxError:0,interPaletteMaxError:256}).toFile(path.join(root,'robot_movimiento.gif'));
  if (process.argv.includes('--qa')) {
    await sharp(overlay,{raw:{width,height,channels:4}}).png().toFile(path.join(root,'.qa_track_mask.png'));
    await sharp(frames.subarray(0,data.length),{raw:{width,height,channels:4}}).png().toFile(path.join(root,'.qa_track_frame.png'));
  }
  const allowed = new Set(pixels.map(p => p.i/4));
  for (let frame = 0; frame < frameCount; frame++) {
    const out = frames.subarray(frame*data.length,(frame+1)*data.length);
    for (let i = 0; i < data.length; i += 4) {
      if (!allowed.has(i/4) && !data.subarray(i,i+4).equals(out.subarray(i,i+4))) throw new Error('A pixel outside the tread mask changed.');
    }
  }
  console.log(JSON.stringify({ width,height,frames:frameCount,delay,loop:0,tileTop,animatedPixels:pixels.length,outsideMaskChanges:0 }));
}

module.exports = { maskAt };
if (require.main === module) generate().catch(error => { console.error(error); process.exitCode = 1; });
