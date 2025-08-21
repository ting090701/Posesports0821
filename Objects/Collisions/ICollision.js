export class ICollision {
  constructor(p) {
    if (new.target === ICollision) {
      throw new Error('Cannot instantiate an interface class.');
    }
    this.p = p;
    this.position = p.createVector(0, 0);
  }

  checkCollision(x, y) {
    throw new Error('Abstract method checkCollision() must be implemented in derived class');
  }

  checkCollisionWithMouse() {
    throw new Error('Abstract method checkCollisionWithMouse() must be implemented in derived class');
  }

  update(){
    

  }

  draw(){
    this.p.push()
    this.p.translate(this.position)
    this._on_draw()
    this.p.pop()
  }

  _on_draw(){


  }
}
