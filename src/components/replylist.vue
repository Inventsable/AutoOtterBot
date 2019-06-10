<template>
  <v-layout row>
    <v-flex xs12 sm10 offset-sm1>
      <v-card>
        <v-toolbar color="primary darken-2" dark>
          <!-- <v-toolbar-side-icon></v-toolbar-side-icon> -->
          <v-toolbar-title>History</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>

        <v-list two-line>
          <template v-for="(item, index) in history">
            <v-list-tile :key="item.title" avatar ripple @click="goToLink(item.url)">
              <v-list-tile-content class="pl-1">
                <v-list-tile-title>{{ item.commenter !== item.poster ? item.commenter + ' to ' + item.poster : item.poster }}</v-list-tile-title>
                <v-list-tile-sub-title class="text--primary">{{ item.body }}</v-list-tile-sub-title>
                <v-list-tile-sub-title>{{ item.selftext ? item.selftext : 'No thread content' }}</v-list-tile-sub-title>
              </v-list-tile-content>

              <v-list-tile-action>
                <v-list-tile-action-text>
                  {{ formatDate(
                  item.timestamp,
                  'h:m A[,] MM/DD/YYYY',
                  ) }}
                </v-list-tile-action-text>
                <!-- <v-icon v-if="selected.indexOf(index) < 0" color="grey lighten-1">star_border</v-icon> -->

                <v-icon :color="isValidLink(item.url)">link</v-icon>
              </v-list-tile-action>
            </v-list-tile>
            <v-divider v-if="index + 1 < history.length" :key="index"></v-divider>
          </template>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import db from "@/firebase/init";
const format = require("date-fns/format");

export default {
  name: "replylist",
  data: () => ({
    history: [],
    selected: [2],
    items: [
      {
        action: "15 min",
        headline: "Brunch this weekend?",
        title: "Ali Connors",
        subtitle:
          "I'll be in your neighborhood doing errands this weekend. Do you want to hang out?"
      },
      {
        action: "2 hr",
        headline: "Summer BBQ",
        title: "me, Scrott, Jennifer",
        subtitle: "Wish I could come, but I'm out of town this weekend."
      },
      {
        action: "6 hr",
        headline: "Oui oui",
        title: "Sandra Adams",
        subtitle: "Do you have Paris recommendations? Have you ever been?"
      },
      {
        action: "12 hr",
        headline: "Birthday gift",
        title: "Trevor Hansen",
        subtitle:
          "Have any ideas about what we should get Heidi for her birthday?"
      },
      {
        action: "18hr",
        headline: "Recipe to try",
        title: "Britta Holt",
        subtitle:
          "We should eat this: Grate, Squash, Corn, and tomatillo Tacos."
      }
    ]
  }),
  mounted() {
    this.getHistory();
  },
  methods: {
    formatDate(date, form) {
      return format(date, form);
    },
    getHistory() {
      db.collection("replies")
        .orderBy("timestamp")
        .get()
        .then(snapshot => {
          if (snapshot.docs.length) {
            snapshot.docs.forEach(snap => {
              const doc = snap.data();
              this.history.push(doc);
              console.log(doc);
            });
          }
        });
    },
    isValidLink(url) {
      return url !== "https://www.reddit.com/" ? "primary darken-2" : "grey";
    },
    goToLink(link) {
      if (link !== "https://www.reddit.com/") window.open(link, "_blank");
      // console.log(link);
    }
  }
};
</script>
