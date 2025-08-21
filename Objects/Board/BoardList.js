import { IObject } from "../IObject.js"
import { GeneratorManager } from "../Utils/GeneratorManager.js";
import {BoardGenerator } from "./BoardGenerator.js";
import { Board } from "./Board.js";
/*
    處理多個 EasyBoard 的管理
    負責生成 EasyBoard 並管理它們的生命周期
    
*/


export class BoardList extends IObject{
    // constructor(p, keypointDataList){
    constructor(p, mode, prekeypointsdata){
        super(p);
        this.position.x = 0;
        this.position.y = 0;
        this.easyBoardList = [];
        this.reusableStack = [];

        this.prekeypointsdata = prekeypointsdata;
        this.isLoop = false;

        this.boardAddSpeed = 0;
        this.generatorManaer = new GeneratorManager();
        // this.boardGenerator = new BoardGenerator(this.p, this.keypointDataList);
        this.boardGenerator = new BoardGenerator(this.p, mode, this.prekeypointsdata);
    }
    clear(){
    
        this.easyBoardList.forEach(board => {
            board.isActive = false; 
            this.reusableStack.push(board);
        });
        this.easyBoardList = [];
        this.generatorManaer.clearAll();
    }
    add_board(onLine , onEnd , type = BoardGenerator.Type.POSE , speed = 10) {
        let board;
        if (this.reusableStack.length > 0) {
            board = this.reusableStack.pop(); 
            this.easyBoardList.push(board); 
          
        } else {
            board = new Board(this.p); 
            this.easyBoardList.push(board); 
        }
        
        this.GeneratorBoard(type);
        this.generatorManaer.start(
            board.startRise( 
                this.boardGenerator.getBoard(),
                (board)=>{
                    if(this.isLoop) {
                        this.add_board(onLine);
                    }
                    this.reusableStack.push(board);
                    this.easyBoardList = this.easyBoardList.filter(b => b !== board);
                    if(onEnd) {
                        onEnd(board);
                    }
                } ,
                (board)=>{
                    onLine(board);
                }
            )
        );    
        board.addSpeed = this.boardAddSpeed;
        board.speed = speed;
        return board;
    }
    GeneratorBoard(type) {
        switch(type){
            case BoardGenerator.Type.POSE:
                return this.boardGenerator.generatePoseBoard();
            case BoardGenerator.Type.LIFE:
                return this.boardGenerator.generateLeftArea();
            case BoardGenerator.Type.RIGHT:
                return this.boardGenerator.generateRightArea();
            case BoardGenerator.Type.TOP:
                return this.boardGenerator.generateTopArea();
            default:
                throw new Error("Unknown board type");
        }
    }
    setSpeed(speed){
        for (let i = this.easyBoardList.length - 1; i >= 0; i--) {
            this.easyBoardList[i].addSpeed = speed;
            this.boardAddSpeed = speed;
        }
    }
    

    _on_update(delta){
        this.generatorManaer.update();
        for (let i = this.easyBoardList.length - 1; i >= 0; i--) {
            this.easyBoardList[i].update(delta);
        }
    }

    
    _on_draw(){
        for (let i = this.easyBoardList.length - 1; i >= 0; i--) {
            this.easyBoardList[i].draw();
        }
    }


    update_collider(){
        
    }
}