// 配列をシャッフルする
export const arrayShuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    let rand: number = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[rand]] = [array[rand], array[i]]
  }
  return array
}
