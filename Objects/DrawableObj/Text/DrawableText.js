import { IObject } from "../../IObject.js";
import { ASSETS } from "../../../G.js";

export class DrawableText extends IObject {
  constructor(p, text, text_size, font = ASSETS.font) {
    super(p);
    this.text = text;
    this.text_size = text_size;
    this.font =font ;
    this.strokeColor = p.color(255);  
    this.strokeWeight = 4;            
    this.fillColor = p.color(0);     
    this.textAlign = p.LEFT; // 可依需求改 CENTER
  }

  _on_draw() {
    const p = this.p;
    p.push();
    p.textSize(this.text_size);
    if (this.font) p.textFont(this.font);
    p.textAlign(this.textAlign); // 可依需求改 CENTER
    p.stroke(this.strokeColor);
    p.strokeWeight(this.strokeWeight);
    p.fill(this.fillColor);
    p.text(this.text, 0, 0);
    p.pop();
  }

  _on_update(delta) {}
}
