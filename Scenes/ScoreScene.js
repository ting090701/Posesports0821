import { IScene } from "./IScene.js";
import { SceneEnum } from "../SceneEnum.js";
import { SceneManager } from "../SceneManager.js";
import { WIDTH, HEIGHT, ASSETS, SCORE_DB_NAME, ACCURACY_DB_NAME } from "../G.js";
import { DrawableText } from "../Objects/DrawableObj/Text/DrawableText.js";
import { DrawableImage } from "../Objects/DrawableObj/Game/DrawableImage.js";
import { PoseHandler } from "../Objects/APIs/PoseHandler.js";
import { PoseTracker } from "../Objects/APIs/PoseTracker.js";
import { Fireworks } from "../Objects/DrawableObj/Game/Fireworks.js";
import { MenuScene } from "./MenuScene.js";
import { EasyGameScene } from "./EasyGameScene.js";
import { HardGameScene } from "./HardGameScene.js";
import { BgmManager } from "../AudioController/BgmManager.js";
import { FaceIdentify } from "../Objects/APIs/FaceIdentify.js";
import { IndexedDBHelper } from "../Objects/APIs/IndexedDBHelper.js";

export class ScoreScene extends IScene{
    static instance = null

    constructor(p) {
        if (ScoreScene.instance) {
            
            return ScoreScene.instance
        }
        super(p);
        ScoreScene.instance = this;
        ScoreScene.instance.init()
        this.pose_handler = new PoseHandler(p);
        this.prevRightUp  = false;
        this.prevLeftUp   = false;
        this.backOffsetY  = 0;
        this.backOffsetY1  = 0;
        this.func_to_Menu = () => {
        SceneManager.instance.changeScene(SceneEnum.MENU);
        };
        // 切到排行榜
        this.func_to_Leaderboard = () => {
        SceneManager.instance.changeScene(SceneEnum.LEADERBOARD);
        };
    } 
    

    
    //call after constructor
    init(){
        this.bgmManager = BgmManager.get_instance(this.p);
        this.bg = new DrawableImage(this.p);
        this.bg.setImage(ASSETS.score);
        this.bg.position.set(0, 0);
        this.bg.width = WIDTH;
        this.bg.height = HEIGHT;
        this.add(this.bg);
        
        this.home = new DrawableImage(this.p);
        this.home.setImage(ASSETS.home);
        this.home.position.set(485, 500);
        this.home.width = 250;
        this.home.height = 250;
        this.add(this.home);
        
        // let go_menu_button = new RectButton(this.p,200,70,func)

        // go_menu_button.position.x = 540
        // go_menu_button.position.y = 600

        // ScoreScene.instance.add(go_menu_button)

        // let text = new DrawableText(this.p,"結算畫面",50)
        // text.position.x = WIDTH / 2
        // text.position.y = HEIGHT / 8
        // ScoreScene.instance.add(text)

        this.t1 = new DrawableText(this.p, "右手舉起", 25);
        this.t1.position.set(WIDTH /2 + 20 , 715);
        this.add(this.t1);


        this.leaderboardIcon = new DrawableImage(this.p);
        this.leaderboardIcon.setImage(ASSETS.leaderboardIcon);
        this.leaderboardIcon.position.set(390, 480);
        this.leaderboardIcon.width  = 160;
        this.leaderboardIcon.height = 160;
        this.add(this.leaderboardIcon);

        this.t2 = new DrawableText(this.p, "左手舉起", 25);
        this.t2.position.set(WIDTH /2 - 120 , 715);
        this.add(this.t2);


        this.pose_image = new DrawableImage(this.p);
        this.pose_image.position.x = WIDTH/3 + 70;
        this.pose_image.position.y = HEIGHT - HEIGHT/5 -20;
        this.pose_image.width = WIDTH/4;
        this.pose_image.height = HEIGHT/4;
        this.pose_image.visible = false;
        this.add(this.pose_image)        
        this.func_to_Menu = ()=>{
            SceneManager.instance.changeScene(SceneEnum.MENU)
        }
        this.fireworks = new Fireworks(this.p, this);
        this.add(this.fireworks);


        this.ScoreText = new DrawableText(this.p,"",30)
        this.ScoreText.position.x = WIDTH /2
        this.ScoreText.position.y = HEIGHT /2
        this.ScoreText.textAlign = "center";
        this.add(this.ScoreText)
        this.pose_handler = new PoseHandler(this.p);
        this.prevRightUp  = false;
        this.backOffsetY = 0;

        this.faceIdentify = FaceIdentify.getInstance();
        this.indexedDBHelper = IndexedDBHelper.getInstance();
        //這是測試用的圖片，之後請刪掉
        // this.faceImage = this.p.loadImage("assets/test/1f5667b2387800b6f0a56ccd647d34df.jpg");
        // this.faceImage1 = this.p.loadImage("assets/test/d7cec3e9e7d5bbf3a79b92aec5f148e3.jpg");
        // this.faceImage2 = this.p.loadImage("assets/test/3a074145a5da14325bb400a4b74b6e87.jpg");
    }
    async _on_enter() {
        console.log(">>> ScoreScene 進場，gameType =", MenuScene.instance.gameType);

        // 播 BGM
        this.bgmManager.playLoop(ASSETS.bgm_score_view);

        // 顯示完成文字
        const isEasy = MenuScene.instance.gameType === 1;
        if (isEasy) {
        const all = EasyGameScene.instance.allCount;
        const pass = EasyGameScene.instance.passCount;
        const rate = all === 0 ? 0 : pass / all * 100;
        this.ScoreText.text = `恭喜完成簡單模式:\n通過率: ${rate.toFixed(2)}%`;
        } else {
        const score = HardGameScene.instance.Score;
        this.ScoreText.text = `恭喜完成困難模式:\n通過次數為: ${score}`;
        }

        // --- 1. 準備要寫入資料庫的各種參數 ---
        const db       = IndexedDBHelper.getInstance();
        const descriptor = MenuScene.instance.playerDescriptor;
        const label      = MenuScene.instance.playerLabel;
        const imageB64   = MenuScene.instance.playerPortraitB64;
        const mode    = isEasy ? ACCURACY_DB_NAME : SCORE_DB_NAME;
        const value   = isEasy
            ? (EasyGameScene.instance.passCount / EasyGameScene.instance.allCount)
            : HardGameScene.instance.Score;

        // --- 1. 用 isDuplicateFace 比距離 ---
        // const { isDuplicate, existing, distance } =
        //     await db.isDuplicateFace(descriptor, 0.4 /* threshold */, mode);

        if (false) {
            console.log(
            `舊玩家( id=${existing.id} )，距離 ${distance.toFixed(3)} → 更新最高${isEasy?"accuracy":"score"}`
            );
            // 2a. 更新舊玩家
            const field = isEasy ? "accuracy" : "score";
            await db.updatePlayerById(existing.id, {
            ...existing,
            // 如果你還想保留舊最高分：
            [field]: Math.max(existing[field], value),
            image:     imageB64,
            timestamp: Date.now()
            }, mode);

        } else {
            console.log(`新人玩家 (距離最小 ≥ 阈值)，新增一筆`);
            // 2b. 新玩家
            await db.addPlayer({
            name:      label,
            descriptor,
            image:     imageB64,
            timestamp: Date.now(),
            ...(isEasy 
                ? { accuracy: value } 
                : { score:    value })
            }, mode);
        }
    }

    _on_update(_delta){

        // super.update(_delta);
        this.pose_handler.update(_delta)
        this.pose_image.src = PoseTracker.get_instance(this.p).getVideo();
        const tracker = PoseTracker.get_instance(this.p);
        const isRightUp   = tracker.get_is_righ_hand_up();
        const isLeftUp   = tracker.get_is_left_hand_up();
        this.backOffsetY = this.p.lerp(this.backOffsetY, isRightUp ? -50 : 0, 0.1);
        this.backOffsetY1 = this.p.lerp(this.backOffsetY1, isLeftUp ? -50 : 0, 0.1);
        this.home.position.y = 520 + this.backOffsetY;
        this.leaderboardIcon.position.y = 535 + this.backOffsetY1;
        if (isRightUp && !this.prevRightUp || isLeftUp && !this.prevLeftUp) {
            ASSETS.sfx_BHOME.play();
        }
        this.prevRightUp  = isRightUp;
        this.prevLeftUp   = isLeftUp
        if(this.pose_handler.is_righ_counter_reached()){
            this.func_to_Menu()
        }
        if(this.pose_handler.is_left_counter_reached()){
            this.func_to_Leaderboard()
        }
    }
        // async  registerAllPlayers() {   //測試用的，之後請刪掉
        // const playerInputs = [
        //     {
        //         path:this.faceImage2,
        //         data: {
        //             score: 233000,
        //             accuracy: 0.9,
        //             image: "player1.png", //這裡要記得取轉成 base64 或者其他格式
        //             name: "Alice"
        //         }
        //     },
        //     {
        //         path: this.faceImage1,
        //         data: {
        //             score: 233000,
        //             accuracy: 0.95,
        //             image: "player2.png", //這裡要記得取轉成 base64 或者其他格式
        //             name: "Bob1"
        //         }
        //     },
        //     {
        //         path: this.faceImage,
        //         data: {
        //             score: 2000,
        //             accuracy: 0.95,
        //             image: "player2.png", //這裡要記得取轉成 base64 或者其他格式
        //             name: "Bob2"
        //         }
        //     }
        //     ,
        //     {
        //         path: this.faceImage,
        //         data: {
        //             score: 3332000,
        //             accuracy: 0.95,
        //             image: "player2.png", //這裡要記得取轉成 base64 或者其他格式
        //             name: "Bob3"
        //         }
        //     }
        // ];

    //     for (const { path, data } of playerInputs) {
    //         await this.registerPlayerFromImage(path, data); //呼叫方式，注意他是異步的，所以需要 await or .then() ，
    //         //我前面在Sketch 有刪除資料表，測玩記得留著
    //     }
    //     this.indexedDBHelper.getSortedLeaderboard(SCORE_DB_NAME, 10).then( (data)=>{
    //             console.log(data);
    //     })

    //     }

    //     async registerPlayerFromImage(img, data = {}) { //插入資料到 IndexedDB，包含玩家的分數、準確度、圖片和名稱，也把比對處理掉了
    //     const canvas = img.canvas;
    //     if (!canvas) return console.error(" 缺少 canvas");
    //     try {
    //         const result = await this.faceIdentify.getID(canvas);
    //         const { score = 2000, accuracy = 0.9, image = "default.png", name } = data;
            
    //         const playerData = {
    //             score, accuracy, image,
    //             descriptor: result.descriptor,
    //             name: name || result.label || "Player",
    //             timestamp: Date.now()
    //         };
    //         const topPlayers = await this.indexedDBHelper.getAllDataByName(SCORE_DB_NAME);
    //         const existing = await this.faceIdentify.findPlayerInList(playerData, topPlayers, 0.6);

    //         if (existing) {
    //             if (existing.score < playerData.score) {
    //                 await this.indexedDBHelper.updatePlayerById(existing.id, playerData, SCORE_DB_NAME);
    //                 console.log(`分數更新: ${existing.score} → ${playerData.score}`);
    //             }
    //         } else {
    //             await this.indexedDBHelper.addPlayer(playerData);
    //             console.log(`新增玩家: ${playerData.name}`);
    //         }
    //         return await this.indexedDBHelper.getSortedLeaderboard(SCORE_DB_NAME, 10);
    //     } catch (err) {
    //         console.error("註冊失敗", err);
    //     }
    // }
}