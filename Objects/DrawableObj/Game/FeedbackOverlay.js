// Objects/DrawableObj/Game/FeedbackOverlay.js
import { IObject } from "../../IObject.js";
import { WIDTH, HEIGHT } from "../../../G.js";

export class FeedbackOverlay extends IObject {
  constructor(p) {
    super(p);
    this.visible = false;
    this.ttlMs = 0;
    this.fillCol = p.color(0, 0);   // 透明
    this.strokeCol = p.color(0, 0); // 透明
  }

  // 顯示：color='red' | 'green'；ms=顯示毫秒數
  show(color = "red", ms = 220) { // ★ 建議 180~300ms 有感又不干擾
    this.visible = true;
    this.ttlMs = ms;

    if (color === "green") {
      this.fillCol   = this.p.color(42, 157, 143, 80);   // ★ 綠色半透明
      this.strokeCol = this.p.color(42, 157, 143, 220);  // 邊框較實
    } else {
      this.fillCol   = this.p.color(255, 0, 0, 80);      // ★ 紅色半透明
      this.strokeCol = this.p.color(255, 0, 0, 220);
    }
  }

  _on_update(delta) {
    if (!this.visible) return;
    // 你的專案 delta 以「秒」為單位（速度用 speed * delta），所以換算毫秒
    this.ttlMs -= delta * 1000;
    if (this.ttlMs <= 0) this.visible = false;
  }

  _on_draw() {
    if (!this.visible) return;

    this.p.push();
    // 內部整片染色（紅框內）
    this.p.noStroke();
    this.p.fill(this.fillCol);
    this.p.rect(0, 0, WIDTH, HEIGHT); // ★ 覆蓋整個畫布區域

    // 邊框（紅框/綠框）
    this.p.noFill();
    this.p.stroke(this.strokeCol);
    this.p.strokeWeight(6);           // ★ 框線粗細可調
    this.p.rect(0, 0, WIDTH, HEIGHT); // ★ 貼齊畫布邊界
    this.p.pop();
  }
}
