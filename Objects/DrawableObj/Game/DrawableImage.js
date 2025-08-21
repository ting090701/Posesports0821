import { IObject } from "../../IObject.js"


export class DrawableImage extends IObject{
    constructor(p){
        super(p)
        this.width = 100
        this.height = 400
        this.p = p
        this.src = null; // Placeholder for image resource
        this.anchor = { x: 0, y: 0 }; // (0,0)=左上；(0.5,0.5)=中心
        this.rotation = 0
        this.visible  = true;
    }

    setImage(img) {
        if (!img) {
            console.warn("❌ setImage 傳入圖片為 null/undefined");
        } else {
            console.log("✅ setImage 成功");
            this.src = img;
        }
    }
    setAnchor(x, y) {
        this.anchor.x = x;
        this.anchor.y = y;
    }
    _on_update(delta){
  
    }

    
   _on_draw() {
        if (!this.visible) return; // <== 這行很重要！

        if (!this.src) {
            console.warn("⚠️ 沒有圖可以畫");
            return;
        }   

        this.p.image(this.src, -this.anchor.x * this.width , -this.anchor.y * this.height, this.width, this.height);
    }


    update_collider(){
        
    }
}