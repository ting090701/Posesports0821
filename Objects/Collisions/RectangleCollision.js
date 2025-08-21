import {ICollision} from "./ICollision.js"


export class RectangleCollision extends ICollision{
  constructor(p,width,height) {
    super(p)
    this.p = p;

    this.width = width;
    this.height = height;
  }

  checkCollision(x, y) {
    return this.p.collidePointRect(x,y,
      this.position.x - this.width / 2,this.position.y - this.height / 2,
      this.width,this.height)
    }

  checkCollisionWithMouse() {
    return this.p.collidePointRect(this.p.mouseX,this.p.mouseY,
      this.position.x - this.width / 2,this.position.y - this.height / 2,
      this.width,this.height)
  }

  checkCollisionWithCircle(circleCollision){
    return this.p.collideRectCircle(
      this.position.x - this.width / 2,this.position.y - this.height / 2 , this.width , this.height,
      circleCollision.position.x - circleCollision.radius, circleCollision.position.y - circleCollision.radius,
      circleCollision.radius * 2
      );
    }

  checkCollisionWithRect(rectCollision){
    return this.p.collideRectRect(
      this.position.x - this.width / 2,this.position.y - this.height / 2,this.width,this.height,
      rectCollision.position.x - rectCollision.width / 2,rectCollision.position.y - rectCollision.height / 2,rectCollision.width,rectCollision.height,
      )
    }

  _on_draw(){
    this.p.fill(200, 0, 0,100);
    this.p.rect(-this.width/2, -this.height/2, this.width, this.height);
  }
}
