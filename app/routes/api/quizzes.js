module.exports = (express, db, ObjectId, requireAuth, checkRole) => {

    const quizRouter = express.Router();

    quizRouter.route('/')
    .get(async function(req, res) {

        try {

            let data;

            if (process.env.NODE_ENV == 'production') {
              
              const cosmos = require('../common/cosmosdb');
              data = await cosmos(db, 'quizzes', {});
    
            }
            else {

                data = await db.collection('quizzes').find({}).
                project({_id: 0, id: "$_id", title: 1, description: 1, categoryId: 1, timelimit: 1, timestamp: 1 }).toArray();
            }

            res.json({ status: 'OK', quizzes: data});
        }
        catch(e) {
            res.json({status: 'NOT OK'});
        }
    }).post(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req, res){

        console.log(req.body);

        const quiz = {
            title : req.body.title,
            description : req.body.description,
            categoryId : req.body.categoryId,
            timelimit : req.body.timelimit,
            timestamp : req.body.timestamp
        };

        try {
            const data = await db.collection('quizzes').insertOne(quiz);
            res.json({ status: 'OK', insertId: data.insertedId });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    });

    quizRouter.route('/:id').
    get(requireAuth, async function(req,res){

        try {

            let data;

            if (process.env.NODE_ENV == 'production') {
              
              const cosmos = require('../common/cosmosdb');
              data = await cosmos(db, 'quizzes', {_id: new ObjectId(req.params.id)});
    
            }
            else {
                data = await db.collection('quizzes').find({
                    _id: new ObjectId(req.params.id)
                }).
                project({_id: 0, id: "$_id", title: 1, description: 1, categoryId: 1, timelimit: 1, timestamp: 1 }).toArray();
            }

            res.json({ status: 'OK', quiz: data });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    }).put(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req,res){

        const quiz = {
            title : req.body.title,
            description : req.body.description,
            categoryId : req.body.categoryId,
            timelimit : req.body.timelimit,
            timestamp : req.body.timestamp
        };

        try {
            const data = await db.collection('quizzes').updateOne({
                _id : new ObjectId(req.params.id)
            },{
                $set : quiz
            });

            res.json({ status: 'OK', changedRows: data.modifiedCount });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    }).delete(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req,res){

        try {
            const data = await db.collection('quizzes').deleteOne({
                _id : new ObjectId(req.params.id)
            });

            res.json({ status: 'OK', deletedRows : data.deletedCount });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    });
    
    return quizRouter;

}
