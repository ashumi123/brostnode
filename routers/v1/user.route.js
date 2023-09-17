import express from "express";
const router = express.Router();

//middleware
import asyncTryCatchMiddleware from '../../middleware/async.js';
import verifyJWTToken from '../../middleware/auth.js';

// multer
// import { uploadMedia } from '../../helpers/multer.js';
// const upload = uploadMedia.single('profile');


//controller main functions
import {
    verifyOtp,
    sendOtp,
    registerUser,
    userLogin,
    userDetails,
    listOfUsers,
    updateProfile,
    blockUser,
    editProfile,
    rating,
    forgotPassword,
    resetPassword,
    createPost,
    getPost,
    postComment
} from '../../controller/v1/user.controller.js'
import {
    login,
    adminDashboard,
    montlyData
} from '../../controller/v1/admin.controller.js'
import { upload } from "../../helpers/multer2.js";
const upload1 = upload.single('image');
router.post('/signUp', asyncTryCatchMiddleware(registerUser))
router.post('/sendOtp', asyncTryCatchMiddleware(sendOtp))
router.post('/verifyOtp', asyncTryCatchMiddleware(verifyOtp))
router.post('/login', asyncTryCatchMiddleware(login))
router.post('/appLogin', asyncTryCatchMiddleware(userLogin))
router.get('/details', verifyJWTToken, asyncTryCatchMiddleware(userDetails))
router.post('/profile', verifyJWTToken, upload1, asyncTryCatchMiddleware(updateProfile))
router.post('/list', verifyJWTToken, asyncTryCatchMiddleware(listOfUsers))
router.post('/block', verifyJWTToken, asyncTryCatchMiddleware(blockUser))
router.put('/edit', verifyJWTToken, asyncTryCatchMiddleware(editProfile))
router.post('/rating', verifyJWTToken, asyncTryCatchMiddleware(rating))
router.get('/dashboard', verifyJWTToken, asyncTryCatchMiddleware(adminDashboard))
router.post('/graph', verifyJWTToken, asyncTryCatchMiddleware(montlyData))
router.post('/forgot', asyncTryCatchMiddleware(forgotPassword))
router.post('/reset', asyncTryCatchMiddleware(resetPassword))
router.post('/createPost', asyncTryCatchMiddleware(createPost))
router.post('/postComment', asyncTryCatchMiddleware(postComment))
router.post('/getPost', asyncTryCatchMiddleware(getPost))

export {
    router
};