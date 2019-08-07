<template>
  <div class="home">
    <div>Linuxコマンドタイピング</div>
    <div v-if="starting">
      <div v-if="playing">
        <div>問題数：{{questionIndex + 1}}/{{questions.length}}</div>
        <div>タイプミス回数：{{typeMissCount}}回</div>
        <div>経過時間：{{timer}}秒</div>
        <h1>{{comment}}</h1>
        <h1>
          <span class="transparent">{{clearAnswer}}</span>
          <span class="underline">{{nowAnswer}}</span>
          <span>{{notAnswer}}</span>
        </h1>
      </div>
      <div v-else>
        <button @click="finish">ホームへ</button>
        <h2>スコア</h2>
        <div>タイプ数:{{typeCount}}回</div>
        <div>タイプミス回数：{{typeMissCount}}回</div>
        <div>経過時間：{{timer}}秒</div>
        <div>タイピング速度：{{typeSpeed}}回/秒</div>
        <div>スコア：{{score}}</div>
        <div>
          名前：
          <input type="text" v-model="username" />
        </div>
        <div>
          <button @click="addRanking" :class="{hidden:isHidden}">ランキングに登録</button>
        </div>
        <h2>ランキング</h2>
        <div>
          <table class="table" border="1">
            <tr>
              <th>順位</th>
              <th>名前</th>
              <th>スコア</th>
            </tr>
            <tr v-for="(ranking,index) in rankingList" v-bind:key="index">
              <td>{{index + 1}}位</td>
              <td>{{ranking.username}}</td>
              <td>{{ranking.score}}</td>
            </tr>
          </table>
        </div>
        <h2>問題履歴</h2>
        <div>
          <table class="table" border="1">
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
    </div>
    <div v-else>
      <button @click="start">開始する</button>
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
export default class Home extends Vue {
  // 定数
  db = firebase.firestore()
  questionsTable: string = 'typing-beta-questions'
  rankingTable: string = 'typing-beta-rankings'
  QuestionCount = 10
  // 画面表示用
  starting: boolean = false
  playing: boolean = false
  isHidden: boolean = false
  // 問題回答用
  questions: type.Question[] = []
  questionIndex: number = 0
  charIndex: number = 0
  // 記録用
  typeCount: number = 0
  typeMissCount: number = 0
  timer: number = -1
  username: string = '名無し'
  // ランキング用
  rankingList: type.Ranking[] = []
  // AudioContextを初期化
  buffer?: AudioBuffer

  async created(): Promise<void> {
    await this.getRanking()
    this.onloadSound()
    this.reset()
  }

  // サウンドの読み込み
  onloadSound(): void {
    audio.getAudioBuffer('./se/se5.mp3', buffer => {
      this.buffer = buffer
    })
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
  async reset(): Promise<void> {
    await this.getQuestions()
    this.questionIndex = 0
    this.charIndex = 0
    this.typeCount = 0
    this.typeMissCount = 0
    this.playing = false
    this.isHidden = false
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
      if (this.buffer) {
        audio.playSound(this.buffer)
      }
    }
  }

  // 問題を表示
  get question(): string {
    if (this.questions.length === 0) {
      return ''
    }
    return this.questions[this.questionIndex].question
  }
  // コメントを表示
  get comment(): string {
    if (this.questions.length === 0) {
      return ''
    }
    return this.questions[this.questionIndex].comment
  }

  // タイプしたと比較用の回答
  get replacedAnswer(): string {
    return this.question.replace(/ /g, '□')
  }

  // 回答済み文字列
  get clearAnswer(): string {
    return this.replacedAnswer.slice(0, this.charIndex)
  }

  get nowAnswer(): string {
    return this.replacedAnswer.slice(this.charIndex, this.charIndex + 1)
  }

  // 未回答文字列
  get notAnswer(): string {
    return this.replacedAnswer.slice(this.charIndex + 1)
  }
  // タイピング速度
  get typeSpeed(): number {
    if (this.timer <= 0) {
      return 0
    } else {
      return Math.round((this.typeCount / this.timer) * 10) / 10
    }
  }

  // スコアはWPM(1分あたりの打鍵数)×正確率
  get score(): number {
    return Math.round(
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
  async addRanking(): Promise<void> {
    this.isHidden = true
    // return
    await this.db
      .collection(this.rankingTable)
      .add({
        username: this.username,
        score: this.score
      })
      .then(() => {
        console.log('ランキングデータ追加')
      })
      .catch(error => {
        console.error('Error writing document: ', error)
      })
  }
  async getRanking(): Promise<void> {
    await this.db
      .collection(this.rankingTable)
      .orderBy('score', 'desc')
      .limit(5)
      .onSnapshot(querySnapshot => {
        this.rankingList = []
        querySnapshot.forEach(document => {
          const ranking: type.Ranking = {
            id: document.id,
            username: document.data().username,
            score: document.data().score
          }
          this.rankingList.push(ranking)
        })
      })
  }
  async addQuestion(): Promise<void> {
    this.db
      .collection(this.questionsTable)
      .doc('3')
      .set({
        question: ' uuu',
        comment: 'コメント3'
      })
      .then(function() {
        console.log('Document successfully written!')
      })
      .catch(function(error) {
        console.error('Error writing document: ', error)
      })
  }
  async getQuestions(): Promise<void> {
    await this.db
      .collection(this.questionsTable)
      .get()
      .then(querySnapshot => {
        this.questions = []
        querySnapshot.forEach(document => {
          const qs: type.Question = {
            questionId: document.id,
            question: document.data().question,
            comment: document.data().comment
          }
          this.questions.push(qs)
        })
        this.questions = utils.arrayShuffle(this.questions)
        this.questions = this.questions.slice(0, this.QuestionCount)
      })
      .catch(err => {
        console.log(err)
      })
  }
}
</script>

<style>
.transparent {
  opacity: 0.3;
}
.underline {
  text-decoration: underline;
}
.table {
  margin: 0 auto;
  border: 1rem;
}
.hidden {
  display: none;
}
</style>
