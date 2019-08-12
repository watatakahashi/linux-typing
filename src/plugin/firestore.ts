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
 */
export const getQuestionList = async (questionsTable: string): Promise<type.Question[]> => {
  let questionList: type.Question[] = []
  await main.db
    .collection(questionsTable)
    .where('valid', '==', true)
    .orderBy('createdAt', 'desc')
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(document => {
        const qs: type.Question = document.data() as type.Question
        questionList.push(qs)
      })
    })
    .catch(err => {
      console.log(err)
    })
  return questionList
}
/**
 * 問題を追加
 * @param questionsTable
 * @param questionDraft
 * @param config
 */
export const addQuestion = async (
  questionsTable: string,
  questionDraft: type.Question,
  config: type.Config
): Promise<void> => {
  questionDraft.questionId = String(config.questionCount + 1)
  questionDraft.createdAt = new Date()
  await main.db
    .collection(questionsTable)
    .doc(String(config.questionCount + 1))
    .set(questionDraft)
    .catch(error => {
      console.error(error)
    })
}
/**
 * 問題を削除
 * @param questionsTable
 * @param question
 */
export const deleteQuestion = async (questionsTable: string, question: type.Question): Promise<void> => {
  await main.db
    .collection(questionsTable)
    .doc(question.questionId)
    .update({ valid: false })
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

/**
 * 設定情報を取得
 * @param configTable
 * @param config
 */
export const getConfig = async (configTable: string, config: type.Config): Promise<type.Config> => {
  await main.db
    .collection(configTable)
    .doc('config')
    .get()
    .then(doc => {
      if (doc.exists) {
        config = doc.data() as type.Config
      }
    })
    .catch(error => {
      console.log(error)
    })
  return config
}
/**
 * 設定情報を更新
 * @param configTable
 * @param config
 */
export const updateConfig = (configTable: string, config: type.Config): void => {
  main.db
    .collection(configTable)
    .doc('config')
    .update({ questionCount: config.questionCount + 1 })
    .catch(error => {
      console.log(error)
    })
}
