import { validationResult } from 'express-validator';
import { createErrorResponse } from '../helpers/utils.js';
import fs from 'fs';

// const { validationResult } = pkg;

function asyncTryCatchMiddleware(handler) {
  return async (req, res, next) => {

    //file error
    if (req.fileError) {
      if (req.file && req.file.path) fs.unlinkSync(req.file.path)
      if (req.files && req.files.gstCopy && req.files.gstCopy[0].path) fs.unlinkSync(req.files.gstCopy[0].path)
      if (req.files && req.files.adhaarCardCopy && req.files.adhaarCardCopy[0].path) fs.unlinkSync(req.files.adhaarCardCopy[0].path)
      if (req.files && req.files.panCardCopy && req.files.panCardCopy[0].path) fs.unlinkSync(req.files.panCardCopy[0].path)
      if (req.files && req.files.cancelledChequeCopy && req.files.cancelledChequeCopy[0].path) fs.unlinkSync(req.files.cancelledChequeCopy[0].path)
      return res.status(400).json(createErrorResponse(req.fileError, null, 1000))
    }

    //validation error
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      let errorArray = errors.array()
      return res.status(400).json(createErrorResponse(errorArray.map(i => i.msg).toString().replace(',', ' '), null, 1000))
    }

    try { await handler(req, res) }
    catch (err) {
      console.error("caught inside error")
      next(err)
    }
  }
}

export default asyncTryCatchMiddleware;