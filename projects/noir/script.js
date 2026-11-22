import * as T from './vendor/three.module.min.js';

const canvas = document.querySelector('.watch-canvas');
const experience = document.querySelector('.experience');
const stage = document.querySelector('.stage');
const chapters = [...document.querySelectorAll('.chapter')];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (value) => Math.min(1, Math.max(0, value));

// Every pose is determined by a frame on a 60 fps timeline, including when reversed.
const lastFrame = 480;
function cue(frame, start, end) {
  const t = clamp((frame - start) / (end - start));
  return t * t * (3 - 2 * t);
}

let renderWatch = () => {};
let targetFrame = 0;
let displayedFrame = 0;
let request = 0;
let previousTime = 0;

function measureScroll() {
  const distance = Math.max(1, experience.offsetHeight - stage.offsetHeight);
  const position = -experience.getBoundingClientRect().top / distance;
  targetFrame = clamp(position / .91) * lastFrame;
  const exit = clamp((position - .91) / .09);
  stage.style.setProperty('--progress', clamp(position));
  stage.style.setProperty('--art-exit', `${-exit * stage.offsetHeight * .45}px`);

  const firstChange = cue(targetFrame, 49, 118);
  const secondChange = cue(targetFrame, 224, 316);
  const weights = [1 - firstChange, firstChange * (1 - secondChange), secondChange];
  const shifts = [-firstChange, 1 - firstChange - secondChange, 1 - secondChange];
  chapters.forEach((chapter, i) => {
    chapter.style.opacity = weights[i];
    chapter.style.setProperty('--shift', `${reduceMotion.matches ? 0 : shifts[i] * 72}px`);
    const active = weights[i] > .5;
    chapter.classList.toggle('is-active', active);
    // Keep the opening link keyboard reachable at the start of the scene.
    chapter.inert = !active;
  });
  if (!request) request = requestAnimationFrame(draw);
}

function draw(now) {
  request = 0;
  const delta = previousTime ? Math.min(now - previousTime, 50) : 16;
  previousTime = now;
  displayedFrame += (targetFrame - displayedFrame) * (1 - Math.exp(-delta / 95));
  if (Math.abs(displayedFrame - targetFrame) < .25) displayedFrame = targetFrame;
  renderWatch(reduceMotion.matches ? 0 : displayedFrame);
  if (displayedFrame !== targetFrame && !reduceMotion.matches) request = requestAnimationFrame(draw);
  else previousTime = 0;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function imageMap(image, x, y, w, h) {
  const sheet = document.createElement('canvas');
  sheet.width = sheet.height = 512;
  const context = sheet.getContext('2d');
  context.fillStyle = '#151514';
  context.fillRect(0, 0, 512, 512);
  context.drawImage(image, x, y, w, h, 0, 0, 512, 512);
  const map = new T.CanvasTexture(sheet);
  map.colorSpace = T.SRGBColorSpace;
  map.anisotropy = 8;
  return map;
}

function studioEnvironment(renderer) {
  const panorama = document.createElement('canvas');
  panorama.width = 512;
  panorama.height = 256;
  const context = panorama.getContext('2d');
  context.fillStyle = '#282b2a';
  context.fillRect(0, 0, 512, 256);
  const panels = [
    [76, 60, 45, 107, '#eef5ff'],
    [166, 52, 12, 142, '#aab5bf'],
    [276, 113, 88, 33, '#e7dbc4'],
    [422, 62, 28, 97, '#f6fcff'],
  ];
  for (const [x, y, w, h, color] of panels) {
    context.shadowColor = color;
    context.shadowBlur = 16;
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
  }
  const map = new T.CanvasTexture(panorama);
  map.colorSpace = T.SRGBColorSpace;
  map.mapping = T.EquirectangularReflectionMapping;
  const pmrem = new T.PMREMGenerator(renderer);
  const environment = pmrem.fromEquirectangular(map);
  pmrem.dispose();
  map.dispose();
  return environment;
}

async function createWatch() {
  const parts = await loadImage('watch-parts.png');
  const renderer = new T.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  const scene = new T.Scene();
  scene.environment = studioEnvironment(renderer).texture;
  scene.add(new T.HemisphereLight(0xf0f5ff, 0x474033, 1.75));
  const key = new T.DirectionalLight(0xfff5e5, 2.5);
  key.position.set(-4, 6, 7);
  const rim = new T.DirectionalLight(0xe1eeff, 2.1);
  rim.position.set(3, 1, -4);
  scene.add(key, rim);

  const camera = new T.PerspectiveCamera(34, 1, .1, 40);
  camera.position.z = 9;
  const rig = new T.Group();
  scene.add(rig);
  const steel = new T.MeshStandardMaterial({color:0xc3c8cc, metalness:1, roughness:.24});
  const polish = new T.MeshStandardMaterial({color:0xe2e6e9, metalness:1, roughness:.14});
  const inner = new T.MeshStandardMaterial({color:0x6d7376, metalness:.92, roughness:.36});
  const glass = new T.MeshPhysicalMaterial({color:0xb8d5d5, metalness:.25, roughness:.09, transparent:true, opacity:.14, depthWrite:false, side:T.DoubleSide});
  const leather = new T.MeshStandardMaterial({map:imageMap(parts,1455,41,150,165), roughness:.82});
  const strapSide = new T.MeshStandardMaterial({color:0x302821, roughness:.88});
  const dialTexture = imageMap(parts, 667, 270, 315, 315);
  const movementTexture = imageMap(parts, 1006, 273, 307, 309);

  function mesh(parent, geometry, material, x=0, y=0, z=0) {
    const object = new T.Mesh(geometry, material);
    object.position.set(x,y,z);
    parent.add(object);
    return object;
  }

  function ring(parent, profile, material) {
    const geometry = new T.LatheGeometry(profile.map(([radius,z])=>new T.Vector2(radius,z)), 100);
    const object = mesh(parent, geometry, material);
    object.rotation.x = Math.PI / 2;
    return object;
  }

  function disk(parent, radius, depth, material, z) {
    const object = mesh(parent, new T.CylinderGeometry(radius,radius,depth,96), material, 0, 0, z);
    object.rotation.x = Math.PI / 2;
    return object;
  }

  function face(parent, radius, map, z, reverse=false) {
    const object = mesh(parent, new T.CircleGeometry(radius,96), new T.MeshBasicMaterial({map, toneMapped:false}), 0,0,z);
    if (reverse) object.rotation.y = Math.PI;
    return object;
  }

  function strapGeometry(sign) {
    const vertices = [], uv = [], indices = [];
    const n = 32;
    for(let i=0;i<=n;i++){
      const t=i/n;
      const width=(.54-.12*t)*Math.sqrt(1-.58*Math.pow(t,18));
      const y=sign*(1.08+1.44*t-.13*t*t*t);
      const z=-.06-1.20*t*t;
      for(const side of [-1,1]){
        vertices.push(side*width,y,z);
        uv.push((side+1)/2,1-t);
      }
    }
    for(let i=0;i<n;i++){
      const a=i*2;
      indices.push(a,a+1,a+2,a+1,a+3,a+2);
    }
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
    geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  function strap(sign) {
    const geometry=strapGeometry(sign);
    leather.side=T.DoubleSide;
    strapSide.side=T.DoubleSide;
    mesh(rig,geometry,leather);
    mesh(rig,geometry,strapSide,0,0,-.045);
    const stitch = new T.MeshStandardMaterial({color:0x7f7872,roughness:.9});
    for(let i=0;i<21;i++){
      const t=(i+.8)/22;
      const y=sign*(1.08+1.44*t-.13*t*t*t);
      const z=-.052-1.20*t*t;
      for(const side of [-1,1]){
        const x=side*((.54-.12*t)*Math.sqrt(1-.58*Math.pow(t,18))-.062);
        mesh(rig,new T.CapsuleGeometry(.008,.031,2,4),stitch,x,y,z).rotation.x=sign*-.38;
      }
    }
  }

  strap(1);
  strap(-1);
  for(const x of [-.53,.53]){
    for(const y of [-1,1]){
      const lug = mesh(rig,new T.CapsuleGeometry(.12,.39,7,14),steel,x,y*1.06,-.08);
      lug.rotation.z=x*y*.45;
      lug.rotation.x=y*.36;
    }
  }

  ring(rig,[[.85,-.20],[.96,-.24],[1.034,-.17],[1.056,-.08],[1.056,.115],[1.025,.22],[.945,.232],[.89,.17],[.85,-.20]],steel);
  ring(rig,[[.72,-.229],[.9,-.229],[.92,-.25],[.9,-.272],[.72,-.272],[.72,-.229]],polish);
  disk(rig,.876,.044,inner,-.203);
  face(rig,.73,movementTexture,-.246,true);

  const crown = mesh(rig,new T.CylinderGeometry(.133,.139,.24,36),polish,1.114,0,0);
  crown.rotation.z=Math.PI/2;
  for(let i=0;i<24;i++){
    const angle=i/24*Math.PI*2;
    mesh(rig,new T.BoxGeometry(.15,.021,.019),inner,1.15,Math.sin(angle)*.133,Math.cos(angle)*.133).rotation.x=-angle;
  }

  const mechanism = new T.Group();
  const dial = new T.Group();
  const crystal = new T.Group();
  const bezel = new T.Group();
  rig.add(mechanism,dial,crystal,bezel);

  disk(mechanism,.882,.14,steel,.055);
  face(mechanism,.86,movementTexture,.132);
  face(mechanism,.86,movementTexture,-.02,true);
  disk(dial,.884,.06,inner,.207);
  face(dial,.879,dialTexture,.24);
  disk(crystal,.933,.027,glass,.291);
  ring(bezel,[[.917,.248],[1.032,.236],[1.051,.261],[1.014,.313],[.931,.313],[.917,.289],[.917,.248]],polish);

  function resize() {
    const width=canvas.clientWidth, height=canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width,height,false);
    camera.aspect=width/height;
    camera.updateProjectionMatrix();
    measureScroll();
  }
  new ResizeObserver(resize).observe(canvas);

  renderWatch = (frame) => {
    const intro = cue(frame, 0, 110);
    const turn = cue(frame, 95, 226);
    const reveal = cue(frame, 252, 379);
    const finish = cue(frame, 378, 454);
    const mobile = matchMedia('(max-width:740px)').matches;
    const exploded = cue(frame, 121, 300);
    const aspectLimit = (mobile ? .99 : 1.00) + exploded * .20;
    const narrow = Math.min(1, camera.aspect / aspectLimit);
    rig.rotation.set(-.085 + intro * .13 + reveal * .17 - finish * .12,
      .13 - turn * 1.18 - reveal * .29 + finish * .23,
      -.068 + intro * .085 - reveal * .11 + finish * .07);
    const zoom = (1 + reveal * (mobile ? .07 : .18) - finish * .10) * narrow;
    rig.scale.setScalar(zoom);
    rig.position.set((mobile ? .73 : .91) * exploded * narrow, .16 + reveal*.12, 0);
    bezel.position.z=2.79 * cue(frame, 139, 292);
    crystal.position.z=2.13 * cue(frame, 152, 300);
    dial.position.z=1.43 * cue(frame, 173, 316);
    mechanism.position.z=.66 * cue(frame, 202, 328);
    camera.position.z=9.45-intro*.48;
    renderer.render(scene,camera);
  };

  canvas.addEventListener('webglcontextlost', () => stage.classList.remove('scene-ready'));
  canvas.addEventListener('webglcontextrestored', () => {
    renderWatch(displayedFrame);
    stage.classList.add('scene-ready');
  });
  resize();
  renderWatch(displayedFrame);
  stage.classList.add('scene-ready');
}

addEventListener('scroll',measureScroll,{passive:true});
addEventListener('resize',measureScroll);
reduceMotion.addEventListener('change',measureScroll);
measureScroll();
createWatch().catch((error) => console.warn('NOIR 3D preview unavailable',error));
