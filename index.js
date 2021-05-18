const express = require('express');
const path = require('path');
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf')
const flash = require('connect-flash')
require('dotenv').config()
const {v4: uuidv4 } = require('uuid')
const multer = require('multer')

const adminRouters = require('./routes/admin');
const shopRouters = require('./routes/shop');
const authRouters = require('./routes/auth')

const errorController = require('./controllers/error');
const User = require('./models/User');
const { dirname } = require('path');

//-------------------Setup MIME Type---------------
const MIME_TYPE_MAP = {
    "image/jpg" : "jpg",
    "image/jpeg": "jpeg",
    "image/gif": "gif"
}   

//--------------------Setups--------------------
const app = express();
const store = new MongoDBStore({
    uri: process.env.MONGODB_URL,
    collection: 'sessions'
})
const csrfProtection = csrf()
app.use(express.urlencoded({extended:false}));

//parse the requrest body into readable data (from multipartform)
app.use(multer({
    limits: 5000000, //bytes
    storage: multer.diskStorage({
        destination: (req ,file, cb) => {
            cb(null, 'uploads/images')
        },
        filename: (req ,file, cb) => {
            const ext = MIME_TYPE_MAP[file.mimetype]
            cb(null, uuidv4() + '.' + ext) //asfasgwe23r23fse43tf.jpg
        }
    }),
    fileFilter: (req,file,cb) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype]
        let error = isValid ? null : new Error('Invalid MIME type')
        cb(error, isValid)
    }
}).single('image'))

//app.set = allows us to set any values globally on our express application
app.set('view engine', 'ejs');
//views is set to default path of views but I am just implicitly showing
app.set('views','views');

//serve file statically
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads', 'images')))
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: store
}))
app.use(csrfProtection)
app.use(flash())

// Dummy Auth
app.use((req,res,next) => {
    if(!req.session.user){
        return next()
    }
    User.findById(req.session.user._id).then(user => {
        if(!user){
            return next()
        }
        req.user = user
        next()
    }).catch(err => console.log(err))

})

app.use((req,res,next) => {
    res.locals.csrfToken = req.csrfToken()
    res.locals.isAuth = req.session.isLoggedIn
    next()
})

//--------------------Middleware--------------------
app.use('/admin',adminRouters);
app.use(shopRouters);
app.use(authRouters)

// catch all middleware
app.use(errorController.get404);
//----------------End of Middleware-----------------

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log("Connected to Database")

    //not necessary for production. Just a dummy auth for id
    // User.findOne().then(user => {
    //     if(!user){
    //         const user = new User({
    //             username: 'Sushi',
    //             email: 'maki@zushi.com'
    //         })
    //         user.save()
    //     }
    // })

    app.listen(5000, () => console.log('Server connected to port 5000'));
}).catch(err => console.log(err))