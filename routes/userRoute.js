import express from 'express';
import { acceptRequest, changePassword, friendRequest, getFriendRequest, getUser, profileViews, requestPasswordReset, resetPassword, suggestedFriends, updateUser } from '../controllers/userController.js';
import userAuth from '../middleware/authMiddleware.js';

const router = express.Router();


//password reset flow
router.post("/request-passwordreset", requestPasswordReset);
router.get("/reset-password/:userId/:token", resetPassword);
router.post('/reset-password/:userId/:token?', changePassword);

//Users
router.post("/get-user/:id?", userAuth, getUser);
router.put("/update-user", userAuth, updateUser);


//friend requests
router.post("/friend-request", userAuth, friendRequest);
router.post("/get-friend-request", userAuth, getFriendRequest);
router.post("/accept-request", userAuth, acceptRequest);


//view profile
router.post("/profile-view", userAuth, profileViews);

//suggested friends
router.post("/suggested-friend", userAuth, suggestedFriends);

export default router;