class AnimationPlayer{

    


    constructor(){
        this.animation_tracks = []
        this.time_elpased = 0.0
        this.max_time = 2.0


        this.playing = false
    }

    update(delta){
        if(!this.playing){
            return
        }
        this.time_elpased += delta
        if(this.time_elpased > max_time){
            this.time_elpased = max_time
            this.playing = false
        }


        for(let i = 0 ; i < this.animation_tracks.length ; i++){
            this.animation_tracks[i].update(time_elpased,this.max_time)
        }
    }

    start(){
        this.playing = true

    }

    add_track(track){
        this.animation_tracks.push(track)
    }


    remove_track(track){
        ind = this.animation_tracks.indexOf(track)
        if(ind){
            this.animation_tracks.splice(ind,1)

        }



    }
}