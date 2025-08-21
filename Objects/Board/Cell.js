
export class Cell {
    constructor(x = 0, y = 0 , sizeX, sizey , type = 1) { 
        this.type = 0;
        this.color = "rgba(255, 245, 245, 0.57)";
        this.x = x;
        this.y = y;
        this.width = sizeX;
        this.height = sizey;
    }
}
