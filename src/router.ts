import VueRouter from 'vue-router';
import MainPage from './components/MainPage.vue';

export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: MainPage },
  ]
});
