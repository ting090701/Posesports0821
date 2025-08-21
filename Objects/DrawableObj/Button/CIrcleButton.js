import { IButton } from "./IButton.js";
import { CircleCollision } from './../../Collisions/CircleCollision';

export class CircleButton extends IButton{
    constructor(p,width,height,onClick){
        super(p ,width ,height ,onClick);
    }


    apply_collision(){
        this.collider = new CircleCollision(this.p,this.width)
        this.collider.position = this.position
    }
}