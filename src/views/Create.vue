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
    <div>
      <h2>問題テーブル</h2>
      <table border="1">
        <tr>
          <th>問題番号</th>
          <th>問題文</th>
          <th>解説</th>
        </tr>
        <tr v-for="(question,index) in questions" v-bind:key="index">
          <td>{{question.questionNumber}}</td>
          <td>{{question.question}}</td>
          <td>{{question.comment}}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import * as firebase from 'firebase/app'
import 'firebase/firestore'
import * as audio from '@/plugin/audio'
import * as utils from '@/plugin/utils'
import * as type from '@/types/type'

@Component({})
export default class Create extends Vue {
  db = firebase.firestore()
  question: string = ''
  comment: string = ''
  questionsTable: string = 'typing-questions-beta'
  questions: type.Question[] = []

  mounted() {
    this.getQuestionsCount()
  }

  async submit() {
    await this.getQuestionsCount()
    await this.addQuestion()
    this.question = ''
    this.comment = ''
  }

  async addQuestion(): Promise<void> {
    let question: type.Question = {
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
      this.questions = []
      this.db
        .collection(this.questionsTable)
        .orderBy('questionNumber', 'asc')
        .get()
        .then(querySnapshot => {
          this.questions = []
          querySnapshot.forEach(document => {
            const qs: type.Question = document.data() as type.Question
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
