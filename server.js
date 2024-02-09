const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {MongoClient, ObjectId} = require('mongodb');
const requireAuth = require('./app/routes/common/requireAuth');
const checkRole = require('./app/routes/common/checkRole');
require('dotenv').config();

const port = process.env.PORT || process.env.LOCAL_PORT;

async function init() {

    try {
        const client = new MongoClient(process.env.DB_CONNECTION_STRING);
        await client.connect();
        const database = client.db('quizdb');
        initServer(database);

    } catch (err) {
        console.error('Error connecting to database', err);
    }
};

function initServer(database) {

    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-type, Authorization');
        if (req.method === "OPTIONS") {
            return res.status(200).end();
        }
        next();
    });

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.use(express.static(__dirname + '/public/app'));

    app.use(morgan('dev'));

    const authRouter = require('./app/routes/auth/auth')(express, database, requireAuth, jwt, bcrypt);
    app.use('/auth', authRouter);
    const userRouter = require('./app/routes/api/users')(express, database, ObjectId, requireAuth, checkRole, bcrypt, path);
    app.use('/api/users', userRouter);

    const quizRouter = require('./app/routes/api/quizzes')(express, database, ObjectId, requireAuth, checkRole);
    app.use('/api/quizzes', quizRouter);
    const quizResultRouter = require('./app/routes/api/quizresults')(express, database, ObjectId, requireAuth, checkRole);
    app.use('/api/quiz-results', quizResultRouter);
    const categoryRouter = require('./app/routes/api/categories')(express, database, ObjectId, requireAuth, checkRole);
    app.use('/api/categories', categoryRouter);
    const questionRouter = require('./app/routes/api/questions')(express, database, ObjectId, requireAuth, checkRole);
    app.use('/api/questions', questionRouter);
    const assignedQuestionRouter = require('./app/routes/api/assignedquestions')(express, database, ObjectId, requireAuth, checkRole);
    app.use('/api/assigned-questions', assignedQuestionRouter);

    const openAiRouter = require('./app/routes/openai/openai').openAiApi(express, requireAuth);
    app.use('/openai', openAiRouter);

    app.get('/api/me', requireAuth, (req, res) => {
        res.json({status: 'OK', user: req.decoded});
    });

    app.get('/api/', (req, res) => {
        res.status(200).send('Welcome to Quiz API');
      }); 

    app.all('/api/*', (req, res) => {
        res.status(404).send('API route not found');
    });

    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname + '/public/app/index.html'));
    });

    app.listen(port);

    console.log('Running on port: ' + port);
};

init();