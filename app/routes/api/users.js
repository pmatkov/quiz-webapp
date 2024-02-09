const {existsSync} = require('fs');
const {unlink} = require('fs').promises;
const {v4: uuidv4} = require('uuid');
const multer = require('multer');

module.exports = (express, db, ObjectId, requireAuth, checkRole, bcrypt, path) => {

    const userRouter = express.Router();

    userRouter.route('/')
    .get(requireAuth, async function(req, res) {

        try {

            const data = await db.collection('users').find({}).
            project({_id: 0, id: "$_id", username: 1, password: 1, 
            name: 1, surname: 1, age: 1, email: 1, role: 1, imageUrl: 1}).toArray();

            res.json({ status: 'OK', users: data});
        }
        catch(e) {
            res.json({status: 'NOT OK'});
        }
    }).post(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req, res){

        console.log(req.body);

        const hash = await bcrypt.hash(req.body.password, 10); 

        const user = {
            username : req.body.username,
            password : hash,
            role: req.body.role,
        };

        try {
            const data = await db.collection('users').insertOne(user);
            res.json({ status: 'OK', insertId: data.insertedId });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    });

    userRouter.route('/:id').
    get(requireAuth, async function(req,res){

        if (req.decoded.role === 'user' && req.params.id !== req.decoded.id) {
            res.status(403).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        else {

            try {

                const data = await db.collection('users').find({
                    _id: new ObjectId(req.params.id)
                }).
                project({_id: 0, id: "$_id", username: 1, password: 1, 
                name: 1, surname: 1, age: 1, email: 1, role: 1, imageUrl: 1}).toArray();
                res.json({ status: 'OK', user: data });
    
            } catch (e) {
                res.json({ status: 'NOT OK' });
            }

        }

    }).put(requireAuth, async function(req,res){

        if (req.decoded.role === 'user' && req.params.id !== req.decoded.id) {
          res.status(403).json({
              success: false,
              message: 'Unauthorized',
          });
        }
        else {

          const user = {
            username : req.body.username,
            password : req.body.password,
            name : req.body.name,
            surname : req.body.surname,
            age : req.body.age,
            email : req.body.email,
            role: req.body.role

          };

          try {
              const data = await db.collection('users').updateOne({
                  _id : new ObjectId(req.params.id)
              },{
                  $set : user
              });

              res.json({ status: 'OK', changedRows: data.modifiedCount });

          } catch (e) {
              res.json({ status: 'NOT OK' });
          }
      }

    }).delete(requireAuth, (req, res, next) => {checkRole(req, res, next, 'admin');},
        async function(req,res){

        try {
            const data = await db.collection('users').deleteOne({
                _id : new ObjectId(req.params.id)
            });

            res.json({ status: 'OK', deletedRows : data.deletedCount });

        } catch (e) {
            res.json({ status: 'NOT OK' });
        }

    });

    const uploadDir = path.join(__dirname, '../../../public/app/uploads');

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        if (!existsSync(uploadDir)) {
          return cb(new Error('Upload directory does not exist'));
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const filename = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, filename + ext);
      }
    });
    
    const upload = multer({ storage: storage });
    
    userRouter.route('/img/:id')
    .patch(requireAuth, (req, res, next) => {
      upload.single('profileImg')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({
            success: false,
            message: 'File upload error',
          });
        }
        next();
      });
    }, async function(req, res) {
      if (req.params.id !== req.decoded.id) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized',
        });
      } else {
        try {

          let data = await db.collection('users').find({
            _id : new ObjectId(req.params.id)
          }).
          project({_id: 0, imageUrl: 1}).toArray();

          if (data[0].imageUrl) {
            await unlink(path.join(uploadDir, data[0].imageUrl)); 
          }   

          const filename = req.file.filename;
          data = await db.collection('users').updateOne({
            _id: new ObjectId(req.params.id)
          }, { $set: { imageUrl: filename } });

          res.json({ status: 'OK', changedRows: data.modifiedCount, imageUrl: filename });
        } catch (e) {
          res.json({ status: 'NOT OK' });
        }
      }
    }).delete(requireAuth, async function(req, res) {
      if (req.params.id !== req.decoded.id) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized',
        });
      } else {
        try {

          let data = await db.collection('users').find({
            _id : new ObjectId(req.params.id)
          }).
          project({_id: 0, imageUrl: 1}).toArray();

          if (data[0].imageUrl) {
            await unlink(path.join(uploadDir, data[0].imageUrl)); 
          }   
          
          data = await db.collection('users').updateOne({
            _id : new ObjectId(req.params.id)
          },{
              $set: { imageUrl: '' }
          });
          res.json({ status: 'OK', changedRows: data.modifiedCount });
        } catch (e) {
          res.json({ status: 'NOT OK' });
        }
      }
    });

    return userRouter;
  
}
