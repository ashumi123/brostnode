import mongoose from 'mongoose';
import { stringType, numberType, emailType, joinSchema, booleanType } from './common/commonTypes.js';
const AdminSchema = mongoose.model('Admins', new mongoose.Schema({
    name: stringType,
    email: emailType,
    profile: stringType,
    password: stringType,
    deviceToken: stringType,
    expireToken: numberType
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } }))

const createSingle = (createObject) => new AdminSchema(createObject).save()

const getSingle = (filter, select) => {
    return AdminSchema.findOne(filter).select(select)
}

const getMultiple = (filter, select) => {
    return AdminSchema.find(filter).select(select)
}

const getMultipleWithLimit = (filter, select, offset, limit) => {
    return AdminSchema.find(filter).select(select).skip(offset).limit(limit)
}

const deleteSingle = (filter) => {
    return AdminSchema.deleteOne(filter)
}

const updateSingle = (filter, update) => {
    return AdminSchema.updateOne(filter, update)
}

const totalCount = (filter) => AdminSchema.find(filter).count()

const aggregation = (filter) => {
    return AdminSchema.aggregate(filter)
}
export {
    createSingle,
    getSingle,
    getMultiple,
    getMultipleWithLimit,
    updateSingle,
    deleteSingle,
    totalCount,
    aggregation
}