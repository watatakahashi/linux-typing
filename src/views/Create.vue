<template>
  <div>
    <div>
      <div>
        問題文：
        <input type="text" v-model="question" placeholder="e.g. cd hoge" />
      </div>
      <div>
        コメント：
        <input type="text" v-model="comment" placeholder="e.g. hogeに移動する" />
      </div>
      <div>
        <button @click="submit" :class="{hidden:isHidden}">問題を登録</button>
      </div>
    </div>
    <div>
      <router-link :to="{ name: 'index'}">戻る</router-link>
    </div>
    <div>
      <h2>{{gameId}}問題テーブル</h2>
      <table class="table" border="1">
        <tr>
          <th>問題番号</th>
          <th>問題文</th>
          <th>解説</th>
          <th>削除</th>
        </tr>
        <tr v-for="(question,index) in questions" v-bind:key="index">
          <td>{{question.questionId}}</td>
          <td>{{question.question}}</td>
          <td>{{question.comment}}</td>
          <td>
            <span class="delete" @click="deleteCheck(question)">×</span>
          </td>
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

interface Config {
  questionCount: number
}

@Component({})
export default class Create extends Vue {
  db = firebase.firestore()
  gameId: string = ''
  question: string = ''
  comment: string = ''
  questionsTable: string = ''
  rankingTable: string = ''
  configTable: string = ''
  isHidden: boolean = false
  questions: type.Question[] = []
  config: Config = {
    questionCount: 0
  }

  mounted() {
    this.gameId = this.$route.params.gameId
    this.questionsTable = 'typing-beta-' + this.gameId + '-questions'
    this.rankingTable = 'typing-beta-' + this.gameId + '-rankings'
    this.configTable = 'typing-beta-' + this.gameId + '-config'
    this.getQuestions()
  }

  async submit() {
    this.isHidden = true
    await this.getConfig()
    await this.addQuestion()
    await this.updateConfig()
    this.question = ''
    this.comment = ''
    await this.getQuestions()
    this.isHidden = false
  }
  async deleteCheck(question: type.Question) {
    if (confirm('この問題を削除してもよろしいですか？')) {
      await this.deleteQuestion(question)
      await this.getQuestions()
    }
  }

  async addQuestion(): Promise<void> {
    let question: type.Question = {
      questionId: String(this.config.questionCount + 1),
      question: this.question,
      comment: this.comment,
      createdAt: new Date(),
      valid: true
    }

    await this.db
      .collection(this.questionsTable)
      .doc(String(this.config.questionCount + 1))
      .set(question)
      .then(() => {})
      .catch(error => {
        console.error(error)
      })
  }
  getQuestions(): Promise<number> {
    return new Promise(resolve => {
      this.questions = []
      this.db
        .collection(this.questionsTable)
        .where('valid', '==', true)
        .orderBy('createdAt', 'desc')
        .get()
        .then(querySnapshot => {
          this.questions = []
          querySnapshot.forEach(document => {
            const qs: type.Question = document.data() as type.Question
            this.questions.push(qs)
            return resolve(this.questions.length)
          })
        })
        .catch(err => {
          console.log(err)
          return resolve(0)
        })
    })
  }
  getConfig(): Promise<void> {
    return new Promise(resolve => {
      this.db
        .collection(this.configTable)
        .doc('config')
        .get()
        .then(doc => {
          if (doc.exists) {
            this.config = doc.data() as Config
            console.log(this.config)
          }
          resolve()
        })
        .catch(error => {
          console.log(error)
        })
    })
  }
  updateConfig(): Promise<void> {
    return new Promise(resolve => {
      this.db
        .collection(this.configTable)
        .doc('config')
        .update({ questionCount: this.config.questionCount + 1 })
        .then(() => {
          console.log('config更新成功')
          resolve()
        })
        .catch(() => {
          console.log('config更新失敗')
        })
    })
  }
  async deleteQuestion(question: type.Question): Promise<void> {
    await this.db
      .collection(this.questionsTable)
      .doc(question.questionId)
      .update({ valid: false })
  }
}
</script>

<style>
.table {
  margin: 0 auto;
  border: 1rem;
}
.hidden {
  display: none;
}
.delete {
  cursor: pointer;
}
</style>
