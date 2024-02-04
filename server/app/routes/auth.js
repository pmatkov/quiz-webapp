
module.exports = function(app, express, db, jwt, secret, bcrypt){

    const authRouter = express.Router();

    authRouter.route('/login').post(async function(req,res){

        console.log(req.body);

        let user = await checkUser(db, res, req.body.username);

        if (!user) {

            res.json({ status: 'NOT OK', description:'Username doesn\'t exist' }); 
        }
        else {

            console.log(user.password, req.body.password);

            const validPass = await bcrypt.compare(req.body.password, user.password);

            if (validPass) {

                const { _id, ...u } = user;
                user = { id: _id, ...u };

                const token = jwt.sign({...user}, secret, {
                    expiresIn: 3600
                });

                res.json({
                    status: 'OK',
                    token: token,
                    user: user
                });

            } else {
                res.json({status: 'NOT OK', description: 'Wrong password'});
            }
    }
        }


    );

    authRouter.route('/register').post(async function(req, res) {

        console.log(req.body);

        const u = await checkUser(db, res, req.body.username);

        if (u)  {
            res.json({ status: 'NOT OK', description: 'Username already exists' }); 
        }
        else {

            const hash = await bcrypt.hash(req.body.password, 10); 

            const user = {
                username : req.body.username,
                password : hash,
                name : req.body.name,
                email : req.body.email

            };

            try {
                const data = await db.collection('users').insertOne(user);

                const token = jwt.sign({...user, id: data.insertedId}, secret, {
                    expiresIn: 3600
                });

                res.json({
                    status: 'OK',
                    token: token,
                    insertId: data.insertedId
                });

            } catch (e) {
                res.json({ status: 'NOT OK' });
            }

        }

    });


return authRouter;

}

const checkUser = async (db, res, uname) => {

    try {
        const rows = await db.collection('users').find({
            username: uname
        }).toArray();

        console.log(rows);

        return rows.length > 0 ? rows[0]: null;
    }
    catch (e) {
        res.json({status: 'NOT OK'});
    }

}
