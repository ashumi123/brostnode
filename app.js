import createError from 'http-errors';
import express from "express";
import mongoose from 'mongoose';
import { customCORSHandler, customErrorHandler } from './helpers/utils.js';
import router from './routers/v1/index.js'
import cors from 'cors';
const app = express();

const corsOptions = {
    origin: 'https://clubboxx.in/',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  };
app.use(cors(corsOptions));

// app.use(customCORSHandler);

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const mongoDBOptions = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true
}

const MONGO_CONNECT_URL = process.env.MONGO_CONNECTION_URL
mongoose.connect(MONGO_CONNECT_URL, mongoDBOptions, (err) => {
    if (err) console.log(`Cannot connect to ${MONGO_CONNECT_URL}`)
    else console.log(`Successfully Connected to ${MONGO_CONNECT_URL}`)
});

mongoose.set('debug', true);
app.use('/public', express.static('public'))

app.use((req, res, next) => {
    if (req.query.offset && req.query.offset != '') req.query.offset = parseInt(req.query.offset)
    if (req.query.limit && req.query.limit != '') req.query.limit = parseInt(req.query.limit)
    if (req.body.offset && req.body.offset != '') req.body.offset = parseInt(req.body.offset)
    if (req.body.limit && req.body.limit != '') req.body.limit = parseInt(req.body.limit)
    next()
})

app.use('/v1/api/', router)

// catch 404 and forward to error handler
app.use((req, res, next) => next(createError(404)));
app.use((req, res, next) => res.send('API Not Found'));

// error handler
app.use(customErrorHandler);

export default app;