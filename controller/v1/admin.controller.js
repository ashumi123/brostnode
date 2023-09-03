//schema
import { getSingle } from '../../models/admin.model.js'
import * as UserSchema from '../../models/user.model.js'
//helpers
import {
    createErrorResponse,
    createSuccessResponse,
    generateToken,
    comparePassword,
    parseToMongoObjectID,
    uuidv4_6,
    monthlyWiseDates
} from '../../helpers/utils.js';
import msgConstant from '../../helpers/msgConstant.js';
//200-299 -->220

export const login = async (req, res, next) => {
    const { email, password } = req.body;
    let checkAdmin = await getSingle({ email });
    if (checkAdmin) {
        let checkPass = await comparePassword(password, checkAdmin.password);
        
        console.log('checkPass',checkPass);
        if (checkPass) {
            let unique = await uuidv4_6();
            checkAdmin['deviceToken'] = unique;
            await checkAdmin.save();
            const token = await generateToken({
                _id: checkAdmin._id,
                password: checkAdmin.password,
                deviceToken: unique,
                email
            })
            return res.status(200).json(createSuccessResponse(msgConstant.loginSuccessfully, {
                token
            }))
        } else {
            return res.status(400).json(createErrorResponse(msgConstant.passwordWrong, null))
        }
    } else {
        return res.status(400).json(createErrorResponse(msgConstant.enterValidMail, null))
    }
}

export const adminDashboard = async (req, res, next) => {
    if (req.user.type === 'admin') {
        let dashboard = {
            sales: 0,
            users: await UserSchema.totalCount({ type: 'user' }),
            astrologers: await UserSchema.totalCount({ type: 'astrologer' })
        }
        return res.status(200).json(createSuccessResponse(msgConstant.dashboard, dashboard))
    } else {
        return res.status(401).json(createErrorResponse(msgConstant.authorizationError, null))
    }
}

export const montlyData = async (req, res, next) => {
    if (req.user.type === 'admin') {
        let year = req.body.year;
        let months = {
            users: [],
            astrologers: []
        };
        let dates = monthlyWiseDates(year);
        for (let i of dates) {
            let user = await UserSchema.totalCount({ type: 'user', createdOn: { $gte: i.start, $lte: i.end } })
            let astrologer = await UserSchema.totalCount({ type: 'astrologer', createdOn: { $gte: i.start, $lte: i.end } })
            months.users.push(user)
            months.astrologers.push(astrologer)
        }
        return res.status(200).json(createSuccessResponse(msgConstant.dashboard, months))
    } else {
        return res.status(401).json(createErrorResponse(msgConstant.authorizationError, null))
    }
}