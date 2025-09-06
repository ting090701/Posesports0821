import { IScene } from "./IScene.js";
import { SceneManager } from "../SceneManager.js";
import { SceneEnum } from "../SceneEnum.js";

import { ASSETS, WIDTH, HEIGHT } from "../G.js";
import { DrawableText } from "../Objects/DrawableObj/Text/DrawableText.js";
import { PoseTracker } from "../Objects/APIs/PoseTracker.js";
import { PoseDrawer } from "../Objects/DrawableObj/Game/PoseDrawer.js";

import { BoardList } from "../Objects/Board/BoardList.js";
import { GeneratorManager, WaitTimer } from "../Objects/Utils/GeneratorManager.js";
import { DrawableImage } from "../Objects/DrawableObj/Game/DrawableImage.js";
import { HpBar } from "../Objects/DrawableObj/Game/HpBar.js";
import { BgmManager } from "../AudioController/BgmManager.js";
import { FeedbackOverlay } from "../Objects/DrawableObj/Game/FeedbackOverlay.js";

export class HardGameScene extends IScene {
    static lastScore = 0;

  constructor(p, hardKeypointDataList) {
    super(p);
    this.keypointDataList = hardKeypointDataList;
    this.init();
  }

  // ===== 初始化 =====
  init() {
    // 狀態
    this.time = 0;
    this.life = 3;
    this.Score = 0;

    // 子系統
    this.judgePoseState = new Map();
    this.generatorManager = new GeneratorManager();
    this.timer = new WaitTimer();
    this.activeBoards = new Set();
    this.maxConcurrentBoards = 1;

    // BGM
    this.bgmManager = BgmManager.get_instance(this.p);

    // 畫布 / 背景
    this.gameCanva = document.querySelector(".GameCanvas");

    this.Backgroundimage = new DrawableImage(this.p);
    this.Backgroundimage.width = WIDTH;
    this.Backgroundimage.height = HEIGHT;
    this.Backgroundimage.src = ASSETS.game_bg;
    this.add(this.Backgroundimage);

    this.Background = new DrawableImage(this.p);
    this.Background.width = WIDTH;
    this.Background.height = HEIGHT;
    this.bg = this.p.createGraphics(WIDTH, HEIGHT);
    this.Background.src = this.CreateBackground(this.bg);
    this.add(this.Background);

    // BoardList / Pose
    this.boardList = new BoardList(this.p, "hard_pose_snapshot", this.keypointDataList);
    this.add(this.boardList);

    this.poseTracker = PoseTracker.get_instance(this.p);
    this.poseDrawer = new PoseDrawer(this.p);
    this.poseDrawer.posePoint = this.poseTracker.getFullSkeleton();
    this.poseDrawer.position.x = 0;
    this.poseDrawer.position.y = 0;
    this.add(this.poseDrawer);

    // UI
    this.TimeText = new DrawableText(this.p, "時間: 0秒", 30);
    this.TimeText.position.x = 100;
    this.TimeText.position.y = HEIGHT / 8;
    this.TimeText.textAlign = "center";
    this.add(this.TimeText);

    this.ScoreText = new DrawableText(this.p, "通過次數: 0", 30);
    this.ScoreText.position.x = WIDTH - 140;
    this.ScoreText.position.y = HEIGHT / 8;
    this.ScoreText.textAlign = "center";
    this.add(this.ScoreText);

    this.CountdownText = new DrawableText(this.p, "", 100);
    this.CountdownText.position.x = WIDTH / 2;
    this.CountdownText.position.y = HEIGHT / 2;
    this.CountdownText.textAlign = "center";
    this.add(this.CountdownText);

    this.hpbar = new HpBar(this.p);
    this.hpbar.position.x = WIDTH / 2 - 70;
    this.hpbar.position.y = HEIGHT / 8 - 40;
    this.hpbar.currentHp = this.life;
    this.add(this.hpbar);

    this.feedback = new FeedbackOverlay(this.p);
    this.add(this.feedback);
  }

  // ===== 進出場 =====
  _on_enter() {
    // 重置即時狀態
    this.time = 0;
    this.life = 3;
    this.Score = 0;
    this.TimeText.text = "時間: 0秒";
    this.ScoreText.text = "通過次數: 0";
    this.hpbar.currentHp = this.life;

    // 啟動流程
    this.generatorManager.start(this.GameFlow());
    this.bgmManager.playLoop(ASSETS.bgm_HardMode);
  }

  _on_exit() {
    this.generatorManager.clearAll();
    this.judgePoseState.clear();
    this.boardList.clear();
    this.activeBoards.clear();

    HardGameScene.lastScore = this.Score;
  }

  // ===== 主遊戲流程 =====
  *GameFlow() {
    // 倒數
    this.CountdownText.isActive = true;
    for (let i = 0; i < 3; i++) {
      this.CountdownText.text = (3 - i).toString();
      yield* this.timer.delay(1000);
    }
    this.CountdownText.text = "開始!!!";
    yield* this.timer.delay(1000);
    this.CountdownText.isActive = false;

    // 啟動計時
    this.generatorManager.start(this.TimerCount());

    // 生成循環
    while (true) {
      // 鎖：場上不可有可視板
      while (this.activeBoards.size >= this.maxConcurrentBoards || this._hasVisibleBoard()) {
        yield* this.timer.delay(20);
      }

      // 隨機波段（BoxState 串行）
      if (Math.floor(Math.random() * 3) === 0) {
        yield* this.BoxState(Math.floor(Math.random() * 2) + 2);
        continue;
      }

      // 一般板
      const board = this.boardList.add_board(this.JudgePose.bind(this), this.boardEnd.bind(this));
      this.activeBoards.add(board);

      // 速度標定
      const target = Math.floor(Math.random() * 3) + 13;
      const base = (board.speed + board.addSpeed) || 1;
      if (typeof board.setSpeedScale === "function") {
        board.setSpeedScale(target / base);
      } else {
        board.speed = target; board.addSpeed = 0;
      }
      this.judgePoseState.set(board, false);

      // 等到真正離場
      yield* this.waitBoardGone(board);

      // 節奏延遲
      yield* this.timer.delay(1000 - Math.min(this.time * 5, 1000));
    }
  }

  *BoxState(round) {
    yield* this.timer.delay(100);

    for (let i = 0; i < round; i++) {
      while (this.activeBoards.size >= this.maxConcurrentBoards || this._hasVisibleBoard()) {
        yield* this.timer.delay(20);
      }

      const wave = Math.floor(Math.random() * 3) + 1;

      const board = this.boardList.add_board(
        this.JudgePose.bind(this),
        this.boardEnd.bind(this),
        wave, 17
      );

      this.activeBoards.add(board);
      this.judgePoseState.set(board, false);

      const target = Math.floor(Math.random() * 5) + 8;
      const base = (board.speed + board.addSpeed) || 1;
      if (typeof board.setSpeedScale === "function") {
        board.setSpeedScale(target / base);
      } else {
        board.speed = target; board.addSpeed = 0;
      }

      yield* this.waitBoardGone(board);
      yield* this.timer.delay(1000 - Math.min(this.time * 1, 500));
    }
  }

  *waitBoardGone(board) {
    const start = Date.now();
    const TIMEOUT_MS = 20000;

    const stillInList = (b) => {
      const l1 = this.boardList?.easyBoardList;
      const l2 = this.boardList?.hardBoardList;
      const inL1 = Array.isArray(l1) ? l1.includes(b) : false;
      const inL2 = Array.isArray(l2) ? l2.includes(b) : false;
      if (!Array.isArray(l1) && !Array.isArray(l2)) return true;
      return inL1 || inL2;
    };

    const strictlyOffscreen = (b) => {
      try {
        const sx = b.scale?.x ?? 1, sy = b.scale?.y ?? 1;
        const w = (b.width ?? 0) * sx;
        const h = (b.height ?? 0) * sy;
        const cx = b.position?.x ?? 0;
        const cy = b.position?.y ?? 0;
        const left = cx - w / 2, right = cx + w / 2;
        const top = cy - h / 2, bottom = cy + h / 2;
        return (right < 0) || (left > WIDTH) || (bottom < 0) || (top > HEIGHT);
      } catch { return false; }
    };

    while (true) {
      if (!board) break;

      const inactive = (board.isActive === false) || (board.destroyed === true);
      const notInList = !stillInList(board);
      const offscreen = strictlyOffscreen(board);

      if (offscreen || (inactive && notInList)) {
        this.activeBoards.delete(board);
        break;
      }

      if (Date.now() - start > TIMEOUT_MS) {
        console.warn("waitBoardGone timeout → 強制解鎖");
        this.activeBoards.delete(board);
        break;
      }
      yield* this.timer.delay(30);
    }
  }

  _hasVisibleBoard() {
    const list = [
      ...(this.boardList?.easyBoardList ?? []),
      ...(this.boardList?.hardBoardList ?? []),
    ];
    for (const b of list) {
      if (!b) continue;
      const sx = b.scale?.x ?? 1, sy = b.scale?.y ?? 1;
      const w = (b.width ?? 0) * sx;
      const h = (b.height ?? 0) * sy;
      const cx = b.position?.x ?? 0;
      const cy = b.position?.y ?? 0;
      const left = cx - w / 2, right = cx + w / 2;
      const top = cy - h / 2, bottom = cy + h / 2;
      const intersect = !(right < 0 || left > WIDTH || bottom < 0 || top > HEIGHT);
      if (intersect) return true;
    }
    return false;
  }

  *TimerCount() {
    while (true) {
      this.time++;
      this.boardList.setSpeed(this.time / 100);
      this.TimeText.text = "時間: " + this.time + "秒";
      yield* this.timer.delay(1000);
    }
  }

  boardEnd(board) {
    if (!this.judgePoseState.has(board) || !board) {
      console.log("板子已經被刪除或不存在");
      return;
    }

    if (this.judgePoseState.get(board)) {
      ASSETS.pass.play();
      board.changeColor(true);
      this.feedback?.show("green", 220);
      this.Score++;
      this.ScoreText.text = "通過次數: " + this.Score;
        HardGameScene.lastScore = this.Score; 
    } else {
      ASSETS.NotPass.play();
      board.changeColor(false);
      this.feedback?.show("red", 220);
      this.generatorManager.start(this.ScreenShake());
      this.life--;
      this.hpbar.currentHp = this.life;
      if (this.life <= 0) {
        HardGameScene.lastScore = this.Score;
        SceneManager.instance.changeScene(SceneEnum.SCORE);
      }
    }
    this.judgePoseState.delete(board);
  }

  JudgePose(board) {
    const landmarks = this.poseTracker.getFullSkeleton();
    if (!PoseTracker.checkHeadAndWristsVisible(landmarks)) return;
    if (!this.judgePoseState.has(board) || this.judgePoseState.get(board) === true) {
      board.changeColor(true);
      return;
    }
    if (!board.JudgePose(landmarks)) {
      this.judgePoseState.set(board, true);
      return;
    }
  }

  _on_update(delta) {
    this.p.stroke(255, 0, 0, 20);
    this.poseDrawer.posePoint = this.poseTracker.getFullSkeleton();
    this.boardList.update(delta);
    this.generatorManager.update(delta);
  }

  CreateBackground(bg) {
    bg.strokeWeight(3);
    bg.stroke(0);

    bg.noStroke();
    bg.fill("rgb(255, 248, 216)");
    bg.quad((WIDTH / 2) - 36, 240, (WIDTH / 2) + 36, 240, 921.6, 624, 158.4, 624);

    this.drawWarningStripe(bg, 921.6, 624, 158.4, 624, 72, 720, 1008, 720);

    bg.strokeWeight(3);
    bg.stroke(0);
    bg.fill("rgb(189, 116, 116)");
    bg.quad((WIDTH / 2) - 36, 240, (WIDTH / 2) - 36, 240, 0, HEIGHT, 72, HEIGHT);
    bg.quad((WIDTH / 2) + 36, 240, (WIDTH / 2) + 36, 240, WIDTH, HEIGHT, WIDTH - 72, HEIGHT);

    bg.line((WIDTH / 2) - 36, 240, (WIDTH / 2) + 36, 240);
    this.drawRoadArrows(bg, 3);
    return bg;
  }

  *ScreenShake() {
    this.gameCanva.classList.add('shake');
    yield* this.timer.delay(40);
    this.gameCanva.classList.remove('shake');
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

  lerp(a, b, t) { return a + (b - a) * t; }
  lerpPoint(p1, p2, t) { return { x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t }; }
}
