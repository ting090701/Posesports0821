
 import { v4 as uuidv4, v1 as uuidv1 } from 'https://jspm.dev/uuid@9.0.0';
export class FaceIdentify {
  static #instance = null;
  static getInstance() {
    if (!FaceIdentify.#instance) {
      FaceIdentify.#instance = new FaceIdentify();
        FaceIdentify.#instance.loadModels();
    }
      
    return FaceIdentify.#instance;
  }

  constructor() {
    this.modelsLoaded = false;
     this.faceMatcher = null; 
  }

  async loadModels(modelUrl = '/Objects/APIs/models') {
    // await Promise.all([
    //   faceapi.loadTinyFaceDetectorModel(modelUrl),
    //   faceapi.loadFaceLandmarkModel(modelUrl),
    //   faceapi.loadFaceRecognitionModel(modelUrl),
    // ]);
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
      faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
      faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl),
    ]);
    this.modelsLoaded = true;
  }

  async getID(imageElement, threshold = 0.1) {
    if (!this.modelsLoaded) throw new Error('Models not loaded');

    // const res = await faceapi
    //   .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
    //   .withFaceLandmarks()
    //   .withFaceDescriptor();
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 160,       // 介於 128~224，依實測速度/準確度調整
      scoreThreshold: 0.1,  // 預設 0.5，調低一點比較容易抓到臉
    });
    // 2. 用 TinyFaceDetector 偵測 + Landmark + Descriptor
    const res = await faceapi
      .detectSingleFace(imageElement, options)
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!res) throw new Error('No face detected');

    const name = uuidv4(); 
    return {
      label: name,               
      descriptor: res.descriptor, 
      threshold: threshold
    };
  }



async identifyFromDescriptors(input, playerList, threshold = 0.6) {
  if (playerList.length === 0) return null;

  const res = await faceapi
    .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!res) throw new Error('No face detected');

  const targetDescriptor = res.descriptor;
  const currentKey = JSON.stringify(playerList);

  if (!this.faceMatcher || this._lastPlayerListKey !== currentKey) {
    const labeledDescriptors = playerList.map(player => {
      if (!player.descriptor || player.descriptor.length !== 128) {
        throw new Error(`Invalid descriptor for player ${player.name}`);
      }
      const descriptorArray = new Float32Array(player.descriptor);
      return new faceapi.LabeledFaceDescriptors(player.name || 'unknown', [descriptorArray]);
    });

    this.faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, threshold);
    this._lastPlayerListKey = currentKey;
  }

  const bestMatch = this.faceMatcher.findBestMatch(targetDescriptor);
  if (bestMatch.label === 'unknown') return null;

  // 回傳對應的 player 資料
  return playerList.find(player => player.name === bestMatch.label) || null;
}



  findPlayerInList(targetPlayer, playerList, threshold = 0.6) {
    if (playerList.length === 0) return null;
    if (!targetPlayer.descriptor || targetPlayer.descriptor.length !== 128) {
      throw new Error('Invalid descriptor for targetPlayer');
    }

    const currentKey = JSON.stringify(playerList);

    if (!this.faceMatcher || this._lastPlayerListKey !== currentKey) {
      const labeledDescriptors = playerList.map(player => {
        if (!player.descriptor || player.descriptor.length !== 128) {
          throw new Error(`Invalid descriptor for player ${player.name}`);
        }
        const descriptorArray = new Float32Array(player.descriptor);
        return new faceapi.LabeledFaceDescriptors(player.name || 'unknown', [descriptorArray]);
      });

      this.faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, threshold);
      this._lastPlayerListKey = currentKey;
    }

    const targetDescriptor = new Float32Array(targetPlayer.descriptor);
    const bestMatch = this.faceMatcher.findBestMatch(targetDescriptor);

    if (bestMatch.label === 'unknown') return null;

    // 回傳對應的 player 資料
    return playerList.find(player => player.name === bestMatch.label) || null;
  }
}
