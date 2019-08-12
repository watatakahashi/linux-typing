<template>
  <div class="home">
    <h2>問題履歴</h2>
    <div>
      <table class="table" border="1">
        <tr>
          <th>問題番号</th>
          <th>問題文</th>
          <th>解説</th>
        </tr>
        <tr v-for="(question,index) in questionList" v-bind:key="index">
          <td>{{question.questionId}}</td>
          <td>{{question.question}}</td>
          <td>{{question.comment}}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import * as type from '@/types/type'

@Component
export default class QuestionTable extends Vue {
  @Prop() private questionList!: type.Question[]
}
</script>

<style>
.table {
  margin: 0 auto;
  border: 1rem;
}
</style>
