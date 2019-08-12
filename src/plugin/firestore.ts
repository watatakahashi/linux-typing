import * as firebase from 'firebase/app'
import 'firebase/firestore'
import * as utils from '@/plugin/utils'
import * as type from '@/types/type'
import * as main from '@/main'
// Your web app's Firebase configuration

/**
 * ドキュメントIDをフィールドに転記する
 * @param tableName ドキュメントのテーブル名
 * @param docId ドキュメントID
 */
export const addDocumentId = (tableName: string, docId: string): void => {
  main.db
    .collection(tableName)
    .doc(docId)
    .update({ id: docId })
    .catch(error => {
      console.log(error)
    })
}
/**
 * 問題リストを取得
 * @param questionsTable
 * @param questionCount
 */
export const getQuestionList = async (questionsTable: string, questionCount: number): Promise<type.Question[]> => {
  let questionList: type.Question[] = []
  await main.db
    .collection(questionsTable)
    .where('valid', '==', true)
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(document => {
        const qs: type.Question = document.data() as type.Question
        questionList.push(qs)
      })
      questionList = utils.arrayShuffle(questionList)
      questionList = questionList.slice(0, questionCount)
    })
    .catch(err => {
      console.log(err)
    })
  return questionList
}

/**
 * ランキングリストを取得
 * @param rankingTable
 * @param maxDisplayPlayers
 */
export const getRankingList = async (rankingTable: string, maxDisplayPlayers: number): Promise<type.Ranking[]> => {
  let rankingList: type.Ranking[] = []
  await main.db
    .collection(rankingTable)
    .orderBy('score', 'desc')
    .limit(maxDisplayPlayers)
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(document => {
        const ranking: type.Ranking = document.data() as type.Ranking
        rankingList.push(ranking)
      })
    })
    .catch(err => {
      console.log(err)
    })
  return rankingList
}
/**
 * ランキングに追加
 * @param rankingTable
 * @param ranking
 */
export const addRanking = async (rankingTable: string, ranking: type.Ranking): Promise<void> => {
  await main.db
    .collection(rankingTable)
    .add(ranking)
    .then(doc => {
      addDocumentId(rankingTable, doc.id)
    })
    .catch(error => {
      console.error(error)
    })
}
