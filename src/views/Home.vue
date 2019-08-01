<template>
  <div class="home">
    <div>タイピングゲーム</div>
    <div v-if="starting">
      <button @click="finish">終了する</button>
      <div v-if="playing">
        <div>問題数：{{questionIndex + 1}}/{{questions.length}}</div>
        <div>タイプミス回数：{{typeMissCount}}回</div>
        <div>経過時間：{{timer}}秒</div>
        <!-- <h1>問題：{{question}}</h1> -->
        <h1>説明文</h1>
        <h1>
          <span class="transparent">{{clearAnswer}}</span>
          <span>{{notAnswer}}</span>
        </h1>
        <h1></h1>
      </div>
      <div v-else>
        <div>タイプ数:{{typeCount}}回</div>
        <div>タイピング速度：{{typeSpeed}}回/秒</div>
        <div>タイプミス回数：{{typeMissCount}}回</div>
        <div>経過時間：{{timer}}秒</div>
        <div>スコア：{{score}}</div>
      </div>
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
  playing: boolean = false
  // 問題回答用
  // questions: string[] = [
  //   'cp file1 dir2',
  //   'mv file1 dir1',
  //   'cd /usr/src',
  //   'chown -R hoge dir'
  // ]
  questions: string[] = ['aaa', 'iii', 'uuu']

  questionIndex: number = 0
  clearAnswer: string = ''
  notAnswer: string = ''
  charIndex: number = 0
  // 記録用
  typeCount: number = 0
  typeMissCount: number = 0
  timer: number = -1

  mounted() {
    this.reset()
  }

  // ゲームスタート時
  start() {
    this.starting = true
    this.playing = true
    this.countUp()
    window.addEventListener('keypress', this.keyCheck)
  }
  // ホーム画面へ戻る際に実行
  finish() {
    this.starting = false
    this.reset()
  }
  // 初期化処理
  reset() {
    this.questionIndex = 0
    this.clearAnswer = ''
    this.notAnswer = this.question
    this.charIndex = 0
    this.typeMissCount = 0
    this.playing = false
    this.timer = -1 // countUpを最初0秒表示させるため-1に設定
  }

  // タイマー
  countUp() {
    if (!this.playing) {
      return
    }
    this.timer += 1
    setTimeout(this.countUp, 1000)
  }

  // キーボード入力と文字が一致しているか確認
  keyCheck(e: any) {
    this.typeCount += 1
    const character = String.fromCharCode(e.keyCode)
    if (this.question[this.charIndex] === character) {
      this.clearAnswer += character
      this.notAnswer = this.notAnswer.slice(1)
      this.charIndex += 1
    } else {
      this.typeMissCount += 1
    }
  }

  // 問題を表示
  get question(): string {
    return this.questions[this.questionIndex]
  }

  // タイピング速度
  get typeSpeed(): number {
    if (this.timer <= 0) {
      return 0
    } else {
      return this.typeCount / this.timer
    }
  }

  // 全回答文字数
  get questionsTotalChars(): number {
    let sum = 0
    this.questions.forEach(element => {
      sum += element.length
    })
    return sum
  }

  // スコアはWPM(1分あたりの打鍵数)×正確率
  get score(): number {
    return (
      (this.questionsTotalChars / this.timer) *
      60 *
      ((this.typeCount - this.typeMissCount) / this.typeCount)
    )
  }

  // 正解と一致したら次の問題、全部正解するとクリア
  @Watch('clearAnswer')
  onWatchChanged(val: string) {
    if (val === this.question) {
      this.questionIndex += 1
      this.charIndex = 0
      if (this.questions.length === this.questionIndex) {
        this.gameClear()
      }
      this.notAnswer = this.question
      this.clearAnswer = ''
    }
  }
  // クリア時の処理
  gameClear() {
    this.playing = false
    window.removeEventListener('keypress', this.keyCheck)
    alert('クリア！')
  }
}
</script>

<style>
.transparent {
  opacity: 0.5;
}
</style>
