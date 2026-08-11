import type { PixelMask, TailConfig } from '../pixel/types';

const SVG_NS = 'http://www.w3.org/2000/svg';
const clamp = (v:number,min=0,max=1) => Math.max(min,Math.min(max,v));
const num = (v:string|undefined,f:number) => Number.isFinite(Number(v)) ? Number(v) : f;
const bool = (v:string|undefined,f:boolean) => v === undefined ? f : v !== 'false';

type SampleMode = 'average'|'top'|'bottom'|'centre';
type Colour = { r:number; g:number; b:number; a:number };

class PixelHero {
  root: HTMLElement;
  image: HTMLImageElement;
  topSvg: SVGSVGElement;
  tailSvg: SVGSVGElement;
  layer: HTMLElement;
  mask: PixelMask;
  tail: TailConfig;

  topHeight:number;
  pitch:number;
  dotScale:number;
  cornerRadius:number;
  saturation:number;
  contrast:number;
  fadeStart:number;
  fadeEndOpacity:number;
  fadeCurve:number;
  backgroundTarget:string;
  backgroundSample:SampleMode;
  backgroundMix:number;
  parallax:boolean;
  parallaxSpeed:number;

  columns=1;
  rows=1;
  pixels:Uint8ClampedArray|null=null;
  resizeObserver?:ResizeObserver;
  resizeTimer=0;
  scrollFrame=0;

  constructor(root:HTMLElement){
    this.root=root;
    this.image=root.querySelector('.pixel-hero__source')!;
    this.topSvg=root.querySelector('[data-top-svg]')!;
    this.tailSvg=root.querySelector('[data-tail-svg]')!;
    this.layer=root.querySelector('[data-parallax-layer]')!;
    this.mask=JSON.parse(root.dataset.mask ?? '{}');
    this.tail=JSON.parse(root.dataset.tail ?? '{}');

    const d=root.dataset;
    this.topHeight=num(d.topHeight,600);
    this.pitch=num(d.pixelPitch,18);
    this.dotScale=num(d.dotScale,.44);
    this.cornerRadius=num(d.cornerRadius,24);
    this.saturation=num(d.saturation,1);
    this.contrast=num(d.contrast,1);
    this.fadeStart=num(d.fadeStart,.72);
    this.fadeEndOpacity=num(d.fadeEndOpacity,.18);
    this.fadeCurve=num(d.fadeCurve,1.6);
    this.backgroundTarget=d.backgroundTarget ?? 'body';
    this.backgroundSample=(d.backgroundSample as SampleMode) ?? 'average';
    this.backgroundMix=num(d.backgroundMix,.29);
    this.parallax=bool(d.parallax,true);
    this.parallaxSpeed=num(d.parallaxSpeed,.08);

    this.render=this.render.bind(this);
    this.onScroll=this.onScroll.bind(this);

    this.resizeObserver=new ResizeObserver(()=>{
      clearTimeout(this.resizeTimer);
      this.resizeTimer=window.setTimeout(this.render,100);
    });
    this.resizeObserver.observe(this.root);
    window.addEventListener('scroll',this.onScroll,{passive:true});

    if(this.image.complete && this.image.naturalWidth>0) this.render();
    else this.image.addEventListener('load',this.render,{once:true});

    this.applyParallax();
  }

  render(){
    const width=this.root.clientWidth;
    if(!width || !this.image.complete || this.image.naturalWidth<=0) return;

    this.columns=Math.max(1,Math.ceil(width/this.pitch));
    this.rows=Math.max(1,Math.ceil(this.topHeight/this.pitch));

    const actualTop=this.rows*this.pitch;
    this.root.style.setProperty('--pixel-hero-top-height',`${actualTop}px`);
    this.root.style.setProperty('--pixel-hero-tail-height',`${this.tail.enabled?this.tail.height:0}px`);

    const canvas=document.createElement('canvas');
    canvas.width=this.columns;
    canvas.height=this.rows;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx) return;

    this.drawCover(ctx,this.image,this.columns,this.rows);

    try{
      this.pixels=ctx.getImageData(0,0,this.columns,this.rows).data;
    }catch(e){
      console.error('PixelHero could not read image pixels. Check CORS.',e);
      return;
    }

    this.renderTop();
    this.renderTail();
    this.applyBackground();
    const filter=`saturate(${this.saturation}) contrast(${this.contrast})`;
    this.topSvg.style.filter=filter;
    this.tailSvg.style.filter=filter;
    this.applyParallax();
    this.root.classList.add('is-ready');
  }

  renderTop(){
    if(!this.pixels) return;

    const frag=document.createDocumentFragment();
    const size=this.pitch*this.dotScale;
    const radius=size*(this.cornerRadius/100);
    const hidden=this.getResponsiveHiddenCells();

    this.topSvg.setAttribute('viewBox',`0 0 ${this.columns*this.pitch} ${this.rows*this.pitch}`);

    for(let row=0;row<this.rows;row++){
      const opacity=this.getTopOpacity(row);

      for(let col=0;col<this.columns;col++){
        if(hidden.has(`${col}:${row}`)) continue;

        const c=this.sampleColour(col,row);
        if(c.a<=0) continue;

        const rect=document.createElementNS(SVG_NS,'rect');
        rect.setAttribute('x',String(col*this.pitch+(this.pitch-size)/2));
        rect.setAttribute('y',String(row*this.pitch+(this.pitch-size)/2));
        rect.setAttribute('width',String(size));
        rect.setAttribute('height',String(size));
        rect.setAttribute('rx',String(radius));
        rect.setAttribute('ry',String(radius));
        rect.setAttribute('fill',`rgb(${c.r} ${c.g} ${c.b})`);
        rect.setAttribute('fill-opacity',String(c.a*opacity));
        frag.append(rect);
      }
    }

    this.topSvg.replaceChildren(frag);
  }

  renderTail(){
    if(!this.tail.enabled || !this.pixels){
      this.tailSvg.replaceChildren();
      return;
    }

    const tailRows=Math.max(1,Math.ceil(this.tail.height/this.pitch));
    const size=this.pitch*this.dotScale;
    const radius=size*(this.cornerRadius/100);
    const frag=document.createDocumentFragment();

    this.tailSvg.setAttribute('viewBox',`0 0 ${this.columns*this.pitch} ${tailRows*this.pitch}`);

    for(let col=0;col<this.columns;col++){
      const cluster=this.hash(col,101);
      const clusterFactor=(1-this.tail.clusterStrength)+cluster*this.tail.clusterStrength;

      for(let row=0;row<tailRows;row++){
        const progress=tailRows<=1?1:row/(tailRows-1);
        const density=this.tail.density*clusterFactor*(.12+(1-progress)*.88);

        if(this.hash(col,row+500)>density) continue;

        const sourceCol=Math.floor(this.hash(col,row+900)*this.columns);
        const sourceRow=Math.max(0,this.rows-1-Math.floor(this.hash(col,row+1200)*Math.min(5,this.rows)));
        const c=this.sampleColour(sourceCol,sourceRow);
        const opacity=this.fadeEndOpacity+(this.tail.endOpacity-this.fadeEndOpacity)*progress;

        const rect=document.createElementNS(SVG_NS,'rect');
        rect.setAttribute('x',String(col*this.pitch+(this.pitch-size)/2));
        rect.setAttribute('y',String(row*this.pitch+(this.pitch-size)/2));
        rect.setAttribute('width',String(size));
        rect.setAttribute('height',String(size));
        rect.setAttribute('rx',String(radius));
        rect.setAttribute('ry',String(radius));
        rect.setAttribute('fill',`rgb(${c.r} ${c.g} ${c.b})`);
        rect.setAttribute('fill-opacity',String(c.a*clamp(opacity)));
        frag.append(rect);
      }
    }

    this.tailSvg.replaceChildren(frag);
  }

  getTopOpacity(row:number){
    const y=this.rows<=1?0:row/(this.rows-1);
    const start=clamp(this.fadeStart);
    if(y<=start) return 1;
    const p=clamp((y-start)/Math.max(.0001,1-start));
    const curved=Math.pow(p,Math.max(.05,this.fadeCurve));
    return 1-curved*(1-this.fadeEndOpacity);
  }

  getResponsiveHiddenCells(){
    const result=new Set<string>();
    const rc=Math.max(1,this.mask.referenceColumns);
    const rr=Math.max(1,this.mask.referenceRows);

    for(const [x,y] of this.mask.off){
      const xn=rc<=1?0:x/(rc-1);
      const yn=rr<=1?0:y/(rr-1);
      const col=Math.round(xn*(this.columns-1));
      const row=Math.round(yn*(this.rows-1));
      result.add(`${col}:${row}`);
    }
    return result;
  }

  sampleColour(col:number,row:number):Colour{
    if(!this.pixels) return {r:0,g:0,b:0,a:0};
    const x=Math.max(0,Math.min(this.columns-1,col));
    const y=Math.max(0,Math.min(this.rows-1,row));
    const i=(y*this.columns+x)*4;
    return {r:this.pixels[i],g:this.pixels[i+1],b:this.pixels[i+2],a:this.pixels[i+3]/255};
  }

  drawCover(ctx:CanvasRenderingContext2D,image:HTMLImageElement,tw:number,th:number){
    const sw=image.naturalWidth, sh=image.naturalHeight;
    const sr=sw/sh, tr=tw/th;
    let sx=0, sy=0, cw=sw, ch=sh;

    if(sr>tr){
      cw=sh*tr;
      sx=(sw-cw)/2;
    }else{
      ch=sw/tr;
      sy=(sh-ch)/2;
    }

    ctx.clearRect(0,0,tw,th);
    ctx.drawImage(image,sx,sy,cw,ch,0,0,tw,th);
  }

  applyBackground(){
    if(!this.pixels || this.backgroundTarget==='none') return;

    const c=this.sampleBackgroundColour();
    const mix=clamp(this.backgroundMix);
    const colour=`rgb(${Math.round(c.r*mix)} ${Math.round(c.g*mix)} ${Math.round(c.b*mix)})`;

    const target=this.backgroundTarget==='self'
      ? this.root
      : document.querySelector<HTMLElement>(this.backgroundTarget);

    if(target) target.style.backgroundColor=colour;
    document.documentElement.style.setProperty('--pixel-hero-background',colour);
  }

  sampleBackgroundColour(){
    const coords:Array<[number,number]> = [];

    if(this.backgroundSample==='top'){
      for(let x=0;x<this.columns;x++) coords.push([x,0]);
    }else if(this.backgroundSample==='bottom'){
      for(let x=0;x<this.columns;x++) coords.push([x,this.rows-1]);
    }else if(this.backgroundSample==='centre'){
      const cx=Math.floor(this.columns/2), cy=Math.floor(this.rows/2);
      for(let y=Math.max(0,cy-1);y<=Math.min(this.rows-1,cy+1);y++)
        for(let x=Math.max(0,cx-1);x<=Math.min(this.columns-1,cx+1);x++)
          coords.push([x,y]);
    }else{
      for(let y=0;y<this.rows;y++)
        for(let x=0;x<this.columns;x++)
          coords.push([x,y]);
    }

    let r=0,g=0,b=0,w=0;
    for(const [x,y] of coords){
      const c=this.sampleColour(x,y);
      if(c.a<=0) continue;
      r+=c.r*c.a; g+=c.g*c.a; b+=c.b*c.a; w+=c.a;
    }

    return w>0 ? {r:r/w,g:g/w,b:b/w} : {r:0,g:0,b:0};
  }

  onScroll(){
    if(this.scrollFrame) return;
    this.scrollFrame=requestAnimationFrame(()=>{
      this.scrollFrame=0;
      this.applyParallax();
    });
  }

  applyParallax(){
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const y=!this.parallax || reduced ? 0 : window.scrollY*this.parallaxSpeed;
    this.layer.style.transform=`translate3d(0,${y}px,0)`;
  }

  hash(a:number,b:number){
    let v=Math.imul((this.tail.seed+1)^a,0x45d9f3b)^Math.imul(b+1,0x27d4eb2d);
    v^=v>>>16;
    v=Math.imul(v,0x7feb352d);
    v^=v>>>15;
    v=Math.imul(v,0x846ca68b);
    v^=v>>>16;
    return (v>>>0)/4294967296;
  }
}

const instances=new WeakMap<HTMLElement,PixelHero>();

function init(){
  document.querySelectorAll<HTMLElement>('[data-pixel-hero]').forEach(root=>{
    if(!instances.has(root)) instances.set(root,new PixelHero(root));
  });
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init,{once:true});
}else{
  init();
}
document.addEventListener('astro:page-load',init);
