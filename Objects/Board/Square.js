export class Square {
    constructor(topLeft ,topRight ,  bottomRight , bottomLeft) { 
        this.topLeft = topLeft; // {x: 0, y: 0}
        this.topRight = topRight; // {x: 0, y: 0}
        this.bottomRight = bottomRight; // {x: 0, y: 0}
        this.bottomLeft = bottomLeft; // {x: 0, y: 0}
        this.configuration = 0;
        this.type = topLeft.type;


        this.centerTop = {
            x: (topLeft.x + topRight.x) / 2,
            y: (topLeft.y + topRight.y) / 2,
        };
        this.centerRight = {
            x: (topRight.x + bottomRight.x) / 2,
            y: (topRight.y + bottomRight.y) / 2,
        };
        this.centerBottom = {
            x: (bottomLeft.x + bottomRight.x) / 2,
            y: (bottomLeft.y + bottomRight.y) / 2,
        };
        this.centerLeft = {
            x: (topLeft.x + bottomLeft.x) / 2,
            y: (topLeft.y + bottomLeft.y) / 2,
        };


        if (topLeft.type == 0) 
            this.configuration += 8;
        if (topRight.type == 0)
            this.configuration += 4;
        if (bottomRight.type == 0)
            this.configuration += 2;
        if (bottomLeft.type == 0)
            this.configuration += 1;
    }
}
