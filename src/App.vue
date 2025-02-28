<template>
  <div class="text-center">
    <div id="nav">
      <router-link to="/" active-class="text-success font-weight-bolder" exact
        >Home</router-link
      >|
      <router-link
        to="/about"
        active-class="text-success font-weight-bolder"
        exact
        >About</router-link
      >
    </div>
    <router-view />
  </div>
</template>

<script>
import 'bootstrap';
//import 'bootstrap/dist/css/bootstrap.min.css';
// eslint-disable-next-line
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
export default {};
</script>

<style></style>

<style lang="scss">
@import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
</style>
