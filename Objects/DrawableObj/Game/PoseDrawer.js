import { IObject } from "../../IObject.js"
import { WIDTH, HEIGHT } from "../../../G.js";
import { SpringTail } from "./SpringTail.js";
import { PoseTracker } from "../../APIs/PoseTracker.js";



export class PoseDrawer extends IObject{
    constructor(p , posePoint){
        super(p)
        this.p = p
        this.posePoint = posePoint; 
        this.springTail = new SpringTail(p ,5 ,2);
        
        this.offsetX = 115.2;
        this.offsetY = 105.6;
        this.areaWidth = 849.6;
        this.areaHeight = 566.4;

        this.size =0;

    }


    _on_update(delta){

    }

    _on_draw() {
        this.size = this.calculateHeadSize3DFromTorso(this.posePoint, this.areaHeight);
        this._Draw_Pose(this.posePoint, this.size);
    }

    static connections = [
        [11, 13], [13, 15],       // 左手
        [12, 14], [14, 16],       // 右手
        [11, 12],                 // 肩膀
        [23, 24],                 // 髖部
        [11, 23], [12, 24],       // 肩膀到髖部
        [23, 25], [25, 27],       // 左腳
        [24, 26], [26, 28],       // 右腳
        [27, 31], [28, 32],       // 腳掌
    ];

    _Draw_Pose(landmarks, size) {
        if (!landmarks || landmarks.length === 0) return;
        if (PoseTracker.checkHeadAndWristsVisible(landmarks) === false) {
            this._drawClippingRect(this.offsetX, this.offsetY, this.areaWidth, this.areaHeight , "rgba(255, 0, 0, 0.5)");
            return;
        }

        this._drawClippingRect(this.offsetX, this.offsetY, this.areaWidth, this.areaHeight );

        // 限制繪製區域
        this.p.push();
    
        this.p.beginClip();
     
        this.p.rect(this.offsetX, this.offsetY, this.areaWidth, this.areaHeight);
        this.p.endClip();

        // 繪製骨架、頭與脖子、手腕
        const scale = {
            skeleton: size / 5.5,
            head: size / 2.0,
            wrist: size / 4.5
        };
        this._drawSkeleton(landmarks, scale.skeleton);
        this._drawHeadAndNeck(landmarks, scale.head);
        this._drawWrist(landmarks[15], scale.wrist); // 左手
        this._drawWrist(landmarks[16], scale.wrist); // 右手

        this.p.pop();
    }

    _drawClippingRect(offsetX, offsetY, areaWidth, areaHeight , c = "rgba(24, 25, 29, 0.5)") {
        this.p.noFill();
        this.p.stroke(c);
        this.p.strokeWeight(5);
        this.p.rect(offsetX, offsetY, areaWidth, areaHeight);
    }

    _drawSkeleton(landmarks, size) {
        this.p.stroke("rgb(0, 0, 0)");
        this.p.strokeWeight(8);
        this.p.noFill();

        for (const [start, end] of PoseDrawer.connections) {
            const a = landmarks[start];
            const b = landmarks[end];
            if (!a || !b) continue;

            const p1 = this._toWorldPos(a);
            const p2 = this._toWorldPos(b);

            this.p.line(p1.x, p1.y, p2.x, p2.y);
        }

        // 畫肩膀
        this.p.noStroke();
        this.p.fill("rgb(0, 0, 0)");
        const shoulders = [landmarks[11], landmarks[12]];
        for (const shoulder of shoulders) {
            if (!shoulder) continue;
            const p = this._toWorldPos(shoulder);
            this.p.ellipse(p.x, p.y, size, size);
        }
    }

    _drawHeadAndNeck(landmarks, size) {
        const { 0: nose, 1: leftEye, 2: rightEye, 11: leftShoulder, 12: rightShoulder } = landmarks;
        if (!nose || !leftEye || !rightEye || !leftShoulder || !rightShoulder) return;

        // 頭部與脖子中點
        const headPos = this._toWorldPos({
            x: (nose.x + leftEye.x + rightEye.x) / 3,
            y: (nose.y + leftEye.y + rightEye.y) / 3
        });
        const neckPos = this._toWorldPos({
            x: (leftShoulder.x + rightShoulder.x) / 2,
            y: (leftShoulder.y + rightShoulder.y) / 2
        });
        // 畫脖子
        this.p.stroke("rgb(0, 0, 0)");
        this.p.strokeWeight(10);
        this.p.line(headPos.x, headPos.y, neckPos.x, neckPos.y);
        // 畫頭
        this.p.noStroke();
        this.p.fill("rgb(0,0,0)");
        this.p.ellipse(headPos.x, headPos.y, size, size);
        // 畫紅色綁帶
        const bandHeight = size * 0.2;
        const bandWidth = size;
        const bandYOffset = size * 0.25;
        this.p.fill("rgb(255, 0, 0)");
        this.p.rect(
            headPos.x - bandWidth / 2,
            headPos.y - bandHeight / 2 - bandYOffset,
            bandWidth, bandHeight,
            bandHeight / 3
        );
        // 畫 springTail
        const springAnchor = this.p.createVector(headPos.x, headPos.y - bandHeight / 2 - bandYOffset);
        this.springTail.draw(springAnchor, size / 5);
    }

    _drawWrist(wrist, size) {
        if (!wrist) return;
        const p = this._toWorldPos(wrist);
        this.p.noStroke();
        this.p.fill("rgb(0, 0, 0)");
        this.p.ellipse(p.x, p.y, size, size);
    }

    _toWorldPos(landmark) {
        return {
            x: this.offsetX + (1 - landmark.x) * this.areaWidth,
            y: this.offsetY + landmark.y * this.areaHeight
        };
    }

    calculateHeadSize3DFromTorso(landmarks, areaHeight, ratio = 2.5) {
        if (!landmarks || landmarks.length < 25) return null;

        const { 0: nose, 1: leftEye, 2: rightEye, 23: leftHip, 24: rightHip } = landmarks;
        if (!nose || !leftEye || !rightEye || !leftHip || !rightHip) return null;

        const head = {
            x: (nose.x + leftEye.x + rightEye.x) / 3,
            y: (nose.y + leftEye.y + rightEye.y) / 3,
            z: (nose.z + leftEye.z + rightEye.z) / 3
        };
        const hips = {
            x: (leftHip.x + rightHip.x) / 2,
            y: (leftHip.y + rightHip.y) / 2,
            z: (leftHip.z + rightHip.z) / 2
        };

        const dx = hips.x - head.x;
        const dy = hips.y - head.y;
        const dz = hips.z - head.z;
        const torsoLength3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const estimatedHeightPx = torsoLength3D * areaHeight;
        return estimatedHeightPx / ratio;
    }

}