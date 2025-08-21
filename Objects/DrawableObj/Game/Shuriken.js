import { IObject } from "../../IObject.js";

export class Shuriken extends IObject {
  constructor(p) {
    super(p);
    this.rotation = 0; // 手裡劍的旋轉角度
    this.reset(); 
    this.randomNumber = p.random(0, 1000)/1000 +1; // 用於隨機化位置
  }

  reset() {
    let x = this.p.random() < 0.5 ? this.p.random(0, 500) : this.p.random(600, 1080);
    this.position.set(
      x,
      this.p.height + 400
    );
    this.speed = this.p.random(4.5, 7.5);
    const angle = this.p.random(-Math.PI * 3 / 4, -Math.PI / 4);
    this.velocity = this.p.createVector(Math.cos(angle), Math.sin(angle)).mult(this.speed);

    this.bodyColor = this.p.color(this.p.random([
      "#C0C0C0", "#A9A9A9", "#D3D3D3", "#808080", "#B0C4DE" // 銀灰色系
    ]));
    this.tailColor = this.p.color("#000000"); // 黑色邊緣
  }

  _on_update(delta) {
    const factor = delta * 30;
    this.position.x += this.velocity.x * factor;
    this.position.y += this.velocity.y * factor;

    this.rotation += this.randomNumber * delta; // 持續旋轉

    if (
      this.position.y < -5 ||
      this.position.x < -5 ||
      this.position.x > this.p.width + 5
    ) {
      this.reset();
    }
  }

  _on_draw() {
    this.p.push();
    this.p.translate(0, 0); // local 空間
    this.p.rotate(this.rotation);

    // 使用隨機主體色
    this.p.fill(this.bodyColor);
    this.p.stroke(30);
    this.p.strokeWeight(1.5);

    // 畫 4 個尖角
    for (let i = 0; i < 4; i++) {
      this.p.push();
      this.p.rotate((Math.PI / 2) * i);

      this.p.beginShape();
      this.p.vertex(0, 0);
      this.p.vertex(-6, 18);
      this.p.vertex(0, 35);
      this.p.vertex(6, 18);
      this.p.endShape(this.p.CLOSE);

      this.p.pop();
    }

    // 中心圓 + 邊框
    this.p.fill(0);
    this.p.noStroke();
    this.p.circle(0, 0, 10);

    this.p.noFill();
    this.p.stroke(80);
    this.p.strokeWeight(1);
    this.p.circle(0, 0, 14);

    this.p.pop();
  }
}
