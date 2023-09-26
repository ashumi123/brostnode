import mongoose from 'mongoose';
import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import moment from 'moment';
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = payload => JWT.sign(payload, JWT_SECRET);

const verifyToken = token => {
    try {
        return JWT.verify(token, JWT_SECRET)
    } catch (error) {
        return false;
    }
};

const hashPassword = async password => await bcrypt.hash(password, 6);

const comparePassword = async (password1, password2) => await bcrypt.compare(password1, password2);

const customCORSHandler = (request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, On-behalf-of, x-sg-elas-acl,Access-Control-Allow-Origin");
    response.header("Access-Control-Allow-Credentials", true);
    response.header("access-control-allow-methods", "*");
    // response.setHeader('Access-Control-Allow-Origin', 'https://clubboxx.in');
  
  // Set the 'Content-Type' header to indicate that the response is in JSON format
    next()
}

const customErrorHandler = (err, req, res, next) => {
    let message = ''
    let code = 500;
    if (err) {
        switch (err.name) {
            case "NotFoundError":
                code = 400;
                message = "Route Not Found";
                break;
            case "JsonWebTokenError":
                code = 400;
                message = "Invaid signature";
                break;
        }
    }

    console.log('====================================');
    console.log(err);
    console.log('====================================');
    res.status(code).json({ status: false, message: message ? message : `${err.name}:${err.message}`, data: null });
}

const isPhoto = mimetype => mimetype && mimetype == 'image/jpeg' || mimetype == 'image/jpg' || mimetype == 'image/png' || mimetype == 'image/gif';

const fileExt = fileName => fileName.split('.').pop();

const isVideo = mimetype => {
    if (!mimetype) return false;
    switch (mimetype) {
        case 'video/mp4':
        case 'video/quicktime':
        case 'video/mpeg':
        case 'video/mp2t':
        case 'video/webm':
        case 'video/ogg':
        case 'video/x-ms-wmv':
        case 'video/x-msvideo':
        case 'video/3gpp':
        case 'video/3gpp2':
            return true;
        default:
            return false;
    }
}

const isArrayPopulated = checkArray => {
    if (checkArray !== undefined
        && checkArray !== null
        && Array.isArray(checkArray)
        && checkArray.length > 0) {
        return true;
    }
    return false;
}

const isStringNullOrEmpty = checkString => typeof checkString === 'string'
    && checkString !== null && checkString.length > 0 ? true : false;

const isPropertyNullOrZero = object => object === null ? object = 0 : object;

const stringToNumber = checkString => typeof checkString === 'string' ? parseInt(checkString) : checkString;

const isNotNullAndUndefined = value => value !== undefined && value !== null;

const isNotNullAndNaN = value => value !== undefined && value !== null && !isNaN(value);

const isNotNullUndefinedAndQueryString = value => value !== undefined && value !== null && value !== '';

const isNotNullUndefinedAndEmptyString = value => value !== undefined && value !== null && value !== '';

const paginationData = (totalCount, LIMIT, OFFSET) => {
    let totalPages = Math.ceil(totalCount / LIMIT);
    let currentPage = Math.floor(OFFSET / LIMIT);
    let prevPage = (currentPage - 1) > 0 ? (currentPage - 1) * LIMIT : 0;
    let nextPage = (currentPage + 1) <= totalPages ? (currentPage + 1) * LIMIT : 0;

    return {
        totalCount,
        nextPage,
        prevPage,
        totalCount,
        currentPage: currentPage + 1
    }
}

const isNullOrUndefined = e => (e === null || e === undefined) ? false : e;

const isNullOrZero = e => (e === null || e === 0);

const isNullOrUndefinedValue = e => (e === null || e === undefined) ? null : e;

const stringTOFloatNumber = checkString => typeof checkString === 'string' ? parseFloat(checkString) : checkString;

const arrayIsEmpty = checkArray => (checkArray !== 'undefined' && checkArray !== null && Array.isArray(checkArray) && checkArray.length < 1);

const isNullOrNumber = e => (e === null) ? null : stringTOFloatNumber(e);

const hasNoValue = e => e === null || e === undefined || e === '' ? true : false;

const hasValue = e => e === null || e === undefined || e === '' ? false : true;

const removeDuplicates = data => [...new Set(data)];

const createSuccessResponse = (message, data, success = true) => {
    return { success, message, data };
}

const createErrorResponse = (message, data, success = false) => {
    return { success, message, data };
}

const createCatchResponse = (error, message, data, success = false) => {
    return { success, message, data, error };
}

const parseToMongoObjectID = string => mongoose.Types.ObjectId(string);

const generateSMSVerificationCode = () => Math.floor(1000 + Math.random() * 9000);

const removeDuplicatesByReduce = array => {
    return array.reduce(function (a, b) {
        if (a.indexOf(b) < 0) a.push(b);
        return a;
    }, []);
}

const objToArrayObj = (obj, key1, key2) => {
    const result = [];
    for (let i of Object.keys(obj)) result.push({ [key1]: i, [key2]: obj[i] })
    return result;
}

const objectIsEmpty = (obj) => {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) return false;
    }
    return true;
}

const removeDuplicatesByStringfy = (arrayOfObjects) => {

    let uniq = new Set(arrayOfObjects.map(e => JSON.stringify(e)));

    let uniqueElementsArray = Array.from(uniq).map(e => JSON.parse(e));

    return uniqueElementsArray;
}

const uuidv4_6 = () => {
    let dt = new Date().getTime();
    return 'xxxxxxxx'.replace(/[xy]/g, c => {
        let r = (dt + Math.random() * 16) % 16 | 0;
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16).toUpperCase();
    });
}

const findHashTagsFromString = string => {
    const regexp = /#[^\s!@#$%^&*()=+-.\/,\[{\]};:'"?><]+/g
    const result = string.match(regexp);
    if (isNotNullAndUndefined(result)) return result.map(s => s.trim().substr(1));
    else return false;
}

const imageExtension = ['jpg', 'png', 'jpeg']
const videoExtension = ['mp4', 'mkv', 'avi']
const fileExtension = ['.jpg', '.png', '.jpeg', '.mp4', '.mkv', '.avi']

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

const monthlyWiseDates = (year) => {
    let months = [];
    for (let month = 0; month < 12; month++) {
        months.push({
            start: moment().month(month).year(year).startOf('month'),
            end: moment().month(month).year(year).endOf('month')
        })
    }
    return months;
}

monthlyWiseDates(2012)
export {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    customCORSHandler,
    customErrorHandler,
    isPhoto,
    fileExt,
    isVideo,
    isArrayPopulated,
    isStringNullOrEmpty,
    isPropertyNullOrZero,
    stringToNumber,
    isNotNullAndUndefined,
    isNotNullUndefinedAndQueryString,
    isNotNullUndefinedAndEmptyString,
    paginationData,
    isNullOrUndefined,
    isNullOrZero,
    isNullOrUndefinedValue,
    stringTOFloatNumber,
    arrayIsEmpty,
    isNullOrNumber,
    hasNoValue,
    hasValue,
    removeDuplicates,
    createSuccessResponse,
    createErrorResponse,
    createCatchResponse,
    parseToMongoObjectID,
    generateSMSVerificationCode,
    removeDuplicatesByReduce,
    objToArrayObj,
    objectIsEmpty,
    removeDuplicatesByStringfy,
    isNotNullAndNaN,
    uuidv4_6,
    imageExtension,
    videoExtension,
    fileExtension,
    findHashTagsFromString,
    isObjectId,
    monthlyWiseDates
}