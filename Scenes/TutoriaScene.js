import { IScene } from "./IScene.js";

import { SceneEnum } from "../SceneEnum.js";
import { SceneManager } from "../SceneManager.js";
import { PoseTracker } from "../Objects/APIs/PoseTracker.js";
import { SCORE_DB_NAME, WIDTH } from "../G.js"
import { HEIGHT } from "../G.js"
import { ASSETS } from "../G.js"
import { DrawableText } from "../Objects/DrawableObj/Text/DrawableText.js";
import { DrawableImage } from "../Objects/DrawableObj/Game/DrawableImage.js";
import { PoseHandler } from './../Objects/APIs/PoseHandler.js';
import { BgmManager } from "../AudioController/BgmManager.js";
export class TutorialScene extends IScene{
    static instance = null

    constructor(p) {
        if (TutorialScene.instance) {
            
            return TutorialScene.instance
        }
        super(p);
        TutorialScene.instance = this;
        TutorialScene.instance.init()
        this.pose_handler = new PoseHandler(p)
        this.prevLeftUp  = false;
        this.backOffsetX = 0;


    } 
    

    
    //call after constructor
    init(){
        let func =()=>{
            SceneManager.instance.changeScene(SceneEnum.MENU)
        }
        this.bgmManager = BgmManager.get_instance(this.p);
        //背景
        this.bg = new DrawableImage(this.p);
        this.bg.setImage(ASSETS.how);
        this.bg.position.set(0, 0);
        this.bg.width = WIDTH;
        this.bg.height = HEIGHT;
        this.add(this.bg);
        //忍者
        this.ninja = new DrawableImage(this.p);
        this.ninja.setImage(ASSETS.ninja);
        this.ninja.position.set(-20, 200);
        this.ninja.width = 400;
        this.ninja.height = 400;
        this.add(this.ninja);
        //back
        this.back = new DrawableImage(this.p);
        this.back.setImage(ASSETS.back);
        this.back.position.set(30, 450);
        this.back.width = 380;
        this.back.height = 380;
        this.add(this.back);
        this.title = new DrawableText(this.p, "遊戲教學", 100);
        this.title.textAlign = this.p.CENTER;
        this.title.position.set(WIDTH / 2, HEIGHT / 5);
        this.add(this.title);

        this.t1 = new DrawableText(this.p, "畫面中的忍者會呈現玩家的姿勢", 32);
        this.t1.position.set(WIDTH / 3 -50, 310);
        this.add(this.t1);

        // 簡單模式說明
        this.t2 = new DrawableText(this.p, "簡單模式：主要為輕鬆動一動\n根據關卡設計的姿勢讓上半身放鬆", 30);
        this.t2.position.set(WIDTH / 3-50, 420);
        this.add(this.t2);

        // 困難模式說明
        this.t3 = new DrawableText(this.p, "困難模式：挑戰人類極限\n利用全身的力量躲避障礙物", 30);
        this.t3.position.set(WIDTH / 3-50, 510);
        this.add(this.t3);

        this.t4 = new DrawableText(this.p, "左手舉起", 25);
        this.t4.position.set(180 , 680);
        this.add(this.t4);
        // let go_game_button = new RectButton(this.p,200,100,func)
        // go_game_button.position.x = 840
        // go_game_button.position.y = 600
        // TutorialScene.instance.add(go_game_button)
        // let text = new DrawableText(this.p,"教學介面",50)
        // text.position.x = WIDTH / 2
        // text.position.y = HEIGHT / 9
        // TutorialScene.instance.add(text)
        this.pose_image = new DrawableImage(this.p);
        this.pose_image.position.x = WIDTH/3 + 70;
        this.pose_image.position.y = HEIGHT - HEIGHT/5 -20;
        this.pose_image.width = WIDTH/4;
        this.pose_image.height = HEIGHT/4;
        TutorialScene.instance.add(this.pose_image)
        this.func_to_menu = ()=>{
            SceneManager.instance.changeScene(SceneEnum.MENU)
        }



    }

    _on_update(_delta){
        
        this.pose_handler.update(_delta)
        this.pose_image.src = PoseTracker.get_instance(this.p).getVideo();
        const tracker = PoseTracker.get_instance(this.p);
        const isLeftUp   = tracker.get_is_left_hand_up();
        this.backOffsetX = this.p.lerp(this.backOffsetX, isLeftUp ? -50 : 0, 0.1);
        this.back.position.x = 30 + this.backOffsetX;
        if (isLeftUp && !this.prevLeftUp) {
            ASSETS.sfx_return.play();
        }
        this.prevLeftUp  = isLeftUp;
        
        if(this.pose_handler.is_left_counter_reached()){
            this.func_to_menu()
        }
    }

    _on_exit(){
        this.pose_handler.reset_all_counter()

    }
    _on_enter(){
        this.bgmManager.playLoop(ASSETS.bgm_menu);
    }


}