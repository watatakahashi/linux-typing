import * as firebase from 'firebase/app'
import 'firebase/firestore'

/**
 * ドキュメントIDをフィールドに転記する
 * @param tableName ドキュメントのテーブル名
 * @param docId ドキュメントID
 */
export const addDocumentId = (tableName: string, docId: string): void => {
  const db = firebase.firestore()
  db.collection(tableName)
    .doc(docId)
    .update({ id: docId })
    .catch(error => {
      console.log(error)
    })
}
