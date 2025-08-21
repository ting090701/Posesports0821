export class SustainCounter{
    constructor(_sec){
        this.max_time = _sec
        this.val_time = 0
    }



    update(_delta , state){
        if(state){
            this.val_time += _delta
            
        }else{
            this.reset()
        }
    }

    get_result(){
        return this.val_time >= this.max_time
    }
    reset(){
        this.val_time = 0.0
    }
    get_result_and_reset(){
        if(this.val_time >= this.max_time){

            this.reset()
            return true
        }
        return false
    }
}