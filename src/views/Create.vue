<template>
  <div>
    <div>
      <div>
        問題文：
        <input type="text" v-model="questionDraft.question" placeholder="e.g. cd hoge" />
      </div>
      <div>
        コメント：
        <input type="text" v-model="questionDraft.comment" placeholder="e.g. hogeに移動する" />
      </div>
      <div>
        <button @click="submit" :class="{hidden:isHidden}" :disabled="isDisabled">問題を登録</button>
      </div>
      <div>※間違えて登録した場合は削除してください</div>
    </div>
    <div>
      <router-link :to="{ name: 'index'}">ホームへ</router-link>
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
  // 画面情報
  db = firebase.firestore()
  gameId: string = ''
  isHidden: boolean = false
  isDisabled: boolean = true
  // 作成する問題
  questionDraft: type.Question = {
    questionId: '',
    question: '',
    comment: '',
    createdAt: new Date(),
    valid: true
  }
  // テーブル用
  questionsTable: string = ''
  configTable: string = ''
  questions: type.Question[] = []
  config: Config = {
    questionCount: 0
  }

  mounted() {
    this.gameId = this.$route.params.gameId
    this.questionsTable = 'typing-beta-' + this.gameId + '-questions'
    this.configTable = 'typing-beta-' + this.gameId + '-config'
    this.getQuestions()
  }

  async submit() {
    this.isDisabled = true
    await this.getConfig()
    await this.addQuestion()
    this.updateConfig()
    this.reset()
    this.isDisabled = false
    await this.getQuestions()
  }
  reset() {
    this.questionDraft.question = ''
    this.questionDraft.comment = ''
  }
  async deleteCheck(question: type.Question) {
    if (confirm('この問題を削除してもよろしいですか？')) {
      await this.deleteQuestion(question)
      await this.getQuestions()
    }
  }

  async addQuestion(): Promise<void> {
    this.questionDraft.questionId = String(this.config.questionCount + 1)
    this.questionDraft.createdAt = new Date()

    await this.db
      .collection(this.questionsTable)
      .doc(String(this.config.questionCount + 1))
      .set(this.questionDraft)
      .catch(error => {
        console.error(error)
      })
  }
  async getQuestions(): Promise<void> {
    this.questions = []
    await this.db
      .collection(this.questionsTable)
      .where('valid', '==', true)
      .orderBy('createdAt', 'desc')
      .get()
      .then(querySnapshot => {
        this.questions = []
        querySnapshot.forEach(document => {
          const qs: type.Question = document.data() as type.Question
          this.questions.push(qs)
        })
      })
      .catch(err => {
        console.log(err)
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
          }
          resolve()
        })
        .catch(error => {
          console.log(error)
        })
    })
  }
  updateConfig(): void {
    this.db
      .collection(this.configTable)
      .doc('config')
      .update({ questionCount: this.config.questionCount + 1 })
      .catch(error => {
        console.log(error)
      })
  }
  async deleteQuestion(question: type.Question): Promise<void> {
    await this.db
      .collection(this.questionsTable)
      .doc(question.questionId)
      .update({ valid: false })
  }
  @Watch('questionDraft.question')
  onWatchChanged(val: string): void {
    var reg = new RegExp(/^[a-zA-Z0-9!-/:-@¥[-`{-~\s]*$/)
    this.isDisabled = reg.test(val) && val != '' ? false : true
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
