// 📁 Objects/APIs/ScreenShoter.js
import { IObject } from "../IObject.js";

export class GetPoseData extends IObject {
    constructor(p) {
        super(p);
        this.p = p;

    }


    _on_draw() {
    }

    _on_update(delta) {
        
    }

    getStoredPose(dataName) {
        const savedData = localStorage.getItem(dataName);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            console.log("📂 儲存的姿態資料：", parsed);
            return parsed;
        } else {
            console.log("❌ 尚未有任何儲存的姿態資料！");
            return [];
        }

    }
}
