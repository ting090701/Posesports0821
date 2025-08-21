/* Project: PoseTracker
  import poseTracker from '../PoseTracker.js';


  註：
    在此一開始就初始化，要保證兩個東西載入才能進行偵測
    - 一個是Camera(createCaputre)
    - 另一個是Mediapipe首次的gotPose

*/ 
import { WIDTH } from "../../G.js";
import { HEIGHT } from "../../G.js";
export class PoseTracker {
  static #instance;
  #pose;


  static get_instance(p){
    if(PoseTracker.#instance){
      return PoseTracker.#instance
    }else{
      //will assign to singlton
      return new PoseTracker(p)
    }
  }
  constructor(p) {
    

    this.flag = true
    this.p = p
    this.buffer = this.p.createGraphics(WIDTH, HEIGHT);
    this.head = this.p.createGraphics(WIDTH, HEIGHT);
    if (PoseTracker.#instance) {
      return PoseTracker.#instance;
    }
    PoseTracker.#instance = this;

    this.#pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    this.setOptions({
      modelComplexity: 0,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.detections_pose = [];
    this.#pose.onResults((results) => this.gotPose(results));
    this.OnGetPose = function (results) {


    };
    
    this._init()
    
    this.is_left_hand_up = false
    this.is_righ_hand_up = false
    this.is_doub_hand_up = false
    this.is_cross_hand = false

    this.PoseImage =this.p.createGraphics(WIDTH, HEIGHT);

  }

  get_is_left_hand_up(){
    return this.is_left_hand_up
  }

  get_is_righ_hand_up(){
    return this.is_righ_hand_up
  }

  get_is_doub_hand_up(){
    return this.is_doub_hand_up
  }
  
  get_is_cross_hand(){
    return this.is_cross_hand
  }

  _init(){
    this.video = this.p.createCapture(this.p.VIDEO)
      .size(WIDTH, HEIGHT)
      .hide();
      // this.flippedGraphics = this.p.createGraphics(WIDTH, HEIGHT);
      this.myCamera = new Camera(this.video.elt, {
          onFrame: async () => {
              //console.log("send video to pose tracker")
              await this.send(this.video.elt);
          },
          width: 1080,
          height: 720
      }).start();

  }
  getVideo() {

      this.buffer.push();
      this.buffer.translate(WIDTH, 0);
      this.buffer.scale(-1, 1); // 水平翻轉
      this.buffer.image(this.video, 0, 0, WIDTH, HEIGHT);
      this.drawSkeleton(this.buffer,this.getFullSkeleton());
      this.buffer.pop();
      return this.buffer;
    
  }
  update(){
    //console.log(this.video.loadedmetadata)
    //console.log(this.video.elt.readyState)
    if(this.video.loadedmetadata && this.poseReady){
      //this.p.image(this.video, 0, 0, WIDTH, HEIGHT);
      
      //this.drawSkeleton(this.getFullSkeleton());
      this.send(this.video.elt);

   
   
    }
  }

  setOptions(options) {
    this.#pose.setOptions(options);
  }

  async send(image) {
    await this.#pose.send({ image });
  }

  gotPose(results) {
    this.detections_pose = results.poseLandmarks || [];

    if (!this.poseReady) {
      this.poseReady = true;
      //console.log("Pose is ready!");
    }
  }
  
  getFullSkeleton() {
    return this.detections_pose;
  }


  drawSkeleton(p , landmarks) {
        if (!landmarks || landmarks.length === 0) return;

        p.stroke(0, 255, 0);
        p.strokeWeight(2);
        p.noFill();

        // 🔗 可連接的骨架關係（骨頭連線），根據 MediaPipe Pose 定義
        const connections = [
            [11, 13], [13, 15],       // 左手
            [12, 14], [14, 16],       // 右手
            [11, 12],                 // 肩膀
            [23, 24],                 // 髖部
            [11, 23], [12, 24],       // 肩膀到髖部
            [23, 25], [25, 27],       // 左腳
            [24, 26], [26, 28],       // 右腳
            [27, 31], [28, 32],       // 腳掌
        ];

        for (const [start, end] of connections) {
            const a = landmarks[start];
            const b = landmarks[end];
            if (a && b) {
              p.line(a.x *WIDTH , a.y *HEIGHT , b.x *WIDTH, b.y *HEIGHT);
            }

            //舉左手
            let left_shou = landmarks[11]
            let left_hand = landmarks[15]
            this.is_left_hand_up = false
            if(left_shou.y > left_hand.y){  //舉左手
                this.is_left_hand_up = true
            }

            
            let righ_shou = landmarks[12]
            let righ_hand = landmarks[16]
            this.is_righ_hand_up = false
            if(righ_shou.y > righ_hand.y){  //舉右手
                this.is_righ_hand_up = true
            }



            
            this.is_cross_hand = false
            this.is_doub_hand_up = false
            if(this.is_left_hand_up && this.is_righ_hand_up && righ_hand.x > left_hand.x){
              console.log("cross hand!")
              this.is_cross_hand = true
              this.is_doub_hand_up = false
              this.is_left_hand_up = false
              this.is_righ_hand_up = false
            }
            else if(this.is_left_hand_up && this.is_righ_hand_up){
              console.log("double hand up!")
              this.is_doub_hand_up = true
              this.is_left_hand_up = false
              this.is_righ_hand_up = false
              this.is_cross_hand = false
              
            }
            else if(this.is_left_hand_up){
              console.log("left hand up!")
            }
            else if(this.is_righ_hand_up){
              console.log("right hand up!")
            }
            //舉雙手
        }
        // 畫出每個關鍵點
        p.fill(255, 0, 0);
        p.noStroke();
        for (const pt of landmarks) {
            p.ellipse(pt.x *WIDTH, pt.y *HEIGHT, 6, 6);
        }
        p.fill(0, 0, 0);
    }
    static checkHeadAndWristsVisible(landmarks) {
      if (!landmarks || landmarks.length < 17) return false;
      const headPoints = [0, 1, 2];  // nose, leftEye, rightEye
      const wristPoints = [15, 16];  // leftWrist, rightWrist
      const headVisible = headPoints.every(index => {
          const pt = landmarks[index];
          return pt && this._isPointVisible(pt);
      });
      const wristVisible = wristPoints.every(index => {
          const pt = landmarks[index];
          return pt && this._isPointVisible(pt);
      });
      return headVisible && wristVisible;
  }
  static _isPointVisible(pt) {
      return pt.x >= 0 && pt.x <= 1 && pt.y >= 0 && pt.y <= 1;
  }

  gethead() {

      this.head.push();
      this.head.translate(WIDTH, 0);
      this.head.scale(-1, 1); // 水平翻轉
      this.head.image(this.video, 0, 0, WIDTH, HEIGHT);
      this.head.pop();
      return this.head;
    
  }
  //擷取頭像
  getHeadPortrait() {
  const lm = this.getFullSkeleton();
  if (!lm || lm.length === 0) return null;

  // 取鼻尖跟雙眼 (以 Mediapipe Pose 為例)
  const nose     = lm[0];
  const leftEye  = lm[2];
  const rightEye = lm[5];

  // 轉成畫面座標 (pixel)
  const nx = nose.x     * WIDTH;
  const ny = nose.y     * HEIGHT;
  const lx = leftEye.x  * WIDTH;
  const ly = leftEye.y  * HEIGHT;
  const rx = rightEye.x * WIDTH;
  const ry = rightEye.y * HEIGHT;

  // 眼睛中心
  const ex = (lx + rx) / 2;
  const ey = (ly + ry) / 2;

  // 算眼距
  const eyeDist = Math.hypot(rx - lx, ry - ly);

  // 決定方框大小（可微調）
  const boxSize = eyeDist * 4.5;

  // —— 這裡做「水平翻轉」 —— //
  // 如果 gethead() 已經是鏡像了，就要把原始 ex 轉成翻過去的 fx
  const fx = WIDTH - ex;
  const fy = ey;

  // 左上角座標
  let sx = fx - boxSize / 2;
  let sy = fy - boxSize / 2;

  // 邊界檢查
  sx = Math.max(0, Math.min(WIDTH  - boxSize, sx));
  sy = Math.max(0, Math.min(HEIGHT - boxSize, sy));

  // 取出整張鏡像後的畫面
  const gfx = this.gethead();

  // 裁切並回傳
  return gfx.get(sx, sy, boxSize, boxSize);
}

}
