//schema
import {
    createSingle,
    getMultipleWithLimit,
    totalCount,
    getSingle,
    deleteSingle,
    getMultiple,
    aggregateMetod,
    updateSingle
} from '../../models/category.model.js'
import * as UserSchema from '../../models/user.model.js';

//helpers
import {
    createErrorResponse,
    createSuccessResponse,
    generateSMSVerificationCode,
    paginationData,
    hashPassword,
    parseToMongoObjectID,
} from '../../helpers/utils.js';
import msgConstant from '../../helpers/msgConstant.js';

//200-299 -->220

export const addCategory = async (req, res, next) => {
    if (req.user.type === 'admin') {
        const { name } = req.body;
        if (!name) return res.status(400).json(createErrorResponse(msgConstant.enterCategory, null))
        let checKCat = await getSingle({ name }, '');
        if (checKCat) return res.status(400).json(createErrorResponse(msgConstant.categoryAlready, null))
        await createSingle({ name });
        return res.status(200).json(createSuccessResponse(msgConstant.categoryAdded))
    } else {
        return res.status(401).json(createErrorResponse(msgConstant.authorizationError, null))
    }
}

export const listOfCategory = async (req, res, next) => {
    if (req.user.type === 'admin' || req.user.type === 'user' || req.user.type === 'astrologer') {
        let { offset, limit, search, sortBy, order } = req.body;
        offset = offset ? offset : 0
        const pagination = [{ $skip: offset }]
        if (limit) pagination.push({ $limit: limit })

        const sortObject = Object.assign({});
        if (sortBy && order) sortObject[sortBy] = order
        else sortObject['createdOn'] = -1

        let aggregation = [
            {
                $project: {
                    name: 1
                }
            },
            {
                $sort: sortObject
            },
            {
                $facet: {
                    data: pagination,
                    totalCount: [
                        {
                            $count: 'count'
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: '$totalCount',
                    preserveNullAndEmptyArrays: true
                }
            },
        ]

        if (search) {
            aggregation[1].$match.$and.push({
                $or: [
                    {
                        'name': { $regex: new RegExp(('.*' + search + '.*'), "i") }
                    }
                ]
            })
        }
        let list = await aggregateMetod(aggregation);
        return res.status(200).json(createSuccessResponse(msgConstant.categoryFetch, {
            list: list && list[0] ? list[0].data : [],
            paging: paginationData(list && list[0] && list[0].totalCount ? list[0].totalCount.count : 0, limit, offset)
        }))
    } else {
        return res.status(401).json(createErrorResponse(msgConstant.authorizationError, null))
    }
}

export const categoryDetails = async (req, res, next) => {
    if (req.user.type === 'admin') {
        let categoryId = req.params.id
        let aggregate = [
            {
                $match: {
                    _id: parseToMongoObjectID(categoryId)
                }
            },
            {
                $project: {
                    name: 1
                }
            }
        ]
        let userData = await aggregateMetod(aggregate);
        if (userData.length > 0 && userData[0]) {
            return res.status(200).json(createSuccessResponse(msgConstant.categoryFetch, userData[0]))
        } else {
            return res.status(400).json(createErrorResponse(msgConstant.categoryNotFound, null))
        }
    } else {
        return res.status(401).json(createErrorResponse(msgConstant.authorizationError, null))
    }
}

export const editCategory = async (req, res, next) => {
    if (req.user.type === 'admin') {
        const { name, categoryId } = req.body;
        if (!name) return res.status(400).json(createErrorResponse(msgConstant.enterCategory, null))
        let checKCat = await getSingle({ _id: categoryId }, '');
        if (checKCat) {
            checKCat['name'] = name
            await checKCat.save();
            return res.status(200).json(createSuccessResponse(msgConstant.categoryUpdate, null))
        } else {
            return res.status(400).json(createErrorResponse(msgConstant.categoryNotFound, null))
        }
    } else {
        return res.status(401).json(createErrorResponse(msgConstant.authorizationError, null, 206))
    }
}

export const removeCategory = async (req, res, next) => {
    if (req.user.type === 'admin') {
        const categoryId = req.params.id;
        let checkAlreadyUsed = await UserSchema.getSingle({ category: categoryId });
        if (checkAlreadyUsed) return res.status(400).json(createErrorResponse(msgConstant.categorySelected, null))
        else {
            await deleteSingle({ _id: categoryId });
            return res.status(200).json(createSuccessResponse(msgConstant.categoryDelete, null))
        }
    } else {
        return res.status(401).json(createErrorResponse(msgConstant.authorizationError, null, 206))
    }
}