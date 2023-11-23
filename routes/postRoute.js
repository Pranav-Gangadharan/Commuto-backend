import express from "express";
import userAuth from "../middleware/authMiddleware.js";
import { commentPost,createPost, deletePost, getComments, getPost, getPosts, getUserPost, likePost } from "../controllers/postController.js";


const router = express.Router();

router.post("/create-post", userAuth, createPost);
router.post("/", userAuth,  getPosts);
router.post("/:id", userAuth, getPost);

router.post("/get-user-post/:id", userAuth, getUserPost);

//get comments
router.get("/comments/:postId", getComments);

//like and comment on post
router.post("/like/:id", userAuth, likePost);
router.post("/comment/:id", userAuth,commentPost)
//delete post 
router.delete("/:id",userAuth,deletePost);

export default router;