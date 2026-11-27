/*
 * Cloth.js — one "cloth" = a 33×25 vertex mesh with a small verlet/spring simulation,
 * a custom shader, and motion-trail echoes. Used for every poster AND for the gallery cloth.
 * This is the original physics, moved over unchanged (only wrapped as a module).
 */
import * as THREE from 'three';
import { clamp, rng } from './utils.js';

/* ---------- cloth textures from your images ---------- */
function makeTexture(d, idx){
  const w=893,h=630, c=document.createElement('canvas'); c.width=w;c.height=h;
  const g=c.getContext('2d'), r=rng(idx*977+13);
  g.imageSmoothingQuality='high';
  if(d.el)g.drawImage(d.el,0,0,w,h);else{g.fillStyle=d.bg;g.fillRect(0,0,w,h);}
  // fine woven threads + grain
  g.fillStyle='rgba(0,0,0,.06)';for(let y=0;y<h;y+=3)g.fillRect(0,y,w,1);
  g.fillStyle='rgba(255,255,255,.05)';for(let x=0;x<w;x+=3)g.fillRect(x,0,1,h);
  for(let i=0;i<4500;i++){g.fillStyle=r()>.5?'rgba(255,255,255,.05)':'rgba(0,0,0,.05)';g.fillRect(r()*w,r()*h,1+r()*2,1+r()*2);}
  const t=new THREE.CanvasTexture(c);
  t.anisotropy=4; t.minFilter=THREE.LinearMipmapLinearFilter;
  return t;
}

/* ---------- shaders ---------- */
const VERT=`
varying vec2 vUv; varying vec3 vN;
void main(){ vUv=uv; vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const FRAG=`
uniform sampler2D map; uniform float uA; uniform vec3 uBg; uniform float uMix; uniform vec3 uTint;
varying vec2 vUv; varying vec3 vN;
void main(){
  vec4 t=texture2D(map,vUv);
  vec3 base=mix(t.rgb,uBg,uMix)*uTint;          // calms the pattern on the detail page
  vec3 n=normalize(vN);
  bool front=gl_FrontFacing;
  if(!front) n=-n;
  vec3 L=normalize(vec3(-0.35,0.55,0.75));
  float d=max(dot(n,L),0.0);
  float shade=0.34+0.72*d;
  vec3 col=base*shade;
  float sheen=pow(1.0-abs(n.z),2.4)*0.2;
  col+=vec3(sheen);
  if(!front) col=mix(col,vec3(dot(col,vec3(.33))),.4)*0.85;
  gl_FragColor=vec4(col,uA);
}`;

/* ---------- cloth ---------- */
export const COLS=33, ROWS=25, NP=COLS*ROWS;
const idxArr=[];
for(let j=0;j<ROWS-1;j++)for(let k=0;k<COLS-1;k++){const a=j*COLS+k,b=a+1,c=a+COLS,e=c+1;idxArr.push(a,c,b,b,c,e);}
const uvArr=new Float32Array(NP*2);
for(let j=0;j<ROWS;j++)for(let k=0;k<COLS;k++){const m=j*COLS+k;uvArr[m*2]=k/(COLS-1);uvArr[m*2+1]=1-j/(ROWS-1);}
const PAIRS=[];
for(let j=0;j<ROWS;j++)for(let k=0;k<COLS;k++){
  const m=j*COLS+k;
  if(k<COLS-1)PAIRS.push(m,m+1);
  if(j<ROWS-1)PAIRS.push(m,m+COLS);
  if(k<COLS-1&&j<ROWS-1){PAIRS.push(m,m+COLS+1);PAIRS.push(m+1,m+COLS);}
  if(k<COLS-2)PAIRS.push(m,m+2);
  if(j<ROWS-2)PAIRS.push(m,m+2*COLS);
}
const NPAIR=PAIRS.length/2;
const CENTER=Math.floor(ROWS/2)*COLS+Math.floor(COLS/2);
const CORNERS=[0,COLS-1,(ROWS-1)*COLS,NP-1];     // the four corner vertices
const RING=8, LAGS=[3,7];

function mkGeo(){
  const g=new THREE.BufferGeometry();
  g.setAttribute('uv',new THREE.BufferAttribute(uvArr.slice(),2)); g.setIndex(idxArr);
  g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e5);
  return g;
}
const mkUniforms=(tex,bg,a,tint)=>({map:{value:tex},uA:{value:a},uBg:{value:new THREE.Color(bg)},uMix:{value:0},uTint:{value:new THREE.Color(tint||'#ffffff')}});

export class Poster {
  constructor(i,d){
    this.i=i;this.d=d;
    this.p=new Float32Array(NP*3);this.q=new Float32Array(NP*3);
    this.rest=new Float32Array(NP*3);this.bil=new Float32Array(NP);this.bil2=new Float32Array(NP);
    this.ldx=new Float32Array(NPAIR);this.ldy=new Float32Array(NPAIR);this.Lc=new Float32Array(NPAIR);
    this.lsx=-1;this.lsy=-1;
    this.o=0;this.lastAx=0;this.init=false;this.ph=i*1.7;this.speed=0;this.kick=0;this.layer=1;this.a=1;this.scene=new THREE.Scene();this.tintT=new THREE.Color(d.tint||'#ffffff');
    this.geo=mkGeo();
    this.posAttr=new THREE.BufferAttribute(this.p,3);this.posAttr.setUsage(THREE.DynamicDrawUsage);
    this.geo.setAttribute('position',this.posAttr);
    this.nAttr=new THREE.BufferAttribute(new Float32Array(NP*3),3);
    this.geo.setAttribute('normal',this.nAttr);
    this.tex=makeTexture(d,i);
    this.mat=new THREE.ShaderMaterial({vertexShader:VERT,fragmentShader:FRAG,side:THREE.DoubleSide,transparent:true,
      uniforms:mkUniforms(this.tex,'#ffffff',1,d.tint)});
    this.mesh=new THREE.Mesh(this.geo,this.mat);this.mesh.frustumCulled=false;this.mesh.renderOrder=2;
    this.scene.add(this.mesh);          // every cloth lives in its own scene
    // motion-trail echoes
    this.ring=[];this.rh=0;
    this.echoes=LAGS.map(lag=>{
      const g=mkGeo();const pa=new THREE.BufferAttribute(new Float32Array(NP*3),3),na=new THREE.BufferAttribute(new Float32Array(NP*3),3);
      g.setAttribute('position',pa);g.setAttribute('normal',na);
      const mat=new THREE.ShaderMaterial({vertexShader:VERT,fragmentShader:FRAG,side:THREE.DoubleSide,transparent:true,depthWrite:false,
        uniforms:mkUniforms(this.tex,'#ffffff',0,d.tint)});
      const m=new THREE.Mesh(g,mat);m.frustumCulled=false;m.renderOrder=0;m.visible=false;this.scene.add(m);
      return {lag,pa,na,mat,m};
    });
  }
  layout(w,h){
    this.w=w;this.h=h;
    for(let j=0;j<ROWS;j++)for(let k=0;k<COLS;k++){
      const m=j*COLS+k,u=k/(COLS-1)-.5,v=.5-j/(ROWS-1);
      this.rest[m*3]=u*w;this.rest[m*3+1]=v*h;this.rest[m*3+2]=0;
      const f0=Math.min(1,Math.hypot(u,v)*2.2),far=f0*f0*(3-2*f0);
      this.bil[m]=Math.sin(u*5+this.ph)*Math.cos(v*4+this.ph*.5)*far;
      this.bil2[m]=Math.sin(u*17+v*13+this.ph)*far;
    }
    for(let n=0;n<NPAIR;n++){
      const a=PAIRS[n*2]*3,b=PAIRS[n*2+1]*3;
      this.ldx[n]=Math.abs(this.rest[a]-this.rest[b]);
      this.ldy[n]=Math.abs(this.rest[a+1]-this.rest[b+1]);
    }
    this.lsx=-1;this.init=false;
  }
  flat(ax,ay,az,scx,scy){
    for(let m=0;m<NP;m++){const i3=m*3;
      this.p[i3]=this.q[i3]=ax+this.rest[i3]*scx;
      this.p[i3+1]=this.q[i3+1]=ay+this.rest[i3+1]*scy;
      this.p[i3+2]=this.q[i3+2]=az;}
    this.lastAx=ax;this.lastAy=ay;this.init=true;this.rh=0;
  }
  step(ax,ay,az,scx,scy,total,time,ptr,pin){
    if(!this.init)this.flat(ax,ay,az,scx,scy);
    if(this.lsx!==scx||this.lsy!==scy){
      for(let n=0;n<NPAIR;n++)this.Lc[n]=Math.hypot(this.ldx[n]*scx,this.ldy[n]*scy);
      this.lsx=scx;this.lsy=scy;this.rh=0;
    }
    let vel=ax-this.lastAx;
    const p=this.p,q=this.q,rest=this.rest;
    if(Math.abs(vel)>total*.4){for(let m=0;m<NP;m++){p[m*3]+=vel;q[m*3]+=vel;}vel=0;}
    this.lastAx=ax;
    const vy=ay-this.lastAy;this.lastAy=ay;const speed=Math.min(Math.hypot(vel,vy)+this.kick,80);
    this.speed=speed;
    const lim=90*Math.max(scx,scy);
    const R=this.w*.42*clamp(Math.max(scx,1),1,1.6),R2=R*R;
    for(let m=0;m<NP;m++){
      const i=m*3,tx=ax+rest[i]*scx,ty=ay+rest[i+1]*scy;
      let vx=(p[i]-q[i])*.91,vy=(p[i+1]-q[i+1])*.91,vz=(p[i+2]-q[i+2])*.92;
      q[i]=p[i];q[i+1]=p[i+1];q[i+2]=p[i+2];
      vx+=(tx-p[i])*.028;vy+=(ty-p[i+1])*.028;
      vz+=(az-p[i+2])*.02 + (this.bil[m]*.11+this.bil2[m]*.06)*speed*.6;
      // cursor presses and ripples the cloth
      if(ptr.on){
        const dx=p[i]-ptr.x,dy=p[i+1]-ptr.y,d2=dx*dx+dy*dy;
        if(d2<R2){
          const d=Math.sqrt(d2),f=1-d/R,ff=f*f;
          vz-=ff*(2.6+(ptr.down?2.4:0));
          vz+=Math.sin(time*5-d*.07)*ff*1.4;
          if(d>1){vx+=dx/d*ff*.9;vy+=dy/d*ff*.9;}
        }
      }
      let nx=p[i]+vx,ny=p[i+1]+vy,nz=p[i+2]+vz;
      nx=tx+clamp(nx-tx,-lim,lim);ny=ty+clamp(ny-ty,-lim,lim);nz=clamp(nz,-360,360+az);
      p[i]=nx;p[i+1]=ny;p[i+2]=nz;
    }
    if(pin)this.pinCorners(ax,ay,az,scx,scy);
    for(let it=0;it<4;it++){
      for(let n=0;n<NPAIR;n++){
        const a=PAIRS[n*2]*3,b=PAIRS[n*2+1]*3;
        const dx=p[b]-p[a],dy=p[b+1]-p[a+1],dz=p[b+2]-p[a+2];
        const dist=Math.sqrt(dx*dx+dy*dy+dz*dz)||1e-4;
        const f=(dist-this.Lc[n])/dist*.5;
        p[a]+=dx*f;p[a+1]+=dy*f;p[a+2]+=dz*f;
        p[b]-=dx*f;p[b+1]-=dy*f;p[b+2]-=dz*f;
      }
      if(pin)this.pinCorners(ax,ay,az,scx,scy);
    }
    this.posAttr.needsUpdate=true;
    this.geo.computeVertexNormals();
    // snapshot for the trail
    const slot=this.ring[this.rh%RING]||(this.ring[this.rh%RING]={p:new Float32Array(NP*3),n:new Float32Array(NP*3)});
    slot.p.set(p);slot.n.set(this.nAttr.array);this.rh++;
    const trail=clamp((speed-6)/40,0,1)*.3*(1-this.o);
    this.echoes.forEach((e,k)=>{
      const s=this.ring[(((this.rh-1-e.lag)%RING)+RING)%RING];
      if(trail>.02&&s&&this.rh>e.lag+1){
        e.pa.array.set(s.p);e.na.array.set(s.n);e.pa.needsUpdate=true;e.na.needsUpdate=true;
        e.m.visible=true;e.mat.uniforms.uA.value=trail*(1-k*.4);
      }else e.m.visible=false;
    });
  }
  setTint(hex,k,snap){const c=new THREE.Color(hex);this.tintT.setRGB(c.r*k,c.g*k,c.b*k);if(snap){this.mat.uniforms.uTint.value.copy(this.tintT);this.echoes.forEach(e=>e.mat.uniforms.uTint.value.copy(this.tintT));}}
  tintStep(){const u=this.mat.uniforms.uTint.value;u.lerp(this.tintT,.08);this.echoes.forEach(e=>e.mat.uniforms.uTint.value.copy(u));}
  // hold the four corners exactly on the target rectangle; everything between them stays free
  pinCorners(ax,ay,az,scx,scy){
    const p=this.p,q=this.q,rest=this.rest;
    for(let k=0;k<4;k++){const i3=CORNERS[k]*3;
      p[i3]=q[i3]=ax+rest[i3]*scx;p[i3+1]=q[i3+1]=ay+rest[i3+1]*scy;p[i3+2]=q[i3+2]=az;}
  }
  isDrawn(){return this.mesh.visible||this.echoes.some(e=>e.m.visible);}
  hide(){this.mesh.visible=false;this.echoes.forEach(e=>e.m.visible=false);this.init=false;this.rh=0;this.kick=0;}
  dispose(){this.scene.remove(this.mesh);this.geo.dispose();this.mat.dispose();this.tex.dispose();this.echoes.forEach(e=>{this.scene.remove(e.m);e.m.geometry.dispose();e.mat.dispose();});}
}
