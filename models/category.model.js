import mongoose from 'mongoose';
import { stringType, joinSchema, booleanType, customDefaultNumberType } from './common/commonTypes.js';
const CategorySchema = mongoose.model('Categories', new mongoose.Schema({
    name: stringType,
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } }))

const createSingle = (createObject) => new CategorySchema(createObject).save()

const getSingle = (filter, select) => {
    return CategorySchema.findOne(filter).select(select)
}

const getMultiple = (filter, select) => {
    return CategorySchema.find(filter).select(select)
}

const getMultipleWithLimit = (filter, select, offset, limit) => {
    return CategorySchema.find(filter).select(select).skip(offset).limit(limit)
}

const deleteSingle = (filter) => {
    return CategorySchema.deleteOne(filter)
}

const updateSingle = (filter, update) => {
    return CategorySchema.updateOne(filter, update)
}

const totalCount = (filter) => CategorySchema.find(filter).count()

const aggregateMetod = (filter) => {
    return CategorySchema.aggregate(filter)
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