import express from "express";

import { router as userRoute } from './user.route.js'
import { router as categoryRoute } from './category.route.js'

const router = express.Router();

router.use('/user', userRoute)
router.use('/category', categoryRoute)

export default router;