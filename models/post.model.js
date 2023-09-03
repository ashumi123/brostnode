import mongoose from 'mongoose';
import { stringType, numberType, emailType, customDefaultStringType, joinSchema, booleanType } from './common/commonTypes.js';



  const Post = mongoose.model('Post', new mongoose.Schema({
    user: joinSchema('Users'),
    title: String,
    content: String,
    imageUrl: String,
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } }))

const createSinglePost = (createObject) => new Post(createObject).save()

const getMultiplePost = (seach) => {
    const filter = {  $or: [
        { title: { $regex: seach, $options: 'i' } },
        { content: { $regex: seach, $options: 'i' } }
      ] };
    const select = 'content title';
    return Post.find(filter).select(select).populate('user')
}

export {
    createSinglePost,
    getMultiplePost
}
