const express = require('express');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const subredditRoutes = require('./routes/subreddit.routes');

const PORT = 5001

const app = express();
app.use(express.json());

app.use("/user", userRoutes);
app.use("/post", postRoutes);
app.use("/subreddit", subredditRoutes);

app.listen(PORT, () => {
  console.log(`server at ${PORT}`)
})
