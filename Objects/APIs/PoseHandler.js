import { PoseTracker } from "./PoseTracker.js"
import { SustainCounter } from "../Counters/SustainCounter.js"

export class PoseHandler{
    constructor(p){
        this.tracker = PoseTracker.get_instance(p)
        this.left_hand_sustain_counter = new SustainCounter(3.0)
        this.righ_hand_sustain_counter = new SustainCounter(3.0)
        this.doub_hand_sustain_counter = new SustainCounter(3.0)
        this.cross_hand_sustain_counter = new SustainCounter(3.0)
    }



    update(_delta){
        
        this.left_hand_sustain_counter.update(_delta,this.tracker.get_is_left_hand_up())
        this.righ_hand_sustain_counter.update(_delta,this.tracker.get_is_righ_hand_up())
        this.doub_hand_sustain_counter.update(_delta,this.tracker.get_is_doub_hand_up())
        this.cross_hand_sustain_counter.update(_delta,this.tracker.get_is_cross_hand())

       // console.log("val_time ",this.doub_hand_sustain_counter.val_time)
    }
    reset_all_counter(){
        this.left_hand_sustain_counter.reset()
        this.righ_hand_sustain_counter.reset()
        this.doub_hand_sustain_counter.reset()
        this.cross_hand_sustain_counter.reset()

    }

    is_left_counter_reached(){
        return this.left_hand_sustain_counter.get_result_and_reset()
    }

    is_righ_counter_reached(){

        return this.righ_hand_sustain_counter.get_result_and_reset()
    }

    is_doub_counter_reached(){
        return this.doub_hand_sustain_counter.get_result_and_reset()
    }

    is_cross_counter_reached(){
        return this.cross_hand_sustain_counter.get_result_and_reset()
    }

}