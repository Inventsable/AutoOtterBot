<template>
  <v-app>
    <bot/>
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
import bot from "./components/bot";

export default {
  name: "App",
  components: {
    bot
  },
  data() {
    return {
      //
    };
  }
};
</script>
