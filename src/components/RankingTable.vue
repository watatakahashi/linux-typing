<template>
  <div class="home">
    <h2>ランキング</h2>
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
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import * as firebase from 'firebase/app'
import 'firebase/firestore'
import * as firestore from '@/plugin/firestore'

import * as type from '@/types/type'
@Component
export default class RankingTable extends Vue {
  @Prop() private gameId!: string
  db: firebase.firestore.Firestore = firebase.firestore()
  rankingTable: string = 'typing-beta-rankings'
  // ランキングデータ
  rankingList: type.Ranking[] = []
  maxDisplayPlayers: number = 5

  async mounted() {
    this.rankingTable = 'typing-beta-' + this.gameId + '-rankings'
    this.rankingList = await firestore.getRankingList(this.rankingTable, this.maxDisplayPlayers)
  }
}
</script>

<style>
.table {
  margin: 0 auto;
  border: 1rem;
}
</style>
