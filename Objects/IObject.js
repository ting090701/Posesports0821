export class IObject {
    constructor(p) {
      if (new.target === IObject) {
        throw new Error('Cannot instantiate an abstract class.');
      }
      this.p = p;
      this.position = p.createVector(0, 0);
      this.rotation = 0;
      this.scale = p.createVector(1, 1);
      this.pivot = p.createVector(0, 0);
      this.isActive = true; 
    }
    // Abstract methods
    _on_draw() {
        throw new Error('Abstract method _on_draw() must be implemented in derived class');
    }
    setImage(img) {
        this.src = img;
    }

    _on_update(delta){
        throw new Error('Abstract method _on_update() must be implemented in derived class');
    }
    
    draw() {
        if (!this.isActive) return; // Skip drawing if not active
        this.p.push()
        this.applyTransformations()
        this._on_draw()
        this.p.pop()
    }
  
    update(delta) {
      if (!this.isActive) return;
      this._on_update(delta)
    }

    
  
    // Example of a utility method using p5 functions
    applyTransformations() {
      this.p.translate(this.position.x -this.pivot.x, this.position.y -this.pivot.y);
      this.p.rotate(this.rotation);
      this.p.scale(this.scale.x, this.scale.y);
    }
  }