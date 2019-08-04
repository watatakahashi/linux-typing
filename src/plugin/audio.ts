const context = new AudioContext()

// オーディオバッファの取得
export const getAudioBuffer = (
  url: string,
  fn: {
    (buf: AudioBuffer): void
  }
) => {
  let req = new XMLHttpRequest()
  req.responseType = 'arraybuffer'
  req.onreadystatechange = () => {
    if (req.readyState === 4) {
      if (req.status === 0 || req.status === 200) {
        context.decodeAudioData(req.response, buffer => {
          fn(buffer)
        })
      }
    }
  }
  req.open('GET', url, true)
  req.send('')
}
// サウンド再生
export const playSound = (buffer: AudioBuffer) => {
  let source = context.createBufferSource()
  source.buffer = buffer
  source.connect(context.destination)
  // 再生
  source.start(0)
}
