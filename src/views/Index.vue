<template>
  <div>
    <h1>タイピングゲーム</h1>
    <div>
      <h2>Linux</h2>
      <div>
        <router-link :to="{ name: 'home', params: { gameId: 'linux' }}">ゲームをする</router-link>
      </div>
      <div>
        <router-link :to="{ name: 'create', params: { gameId: 'linux' }}">問題を作成</router-link>
      </div>
    </div>
    <div>
      <h2>Cisco</h2>
      <div>
        <router-link :to="{ name: 'home', params: { gameId: 'cisco' }}">ゲームをする</router-link>
      </div>
      <div>
        <router-link :to="{ name: 'create', params: { gameId: 'cisco' }}">問題を作成</router-link>
      </div>
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
export default class Index extends Vue {}
</script>
