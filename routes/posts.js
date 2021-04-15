const express = require("express");
const router = express.Router();
const ObjectID = require("mongodb").ObjectID;
const Post = require("../models/Post");

// get back all the posts
router.get("/", async (req, res) => {
  try {
    // "desc" sort will show newest posts at the top like a feed
    const posts = await Post.find().sort({ date: "desc" });
    res.json(posts);
  } catch (error) {
    res.json(error);
  }
});

// submit a post
router.post("/", async (req, res) => {
  const post = new Post({
    id: new ObjectID(),
    title: req.body.title,
    description: req.body.description,
  });

  const savedPost = await post.save();
  res.json(savedPost);
});

// Delete specific post
router.delete("/:postId", async (req, res) => {
  try {
    const removedPost = await Post.findByIdAndDelete(req.params.postId);
    res.json(removedPost);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
