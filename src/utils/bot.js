// //Reply to comment containing specific keyword or phrase
// comments.on("comment", comment => {
//   if (comment.body === "Phrase to reply to") {
//     comment.reply("Your bots reply");
//     comment.save();
//   }
// });

// //Get newest Submission titles and nameID from a subreddit
// r.getSubreddit("testingground4bots")
//   .getNew()
//   .then(posts => {
//     const titles = posts.map(post => post.title);
//     const names = posts.map(post => post.name);
//     // Do something with titles, e.g. print them out
//     console.log(titles, names);
//   });

// //Have bot submit self post
// r.submitSelfpost({
//   subredditName: "testingground4bots",
//   title: "This is a selfpost",
//   body: "This is the body of the selfpost"
// }).then(console.log);
