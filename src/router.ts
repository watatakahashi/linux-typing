import Vue from 'vue'
import Router from 'vue-router'
import Index from './views/Index.vue'
import Home from './views/Home.vue'
import Create from './views/Create.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index
    },
    {
      path: '/:gameId',
      name: 'home',
      component: Home
    },
    {
      path: '/create/:gameId',
      name: 'create',
      component: Create
    }
  ]
})
