import mongoose from 'mongoose';
import { stringType, numberType, emailType, customDefaultStringType, joinSchema, booleanType } from './common/commonTypes.js';



  const Post = mongoose.model('Post', new mongoose.Schema({
    user: joinSchema('Users'),
    title: String,
    content: String,
    imageUrl: String,
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } }))

const commentSchema =mongoose.model('comment', new mongoose.Schema({
    user: joinSchema('Users'),
    content:String,
    postId:joinSchema('Post')
  },{ timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } }))

const createSinglePost = (createObject) => new Post(createObject).save()
const createSingleComment = (createObject) => new commentSchema(createObject).save()

const getMultiplePost = (seach,userId) => {

  let usersIFollow 
  if(userId){
    usersIFollow = userId.followers;
  }

    const filter = {  $or: [
        { title: { $regex: seach, $options: 'i' } },
        { content: { $regex: seach, $options: 'i' } }
        
      ] };
    const select = 'content title imageUrl comments createdAt ';
    if(usersIFollow){
      return Post.find({ user: { $in: usersIFollow }}).select(select).populate('user')
    }
    else{
    return Post.find(filter).select(select).populate('user').sort(-1)
    }
}
const getComments = (seach) => {
   
    const select = 'user content postId createdAt';
    return commentSchema.find({postId:seach}).select(select).populate('user')
}

const getMultiplePostSingleUser = (seach) => {
  
  const select = 'content title imageUrl comments createdAt ';
  return Post.find({user:Object(seach)}).select(select).populate('user')
}


export {
    createSinglePost,
    getMultiplePost,
    createSingleComment,
    getComments,
    getMultiplePostSingleUser
}
