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
        if (this.masterkey.test(comment.body)) {
          // @@ Something is wrong. Fetch doesn't work once nested in a firebase promise

          // let check = db.collection("replies").where("id", "==", comment.name);
          // check.get().then(snapshot => {
          //   // If comment does not exist, proceed to generate one
          //   if (!snapshot.docs.length) {
          //     console.log(`Doesn't exist!`);
          //     console.log(comment);
          //     console.log(comment.link_id);
          // Query the comment's parent thread information
          return r
            .getSubmission(comment.link_id)
            .fetch()
            .then(post => {
              console.log(post);
              // Construct a reply containing comment info and thread creator's name

              self
                .constructReply(comment, post)
                .then(thisreply => {
                  comment.reply(thisreply);
                })
                .catch(rej => {
                  console.log(rej);
                });
            });
          // } else {
          //   // Else do nothing
          //   console.log("ALREADY EXISTS");
          //   console.log(snapshot.docs[0].data());
          //   return null;
          // }
          // });
        }
      });
    },
    constructReply(comment, post) {
      return new Promise((resolve, reject) => {
        console.log(`${comment.author.name} > ${post.author.name}`);

        let responses = this.commands.filter(autoreply => {
          return autoreply.key.test(comment.body);
        });

        let fullreply,
          cmds = [];
        if (responses.length) {
          let greeting = `Hello u/${post.author.name}, please see the following:
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

        console.log(fullreply);

        let check = db.collection("replies").where("id", "==", comment.name);
        check.get().then(snapshot => {
          // If comment does not exist, proceed to generate one
          if (!snapshot.docs.length) {
            console.log(`Doesn't exist!`);
            console.log(comment);
            console.log(comment.link_id);
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
            // console.log("REPLYING TO USER");
            // return
          } else {
            reject("ALREADY EXISTS");
            // console.log("");
          }
        });
      });
    }
  }
};
</script>

<style>
</style>
