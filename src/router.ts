import VueRouter from 'vue-router';
import GraphEditor from './components/graph-editor/GraphEditor.vue';

export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: GraphEditor },
  ]
});
