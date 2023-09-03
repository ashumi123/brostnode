import mongoose from 'mongoose';
export const stringType = {
    type: String,
    trim: true,
    default: null
}

export const numberType = {
    type: Number,
    trim: true,
    default: null
}
export const emailType = {
    type: String,
    lowercase: true,
    trim: true,
    default: null
}

export const booleanType = {
    type: Boolean,
    default: false
}

export const joinSchema = (schemaName) => {
    return {
        type: mongoose.Schema.Types.ObjectId,
        ref: schemaName
    }
}

export const customDefaultNumberType = (defaultValue) => {
    return {
        type: Number,
        trim: true,
        default: defaultValue
    }
}

export const customDefaultStringType = (defaultValue) => {
    return {
        type: String,
        trim: true,
        default: defaultValue
    }
}