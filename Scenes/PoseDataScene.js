import { IScene } from "./IScene.js";

import { SceneEnum } from "../SceneEnum.js";
import { SceneManager } from "../SceneManager.js";
import { PoseTracker } from "../Objects/APIs/PoseTracker.js";
import { WIDTH } from "../G.js"
import { HEIGHT } from "../G.js"
import { ASSETS } from "../G.js"
import { DrawableText } from "../Objects/DrawableObj/Text/DrawableText.js";
import { DrawableImage } from "../Objects/DrawableObj/Game/DrawableImage.js";
import { PoseHandler } from './../Objects/APIs/PoseHandler.js';
import { BgmManager } from "../AudioController/BgmManager.js";
import { ScreenShoter } from "../Objects/ScreenShot/ScreenShoter.js";

import { counter } from "../G.js"

export class PoseDataScene extends IScene{
    static instance = null

    constructor(p) {
        if (PoseDataScene.instance) {
            
            return PoseDataScene.instance
        }
        super(p);
        PoseDataScene.instance = this;
        this.init()
        this.pose_handler = new PoseHandler(p)
        this.prevLeftUp  = false;
        this.backOffsetX = 0;
        this.prevcrosshand  = false;
        this.isPrtScing = false;    // 是否正在截圖
        this.hasResetPose = true;   // 重製截圖
        this.easyPoseCounter = 0;
        this.hardPoseCounter = 0;

        this.shoter = new ScreenShoter(p);
        this.add(this.shoter); // 加入到 drawable object list 中才能顯示 countdown

        
        this.backOffsetY = 0;

    } 
    

    
    //call after constructor
    init(){
        let func =()=>{
            SceneManager.instance.changeScene(SceneEnum.POSE_DATA)
        }
        

        //背景
        this.bg = new DrawableImage(this.p);
        this.bg.setImage(ASSETS.how);
        this.bg.position.set(0, 0);
        this.bg.width = WIDTH;
        this.bg.height = HEIGHT;
        this.add(this.bg);

        this.home = new DrawableImage(this.p);
        this.home.setImage(ASSETS.home);
        this.home.position.set(WIDTH/2, 0);
        this.home.width = 150;
        this.home.height = 150;
        this.add(this.home);

        this.pose_image = new DrawableImage(this.p);
        this.pose_image.position.x = 65;
        this.pose_image.position.y = 115;
        this.pose_image.width = WIDTH-120;
        this.pose_image.height = HEIGHT-120;
        PoseDataScene.instance.add(this.pose_image);

        this.t1 = new DrawableText(this.p, "左手舉起錄製簡單模式資料集\n右手舉起錄製困難模式資料集", 40);
        this.t1.position.set(25, 50);
        this.add(this.t1);

        this.t2 = new DrawableText(this.p, "雙手舉起交叉回主畫面", 40);
        this.t2.position.set((WIDTH/2)+100, 50);
        this.add(this.t2);
        
        this.func_to_menu = ()=>{
            SceneManager.instance.changeScene(SceneEnum.MENU)
        }
    }

    

    _on_update(_delta){
        
        const tracker = PoseTracker.get_instance(this.p);
        
        this.pose_handler.update(_delta);

        const isLeftUp   = tracker.get_is_left_hand_up();
        const isRightUp  = tracker.get_is_righ_hand_up();
        const bothUp     = tracker.get_is_doub_hand_up();
        const crossHand  = tracker.get_is_cross_hand();

        this.backOffsetY = this.p.lerp(this.backOffsetY, crossHand ? -20 : 0, 0.1);
        this.home.position.y = 10 + this.backOffsetY;
        
        if(crossHand && !this.prevcrosshand ){
            ASSETS.sfx_BHOME.play();
        }

        this.prevcrosshand   = crossHand
        
        if (this.pose_handler.is_cross_counter_reached()) {
            this.func_to_menu();
        }

        if (!isLeftUp && !isRightUp && !bothUp && !this.shoter.isCounting()) {
            this.hasResetPose = true;
            console.log("重製");
        }

        if (!this.shoter.isCounting() && this.hasResetPose) {

            if (this.pose_handler.is_left_counter_reached()) {
                console.log("簡單模式錄製");
                this.hasResetPose = false;

                this.shoter.startCountdown("easy", () => {
                    // ✅ easy 截圖處理放這裡
                    const keypoints = tracker.getFullSkeleton ? tracker.getFullSkeleton() : [];
                    console.log("easy_keypoints: ", keypoints);
                    this.shoter.takeScreenshot(keypoints, "easy");
                    console.log("✅ easy pose 資料處理");
                    counter.easy++;
                });

            } else if (this.pose_handler.is_righ_counter_reached()) {
                console.log("困難模式錄製");
                this.hasResetPose = false;

                this.shoter.startCountdown("hard", () => {
                    // ✅ hard 截圖處理放這裡
                    const keypoints = tracker.getFullSkeleton ? tracker.getFullSkeleton() : [];
                    console.log("hard_keypoints: ", keypoints);
                    this.shoter.takeScreenshot(keypoints, "hard");
                    console.log("✅ hard pose 資料處理");
                    counter.hard++;
                });
            }
        }
        
        this.pose_image.src = tracker.getVideo();

        this.printStoredPose("easy_pose_snapshot");
    }

    _on_exit(){
        
    }

    _on_enter(){
        this.shoter.easyPoseData = [];
        this.shoter.hardPoseData = [];
    }

    printStoredPose(dataName) {
        console.log("printStoredPose: ");

        const savedData = localStorage.getItem(dataName);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            console.log("📂 儲存的姿態資料：", parsed);
        } else {
            console.log("❌ 尚未有任何儲存的姿態資料！");
        }
    }
}