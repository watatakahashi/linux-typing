export interface Question {
  // id: string
  questionId: string
  question: string
  comment: string
}
export interface Ranking {
  id: string
  username: string
  score: number
}

export interface Config {
  questionCount: number
}
