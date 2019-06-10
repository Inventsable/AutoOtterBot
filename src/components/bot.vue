<template>
  <div></div>
</template>

<script>
import { Submission } from "snoowrap";
import db from "@/firebase/init";

const { CommentStream } = require("snoostorm");
const Snoowrap = require("snoowrap");
const Snoostorm = require("snoostorm");

//Build snoowrap and Snoostorm
const r = new Snoowrap({
  userAgent: "AutoOtter",
  clientId: process.env.VUE_APP_CLIENT_ID,
  clientSecret: process.env.VUE_APP_CLIENT_SECRET,
  username: process.env.VUE_APP_REDDIT_USER,
  password: process.env.VUE_APP_REDDIT_PASS
});

export default {
  data: () => ({
    stream: null,
    subreddit: "testingground4bots",
    version: "1.0.0",
    masterkey: /\@auto/,
    defaultfooter: `---\r\nv1.0.0 -- Use \`@auto help\` to see a list of my commands`,
    commands: [
      {
        name: "toggle",
        key: /toggle/i,
        desc: "How to create a toggle",
        content: `    ; While you don't have to declare the toggle, by doing so you know what the initial start value is
    toggle  := 0
    return

    F1::
        ; This is where the toggling occurs. You're setting the toggle to the opposite of itself.
        ; 1 becomes 0. True becomes False. You can use either.
        toggle  := !toggle

        if (toggle = 0){
            ; If the toggle is off (0 or false), do the stuff in here
            MsgBox, The toggle is turned off.
        }
        else{
          ; If the toggle is on (1 or true), do the stuff in here
          MsgBox, The toggle is turned on.
        }
      return
      \r\n`
      }
    ]
  }),
  mounted() {
    this.startCrawling();
    this.startBot();
  },
  methods: {
    startCrawling() {
      const self = this;
      r.config({ requestDelay: 3000, warnings: true });

      this.stream = new CommentStream(r, {
        subreddit: self.subreddit,
        results: 25
      });
    },
    startBot() {
      const self = this;
      // Scan a comment stream
      this.stream.on("item", comment => {
        // Look for any comment containing '@auto'
        if (comment.author.name == "AutomatedOtter") return;
        if (this.masterkey.test(comment.body)) {
          return r
            .getSubmission(comment.link_id)
            .fetch()
            .then(post => {
              console.log(post);
              // Construct a reply containing comment info and thread creator's name
              self
                .constructReply(comment, post)
                .then(thisreply => {
                  console.log("REPLY TO USER");
                  console.log(thisreply);
                  comment.reply(thisreply);
                })
                .catch(rej => {
                  console.error(rej);
                });
            });
        }
      });
    },
    constructReply(comment, post) {
      return new Promise((resolve, reject) => {
        let responses = this.commands.filter(autoreply => {
          return autoreply.key.test(comment.body);
        });

        let fullreply,
          cmds = [];
        if (responses.length) {
          let greeting = `Hello u/${post.author.name}:
                  \r\n`;
          fullreply = greeting;
          responses.forEach(response => {
            fullreply += `\r` + response.content;
            cmds.push(response.name);
          });
        } else if (/help/i.test(comment.body)) {
          let greeting = `Hello u/${
            comment.author.name
          }, here are a list of my commands:\r\n`;
          fullreply = greeting;
          this.commands.forEach(cmd => {
            fullreply += `\r\n\`@auto ${cmd.name}\` -- ${cmd.desc}\r\n`;
          });
          cmds = ["help"];
        }
        fullreply += this.defaultfooter;

        // THIS DOES NOT WORK
        // Wrapping the bot to reply after checking database does not work.
        // Yet without checking database, I risk multiple replies every time I run my dev server.

        // let check = db.collection("replies").where("id", "==", comment.name);
        // check.get().then(snapshot => {
        // If comment does not exist, proceed to generate one
        // if (!snapshot.docs.length) {

        // I'd like to have a GUI table of the bot's history,
        // and allow oAuth'd users to add their own commands dynamically
        db.collection("replies").add({
          id: comment.name,
          commenter: comment.author.name,
          poster: post.author.name,
          selftext: post.selftext,
          body: comment.body,
          cmds: cmds,
          timestamp: Date.now(),
          commentTime: comment.created_utc,
          subreddit: comment.subreddit_name_prefixed,
          url: post.url
        });

        resolve(fullreply);
        // } else {
        //   reject("ALREADY EXISTS");
        // }
        // });
      });
    }
  }
};
</script>

<style>
</style>
