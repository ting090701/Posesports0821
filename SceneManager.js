import { SceneEnum } from "./SceneEnum.js"
import { MenuScene } from "./Scenes/MenuScene.js";
import { TutorialScene } from "./Scenes/TutoriaScene.js";
import { EasyGameScene } from "./Scenes/EasyGameScene.js";
import { HardGameScene } from './Scenes/HardGameScene.js';
import { PoseDataScene } from './Scenes/PoseDataScene.js';
import { ScoreScene } from "./Scenes/ScoreScene.js";
import { LeaderboardScene } from "./Scenes/LeaderboardScene.js";



export class SceneManager {
    static instance = null
    constructor(p, easyKeypointDataList, hardKeypointDataList) {
    // constructor(p) {
        if(SceneManager.instance){
            return SceneManager.instance
        }



      this.scenes = new Map();
      this.scenes.set(SceneEnum.MENU, new MenuScene(p));
      this.scenes.set(SceneEnum.TUTORIAL, new TutorialScene(p));
      this.scenes.set(SceneEnum.EASY_GAME, new EasyGameScene(p, easyKeypointDataList));
      this.scenes.set(SceneEnum.HARD_GAME, new HardGameScene(p, hardKeypointDataList));
      // this.scenes.set(SceneEnum.EASY_GAME, new EasyGameScene(p));
      // this.scenes.set(SceneEnum.HARD_GAME, new HardGameScene(p));
      this.scenes.set(SceneEnum.POSE_DATA, new PoseDataScene(p));
      this.scenes.set(SceneEnum.SCORE, new ScoreScene(p));
      this.scenes.set(SceneEnum.LEADERBOARD, new LeaderboardScene(p));

      this.currentScene = this.scenes.get(SceneEnum.MENU);
      this.currentScene._on_enter();
      SceneManager.instance = this

    }
  
    changeScene(sceneEnum) {
      if (!this.scenes.has(sceneEnum)) {
        throw new Error(`Scene ${sceneEnum} does not exist.`);
      }
      this.currentScene._on_exit()

      this.currentScene = this.scenes.get(sceneEnum);

      this.currentScene._on_enter()
      console.log(`Changed to ${sceneEnum}`);
    }
  
    update(delta) {
      if (this.currentScene) {
        this.currentScene.update(delta);
      }
      
      // localStorage.removeItem("easy_pose_snapshot");
      // localStorage.removeItem("hard_pose_snapshot");
      // localStorage.clear();
      // console.log("🧹 已清除舊的 localStorage");
    }
  
    draw() {
      if (this.currentScene) {
        this.currentScene.draw();
      }
    }
  }
  