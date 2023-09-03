//schema
import {
    createSingle,
    getMultipleWithLimit,
    totalCount,
    getSingle,
    deleteSingle,
    getMultiple,
    aggregateMetod,
    updateSingle
} from '../../models/user.model.js'
import * as RatingSchema from '../../models/rating.model.js';
import * as AdminSchema from '../../models/admin.model.js';
//helpers
import {
    createErrorResponse,
    createSuccessResponse,
    generateSMSVerificationCode,
    paginationData,
    generateToken,
    hashPassword,
    comparePassword,
    parseToMongoObjectID,
    uuidv4_6,
    isObjectId,
    verifyToken
} from '../../helpers/utils.js';
import msgConstant from '../../helpers/msgConstant.js';
import { UserKeys, RatingKeys } from '../../helpers/keyConstant.js';
// import { commonFileUplaodOnFirebase } from '../../helpers/multer.js';
// import { generateAgoraToken } from '../../helpers/agoraHelper.js';
import { mailSender } from '../../helpers/mailHelper.js';
import multer from 'multer';
import { createSinglePost, getMultiplePost } from '../../models/post.model.js';
import express from 'express';

const app = express();

//200-299 -->220

export const registerUser = async (req, res, next) => {
    const {  email, password, name } = req.body;
    const hashPass = password ? await hashPassword(password) : await hashPassword('12345678')
   
    if (email) {
        let checKEmail = await getSingle({ email }, '');
        if (checKEmail) return res.status(400).json(createErrorResponse(msgConstant.emailAlreadyExist, null))
    }
    const create = Object.assign({});
    UserKeys.map(i => {
        if (req.body[i]) create[i] = req.body[i];
        else return res.status(400).json(createErrorResponse(`Please enter ${i}.`, null))
    })
    const otp = ''
    create['otp'] = otp
    create['password'] = hashPass;
    create['type'] =  'user'
    create['isVerified'] = password ? true : false
    await createSingle(create);
    return res.status(200).json(createSuccessResponse(msgConstant.userRegister, { otp }))
}

export const sendOtp = async (req, res, next) => {
    const { mobileNumber, deviceToken, deviceType } = req.body;
    if (mobileNumber) {
        let checkMobile = await getSingle({ mobileNumber }, '');
        if (checkMobile) {
            const otp = await generateSMSVerificationCode();
            checkMobile['otp'] = otp
            checkMobile['deviceType'] = deviceType ? deviceType : 'android';
            checkMobile['deviceToken'] = deviceToken
            await checkMobile.save();
            return res.status(200).json(createSuccessResponse(msgConstant.otpSentSucessfully, { otp }))
        } else {
            return res.status(400).json(createErrorResponse(msgConstant.enterRegisterMobile, null))
        }
    } else {
        return res.status(400).json(createErrorResponse(msgConstant.enterMobileNumber, null))
    }
}

export const verifyOtp = async (req, res, next) => {
    if (req.body.mobileNumber && req.body.otp) {
        let checkMobile = await getSingle({ mobileNumber: req.body.mobileNumber }, '');
        if (checkMobile) {
            if (checkMobile.isBlock) {
                return res.status(400).json(createErrorResponse(msgConstant.blockByAdmin, null))
            } else if (checkMobile.otp === req.body.otp) {
                const { _id, mobileNumber, deviceToken, deviceType, type } = checkMobile;
                let token = await generateToken({
                    mobileNumber, _id, deviceToken, deviceType, type
                });
                checkMobile.otp = null;
                checkMobile.isVerified = true;
                // checkMobile.agoraToken = generateAgoraToken(checkMobile.mobileNumber, 'userAccount', '');
                await checkMobile.save();
                return res.status(200).json(createSuccessResponse(msgConstant.loginSuccessfully, {
                    token,
                    isAstrologer: type === 'astrologer' ? true : false,
                    userId: checkMobile._id
                }))

            } else {
                return res.status(400).json(createErrorResponse(msgConstant.otpNotMatch, null))
            }
        } else {
            return res.status(400).json(createErrorResponse(msgConstant.enterRegisterMobile, null))
        }
    } else {
        return res.status(400).json(createErrorResponse(msgConstant.enterMobileOtp, null))
    }
}

export const userLogin = async (req, res, next) => {
    const { email, password } = req.body;
    let checkUser = await getSingle({ email });
    if (checkUser) {
        let checkPass = await comparePassword(password, checkUser.password);
        console.log('checkPass',checkPass);
        if (checkPass) {
            let unique = await uuidv4_6();
            // checkUser['deviceToken'] = deviceToken ? deviceToken : unique;
            checkUser['isVerified'] = true;
            // checkUser['agoraToken'] = generateAgoraToken(checkUser.mobileNumber, 'userAccount', '');
            // checkUser['deviceType'] = deviceType ? deviceType : 'android';
            await checkUser.save();
            const token = await generateToken({
                _id: checkUser._id,
                // password: checkUser.password,
                deviceToken: checkUser.deviceToken,
                mobileNumber: checkUser.mobileNumber,
                deviceType: checkUser.deviceType,
                type: checkUser.type
            })
            return res.status(200).json(createSuccessResponse(msgConstant.loginSuccessfully, {
                token,
                isAstrologer: checkUser && checkUser.type === 'astrologer' ? true : false,
                userId: checkUser._id
            }))
        } else {
            return res.status(400).json(createErrorResponse(msgConstant.passwordWrong, null))
        }
    } else {
        return res.status(400).json(createErrorResponse(msgConstant.enterValidMail, null))
    }
}

export const listOfUsers = async (req, res, next) => {
    if (req.user.type === 'user' || req.user.type === 'admin' || req.user.type === 'astrologer') {
        let { offset, limit, search, sortBy, order } = req.body;
        offset = offset ? offset : 0
        const pagination = [{ $skip: offset }]
        if (limit) pagination.push({ $limit: limit })

        const sortObject = Object.assign({});
        if (sortBy && order) sortObject[sortBy] = order
        else sortObject['createdOn'] = -1

        let aggregation = [
            {
                $lookup: {
                    from: 'categories',
                    let: { 'cat': '$category' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$cat']
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1
                            }
                        }
                    ],
                    as: 'category'
                }
            },
            {
                $unwind: {
                    path: '$category',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    type: 1,
                    name: 1,
                    email: 1,
                    mobileNumber: 1,
                    category: { $cond: ['$category', '$category.name', null] },
                    profile: 1,
                    isBlock: 1,
                    isVerified: 1,
                    agoraToken: 1
                }
            },
            {
                $match: {
                    $and: [
                        {
                            type: 'user'
                        }
                    ]
                }
            },
            {
                $sort: sortObject
            },
            {
                $facet: {
                    data: pagination,
                    totalCount: [
                        {
                            $count: 'count'
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: '$totalCount',
                    preserveNullAndEmptyArrays: true
                }
            },
        ]

        if (req.body.type === 'astrologer') aggregation[3].$match.$and[0].type = 'astrologer'
        if (req.user.type === 'user' || req.user.type === 'astrologer') {
            aggregation[3].$match.$and.push(
                {
                    isBlock: false
                },
                {
                    _id: { $ne: parseToMongoObjectID(req.user._id) }
                }
            )
        }
        if (search) {
            aggregation[3].$match.$and.push({
                $or: [
                    {
                        'name': { $regex: new RegExp(('.*' + search + '.*'), "i") }
                    },
                    {
                        'email': { $regex: new RegExp(('.*' + search + '.*'), "i") }
                    },
                    {
                        'mobileNumber': { $regex: new RegExp(('.*' + search + '.*'), "i") }
                    }
                ]
            })
        }
        let list = await aggregateMetod(aggregation);
        return res.status(200).json(createSuccessResponse(msgConstant.usersFetchedSuccessfully, {
            list: list && list[0] ? list[0].data : [],
            paging: paginationData(list && list[0] && list[0].totalCount ? list[0].totalCount.count : 0, limit, offset)
        }))
    } else {
        return res.status(401).json(createErrorResponse(msgConstant.authorizationError, null))
    }
}

export const userDetails = async (req, res, next) => {
    if (req.user.type === 'user' || req.user.type === 'admin' || req.user.type === 'astrologer') {

        let userId = req.query.userId ? req.query.userId : req.user._id;
        let aggregate = [
            {
                $match: {
                    _id: parseToMongoObjectID(userId)
                }
            },
            {
                $lookup: {
                    from: 'ratings',
                    let: { 'userId': parseToMongoObjectID(userId) },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$astrologer', '$$userId']
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'users',
                                let: { 'from': '$user' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$_id', '$$from']
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            profile: 1,
                                            name: 1,
                                            email: 1
                                        }
                                    }
                                ],
                                as: 'user'
                            }
                        },
                        {
                            $unwind: {
                                path: '$user',
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ],
                    as: 'ratings'
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    let: { 'cat': '$category' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$cat']
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1
                            }
                        }
                    ],
                    as: 'category'
                }
            },
            {
                $unwind: {
                    path: '$category',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    mobileNumber: 1,
                    countryCode: 1,
                    profile: 1,
                    ratings: 1,
                    type: 1,
                    agoraToken: 1,
                    category: { $cond: ['$category', '$category.name', null] },
                    totalRatingUsers: { $size: '$ratings' },
                    createdOn: 1,
                    totalReviews: {
                        $cond: [
                            { $gt: [{ $size: '$ratings' }, 0] },
                            { $round: [{ $divide: [{ $sum: '$ratings.rating' }, { $size: '$ratings' }] }, 1] },
                            0
                        ]
                    }
                }
            }
        ]

        let userData = await aggregateMetod(aggregate);
        if (userData.length > 0 && userData[0]) {
            return res.status(200).json(createSuccessResponse(msgConstant.usersFetchedSuccessfully, userData[0]))
        } else {
            return res.status(400).json(createErrorResponse(msgConstant.userNotFound, null))
        }
    } else {
        return res.status(401).json(createErrorResponse(msgConstant.authorizationError, null))
    }
}

export const updateProfile = async (req, res, next) => {
    if (req.user.type === 'user' || req.user.type === 'admin' || req.user.type === 'astrologer') {
        // let url = await commonFileUplaodOnFirebase(req.file);
        if (url) {
            req.user.profile = url
            await req.user.save();
            return res.status(200).json(createSuccessResponse(msgConstant.imageUpdatedSuccessfully, { url }))
        } else {
            return res.status(400).json(createErrorResponse(msgConstant.imageNotUpdated, null))
        }
    } else {
        return res.status(401).json(createErrorResponse(msgConstant.authorizationError, null))
    }
}

export const blockUser = async (req, res, next) => {
    if (req.user.type === 'admin') {
        let { status, userId } = req.body;
        let userDetails = await getSingle({ _id: userId });
        if (userDetails) {
            let message = status === true ? msgConstant.userDeactivatedSuccessfully : msgConstant.userActivatedSuccessfully;
            userDetails['isBlock'] = status === true ? true : false;
            await userDetails.save();
            return res.status(200).json(createSuccessResponse(message, null))
        } else {
            return res.status(400).json(createErrorResponse(msgConstant.userNotFound, null))
        }
    } else {
        return res.status(401).json(createErrorResponse(msgConstant.authorizationError, null))
    }
}

export const editProfile = async (req, res, next) => {
    if (req.user.type === 'user' || req.user.type === 'astrologer') {
        const { mobileNumber, email, category } = req.body;
        if (mobileNumber) {
            let checkMobile = await getSingle({ mobileNumber, _id: { $ne: req.user._id } }, '');
            if (checkMobile) return res.status(400).json(createErrorResponse(msgConstant.mobileAlreadyExist, null))
        }
        if (email) {
            let checKEmail = await getSingle({ email, _id: { $ne: req.user._id } }, '');
            if (checKEmail) return res.status(400).json(createErrorResponse(msgConstant.emailAlreadyExist, null))
        }
        UserKeys.map(i => {
            if (req.body[i]) req.user[i] = req.body[i];
        })
        if (category) req.user['category'] = category;

        await req.user.save();
        return res.status(200).json(createSuccessResponse(msgConstant.userUpdatedSuccessfully, null))
    } else {
        return res.status(401).json(createErrorResponse(msgConstant.authorizationError, null, 206))
    }
}

export const rating = async (req, res, next) => {
    if (req.user.type === 'user') {
        const { astrologer, rating, description } = req.body;
        const filter = Object.assign({});
        RatingKeys.map(i => {
            if (req.body[i]) filter[i] = req.body[i];
            else return res.status(400).json(createErrorResponse(`Please enter ${i}.`, null))
        })
        if (!isObjectId(astrologer)) return res.status(400).json(createErrorResponse(`Please enter valid astrologer.`, null))
        let astrologerDetail = await getSingle({ _id: astrologer });
        if (astrologerDetail) {
            if (astrologerDetail.type != 'astrologer') return res.status(400).json(createErrorResponse(msgConstant.onlyAstrologer, null))
            if (astrologerDetail.isBlock) return res.status(400).json(createErrorResponse(msgConstant.accountBlock, null))
            let checkRating = await RatingSchema.getSingle({ astrologer, user: req.user._id }, '');
            if (checkRating) {
                checkRating['rating'] = rating;
                checkRating['description'] = description;
                await checkRating.save();
                return res.status(200).json(createSuccessResponse(msgConstant.ratingUpdate, null))
            } else {
                filter['user'] = req.user._id;
                await RatingSchema.createSingle(filter);
                return res.status(200).json(createSuccessResponse(msgConstant.ratingDone, null))
            }
        } else {
            return res.status(400).json(createErrorResponse(msgConstant.userNotFound, null))
        }
    } else {
        return res.status(401).json(createErrorResponse(msgConstant.authorizationError, null, 206))
    }
}

export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    if (!email) return res.status(400).json(createErrorResponse(msgConstant.enterEmail, null))
    let checkEmailForAdmin = await AdminSchema.getSingle({ email });
    let time = Math.floor(Date.now() / 1000)
    if (checkEmailForAdmin) {
        checkEmailForAdmin['expireToken'] = time
        await checkEmailForAdmin.save();
        const token = generateToken({ _id: checkEmailForAdmin._id, type: 'admin', expire: time })
        mailSender(email, token)
            .then(result => {
                return res.status(200).json(createSuccessResponse(msgConstant.forgotMail, null))
            })
            .catch(error => {
                console.log('error', error)
                return res.status(400).json(createErrorResponse(msgConstant.mailNotSent, null))
            })
    } else {
        let checkEmail = await getSingle({ email });
        if (!checkEmail) return res.status(400).json(createErrorResponse(msgConstant.enterValidMail, null))
        checkEmail['expireToken'] = time
        await checkEmail.save();
        const token = generateToken({ _id: checkEmail._id, type: checkEmail.type, expire: time })
        mailSender(email, token)
            .then(result => {
                return res.status(200).json(createSuccessResponse(msgConstant.forgotMail, null))
            })
            .catch(error => {
                return res.status(400).json(createErrorResponse(msgConstant.mailNotSent, null))
            })
    }
}

export const resetPassword = async (req, res, next) => {
    const { token, password } = req.body;
    let decrypt = await verifyToken(token);
    console.log('decrypt', decrypt)
    if (decrypt.type === 'admin') {
        let adminDetails = await AdminSchema.getSingle({ _id: decrypt._id });
        if (adminDetails && adminDetails.expireToken != null) {
            adminDetails['password'] = await hashPassword(password);
            adminDetails['expireToken'] = null;
            await adminDetails.save();
            return res.status(200).json(createSuccessResponse(msgConstant.passwordUpdated, null))
        } else {
            return res.status(400).json(createErrorResponse(msgConstant.linkExpire, null))
        }
    } else if (decrypt.type === 'user' || decrypt.type === 'astrologer') {
        let userDetails = await getSingle({ _id: decrypt._id });
        if (userDetails && userDetails.expireToken != null) {
            userDetails['password'] = await hashPassword(password);
            userDetails['expireToken'] = null
            await userDetails.save();
            return res.status(200).json(createSuccessResponse(msgConstant.passwordUpdated, null))
        } else {
            return res.status(400).json(createErrorResponse(msgConstant.linkExpire, null))
        }
    } else {
        return res.status(400).json(createErrorResponse(msgConstant.linkExpire, null))
    }
}



  

export const createPost=async(req, res, next)=>{
    try {
        console.log('req',req.file);
        const { token,title, content } = req.body;
        const imageUrl = req.file ? req.file.path : null;
        console.log('token',imageUrl);
        const decrypt = await verifyToken(token);
          const userDetails = await getSingle({ _id: decrypt._id });
          if (userDetails) {
            // Create a new post
            await createSinglePost({user:userDetails,title,content,imageUrl})
    
            return res.status(201).json(createSuccessResponse('Post created successfully', null));
          } else {
            return res.status(400).json(createErrorResponse('User not found', null));
          }
        // } 
        // else {
        //   return res.status(403).json(createErrorResponse('Unauthorized', null));
        // }
      } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json(createErrorResponse('An error occurred', null));
      }
}
export const getPost=async(req,res)=>{
    try {
       
            // Create a new post
            let data=await getMultiplePost(req.body.search)
    
            return res.status(201).json(createSuccessResponse('Post created successfully', data));
          
        // } 
        // else {
        //   return res.status(403).json(createErrorResponse('Unauthorized', null));
        // }
      } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json(createErrorResponse('An error occurred', null));
      }
}