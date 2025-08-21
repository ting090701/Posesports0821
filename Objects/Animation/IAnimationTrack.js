

class IAnimationTrack{

    constructor(target){
        this.target = target
        this.animation_keys = []
    }

    update(time_elpased,max_time){

        normalized_time = time_elpased / max_time
        _on_update(normalized_time)

    }

    _on_update(normalized_time){
        
    }


    addKey(time,val){
        this.animation_keys.push(new AnimationKey(time, val));
        this.animation_keys.sort((a, b) => a.time - b.time); // 確保 keyframes 按時間排序
    }


    removeKey(animation_key){
        let ind = this.animation_keys.indexOf(animation_key)
        if(ind){
            this.animation_keys.splice(ind,1)
        }
    }

    
    getValueAt(time_elapsed) {
        if (this.keyframes.length === 0) return null;
        
        // 如果時間超出範圍，回傳邊界值
        if (time_elapsed <= this.keyframes[0].time) return this.keyframes[0].val;
        if (time_elapsed >= this.keyframes[this.keyframes.length - 1].time) return this.keyframes[this.keyframes.length - 1].val;

        // 找到對應的兩個關鍵幀
        let prevKey, nextKey;
        for (let i = 0; i < this.keyframes.length - 1; i++) {
            if (time_elapsed >= this.keyframes[i].time && time_elapsed <= this.keyframes[i + 1].time) {
            prevKey = this.keyframes[i];
            nextKey = this.keyframes[i + 1];
            break;
            }
        }

        // 線性插值 (lerp)
        let t = (time_elapsed - prevKey.time) / (nextKey.time - prevKey.time);
        return prevKey.val * (1 - t) + nextKey.val * t;
    }

}