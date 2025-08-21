import {IObject} from "../../IObject.js"
import { CircleCollision } from './../../Collisions/CircleCollision.js';


export class Ball extends IObject{
    static p;
    t = 0
    base_velocity = 0.01
    velocity = 0.05
    acc = 0.01

    randomX_offset_throw = 0
    randomY_offset_throw = 0

    randomX_offset_end = 0
    randomY_offset_end = 0
    shooting = false
    constructor(p){
        super(p)
        this.init_ball()

        //add collider and set the initial radius
        this.collider = new CircleCollision(this.p,0.0)
        this.radius = 20

        
    }


    _on_update = function(delta){
        this.control_handler()
        if(!this.shooting){
            return
        }
        let p = this.p

        // 定義起點和終點
        let startX = p.width / 2;
        let startY = p.height * 1 / 9;
        let endX = p.width / 5 * 2  + this.randomX_offset_end;
        let endY = p.height / 2 + this.randomY_offset_end;

        // 控制點
        

        let controlX1 = startX+ this.randomX_offset_throw;
        let controlY1 = 0 + this.randomY_offset_throw;
        let controlX2 = endX;
        let controlY2 = endY;

        // 繪製貝塞爾曲線
        //let temp_weight = p.strokeWeight()
        p.noFill();
        p.stroke(0);
        p.strokeWeight(4);
        p.bezier(startX, startY, controlX1, controlY1, controlX2, controlY2, endX, endY);

        // 計算曲線上的座標
        let x = p.bezierPoint(startX, controlX1, controlX2, endX, this.t);
        let y = p.bezierPoint(startY, controlY1, controlY2, endY, this.t);

        // 計算切線方向以旋轉物件
        let tx = p.bezierTangent(startX, controlX1, controlX2, endX, this.t);
        let ty = p.bezierTangent(startY, controlY1, controlY2, endY, this.t);
        let angle = p.atan2(ty, tx);
        this.rotation = angle
        this.position = p.createVector(x, y)
        this.scale = p.createVector(this.t * 10,this.t * 10)
        // 繪製移動的物件

        

        // 更新t以移動物件
        this.velocity += this.acc * delta;
        //console.log(delta)
        this.t += this.velocity;
        if (this.t > 1) {
            
            this.stop_shoot()
        }
        p.fill(0,0,0)
        
        p.strokeWeight(1);
        this.update_collider()

    }
    control_handler(){
        if(!this.shooting && this.p.keyIsDown(83)){
            this.start_shoot()
        }

    }

    stop_shoot(){
        this.shooting = false
    }
    start_shoot(){
        this.init_ball()
        this.shooting = true
    }

    init_ball(){
        let p = this.p
        this.t = 0;
        this.velocity = this.base_velocity

        this.randomX_offset_throw = p.random(-100,100)
        this.randomY_offset_throw = p.random(-100,100)

        this.randomX_offset_end = p.random(-50,50)
        this.randomY_offset_end = p.random(-20,20)

    }

    update_collider(){
        this.collider.position = this.position
        this.collider.radius = this.radius
    }


    _on_draw = function(){
        if(this.shooting){
            this.p.fill(255, 0, 0);
            this.p.ellipse(0, 0, this.radius, this.radius);
        }
        
        
    }



}