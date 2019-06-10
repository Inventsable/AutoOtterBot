<template>
  <v-container>
    <reply-list/>
  </v-container>
</template>

<script>
import replylist from "../components/replylist";

export default {
  components: {
    "reply-list": replylist
  }
};
</script>
