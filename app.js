const express = require("express");
const app = express();
const http = require("http").createServer(app);
const port = process.env.PORT || 3001;
const mongoose = require("mongoose");
const ObjectID = require("mongodb").ObjectID;
const Pusher = require("pusher");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv/config");

// middlewares (can be used on specific routes too)
app.use(cors());
app.use(bodyParser.json());

// Import routes and use middleware
// everytime we go to posts, use postsRoute
const postsRoute = require("./routes/posts");
app.use("/posts", postsRoute);

app.get("/", (req, res) => {
  res.send("this here be my backend");
});

// set up pusher for realtime updates
const pusher = new Pusher({
  appId: "1188275",
  key: "a9b4e56c9cce7312822d",
  secret: "41a415b59c9c9a54671d",
  cluster: "us2",
  useTLS: true,
});

// connect to DB

mongoose.connect(
  process.env.DB_CONNECTION,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  () => {
    console.log("connected to the DB bro");
  }
);

const db = mongoose.connection;

db.once("open", () => {
  console.log("DB connected with once method");

  // setting mongoose to watch the posts collection on mongoDB
  const postsCollection = db.collection("posts");
  const changeStream = postsCollection.watch();

  // don't know why it's called changeStream but basically when we add a post on the frontend or in postman, you'll see "change" and then what change was made in the terminal
  changeStream.on("change", (change) => {
    console.log("a change occurred", change);

    if (change.operationType === "insert") {
      const postDetails = change.fullDocument;
      pusher.trigger("posts", "inserted", {
        _id: postDetails._id,
        title: postDetails.title,
        description: postDetails.description,
      });
    } else if (change.operationType === "delete") {
      pusher.trigger("posts", "deleted", change.documentKey._id);
    }
  });
});

//

// how to start listening on server

// app.listen(port, () => console.log(`we on port ${port} bro`));
http.listen(port, () => console.log(`http port ${port} time`));
