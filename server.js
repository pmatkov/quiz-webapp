const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {MongoClient, ObjectId} = require('mongodb');

const requireAuth = require('./app/routes/common/requireAuth');
const checkRole = require('./app/routes/common/checkRole');

const {url, port, secret} = require('./config');

async function init() {

    try {
        const client = new MongoClient(url);
        await client.connect();
        const database = client.db('quizdb');
        initServer(database);

    } catch (err) {
        console.error('Error connecting to database', err);
    }
};

function initServer(database) {

    console.log("test");

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.use(express.static(__dirname + '/public/app'));

    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \ Authorization');
        next();
    });

    app.use(morgan('dev'));

    const authRouter = require('./app/routes/auth/auth')(express, database, jwt, secret, bcrypt);
    app.use('/auth', authRouter);

    const quizRouter = require('./app/routes/api/quizzes')(express, database, ObjectId, requireAuth, checkRole);
    app.use('/api/quizzes', quizRouter);
    
    const categoryRouter = require('./app/routes/api/categories')(express, database, ObjectId, requireAuth, checkRole);
    app.use('/api/categories', categoryRouter);

    const questionRouter = require('./app/routes/api/questions')(express, database, ObjectId, requireAuth, checkRole);
    app.use('/api/questions', questionRouter);

    const assignedQuestionsRouter = require('./app/routes/api/assigned-questions')(express, database, ObjectId, requireAuth, checkRole);
    app.use('/api/assigned-questions', assignedQuestionsRouter);

    const quizResultsRouter = require('./app/routes/api/quiz-results')(express, database, ObjectId, requireAuth, checkRole);
    app.use('/api/quiz-results', quizResultsRouter);

    const userRouter = require('./app/routes/api/users')(express, database, ObjectId, requireAuth, checkRole, bcrypt);
    app.use('/api/users', userRouter);


    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname + '/public/app/index.html'));
    });


    app.listen(port);

    console.log('Running on port: ' + port);
};

init();














