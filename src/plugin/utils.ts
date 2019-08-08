import * as firebase from 'firebase/app'
import 'firebase/firestore'

// 配列をシャッフルする
export const arrayShuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    let rand: number = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[rand]] = [array[rand], array[i]]
  }
  return array
}

export const addDocumentId = (tableName: string, docId: string) => {
  const db = firebase.firestore()
  db.collection(tableName)
    .doc(docId)
    .update({ id: docId })
    .then(() => {
      console.log('id転記完了')
    })
    .catch(() => {
      console.log('id転記失敗')
    })
}
