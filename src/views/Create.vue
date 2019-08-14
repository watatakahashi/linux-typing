<template>
  <div>
    <div>
      <div>
        問題文：
        <input type="text" v-model="questionDraft.question" placeholder="e.g. cd hoge" />
        <br />
        <span class="isDisabled" v-show="isDisabled">半角英数記号スペースのみ可</span>
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
        <tr v-for="(question,index) in questionList" v-bind:key="index">
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
import * as firestore from '@/plugin/firestore'
import * as type from '@/types/type'

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
  questionList: type.Question[] = []
  config: type.Config = {
    questionCount: 0
  }

  async mounted() {
    this.gameId = this.$route.params.gameId
    this.questionsTable = 'typing-beta-' + this.gameId + '-questions'
    this.configTable = 'typing-beta-' + this.gameId + '-config'
    this.questionList = await firestore.getQuestionList(this.questionsTable)
    this.config = await firestore.getConfig(this.configTable, this.config)
  }

  async submit() {
    this.isDisabled = true
    await firestore.addQuestion(this.questionsTable, this.questionDraft, this.config)
    firestore.updateConfig(this.configTable, this.config)
    this.reset()
    this.isDisabled = false
    this.questionList = await firestore.getQuestionList(this.questionsTable)
    this.config = await firestore.getConfig(this.configTable, this.config)
  }
  reset() {
    this.questionDraft.question = ''
    this.questionDraft.comment = ''
  }
  async deleteCheck(question: type.Question) {
    if (confirm('この問題を削除してもよろしいですか？')) {
      await firestore.deleteQuestion(this.questionsTable, question)
      this.questionList = await firestore.getQuestionList(this.questionsTable)
    }
  }

  @Watch('questionDraft.question')
  onWatchChanged(val: string): void {
    // :TODO 全角スペース許可をさせないようにする
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
.isDisabled {
  color: red;
}
</style>
