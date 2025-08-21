export class IScene{

    constructor(p) {
        if (new.target === IScene) {
          throw new Error('Cannot instantiate an abstract class.');
        }
        this.p = p;
        this.objects = [];
        
    }
    
    
    draw() {
        for(let i = 0 ; i < this.objects.length ; i ++){
            this.objects[i].draw()
        }
    
    }
  
    update(delta) {
        for(let i = 0 ; i < this.objects.length ; i ++){
            this.objects[i].update(delta)
        }
        this._on_update(delta)
    }
    init(){
        throw new Error('Abstract method _init() must be implemented in derived class');

    }

    add(object) {
        if (!object || typeof object.draw !== 'function' || typeof object.update !== 'function') {
          throw new Error('Object must implement draw() and update() methods.');
        }
        this.objects.push(object);
      }
    
    remove(object) {
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }

    _on_update(delta){


    }


    _on_enter(){


    }
    _on_exit(){


    }

}