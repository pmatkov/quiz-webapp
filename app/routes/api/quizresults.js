module.exports = (express, db, ObjectId, requireAuth, checkRole) => {

    const quizResultsRouter = express.Router();

    quizResultsRouter.route('/')
    .get(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req, res) {

        try {

            const data = await db.collection('quizResults').find({}).
            project({_id: 0, id: "$_id", userId: 1, quizId: 1, totalQuestions: 1, questionsAnswered: 1, score: 1, timestamp: 1}).toArray();

            res.json({ status: 'OK', quizResults: data});
        }
        catch(e) {
            res.json({status: 'NOT OK'});
        }
    }).post(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req, res){

        console.log(req.body);

        const quizResults = {
            userId : req.body.userId,
            quizId: req.body.quizId,
            totalQuestions: req.body.description,
            questionsAnswered: req.body.questionsAnswered,
            score: req.body.score,
            timestamp: req.body.timestamp,
        };

        try {
            const data = await db.collection('quizResults').insertOne(quizResults);
            res.json({ status: 'OK', insertId: data.insertedId });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    });

    quizResultsRouter.route('/:id').
    get(requireAuth, async function(req,res){

        try {

            const data = await db.collection('quizResults').find({
                _id: new ObjectId(req.params.id)
            }).
            project({_id: 0, id: "$_id", userId: 1, quizId: 1, totalQuestions: 1, questionsAnswered: 1, score: 1, timestamp: 1}).toArray();

            res.json({ status: 'OK', quizResults: data });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }        

    }).put(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req,res){

        const quizResults = {
            userId : req.body.userId,
            quizId: req.body.quizId,
            totalQuestions: req.body.description,
            questionsAnswered: req.body.questionsAnswered,
            score: req.body.score,
            timestamp: req.body.timestamp,
        };

        try {
            const data = await db.collection('quizResults').updateOne({
                _id : new ObjectId(req.params.id)
            },{
                $set : quizResults
            });

            res.json({ status: 'OK', changedRows: data.modifiedCount });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    }).delete(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req,res){

        try {
            const data = await db.collection('quizResults').deleteOne({
                _id : new ObjectId(req.params.id)
            });

            res.json({ status: 'OK', deletedRows : data.deletedCount });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    });
    
    return quizResultsRouter;

}
