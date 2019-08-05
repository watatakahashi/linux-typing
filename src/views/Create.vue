<template>
  <div>
    <div>
      <div>
        問題文：
        <input type="text" v-model="question" />
      </div>
      <div>
        コメント：
        <input type="text" v-model="comment" />
      </div>
      <div>
        <button @click="submit">送信</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import * as firebase from 'firebase/app'
import 'firebase/firestore'
import * as audio from '@/plugin/audio'
import * as utils from '@/plugin/utils'

interface Question {
  questionNumber: string
  question: string
  comment: string
}

@Component({})
export default class Create extends Vue {
  db = firebase.firestore()
  question: string = ''
  comment: string = ''
  questionsTable: string = 'typing-questions-beta'
  questions: Question[] = []

  async submit() {
    await this.getQuestionsCount()
    await this.addQuestion()
    this.question = ''
    this.comment = ''
  }

  async addQuestion(): Promise<void> {
    let question: Question = {
      questionNumber: String(this.questions.length + 1),
      question: this.question,
      comment: this.comment
    }
    await this.db
      .collection(this.questionsTable)
      .doc(String(this.questions.length + 1))
      .set(question)
      .then(function() {
        console.log('Document successfully written!')
      })
      .catch(function(error) {
        console.error('Error writing document: ', error)
      })
  }
  getQuestionsCount(): Promise<number> {
    return new Promise(resolve => {
      this.db
        .collection(this.questionsTable)
        .get()
        .then(querySnapshot => {
          this.questions = []
          querySnapshot.forEach(document => {
            const qs: Question = document.data() as Question
            this.questions.push(qs)
            return resolve(this.questions.length)
          })
          console.log('データ数取得')
        })
        .catch(err => {
          console.log(err)
          return resolve(0)
        })
    })
  }
}
</script>
