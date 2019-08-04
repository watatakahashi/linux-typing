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
        <div>
          名前：
          <input type="text" value="名無し" />
        </div>
        <div>
          <button>ランキングに登録</button>
        </div>
        <!-- <div>ランキング</div>
        <div>
          <table border="1">
            <tr>
              <th>順位</th>
              <th>名前</th>
              <th>スコア</th>
            </tr>
            <tr v-for="(ranking,index) in (rankingList, 5)" v-bind:key="index">
              <td>{{index + 1}}位</td>
              <td>{{ranking.username}}</td>
              <td>{{question.score}}</td>
            </tr>
          </table>
        </div>-->
        <div class="table">
          <table border="1">
            <tr>
              <th>問題番号</th>
              <th>問題文</th>
              <th>コメント</th>
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

interface Question {
  // id: string
  questionNumber: string
  question: string
  comment: string
}
interface Ranking {
  id: string
  username: string
  score: number
}

@Component({})
export default class Home extends Vue {
  db = firebase.firestore()
  starting: boolean = false
  playing: boolean = false
  // 問題回答用
  questions: Question[] = []
  questionIndex: number = 0
  charIndex: number = 0
  // 記録用
  typeCount: number = 0
  typeMissCount: number = 0
  timer: number = -1
  // ランキング用
  rankingList: Ranking[] = []
  // AudioContextを初期化
  context = new AudioContext()
  buffer?: AudioBuffer

  async created(): Promise<void> {
    await this.getDocuments()
    await this.getRanking()
    this.reset()
    this.db
      .collection('typing-questions')
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
    this.onloadSound()
  }

  // オーディオバッファの取得
  getAudioBuffer(
    url: string,
    fn: {
      (buf: AudioBuffer): void
    }
  ) {
    let req = new XMLHttpRequest()
    req.responseType = 'arraybuffer'
    req.onreadystatechange = () => {
      if (req.readyState === 4) {
        if (req.status === 0 || req.status === 200) {
          this.context.decodeAudioData(req.response, buffer => {
            fn(buffer)
          })
        }
      }
    }
    req.open('GET', url, true)
    req.send('')
  }
  // サウンド再生
  playSound(buffer: AudioBuffer) {
    let source = this.context.createBufferSource()
    source.buffer = buffer
    source.connect(this.context.destination)
    // 再生
    source.start(0)
  }
  // サウンドの読み込み
  onloadSound() {
    this.getAudioBuffer('./se/se5.mp3', buffer => {
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
  reset(): void {
    this.questionIndex = 0
    this.charIndex = 0
    this.typeCount = 0
    this.typeMissCount = 0
    this.playing = false
    this.timer = -1 // countUpを最初0秒表示させるため-1に設定
  }
  async getDocuments() {
    await this.db
      .collection('typing-questions')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(document => {
          const qs: Question = {
            questionNumber: document.id,
            question: document.data().question,
            comment: document.data().comment
          }
          this.questions.push(qs)
        })
        console.log('Questionデータ取得')
      })
      .catch(err => {
        console.log(err)
      })
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
        this.playSound(this.buffer)
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
  addRanking() {
    this.db
      .collection('typing-ranking')
      .add({
        username: '太郎',
        score: 30
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
      .collection('typing-ranking')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(document => {
          const ranking: Ranking = {
            id: document.id,
            username: document.data().username,
            score: document.data().score
          }
          this.rankingList.push(ranking)
        })
        console.log('Rankingデータ取得')
        console.log(this.rankingList)
      })
      .catch(err => {
        console.log(err)
      })
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
