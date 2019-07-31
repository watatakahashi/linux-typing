<template>
  <div class="home">
    <div>タイピングゲーム</div>
    <div v-if="starting">
      <div>{{question}}</div>
      <div>{{answer}}</div>
      <div>タイプミス回数：{{typeMissCount}}回</div>
      <div>経過時間：{{elapsedTime}}秒</div>
      <button @click="finish">終了する</button>
    </div>
    <div v-else>
      <button @click="start">開始する</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'

@Component({})
export default class Home extends Vue {
  starting: boolean = false
  count: number = 0
  questions: string[] = ['aaa', 'iii', 'uuu']
  answer: string = ''
  charCount: number = 0
  typeMissCount: number = 0
  // 開始時間
  startTime: Date = new Date()

  click() {
    alert('test')
  }
  start() {
    this.starting = true
    this.startTime = new Date()
    window.addEventListener('keypress', this.keyCheck)
  }
  finish() {
    this.starting = false
    this.init()
  }
  init() {
    this.count = 0
    this.answer = ''
    this.charCount = 0
    this.typeMissCount = 0
  }

  mounted() {}

  keyCheck(e: any) {
    const character = String.fromCharCode(e.keyCode)
    if (this.question[this.charCount] === character) {
      this.answer += character
      this.charCount += 1
    } else {
      this.typeMissCount += 1
    }
  }

  // 問題を表示
  get question() {
    return this.questions[this.count]
  }

  // 常に1秒しか出ないので修正
  get elapsedTime() {
    return new Date().getTime() - this.startTime.getTime()
  }

  // 正解と一致したら次の問題、全部正解するとクリア
  @Watch('answer')
  onWatchChanged(val: string) {
    if (val === this.question) {
      this.count += 1
      this.charCount = 0
      if (this.questions.length === this.count) {
        alert('クリア！')
        window.removeEventListener('keypress', this.keyCheck)
      }
      this.answer = ''
    }
  }
}
</script>
