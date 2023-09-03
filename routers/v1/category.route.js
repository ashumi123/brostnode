import express from "express";
const router = express.Router();

//middleware
import asyncTryCatchMiddleware from '../../middleware/async.js';
import verifyJWTToken from '../../middleware/auth.js';

//controller main functions
import {
    addCategory,
    listOfCategory,
    categoryDetails,
    removeCategory,
    editCategory
} from '../../controller/v1/category.controller.js'

router.post('/add', verifyJWTToken, asyncTryCatchMiddleware(addCategory))
router.get('/details/:id', verifyJWTToken, asyncTryCatchMiddleware(categoryDetails))
router.post('/list', verifyJWTToken, asyncTryCatchMiddleware(listOfCategory))
router.put('/edit', verifyJWTToken, asyncTryCatchMiddleware(editCategory))
router.delete('/delete/:id', verifyJWTToken, asyncTryCatchMiddleware(removeCategory))

export {
    router
};