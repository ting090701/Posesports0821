import { IButton } from "./IButton.js";
import { RectangleCollision } from "../../Collisions/RectangleCollision.js";

export class RectButton extends IButton{
    constructor(p,width,height,onClick){
        super(p ,width ,height ,onClick);
    }


    apply_collision(){
        this.collider = new RectangleCollision(this.p,this.width,this.height)
        this.collider.position = this.position
    }
}