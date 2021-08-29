<template>
  <router-view id="app"></router-view>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'App'
});
</script>

<style>
#app {
  height: 100%;
  box-sizing: border-box;
  font-family: Segoe UI;
  text-align: center;
  overflow: hidden;
}
</style>
