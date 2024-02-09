module.exports = (express, db, ObjectId, requireAuth, checkRole) => {

    const assignedQuestionRouter = express.Router();

    assignedQuestionRouter.route('/')
    .get(async function(req, res) {

        try {

            const data = await db.collection('assignedQuestions').find({}).
            project({_id: 0, id: "$_id", questionId: 1, quizId: 1}).toArray();

            res.json({ status: 'OK', assignedQuestions: data});
        }
        catch(e) {
            res.json({status: 'NOT OK'});
        }
    }).post(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req, res){

        console.log(req.body);

        const assignedQuestion = {
            questionId : req.body.questionId,
            quizId: req.body.quizId,
        };

        try {
            const data = await db.collection('assignedQuestions').insertOne(assignedQuestion);
            res.json({ status: 'OK', insertId: data.insertedId });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    });

    assignedQuestionRouter.route('/:id').
    get(requireAuth, async function(req,res){

        try {

            const data = await db.collection('assignedQuestions').find({
                _id: new ObjectId(req.params.id)
            }).
            project({_id: 0, id: "$_id", questionId: 1, quizId: 1}).toArray();

            res.json({ status: 'OK', assignedQuestion: data });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }        

    }).put(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req,res){

        const assignedQuestion = {
            questionId : req.body.questionId,
            quizId: req.body.quizId,
        };

        try {
            const data = await db.collection('assignedQuestions').updateOne({
                _id : new ObjectId(req.params.id)
            },{
                $set : assignedQuestion
            });

            res.json({ status: 'OK', changedRows: data.modifiedCount });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    }).delete(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req,res){

        try {
            const data = await db.collection('assignedQuestions').deleteOne({
                _id : new ObjectId(req.params.id)
            });

            res.json({ status: 'OK', deletedRows : data.deletedCount });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    });
    
    return assignedQuestionRouter;

}
