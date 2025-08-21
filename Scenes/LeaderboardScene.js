// Scenes/LeaderboardScene.js
import { IScene }                 from "./IScene.js";
import { DrawableText }           from "../Objects/DrawableObj/Text/DrawableText.js";
import { DrawableImage }          from "../Objects/DrawableObj/Game/DrawableImage.js";
import { SceneEnum }              from "../SceneEnum.js";
import { SceneManager }           from "../SceneManager.js";
import { WIDTH, HEIGHT, ASSETS, SCORE_DB_NAME, ACCURACY_DB_NAME } from "../G.js";
import { PoseTracker } from "../Objects/APIs/PoseTracker.js";
import { PoseHandler } from "../Objects/APIs/PoseHandler.js";
import { IndexedDBHelper } from "../Objects/APIs/IndexedDBHelper.js";
import { MenuScene } from "./MenuScene.js";
export class LeaderboardScene extends IScene {
  static instance = null;

  constructor(p) {
    if (LeaderboardScene.instance) return LeaderboardScene.instance;
    super(p);
    LeaderboardScene.instance = this;
    this.pose_handler = new PoseHandler(p);
    this.pose_image   = new DrawableImage(this.p);
    this.prevRightUp = false;
    this.func_to_Menu = () => {
      SceneManager.instance.changeScene(SceneEnum.MENU);
    };
    this.init();
  }

  init() {
    this.objects = [];

    // 背景
    this.bg = new DrawableImage(this.p);
    this.bg.setImage(ASSETS.leaderboardScene);
    this.bg.position.set(0, 0);
    this.bg.width  = WIDTH;
    this.bg.height = HEIGHT;
    this.add(this.bg);

    // 標題
    this.title = new DrawableText(this.p, "排行榜", 65);
    this.title.position.set(WIDTH/2, 50);
    this.title.textAlign = this.p.CENTER;
    this.add(this.title);

    // 左側：簡單模式
    this.easyTitle = new DrawableText(this.p, "簡單模式", 36);
    this.easyTitle.position.set(WIDTH*0.25 + 50, 140);
    this.easyTitle.textAlign = this.p.CENTER;
    this.add(this.easyTitle);

    // 右側：困難模式
    this.hardTitle = new DrawableText(this.p, "困難模式", 36);
    this.hardTitle.position.set(WIDTH*0.75, 140);
    this.hardTitle.textAlign = this.p.CENTER;
    this.add(this.hardTitle);

    // 各 5 列：頭像 + 文字
    this.easyRows = [];
    this.hardRows = [];
    for (let i = 0; i < 3; i++) {
      // 簡單模式
      const eImg = new DrawableImage(this.p);
      eImg.position.set(WIDTH*0.25 - 120, 190 + i*128);
      eImg.width  = eImg.height = 128;
      eImg.visible = false;
      this.add(eImg);

      const eTxt = new DrawableText(this.p, "", 24);
      eTxt.position.set(WIDTH*0.25 + 30, 250 + i*128 + 8);
      eTxt.textAlign = this.p.LEFT;
      this.add(eTxt);

      this.easyRows.push({ img: eImg, txt: eTxt });

      // 困難模式
      const hImg = new DrawableImage(this.p);
      hImg.position.set(WIDTH*0.65 - 50, 190 + i*128);
      hImg.width  = hImg.height = 128;
      hImg.visible = false;
      this.add(hImg);

      const hTxt = new DrawableText(this.p, "", 24);
      hTxt.position.set(WIDTH*0.75, 250 + i*128);
      hTxt.textAlign = this.p.LEFT;
      this.add(hTxt);

      this.hardRows.push({ img: hImg, txt: hTxt });
    }

    this.unsword = new DrawableImage(this.p);
    this.unsword.setImage(ASSETS.unsword);
    this.unsword.position.set(430, 150);
    this.unsword.width = 250;
    this.unsword.height = 375;
    this.add(this.unsword);

    this.sword = new DrawableImage(this.p);
    this.sword.setImage(ASSETS.sword);
    this.sword.position.set(430, 150);
    this.sword.width = 275;
    this.sword.height = 412;
    this.sword.visible = false;
    this.add(this.sword);

    this.t1 = new DrawableText(this.p, "右手舉起\n回到主畫面", 25);
    this.t1.position.set(WIDTH /2 - 50, 500);
    this.add(this.t1);
  }

  async _on_enter() {
     // 1) 拿到已初始化的 DB helper
    const db = await IndexedDBHelper.getInstance();
    const label      = MenuScene.instance.playerLabel;
    // 2) 各取前 5 筆：score → 簡單模式、accuracy → 困難模式
    const easyList = await db.getSortedLeaderboard(ACCURACY_DB_NAME, 5);
    const hardList = await db.getSortedLeaderboard(SCORE_DB_NAME, 5);

    // 3) 填入簡單模式
    this.easyRows.forEach((row, i) => {
      if (i < easyList.length) {
        const entry = easyList[i];
        console.log("easyList[i] " + entry.name )
        if(entry.name == label){
          row.txt.fillColor = this.p.color(255,229,61);
          row.txt.strokeColor = this.p.color(0);
          row.txt.text = `第${i+1}名： ${entry.accuracy.toFixed(2)}`; 
        }else{
        row.txt.text = `第${i+1}名： ${entry.accuracy.toFixed(2)}`;
        }
        if (entry.image) {
          this.p.loadImage(
            entry.image, 
            img => {
              img.resize(row.img.width, row.img.height);
              row.img.src = img;
              row.img.visible = true;
            },
            err => {
              console.warn("圖片載入失敗，使用預設圖片", err);
              const fallback = ASSETS.head_img.resize(row.img.width, row.img.height);
              row.img.src = fallback;
              row.img.visible = true;
            }
          );    
        } else {
          // 沒有 image 的情況下，也使用預設圖片
          console.warn("圖片載入失敗，使用預設圖片");
          const fallback = ASSETS.head_img;
          fallback.resize(row.img.width, row.img.height);
          row.img.src = fallback;
          row.img.visible = true;
        }
      } else {
        row.txt.text    = "";
        row.img.visible = false;
      }
    });

    // 4) 填入困難模式
    this.hardRows.forEach((row, i) => {
      if (i < hardList.length) {
        const entry = hardList[i];
        if(entry.name == label){
          row.txt.fillColor = this.p.color(255,229,61);
          row.txt.strokeColor = this.p.color(0);
          row.txt.text = `第${i+1}名： ${entry.score.toFixed(2)}`; 
        }else{
          row.txt.text = `第${i+1}名： ${entry.score.toFixed(2)}`;
        }
        if (entry.image) {
          this.p.loadImage(
            entry.image, 
            img => {
              img.resize(row.img.width, row.img.height);
              row.img.src = img;
              row.img.visible = true;
            },
            err => {
              console.warn("圖片載入失敗，使用預設圖片", err);
              const fallback = ASSETS.head_img.resize(row.img.width, row.img.height);
              row.img.src = fallback;
              row.img.visible = true;
            }
          );    
        } else {
          // 沒有 image 的情況下，也使用預設圖片
          console.warn("圖片載入失敗，使用預設圖片");
          const fallback = ASSETS.head_img;
          fallback.resize(row.img.width, row.img.height);
          row.img.src = fallback;
          row.img.visible = true;
        }
      } else {
        row.txt.text    = "";
        row.img.visible = false;
      }
    });
  }

  _on_update(_delta) {
    this.pose_handler.update(_delta)
    this.pose_image.src = PoseTracker.get_instance(this.p).getVideo();
    const tracker = PoseTracker.get_instance(this.p);
    const isRightUp  = tracker.get_is_righ_hand_up();
    if (isRightUp && !this.prevRightUp) {
      ASSETS.sfx_sword.play();
    }
    this.prevRightUp = isRightUp;
    this.unsword.visible = !isRightUp;
    this.sword.visible =  isRightUp;
    if(this.pose_handler.is_righ_counter_reached()){
      this.func_to_Menu()
    }
  }
}
