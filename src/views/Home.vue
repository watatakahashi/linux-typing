<template>
  <div class="home">
    <div>{{gameId}}コマンドタイピング</div>
    <div v-if="starting">
      <div v-if="playing">
        <div>問題数：{{questionIndex + 1}}/{{questionList.length}}</div>
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
        <router-link :to="{ name: 'index'}">ホームへ</router-link>
        <h2>スコア</h2>
        <div>タイプ数:{{typeCount}}回</div>
        <div>タイプミス回数：{{typeMissCount}}回</div>
        <div>経過時間：{{timer}}秒</div>
        <div>タイピング速度：{{typeSpeed}}回/秒</div>
        <div>スコア：{{score}}</div>
        <RankingTable :gameId="gameId" />
        <QuestionTable :questionList="questionList" />
      </div>
    </div>
    <div v-else>
      <div>
        名前：
        <input type="text" v-model="username" />
      </div>
      <div>
        <button @click="start">開始する</button>
      </div>
      <div>
        <router-link :to="{ name: 'index'}">ホームへ</router-link>
      </div>
      <div>
        <RankingTable :gameId="gameId" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import RankingTable from '@/components/RankingTable.vue'
import QuestionTable from '@/components/QuestionTable.vue'
import * as firebase from 'firebase/app'
import 'firebase/firestore'
import * as audio from '@/plugin/audio'
import * as utils from '@/plugin/utils'
import * as type from '@/types/type'

@Component({ components: { RankingTable, QuestionTable } })
export default class Home extends Vue {
  // 定数
  db: firebase.firestore.Firestore = firebase.firestore()
  gameId: string = ''
  questionsTable: string = 'typing-beta-questions'
  QuestionCount = 10
  // 画面表示用
  starting: boolean = false
  playing: boolean = false
  isHidden: boolean = false
  // 問題回答用
  questionList: type.Question[] = []
  questionIndex: number = 0
  charIndex: number = 0

  // 記録用
  // タイプ数
  typeCount: number = 0
  // ミスタイプ数
  typeMissCount: number = 0
  // 経過時間
  timer: number = -1
  // デフォ名
  username: string = '名無し'
  // ランキング用
  rankingTable: string = 'typing-beta-rankings'

  // AudioContextを初期化
  buffer?: AudioBuffer

  async created(): Promise<void> {
    this.gameId = this.$route.params.gameId
    this.questionsTable = 'typing-beta-' + this.gameId + '-questions'
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
    return this.questionList.length === 0
      ? ''
      : this.questionList[this.questionIndex].question
  }
  // コメントを表示
  get comment(): string {
    return this.questionList.length === 0
      ? ''
      : this.questionList[this.questionIndex].comment
  }

  // 比較用の回答
  get replacedAnswer(): string {
    return this.question.replace(/ /g, '□')
  }

  // 回答済み文字列
  get clearAnswer(): string {
    return this.replacedAnswer.slice(0, this.charIndex)
  }

  // 回答文字
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
    this.questionList.forEach(element => {
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
      if (this.questionList.length === this.questionIndex) {
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
    this.addRanking()
  }
  async addRanking(): Promise<void> {
    const ranking: type.Ranking = {
      id: '',
      username: this.username,
      score: this.score,
      typeCount: this.typeCount,
      typeMissCount: this.typeMissCount,
      timer: this.timer,
      createdAt: new Date()
    }
    await this.db
      .collection(this.rankingTable)
      .add(ranking)
      .then(doc => {
        utils.addDocumentId(this.rankingTable, doc.id)
      })
      .catch(error => {
        console.error(error)
      })
  }

  async getQuestions(): Promise<void> {
    await this.db
      .collection(this.questionsTable)
      .where('valid', '==', true)
      .get()
      .then(querySnapshot => {
        this.questionList = []
        querySnapshot.forEach(document => {
          const qs: type.Question = document.data() as type.Question
          this.questionList.push(qs)
        })
        this.questionList = utils.arrayShuffle(this.questionList)
        this.questionList = this.questionList.slice(0, this.QuestionCount)
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
