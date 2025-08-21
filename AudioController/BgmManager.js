export class BgmManager {
  static instance = null;

  constructor(p) {
    if (BgmManager.instance) return BgmManager.instance;

    this.p = p;
    this._currentSound = null;
    this._pendingSound = null; // 等待載入的音效
    BgmManager.instance = this;
  }

  static get_instance(p) {
    return BgmManager.instance || new BgmManager(p);
  }

  isPlaying() {
    return this._currentSound !== null && this._currentSound.isPlaying();
  }

  update() {
    // 如果有等待播放的音效，檢查是否已載入
    if (this._pendingSound && this._pendingSound.isLoaded()) {
      this.playLoop(this._pendingSound);
      this._pendingSound = null;
    }
  }

  playLoop(sound) {
    if (!sound) {
      console.warn("傳入的音效為 null 或 undefined");
      return;
    }

    if (!sound.isLoaded()) {
      console.log("音效尚未載入，等待 update 處理播放");
      this._pendingSound = sound;
      return;
    }

    if (this._currentSound === sound && sound.isPlaying()) {
      console.log(" 同一首音樂已在播放，略過重新播放");
      return;
    }

    if (this._currentSound && this._currentSound !== sound) {
      this._currentSound.stop();
    }

    sound.setVolume(1.0);
    sound.loop();
    this._currentSound = sound;
  }

  stop(sound) {
    if (this._currentSound === sound && sound.isPlaying()) {
      sound.stop();
      this._currentSound = null;
    }
  }

  setVolume(sound, vol) {
    if (sound) {
      sound.setVolume(vol);
    }
  }
}
