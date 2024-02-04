const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {MongoClient} = require('mongodb');

const config = require('./config');

async function init() {

    try {
        const client = new MongoClient(config.url);
        await client.connect();
        const database = client.db('napredni_js');
        initServer(database);

    } catch (e) {
        console.error('Error connecting to database');
    }
};

function initServer(database) {

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

    const authRouter = require('./app/routes/auth')(app, express, database, jwt, config.secret, bcrypt);
    app.use('/auth', authRouter);

    const apiRouter = require('./app/routes/api')(app, express, database, jwt, config.secret);
    app.use('/api', apiRouter);


    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname + '/public/app/index.html'));
    });


    app.listen(config.port);

    console.log('Running on port: ' + config.port);
};

init();














