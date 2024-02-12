module.exports = (express, db, ObjectId, requireAuth, checkRole) => {

    const questionRouter = express.Router();

    questionRouter.route('/')
    .get(async function(req, res) {

        try {

            let data;

            if (process.env.NODE_ENV == 'production') {
              
              const cosmos = require('../common/cosmosdb');
              data = await cosmos(db, 'questions', {});
    
            }
            else {

                data = await db.collection('questions').find({}).
                project({_id: 0, id: "$_id", text: 1, options: 1, answer: 1, timestamp: 1}).toArray();
            }

                res.json({ status: 'OK', questions: data});
        }
        catch(e) {
            res.json({status: 'NOT OK'});
        }
    }).post(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req, res){

        console.log(req.body);

        const question = {
            text : req.body.text,
            options: req.body.options,
            answer: req.body.answer,
            timestamp: req.body.timestamp,
        };

        try {
            const data = await db.collection('questions').insertOne(question);
            res.json({ status: 'OK', insertId: data.insertedId });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    });

    questionRouter.route('/:id').
    get(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req,res){

        try {

            let data;

            if (process.env.NODE_ENV == 'production') {
              
              const cosmos = require('../common/cosmosdb');
              data = await cosmos(db, 'questions', {_id: new ObjectId(req.params.id)});
    
            }
            else {

                data = await db.collection('questions').find({
                    _id: new ObjectId(req.params.id)
                }).
                project({_id: 0, id: "$_id", text: 1, options: 1, answer: 1, timestamp: 1}).toArray();
            }

            res.json({ status: 'OK', question: data });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }        

    }).put(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req,res){

        const question = {
            text : req.body.text,
            options: req.body.options,
            answer: req.body.answer,
            timestamp: req.body.timestamp,
        };

        try {
            const data = await db.collection('questions').updateOne({
                _id : new ObjectId(req.params.id)
            },{
                $set : question
            });

            res.json({ status: 'OK', changedRows: data.modifiedCount });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    }).delete(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req,res){

        try {
            const data = await db.collection('questions').deleteOne({
                _id : new ObjectId(req.params.id)
            });

            res.json({ status: 'OK', deletedRows : data.deletedCount });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    });
    
    return questionRouter;

}
