import msgConstant from '../helpers/msgConstant.js'
import { verifyToken, isNotNullAndUndefined, createErrorResponse } from '../helpers/utils.js'
import * as UserSchema from '../models/user.model.js';
import * as AdminSchema from '../models/admin.model.js';

const verifyJWTToken = async (req, res, next) => {
    if (req.headers['x-access-token']) {
        let token = req.headers['x-access-token']
        const verifyDetails = verifyToken(token)
        const { _id, mobileNumber, deviceType, deviceToken } = verifyDetails;
        console.log('verifyDetails:::::', verifyDetails)
        const getUserDetails = await UserSchema.getSingle({ _id }, 'deviceToken isVerified name email isBlock type mobileNumber profile');
        if (isNotNullAndUndefined(getUserDetails)) {
            if (getUserDetails.deviceToken != deviceToken) {
                return res.status(403).json(createErrorResponse(msgConstant.loginOnAnotherDevice, null))
            } else if (getUserDetails.isBlock) {
                return res.status(403).json(createErrorResponse(msgConstant.blockByAdmin, null))
            } else if (!getUserDetails.isVerified) {
                return res.status(403).json(createErrorResponse(msgConstant.mobileNotVerified, null))
            } else {
                req["user"] = getUserDetails
                next()
            }
        } else {
            return res.status(403).json(createErrorResponse(msgConstant.loginUserNotFound, null))
        }
    } else if (req.headers['authorization']) {
        let token = req.headers['authorization']
        const verifyDetails = verifyToken(token)
        const { _id, email, deviceToken, password } = verifyDetails;
        console.log('verifyDetails:::::', verifyDetails)
        const getUserDetails = await AdminSchema.getSingle({ email, password, _id }, 'deviceToken name email profile password');
        if (isNotNullAndUndefined(getUserDetails)) {
            if (getUserDetails.deviceToken != deviceToken) {
                return res.status(403).json(createErrorResponse(msgConstant.loginOnAnotherDevice, null))
            } else {
                delete verifyDetails['password']
                verifyDetails['type'] = 'admin'
                req["user"] = verifyDetails
                next()
            }
        } else {
            return res.status(403).json(createErrorResponse(msgConstant.loginUserNotFound, null))
        }
    } else {
        return res.status(401).json(createErrorResponse(msgConstant.authorizationTokenRequired, null))
    }
}

export default verifyJWTToken;