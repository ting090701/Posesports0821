import { IObject } from "../../IObject.js";
import { WIDTH, HEIGHT } from "../../../G.js";

export class Fireworks extends IObject {
    constructor(p, scene) {
        super(p);
        this.p = p;
        this.scene = scene;

        this.fireworks = [];
        this.colors = [
            [255, 0, 0], [255, 128, 0], [255, 255, 0], [0, 255, 0],
            [0, 255, 255], [0, 128, 255], [128, 0, 255], [255, 0, 128]
        ];
        this.delay = 300;
        this.timer = 0;

        this.launch();
    }

    launch() {
        for (let i = 0; i < 15; i++) {
            const x = this.p.random(0, WIDTH);
            const y = HEIGHT + this.p.random(30, 100);
            const color = this.p.random(this.colors);
            const speed = this.p.random(6, 10);
            const targetY = this.p.random(200, 400);

            this.fireworks.push({
                state: "ascending",
                x,
                y,
                targetY,
                speed,
                exploded: false,
                particles: [],
                color,
                size: this.p.random(4, 8),
            });
        }
    }

    explode(firework) {
        for (let i = 0; i < 30; i++) {
            const angle = this.p.random(this.p.TWO_PI);
            const speed = this.p.random(1, 4);
            const vel = this.p.createVector(Math.cos(angle), Math.sin(angle)).mult(speed);
            firework.particles.push({
                pos: this.p.createVector(firework.x, firework.y),
                vel,
                alpha: 255,
                size: this.p.random(3, 6),
            });
        }
        firework.state = "exploding";
    }

    _on_update(delta) {
    // 1) 檢查是否所有煙火都結束
        let allDone = true;
        for (let fw of this.fireworks) {
            if (fw.state === "ascending") {
                allDone = false;
                break;
            }
            if (fw.state === "exploding" && fw.particles.some(p => p.alpha > 0)) {
                allDone = false;
                break;
            }
        }

        // 2) 如果都結束了，就清空陣列並重新 launch
        if (allDone) {
            this.fireworks.length = 0;
            this.launch();
            return;  // 跳過本幀剩下的更新
        }

        // 3) 否則，照原本邏輯做更新
        for (let fw of this.fireworks) {
            if (fw.state === "ascending") {
                fw.y -= fw.speed;
                if (fw.y <= fw.targetY) {
                    this.explode(fw);
                }
            } else if (fw.state === "exploding") {
                for (let p of fw.particles) {
                    p.vel.y += 0.1; // 重力
                    p.pos.add(p.vel);
                    p.alpha -= 4;
                }
            }
        }
    }


    _on_draw() {
        for (let fw of this.fireworks) {
            if (fw.state === "ascending") {
                this.p.noStroke();
                this.p.fill(fw.color[0], fw.color[1], fw.color[2]);
                this.p.ellipse(fw.x, fw.y, fw.size);
            } else if (fw.state === "exploding") {
                for (let p of fw.particles) {
                    this.p.noStroke();
                    this.p.fill(fw.color[0], fw.color[1], fw.color[2], p.alpha);
                    this.p.ellipse(p.pos.x, p.pos.y, p.size);
                }
            }
        }
    }
}
