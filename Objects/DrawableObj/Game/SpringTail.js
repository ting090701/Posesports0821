
import { HEIGHT, WIDTH } from "./../../../G.js";

export class SpringTail  {
  constructor( p, segmentCount, segmentLength) {
    this.p = p;

    this.segmentCount = segmentCount;
    this.segmentLength = segmentLength;

    this.springStrength = 0.2;
    this.damping = 0.7; // 阻尼系數，控制彈簧的回彈速度
  
    this.gravity = this.p.createVector(0, 10); //  重力

    this.segments = [];
    this.velocities = [];

    for (let i = 0; i < segmentCount; i++) {
      this.segments.push(this.p.createVector(WIDTH / 2, HEIGHT / 2));
      this.velocities.push(this.p.createVector(0, 0));
    }
  }


  _on_update(target) {
    this.segments[0] = target;

    for (let i = 1; i < this.segmentCount; i++) {
      let prev = this.segments[i - 1];
      let current = this.segments[i];
      let velocity = this.velocities[i];

      let force = p5.Vector.sub(prev, current);
      let distance = force.mag();
      let stretch = distance - this.segmentLength;
      force.setMag(stretch * this.springStrength);
      force.add(this.gravity);
      velocity.add(force);
      velocity.mult(this.damping);
      this.segments[i].add(velocity);
    }
  }
  /** This function redraws the sketch multiple times a second. */
  draw(target ,size) {
    this._on_update(target);
    this._on_draw(size);
  }
  

    _on_draw(size) {
    this.p.stroke("rgb(255, 0, 0)");
    this.p.strokeWeight(size);
    this.p.noFill();

    for (let i = 0; i < this.segmentCount - 1; i++) {
        let current = this.segments[i];
        let next = this.segments[i + 1];
        this.p.line(current.x, current.y, next.x, next.y);
    }
    }
}
