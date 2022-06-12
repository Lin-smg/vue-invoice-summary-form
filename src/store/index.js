import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    showAlert: {
      show: false,
      msg: "null",
    },
  },
  mutations: {
    SHOW_ALERT(state, value) {
      state.showAlert = value;
    },
  },
  actions: {},
  modules: {},
});
