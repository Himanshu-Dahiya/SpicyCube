var passport=require('passport');
var LocalStrategy=require('passport-local').Strategy;
var User=require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var FacebookTokenStrategy = require('passport-facebook-token');

var config = require('./config.js');

exports.local=passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());   //for sessions
passport.deserializeUser(User.deserializeUser());  // when req comes

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = ()=>{
    if(req.user.admin != false)
    {
        next();
    }
    else
    {
        res.statuscode=403,
        res.send('You are not authorized to perform this operation!')
        next(err);
    }
};

exports.sameUser = ()=>{
    id1=comments.author._id;
    id2=req.user._id;
    if(id1.equals(id2))
    {
        next();
    }
    else
    {
        res.statuscode=403,
        res.send('You are not authorized to perform this operation!')
        next(err);
    }
};



exports.facebookPassport = passport.use(new FacebookTokenStrategy({
        clientID: config.facebook.clientId,
        clientSecret: config.facebook.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        User.findOne({facebookId: profile.id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (!err && user !== null) {
                return done(null, user);
            }
            else {
                user = new User({ username: profile.displayName });
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err, user) => {
                    if (err)
                        return done(err, false);
                    else
                        return done(null, user);
                })
            }
        });
    }
));