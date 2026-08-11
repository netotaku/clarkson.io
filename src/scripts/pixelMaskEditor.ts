import type { PixelMask } from '../pixel/types';

type Mode='off'|'on'|'toggle';

class PixelMaskEditor {
  root:HTMLElement;
  image:HTMLImageElement;
  canvas:HTMLCanvasElement;
  ctx:CanvasRenderingContext2D;
  output:HTMLTextAreaElement;
  mask:PixelMask;
  dotScale:number;
  cornerRadius:number;
  dragging=false;
  visited=new Set<string>();
  cell=18;

  constructor(root:HTMLElement){
    this.root=root;
    this.image=root.querySelector('[data-source]')!;
    this.canvas=root.querySelector('[data-canvas]')!;
    this.ctx=this.canvas.getContext('2d')!;
    this.output=root.querySelector('[data-output]')!;
    this.mask=JSON.parse(root.dataset.mask ?? '{}');
    this.dotScale=Number(root.dataset.dotScale ?? .44);
    this.cornerRadius=Number(root.dataset.cornerRadius ?? 24);

    this.bind();

    if(this.image.complete && this.image.naturalWidth>0) this.render();
    else this.image.addEventListener('load',()=>this.render(),{once:true});
  }

  bind(){
    this.canvas.addEventListener('pointerdown',e=>{
      this.dragging=true;
      this.visited.clear();
      this.canvas.setPointerCapture(e.pointerId);
      this.paint(e);
    });

    this.canvas.addEventListener('pointermove',e=>{
      if(this.dragging) this.paint(e);
    });

    const stop=(e:PointerEvent)=>{
      this.dragging=false;
      this.visited.clear();
      if(this.canvas.hasPointerCapture(e.pointerId)) this.canvas.releasePointerCapture(e.pointerId);
    };

    this.canvas.addEventListener('pointerup',stop);
    this.canvas.addEventListener('pointercancel',stop);

    this.root.querySelector('[data-rebuild]')?.addEventListener('click',()=>{
      this.mask={
        name:this.mask.name || 'hero',
        referenceColumns:Number(this.root.querySelector<HTMLInputElement>('[data-columns]')!.value),
        referenceRows:Number(this.root.querySelector<HTMLInputElement>('[data-rows]')!.value),
        off:[],
      };
      this.render();
    });

    this.root.querySelector('[data-show-all]')?.addEventListener('click',()=>{
      this.mask.off=[];
      this.render();
    });

    this.root.querySelector('[data-export]')?.addEventListener('click',async()=>{
      const text=this.createConfig();
      this.output.value=text;
      try{ await navigator.clipboard.writeText(text); }catch{
        this.output.focus();
        this.output.select();
      }
    });
  }

  render(){
    const cols=this.mask.referenceColumns;
    const rows=this.mask.referenceRows;

    this.canvas.width=cols*this.cell;
    this.canvas.height=rows*this.cell;
    this.canvas.style.aspectRatio=`${cols}/${rows}`;

    const sample=document.createElement('canvas');
    sample.width=cols;
    sample.height=rows;
    const sctx=sample.getContext('2d',{willReadFrequently:true})!;
    this.drawCover(sctx,this.image,cols,rows);
    const pixels=sctx.getImageData(0,0,cols,rows).data;

    this.ctx.fillStyle='#111';
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

    const hidden=new Set(this.mask.off.map(([x,y])=>`${x}:${y}`));

    for(let row=0;row<rows;row++){
      for(let col=0;col<cols;col++){
        const x=col*this.cell;
        const y=row*this.cell;

        if(!hidden.has(`${col}:${row}`)){
          const i=(row*cols+col)*4;
          const size=this.cell*this.dotScale;
          const radius=size*(this.cornerRadius/100);
          this.ctx.fillStyle=`rgba(${pixels[i]},${pixels[i+1]},${pixels[i+2]},${pixels[i+3]/255})`;
          this.roundRect(x+(this.cell-size)/2,y+(this.cell-size)/2,size,size,radius);
          this.ctx.fill();
        }

        this.ctx.strokeStyle='rgba(255,255,255,.04)';
        this.ctx.strokeRect(x,y,this.cell,this.cell);
      }
    }

    this.output.value=this.createConfig();
  }

  paint(e:PointerEvent){
    const rect=this.canvas.getBoundingClientRect();
    const x=(e.clientX-rect.left)*(this.canvas.width/rect.width);
    const y=(e.clientY-rect.top)*(this.canvas.height/rect.height);
    const col=Math.floor(x/(this.canvas.width/this.mask.referenceColumns));
    const row=Math.floor(y/(this.canvas.height/this.mask.referenceRows));

    if(col<0||row<0||col>=this.mask.referenceColumns||row>=this.mask.referenceRows) return;

    const key=`${col}:${row}`;
    if(this.visited.has(key)) return;
    this.visited.add(key);

    const mode=this.root.querySelector<HTMLSelectElement>('[data-mode]')!.value as Mode;
    const hidden=new Map(this.mask.off.map(cell=>[`${cell[0]}:${cell[1]}`,cell] as const));
    const visible=!hidden.has(key);

    let next=visible;
    if(mode==='off') next=false;
    else if(mode==='on') next=true;
    else next=!visible;

    if(next) hidden.delete(key);
    else hidden.set(key,[col,row]);

    this.mask.off=[...hidden.values()].sort((a,b)=>a[1]-b[1]||a[0]-b[0]);
    this.render();
  }

  drawCover(ctx:CanvasRenderingContext2D,image:HTMLImageElement,tw:number,th:number){
    const sw=image.naturalWidth, sh=image.naturalHeight, sr=sw/sh, tr=tw/th;
    let sx=0,sy=0,cw=sw,ch=sh;

    if(sr>tr){
      cw=sh*tr;
      sx=(sw-cw)/2;
    }else{
      ch=sw/tr;
      sy=(sh-ch)/2;
    }

    ctx.drawImage(image,sx,sy,cw,ch,0,0,tw,th);
  }

  roundRect(x:number,y:number,w:number,h:number,radius:number){
    const r=Math.min(radius,w/2,h/2);
    this.ctx.beginPath();
    this.ctx.moveTo(x+r,y);
    this.ctx.arcTo(x+w,y,x+w,y+h,r);
    this.ctx.arcTo(x+w,y+h,x,y+h,r);
    this.ctx.arcTo(x,y+h,x,y,r);
    this.ctx.arcTo(x,y,x+w,y,r);
    this.ctx.closePath();
  }

  createConfig(){
    return `import type { PixelMask } from './types';\n\nexport const heroMask: PixelMask = ${JSON.stringify(this.mask,null,2)};\n`;
  }
}

function init(){
  document.querySelectorAll<HTMLElement>('[data-pixel-mask-editor]').forEach(root=>new PixelMaskEditor(root));
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init,{once:true});
}else{
  init();
}
document.addEventListener('astro:page-load',init);
