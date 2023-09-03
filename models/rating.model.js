import mongoose from 'mongoose';
import { stringType, joinSchema, booleanType, customDefaultNumberType } from './common/commonTypes.js';
const RatingSchema = mongoose.model('Ratings', new mongoose.Schema({
    user: joinSchema('Users'),
    astrologer: joinSchema('Users'),
    description: stringType,
    rating: customDefaultNumberType(0),
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } }))

const createSingle = (createObject) => new RatingSchema(createObject).save()

const getSingle = (filter, select) => {
    return RatingSchema.findOne(filter).select(select)
}

const getMultiple = (filter, select) => {
    return RatingSchema.find(filter).select(select)
}

const getMultipleWithLimit = (filter, select, offset, limit) => {
    return RatingSchema.find(filter).select(select).skip(offset).limit(limit)
}

const deleteSingle = (filter) => {
    return RatingSchema.deleteOne(filter)
}

const updateSingle = (filter, update) => {
    return RatingSchema.updateOne(filter, update)
}

const totalCount = (filter) => RatingSchema.find(filter).count()

const aggregateMetod = (filter) => {
    return RatingSchema.aggregate(filter)
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