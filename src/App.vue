<template>
  <div id="app">
    <b-container>
      <b-alert
        :show="dismissCountDown"
        variant="warning"
        @dismissed="dismissCountDown = 0"
        @dismiss-count-down="countDownChanged"
      >
        {{ showAlert.msg }}
      </b-alert>
    </b-container>
    <invoice />

    <b-modal ref="connection" :ok-only="true">
      <template #modal-header="{ close }">
        <h5>Connection</h5>
        <b-button size="sm" variant="outline-danger" @click="close()">
          Close
        </b-button>
      </template>
      Please Check Internet Connection
    </b-modal>
  </div>
</template>

<script>
import Invoice from "./Invoice.vue";
import { mapState } from "vuex";
export default {
  name: "App",
  components: { Invoice },
  data() {
    return {
      online: null,
      dismissSecs: 5,
      dismissCountDown: 0,
    };
  },
  created() {
    this.checkConnection();
  },
  watch: {
    showAlert(newValue, oldValue) {
      console.log(`Updating  ${oldValue} to ${newValue.show}`);
      if (newValue.show) {
        this.dismissCountDown = this.dismissSecs;
      }
    },
  },
  computed: mapState(["showAlert"]),

  methods: {
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    },
    show() {
      this.dismissCountDown = this.dismissSecs;
    },
    async checkConnection() {
      try {
        const online = await fetch(
          "https://jsonplaceholder.typicode.com/todos/1"
        );
        this.online = online.status >= 200 && online.status < 300;
        if (this.online) {
          this.$refs["connection"].hide();
        } else {
          this.$refs["connection"].show();
        }
      } catch (e) {
        this.online = false;
        this.$refs["connection"].show();
      }
    },
  },
};
</script>

<style>
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 10px;
} */
</style>
