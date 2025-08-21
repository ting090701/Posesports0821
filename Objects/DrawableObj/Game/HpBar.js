import { ASSETS } from "../../../G.js";
import { IObject } from "../../IObject.js";

export class HpBar extends IObject {
    constructor(p) {
        super(p);
        this.width = 50; // 愛心寬度
        this.height = 50; // 愛心高度
        this.p = p;

        this.src = ASSETS.HpIcon; // ❤️ 實心愛心圖
        this.anchor = { x: 0, y: 0 }; // 依需求可調
        this.rotation = 0;

        this.currentHp = 3; // 目前 HP 顯示幾顆愛心
        this.spacing = 5; // 每顆愛心間距（橫向）
    }

    _on_update(delta) {
        // 若要根據遊戲邏輯更新 HP，可在這裡處理
    }

    _on_draw() {
        if (!this.src) {
            console.warn("⚠️ 沒有圖可以畫");
            return;
        }

        for (let i = 0; i < this.currentHp; i++) {
            const offsetX = i * (this.width + this.spacing);
            const drawX = -this.anchor.x * this.width + offsetX;
            const drawY = -this.anchor.y * this.height;

            this.p.image(this.src, drawX, drawY, this.width, this.height);
        }
    }

    setHp(hp) {
        this.currentHp = Math.max(0, hp);
    }

    setAnchor(x, y) {
        this.anchor.x = x;
        this.anchor.y = y;
    }
}
