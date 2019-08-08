export interface Question {
  // id: string
  questionId: string
  question: string
  comment: string
  createdAt: Date | firebase.firestore.Timestamp
}
export interface Ranking {
  id: string
  username: string
  score: number
  typeCount: number
  typeMissCount: number
  timer: number
  createdAt: Date | firebase.firestore.Timestamp
}

export interface Config {
  questionCount: number
}
