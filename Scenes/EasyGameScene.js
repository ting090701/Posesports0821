import {IScene} from "./IScene.js"
import { RectButton } from "../Objects/DrawableObj/Button/RectButton.js"
import { SceneManager } from "../SceneManager.js"
import { SceneEnum } from "../SceneEnum.js"

import { ASSETS, WIDTH } from "../G.js"
import { HEIGHT } from "../G.js"
import { counter } from "../G.js"
import { DrawableText } from "../Objects/DrawableObj/Text/DrawableText.js"

import { DrawableImage } from "../Objects/DrawableObj/Game/DrawableImage.js"
import { PoseDrawer } from "../Objects/DrawableObj/Game/PoseDrawer.js"
import { PoseTracker } from "../Objects/APIs/PoseTracker.js"
import { GeneratorManager, WaitTimer } from "../Objects/Utils/GeneratorManager.js"
import { BoardList } from "../Objects/Board/BoardList.js";
import { BgmManager } from "../AudioController/BgmManager.js"
// EasyGameScene.js 頂部 import 區
import { FeedbackOverlay } from "../Objects/DrawableObj/Game/FeedbackOverlay.js"; // ★ 新增




export class EasyGameScene extends IScene{
    static instance = null

    constructor(p, easykeypointDataList) {
    // constructor(p) {
        if (EasyGameScene.instance) {
            return EasyGameScene.instance
        }
        super(p);
        
        this.keypointDataList = easykeypointDataList;

        EasyGameScene.instance = this;
        EasyGameScene.instance.init();

    } 
    

    //call after constructor
    init(){
        
        let func_to_scor =()=>{
            SceneManager.instance.changeScene(SceneEnum.SCORE)
        }
        

        let instance = EasyGameScene.instance
        this.bgmManager = BgmManager.get_instance(this.p);

        this.time = 0;
        this.passCount = 0;
        this.allCount = 0;

        this.poseScore = 0;

        this.gameCanva = document.querySelector(".GameCanvas");
        this.Backgroundimage = new DrawableImage(this.p);
        this.Backgroundimage.width = WIDTH;
        this.Backgroundimage.height = HEIGHT;
        this.Backgroundimage.src = ASSETS.game_bg; ;
        instance.add(this.Backgroundimage);
        

        this.Background = new DrawableImage(this.p);
        this.Background.width = WIDTH;
        this.Background.height = HEIGHT;
        this.bg =  this.p.createGraphics(WIDTH, HEIGHT);
        this.Background.src = this.CreateBackground(this.bg) ;
        instance.add(this.Background);

        // let go_score_button = new RectButton(this.p,300,100,func_to_scor)
        // go_score_button.position.x = 800
        // go_score_button.position.y = 600
        // instance.add(go_score_button)
        
        

        // this.boardList = new BoardList(this.p, this.keypointDataList);
        this.boardList = new BoardList(this.p, "easy_pose_snapshot", this.keypointDataList);
        instance.add(this.boardList);

        this.poseTracker = PoseTracker.get_instance(this.p);
        this.poseDrawer =new PoseDrawer(this.p); 
        this.poseDrawer.posePoint = this.poseTracker.getFullSkeleton();
        this.poseDrawer.width = 936;
        this.poseDrawer.height = 576;
        this.poseDrawer.position.x = 0;
        this.poseDrawer.position.y = 0;
        instance.add(this.poseDrawer);

        this.judgePoseState = new Map();
        this.generatorManager = new GeneratorManager();
        this.timer = new WaitTimer();

        this.TimeText = new DrawableText(this.p,"時間: 0/120秒" ,30)
        this.TimeText.position.x = 150  
        this.TimeText.position.y = HEIGHT / 8
        this.TimeText.textAlign = "center";
        instance.add(this.TimeText)


        this.CountdownText = new DrawableText(this.p,"",100)
        this.CountdownText.position.x = WIDTH / 2
        this.CountdownText.position.y = HEIGHT / 2
        this.CountdownText.textAlign = "center";
        instance.add(this.CountdownText);


        this.ScoreText = new DrawableText(this.p,"",30)
        this.ScoreText.position.x = WIDTH -140
        this.ScoreText.position.y = HEIGHT / 8 
        this.ScoreText.textAlign = "center";
        instance.add(this.ScoreText);

        this.feedback = new FeedbackOverlay(this.p); // ★
        instance.add(this.feedback);

    }

    *GameFlow(){
        this.CountdownText.isActive = true;
        for(let i =0; i < 3; i++){
            console.log(3-i);
            this.CountdownText.text = (3-i).toString();
            yield  *this.timer.delay(1000);
        }
        this.CountdownText.text = "開始!!!";
        yield  *this.timer.delay(1000);
        this.CountdownText.isActive = false;
        this.generatorManager.start(this.TimerCount());
        
        while (true) {
            let board = this.boardList.add_board(this.JudgePose.bind(this) , this.boardEnd.bind(this));
            if (board && typeof board.setSpeedScale === "function") {
                board.setSpeedScale(0.5);   // ★ 半速
            }
            this.judgePoseState.set(board, false); 
            yield  *this.timer.delay(10000); 
        }
        
    }

    *TimerCount() {
        
        while (true) {
            this.time++;
            this.TimeText.text = "時間: " + this.time+"/120秒";
            if(this.time >= 120){
                SceneManager.instance.changeScene(SceneEnum.SCORE);
            }
            yield *this.timer.delay(1000); // 每秒更新一次
        }
    }


    boardEnd(board) {
        this.allCount++;
        if(!this.judgePoseState.has(board) || !board){
            console.log("板子已經被刪除或不存在");
            return;
        }
        if(this.judgePoseState.get(board)){
            console.log("判斷成功");
            ASSETS.pass.play();
            board.changeColor(true);                       // ★ 通過：板子上綠
            if (this.feedback) this.feedback.show("green", 220);
            this.passCount++;
        }else{
            ASSETS.NotPass.play();
            console.log("判斷失敗");
            board.changeColor(false);                      // ★ 失敗：板子上紅
            if (this.feedback) this.feedback.show("red", 220);
            this.generatorManager.start(this.ScreenShake());
        }
        this.judgePoseState.delete(board);
    }

    JudgePose(board) {
        const landmarks = this.poseTracker.getFullSkeleton();
        if(!PoseTracker.checkHeadAndWristsVisible(landmarks))return;
        if( !this.judgePoseState.has(board) || this.judgePoseState.get(board) === true){
            board.changeColor(true);  // 命中
            return;
        }
        if(!board.JudgePose(landmarks)){
            this.judgePoseState.set(board, true);
       
            return ;
        }
    }

    _on_update(delta){
        
        this.ScoreText.text = "通過率: " + (this.allCount !== 0 ? (this.passCount / this.allCount * 100).toFixed(2) : "0.00") + "%";
        this.p.stroke(255, 0, 0, 20);
        this.poseDrawer.posePoint = this.poseTracker.getFullSkeleton();
        this.boardList.update(delta);
        this.generatorManager.update(delta);
    }
    *ScreenShake(){
        this.gameCanva.classList.add('shake');
        yield* this.timer.delay(40);
        this.gameCanva.classList.remove('shake');
    }
    CreateBackground(bg) {
        // const layers = 15;
        // const startColor = bg.color("rgb(201, 235, 255)"); // 最上面顏色（淺藍）
        // const endColor = bg.color("rgb(255, 255, 255)");   // 底部顏色（深藍）

        // const layerHeight = HEIGHT / layers;

        // for (let i = 0; i < layers; i++) {
        //     let t = i / (layers - 1);
        //     let interColor = bg.lerpColor(startColor, endColor, t);
        //     bg.noStroke();
        //     bg.fill(interColor);
        //     bg.rect(0, i * layerHeight, WIDTH, layerHeight);
        // }

        bg.strokeWeight(3);
        bg.stroke(0);

        bg.noStroke();
        bg.fill("rgb(255, 248, 216)");
        bg.quad((WIDTH / 2) - 36, 240, (WIDTH / 2) + 36, 240, 921.6, 624, 158.4, 624);

        this.drawWarningStripe(bg, 921.6, 624, 158.4, 624, 72, 720, 1008, 720);

        bg.strokeWeight(3);
        bg.stroke(0);
        bg.fill("rgb(116, 189, 158)");
        bg.quad((WIDTH / 2) - 36, 240, (WIDTH / 2) - 36, 240, 0, HEIGHT, 72, HEIGHT); // 左邊
        bg.quad((WIDTH / 2) + 36, 240, (WIDTH / 2) + 36, 240, WIDTH, HEIGHT, WIDTH - 72, HEIGHT); // 右邊

        bg.line((WIDTH / 2) - 36, 240, (WIDTH / 2) + 36, 240);
        this.drawRoadArrows(bg, 3);
        return bg;
    }

    drawRoadArrows(bg, count = 3) {
        const startX = WIDTH / 2;
        const startY = 240;
        const endY = HEIGHT - 100;

        for (let i = 1; i <= count; i++) {
            const t = i / (count + 1);
            const y = startY + this.lerp(startY, endY, t) * (i / 7) + 100;
            const scale = this.lerp(0.3, 3.0, t);
            const baseSize = 40;
            const halfBase = baseSize * scale * 1.5;
            const height = baseSize * scale;

            bg.noStroke();
            bg.fill("rgba(255, 210, 113, 0.8)");
            bg.triangle(
                startX, y + height * scale / 7,
                startX - halfBase, y - height * 0.5,
                startX + halfBase, y - height * 0.5
            );
        }
    }

    drawWarningStripe(bg, x1, y1, x2, y2, x3, y3, x4, y4, stripeWidth = 50) {
        const topStart = { x: x1, y: y1 }, topEnd = { x: x2, y: y2 };
        const bottomStart = { x: x3, y: y3 }, bottomEnd = { x: x4, y: y4 };
        const steps = Math.ceil(Math.hypot(topEnd.x - topStart.x, topEnd.y - topStart.y) / stripeWidth);

        for (let i = 0; i < steps; i++) {
            const t1 = i / steps, t2 = (i + 1) / steps;
            const topA = this.lerpPoint(topStart, topEnd, t1);
            const topB = this.lerpPoint(topStart, topEnd, t2);
            const bottomA = this.lerpPoint(bottomEnd, bottomStart, t1);
            const bottomB = this.lerpPoint(bottomEnd, bottomStart, t2);

            bg.fill(i % 2 === 0 ? "rgb(255, 224, 0)" : "rgb(0, 0, 0)");
            bg.noStroke();
            bg.quad(topA.x, topA.y, topB.x, topB.y, bottomB.x, bottomB.y, bottomA.x, bottomA.y);
        }
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    lerpPoint(p1, p2, t) {
        return {
            x: p1.x + (p2.x - p1.x) * t,
            y: p1.y + (p2.y - p1.y) * t
        };
    }
    _on_enter(){
        this.generatorManager.start(this.GameFlow());
        this.bgmManager.playLoop(ASSETS.bgm_EazyMode);
        this.time = 0;
        this.passCount = 0;
        this.allCount = 0;
        this.ScoreText.text = "通過率: " + (this.allCount !== 0 ? (this.passCount / this.allCount * 100).toFixed(2) : "0.00") + "%";
        this.TimeText.text = "時間: " + this.time+"/120秒";
    }
    _on_exit(){
        this.generatorManager.clearAll();
        this.judgePoseState.clear();
        this.boardList.clear();
    }

}
