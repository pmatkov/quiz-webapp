
module.exports = function(app, express, db, jwt, secret) {

    const ObjectId = require('mongodb').ObjectId;
    const apiRouter = express.Router();

    apiRouter.use(async function (req, res, next) {

        const token = req.query.token;
    
        if (!token) {
          return res.status(401).json({
            success: false,
            message: 'No token provided',
          });
        }
    
        try {
          const decoded = await jwt.verify(token, secret);
          req.decoded = decoded;
          next();
        } catch (err) {
          return res.status(401).json({
            success: false,
            message: 'Invalid token',
          });
        }
      });
    

    apiRouter.route('/users').get(async function(req, res){

        try {

            const rows = await db.collection('users').find({}).project({_id: 0, id: "$_id", username: 1}).toArray();

            res.json({ status: 'OK', users: rows});
        }
        catch(e) {
            res.json({status: 'NOT OK'});
        }

    });


    apiRouter.route('/posts').get(async function(req, res){

        try {
            
            rows = await db.collection('posts').aggregate([
            {
                $set: {
                    userId: {
                        $toObjectId: "$userId"
                    }
                }
                },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userslist"
                }
            },
            {
                $unwind: "$userslist"
            },
            {
                $project: {
                    _id: 0, 
                    id: "$_id",
                    userId: 1,
                    timestamp: 1,
                    comment: 1,
                    username: "$userslist.username"
                }
            },
            ]).toArray();
            
            res.json({ status: 'OK', posts: rows });
        }
        catch(e) {
            res.json({status: 'NOT OK'});
        }

    }).post(async function(req, res){

        console.log(req.body);

        const post = {
            comment : req.body.comment,
            timestamp : req.body.timestamp,
            userId : req.body.userId
        };

        try {
            const data = await db.collection('posts').insertOne(post);
            res.json({ status: 'OK', insertId: data.insertedId });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    }).put(async function(req,res) {

        console.log(req.body.id);

        const post = {
            comment : req.body.comment,
            timestamp : req.body.timestamp,
            userId : req.body.userId
        };

        try {
            const data = await db.collection('posts').updateOne(
                { _id: new ObjectId(req.body.id) },
                {
                   $set: post
                }
            );
    

            res.json({ status: 'OK', changedRows:  data.nModified});

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    });


    apiRouter.route('/posts/:id').delete(async function(req,res){

        try {
            const data = await db.collection('posts').deleteOne({
                _id : new ObjectId(req.params.id)
            });

            res.json({ status: 'OK', affectedRows : data });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    });
    

    apiRouter.get('/me', function (req, res){

        res.json({status: 'OK', user: req.decoded });

    });

    return apiRouter;

}
