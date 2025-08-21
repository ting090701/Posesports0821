// 📁 Objects/APIs/ScreenShoter.js
import { IObject } from "../IObject.js";

export class ScreenShoter extends IObject {
    constructor(p) {
        super(p);
        this.countdown = 0;
        this.timer = null;
        this.mode = ""; // "easy" or "hard"
        this.onComplete = null; // 回呼：倒數完畢時要做的事

        this.easyPoseData = [];   // 簡單模式資料陣列
        this.hardPoseData = [];   // 困難模式資料陣列

        // 顯示成功訊息用
        this.successMessage = "";
        this.successMessageTimer = 0;
    }

    startCountdown(mode, onCompleteCallback) {
        if (this.countdown > 0) return; // 已在倒數中

        this.countdown = 3;
        this.mode = mode;
        this.onComplete = onCompleteCallback;

        this.timer = setInterval(() => {
            this.countdown--;
            if (this.countdown <= 0) {
                clearInterval(this.timer);
                this.timer = null;

                console.log(`${this.mode}截圖 📸`);
                if (this.onComplete) this.onComplete();
            }
        }, 1000);
    }

    takeScreenshot(landmarks, mode) {
        if (!landmarks || landmarks.length === 0) {
            console.warn("⚠️ 尚未取得姿態資料，截圖失敗");
            return;
        }

        // 鏡像處理：將 X 軸左右反轉
        const mirroredLandmarks = landmarks.map(p => ({
            ...p,
            x: 1 - p.x  // 假設 x 是 0~1 的相對座標
        }));

        if (mode == "easy") {
            this.easyPoseData.push(mirroredLandmarks);
            localStorage.setItem("easy_pose_snapshot", JSON.stringify(this.easyPoseData));
            console.log("✅ easy pose 資料已儲存");
        } else if (mode == "hard") {
            this.hardPoseData.push(mirroredLandmarks);
            localStorage.setItem("hard_pose_snapshot", JSON.stringify(this.hardPoseData));
            console.log("✅ hard pose 資料已儲存");
        }

        // 顯示訊息
        this.successMessage = "姿態截圖資料建立成功！";
        this.successMessageTimer = 120;
    }

    isCounting() {
        return this.countdown > 0;
    }

    _on_draw() {
        if (this.countdown > 0) {
            this.p.fill(63, 72, 204);
            this.p.stroke(0);
            this.p.textAlign(this.p.CENTER, this.p.CENTER);
            this.p.textSize(64);
            this.p.text(this.countdown + "\n倒數中~請擺出姿勢", this.p.width / 2, this.p.height / 2);
        }

        if (this.successMessageTimer > 0) {
            this.p.fill(0, 255, 0); // 綠色
            this.p.textSize(32);
            this.p.textAlign(this.p.CENTER, this.p.BOTTOM);
            this.p.text(this.successMessage, this.p.width / 2, this.p.height - 40);
            this.successMessageTimer-=10;
        }
    }

    _on_update(delta) {
        // 無需特別更新，因為 countdown 是透過 setInterval 控制的
    }

    printStoredPose(dataName) {
        const savedData = localStorage.getItem(dataName);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            console.log("📂 儲存的姿態資料：", parsed);
        } else {
            console.log("❌ 尚未有任何儲存的姿態資料！");
        }

        return savedData
    }
}
