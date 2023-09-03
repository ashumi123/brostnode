import mongoose from 'mongoose';
import { stringType, numberType, emailType, customDefaultStringType, joinSchema, booleanType } from './common/commonTypes.js';
const UserSchema = mongoose.model('Users', new mongoose.Schema({
    type: {
        type: String,
        enum: ['user', 'astrologer'],
        default: 'user'
    },
    name: stringType,
    email: emailType,
    otp: numberType,
    mobileNumber: stringType,
    password: stringType,
    countryCode: customDefaultStringType('+91'),
    profile: stringType,
    deviceToken: stringType,
    agoraToken: stringType,
    deviceType: {
        type: String,
        enum: ['android', 'ios'],
        default: 'android'
    },
    category: joinSchema('Categories'),
    expireToken: numberType,
    isVerified: booleanType,
    isBlock: booleanType
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } }))

const createSingle = (createObject) => new UserSchema(createObject).save()

const getSingle = (filter, select) => {
    return UserSchema.findOne(filter).select(select)
}

const getMultiple = (filter, select) => {
    return UserSchema.find(filter).select(select)
}

const getMultipleWithLimit = (filter, select, offset, limit) => {
    return UserSchema.find(filter).select(select).skip(offset).limit(limit)
}

const deleteSingle = (filter) => {
    return UserSchema.deleteOne(filter)
}

const updateSingle = (filter, update) => {
    return UserSchema.updateOne(filter, update)
}

const totalCount = (filter) => UserSchema.find(filter).count()

const aggregateMetod = (filter) => {
    return UserSchema.aggregate(filter)
}
export {
    createSingle,
    getSingle,
    getMultiple,
    getMultipleWithLimit,
    updateSingle,
    deleteSingle,
    totalCount,
    aggregateMetod
}