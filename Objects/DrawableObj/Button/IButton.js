import { IObject } from "../../IObject.js";
import { RectangleCollision } from "../../Collisions/RectangleCollision.js";


export class IButton extends IObject{

    constructor(p, width, height,onClick) {
      super(p)
      this.p = p
      this.position = p.createVector(0,0)

      this.width = width;
      this.height = height;
  
      this.isHovered = false;
      this.isPressed = false;



      this.canPress = false;

      this.onClick = onClick

      this.apply_collision()
    }

    apply_collision(){
        
    }

    updateMouseMove() {
        const wasHovered = this.isHovered;
        this.isHovered = this.collider.checkCollisionWithMouse();
    
        if (this.isHovered && !wasHovered) {
          //console.log('Mouse entered button');
        } else if (!this.isHovered && wasHovered) {
          //console.log('Mouse left button');
        }
    }
    
    updateMouseDown() {
        if (this.collider.checkCollisionWithMouse() && this.p.is_first_left_pressing) {
          //console.log(this.p.is_first_left_pressing)
          this.isPressed = true;
          //console.log('Button pressed');
        }
    }
    
    updateMouseUp() {
        if (this.isPressed && this.collider.checkCollisionWithMouse() && this.p.is_first_left_pressing) {
          this.onClick?.();
          //console.log('Button clicked');
        }
        this.isPressed = false;
    }


    _on_draw(){
      this.p.rectMode(this.p.CENTER)
      this.p.fill(0,0,255,70)
      this.p.rect(0,0,this.width,this.height)
      if(this.isHovered){
        this._draw_on_hover()
      }
      if(this.isPressed){
        this._draw_on_pressed()
      }

    }
    _on_update(){
      this.updateMouseMove()
      this.updateMouseDown()
      this.updateMouseUp()

      if(this.isHovered){
        this._update_on_hover()
      }
      if(this.isPressed){
        this._update_on_pressed()
      }
    }


    _draw_on_hover(){

    }

    _draw_on_pressed(){

    }

    _update_on_hover(){


    }

    _update_on_pressed(){


    }
}