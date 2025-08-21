// Data/utils.js
/**
 * 將 p5.Image 轉成 Base64 字串（PNG）
 * @param {p5.Image} img 
 * @returns {string|null}
 */
export function imageToBase64(img) {
  if (!img) return null;
  // p5.Image 底層有一個 HTMLCanvasElement：img.canvas
  return img.canvas.toDataURL('image/png');
}
