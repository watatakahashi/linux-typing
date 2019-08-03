<template>
  <div class="home">
    <div>タイピングゲーム</div>
    <div v-if="starting">
      <div v-if="playing">
        <div>問題数：{{questionIndex + 1}}/{{questions.length}}</div>
        <div>タイプミス回数：{{typeMissCount}}回</div>
        <div>経過時間：{{timer}}秒</div>
        <h1>説明文：{{comment}}</h1>
        <h1>
          <span class="transparent">{{clearAnswer}}</span>
          <span>{{notAnswer}}</span>
        </h1>
      </div>
      <div v-else>
        <button @click="finish">ホームへ</button>
        <div>タイプ数:{{typeCount}}回</div>
        <div>タイピング速度：{{typeSpeed}}回/秒</div>
        <div>タイプミス回数：{{typeMissCount}}回</div>
        <div>経過時間：{{timer}}秒</div>
        <div>スコア：{{score}}</div>
        <div class="table">
          <table border="1">
            <tr>
              <th>問題番号</th>
              <th>ヒント</th>
              <th>問題文</th>
            </tr>
            <tr v-for="(question,index) in questions" v-bind:key="index">
              <td>{{question.questionNumber}}</td>
              <td>{{question.question}}</td>
              <td>{{question.comment}}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
    <div v-else>
      <button @click="start">開始する</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'

interface Question {
  // id: string
  questionNumber: number
  question: string
  comment: string
}

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

  // ダミー問題
  questions: Question[] = [
    { questionNumber: 1, question: ' aaa', comment: 'コメント1' },
    { questionNumber: 2, question: 'iii', comment: 'コメント2' },
    { questionNumber: 3, question: 'uuu', comment: 'コメント3' }
  ]

  questionIndex: number = 0
  charIndex: number = 0
  // 記録用
  typeCount: number = 0
  typeMissCount: number = 0
  timer: number = -1

  mounted(): void {
    this.reset()
  }

  // ゲームスタート時
  start(): void {
    this.starting = true
    this.playing = true
    this.countUp()
    window.addEventListener('keypress', this.keyCheck)
  }
  // ホーム画面へ戻る際に実行
  finish(): void {
    this.starting = false
    this.reset()
  }
  // 初期化処理
  reset(): void {
    this.questionIndex = 0
    this.charIndex = 0
    this.typeMissCount = 0
    this.playing = false
    this.timer = -1 // countUpを最初0秒表示させるため-1に設定
  }

  // タイマー
  countUp(): void {
    if (!this.playing) {
      return
    }
    this.timer += 1
    setTimeout(this.countUp, 1000)
  }

  // キーボード入力と文字が一致しているか確認
  keyCheck(e: any) {
    this.typeCount += 1
    if (this.question[this.charIndex] === String.fromCharCode(e.keyCode)) {
      this.charIndex += 1
    } else {
      this.typeMissCount += 1
    }
  }

  // 問題を表示
  get question(): string {
    return this.questions[this.questionIndex].question
  }
  // コメントを表示
  get comment(): string {
    return this.questions[this.questionIndex].comment
  }

  // タイプしたと比較用の回答
  get replacedAnswer(): string {
    return this.question.replace(/ /g, '□')
  }

  // 透明な文字列（回答済み）
  get clearAnswer(): string {
    return this.replacedAnswer.slice(0, this.charIndex)
  }

  // 非透明な文字列（未回答）
  get notAnswer(): string {
    return this.replacedAnswer.slice(this.charIndex)
  }
  // タイピング速度
  get typeSpeed(): number {
    if (this.timer <= 0) {
      return 0
    } else {
      return this.typeCount / this.timer
    }
  }

  // スコアはWPM(1分あたりの打鍵数)×正確率
  get score(): number {
    return (
      (this.questionsTotalChars / this.timer) *
      60 *
      ((this.typeCount - this.typeMissCount) / this.typeCount)
    )
  }

  // 全回答文字数
  get questionsTotalChars(): number {
    let sum = 0
    this.questions.forEach(element => {
      sum += element.question.length
    })
    return sum
  }

  // 正解と一致したら次の問題、全部正解するとクリア
  @Watch('clearAnswer')
  onWatchChanged(val: string): void {
    if (val === this.replacedAnswer) {
      this.questionIndex += 1
      this.charIndex = 0
      if (this.questions.length === this.questionIndex) {
        this.gameClear()
      }
    }
  }
  // クリア時の処理
  gameClear(): void {
    this.playing = false
    this.questionIndex = 0
    window.removeEventListener('keypress', this.keyCheck)
    alert('クリア！')
  }
}
</script>

<style>
.transparent {
  opacity: 0.5;
}
table {
  margin: 0 auto;
  border: 1rem;
}
</style>
