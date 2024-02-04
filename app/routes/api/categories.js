module.exports = (express, db, ObjectId, requireAuth, checkRole) => {

    const categoryRouter = express.Router();

    categoryRouter.route('/')
    .get(requireAuth, async function(req, res) {

        try {

            const data = await db.collection('categories').find({}).
            project({_id: 0, id: "$_id", name: 1, description: 1}).toArray();

            res.json({ status: 'OK', categories: data});
        }
        catch(e) {
            res.json({status: 'NOT OK'});
        }
    }).post(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req, res){

        console.log(req.body);

        const category = {
            name : req.body.name,
            description: req.body.description,
        };

        try {
            const data = await db.collection('categories').insertOne(category);
            res.json({ status: 'OK', insertId: data.insertedId });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    });

    categoryRouter.route('/:id').
    get(requireAuth, async function(req,res){

        try {

            const data = await db.collection('categories').find({
                _id: new ObjectId(req.params.id)
            }).
            project({_id: 0, id: "$_id",  name: 1, description: 1}).toArray();

            res.json({ status: 'OK', category: data });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }        

    }).put(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req,res){

        const category = {
            name : req.body.name,
            description: req.body.description,
        };

        try {
            const data = await db.collection('categories').updateOne({
                _id : new ObjectId(req.params.id)
            },{
                $set : category
            });

            res.json({ status: 'OK', changedRows: data.modifiedCount });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    }).delete(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req,res){

        try {
            const data = await db.collection('categories').deleteOne({
                _id : new ObjectId(req.params.id)
            });

            res.json({ status: 'OK', deletedRows : data.deletedCount });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    });
    
    return categoryRouter;

}
