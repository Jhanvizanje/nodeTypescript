import express from 'express';
import bodyParser from 'body-parser';
import { Document, PassportLocalModel, PassportLocalDocument , model, PassportLocalSchema} from "mongoose";
import mongoose from 'mongoose';
import passport from 'passport';
import passportLocal from 'passport-local';
import passportLocalMongoose from 'passport-local-mongoose';
import session from 'express-session';
import * as  findOrCreate from 'mongoose-findorcreate';
import Joi from  'joi';
import googleStrategy from 'passport-google-oauth2';
// import * as babel from "@babel/register";
require('@babel/register')({extensions: ['.js', '.ts']});

const app = express();
app.use(express.static("public"));
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());

const LocalStrategy = passportLocal.Strategy;
const GoogleStrategy =  googleStrategy.Strategy;

mongoose.connect('mongodb://localhost/nodeTypescript', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () =>  {
  console.log('Connected to database!');
});

interface UserInt extends PassportLocalDocument {
  _id: string;
  username: string;
  hash: string;
  salt: string;
  attempts: number;
  last: Date;
}


const userSchema = new mongoose.Schema({
  username: String,
  password: String
}) as PassportLocalSchema;
userSchema.plugin(passportLocalMongoose);
interface UserModel<T extends Document> extends PassportLocalModel<T> {}

let User: UserModel<UserInt> = model<User>('User', userSchema);

// const User = mongoose.model('User', userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

// Google
passport.use(new GoogleStrategy({
  clientID: "492359324846-3pgob1j3v23gjqsk152vgq26cr0fisli.apps.googleusercontent.com",
  clientSecret: "fdtCniC_tgp-W1uQGHmuwQEh",
  callbackURL: "http://localhost:3000/auth/google/callback",
  passReqToCallback   : true
},
function(request, accessToken, refreshToken, profile, done) {
  // User.findOrCreate({ googleId: profile.id }, function (err, user) {
  //   return done(err, user);
  // });
  console.log("in");
  console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);
  User.findOne({ googleId: profile.id }, (err, result) => {
    return result ? result : User.create({ googleId: profile.id }, (err, result) => { return result })
  })
}
));

app.post('/reg', (req, res) => {
  const valid = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
      .pattern(new RegExp('^[a-zA-Z0-9]{8,16}$'))
      .error(new Error("Password must be of 8 to 16 length containing on1 uppercase lowercase and a digit"))
  });
  const validateData = valid.validate(req.body);
  if(validateData.error) {
    res.status(400).send({
      success:false, 
      message:validateData.error.message
    });
  }
  const Users = new User({username: req.body.email}); 
  (User as PassportLocalModel<Document>).register(Users, req.body.password, function(err, user) { 
    if (err) { 
      res.status(400).send({success:false, message:"Your account could  not be saved. Error: ", err});
    } else { 
      res.status(200).send({success: true, message: "Your account has  been saved"});
    } 
  }); 
});

app.post('/login', (req, res) => {
    passport.authenticate('local', function (err, user, info) {
      if(err) {
      res.send({success: false, message: err}) 
      } else {
      if (!user) { 
        res.send({success: false, message: 'username or password incorrect'})
      } else{ 
        req.login(user, (err) => { 
        if(err){ 
          res.send({success: false, message: err}) 
        }else{ 
          res.send({
            sucess: true,
            message: 'Successfully logged in'
          });
        } 
        }) 
      } 
      }
    })(req, res)
});

app.get('/home', (req, res) => {
  if (req.isAuthenticated()) {
    res.send({
      success: true,
      message: 'Welcome!'
    });
  } else {
    res.send({
      success: false,
      message: 'Please first log in'
    });
  }
});

app.get('/auth/google', passport.authenticate('google', { scope:[ 'email', 'profile' ] }));
app.get( '/auth/google/callback',
passport.authenticate( 'google'));

app.get('/logout', (req, res) => {
  req.logout();
  res.send({
    success: true,
    message: 'Logged out!'
  });
});

app.get('/', (req, res) => {
  res.sendFile('index.html');
});
app.listen(3000, () => {
  console.log(`listing on port 3000`);
});

//  req.isAuthenticated()