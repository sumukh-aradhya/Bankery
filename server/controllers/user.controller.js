const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');

const User = mongoose.model('User');

module.exports.register = (req, res, next) => {
    var user = new User();
    user.fullName = req.body.fullName;
    user.email = req.body.email;
    user.mobile = req.body.mobile;
    user.balance = req.body.balance;
    user.password = req.body.password;
    user.save((err, doc) => {
        if (!err)
            res.send(doc);
        else {
            if (err.code == 11000)
                res.status(422).send(['Email addrress already exists']); 
            else
                return next(err);
        }

    });
}

module.exports.authenticate = (req, res, next) => {
    // call for passport authentication
    passport.authenticate('local', (err, user, info) => {       
        // error from passport middleware
        if (err) return res.status(400).json(err);
        // registered user
        else if (user) return res.status(200).json({ "token": user.generateJwt() });
        // unknown user or wrong password
        else return res.status(404).json(info);
    })(req, res);
}

module.exports.userProfile = (req, res, next) =>{
    User.findOne({ _id: req._id },
        (err, user) => {
            if (!user)
                return res.status(404).json({ status: false, message: 'User does not exist' });
            else{
                return res.status(200).json({ status: true, user : _.pick(user,['fullName','email','mobile','balance','_id','transactions']) });
            }
        }
    );
}

module.exports.delete = (req, res, next) =>{
    User.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) { 
            if(!doc){
                return res.status(404).json({ status: false, message: 'User does not exist' });
            }
            return res.status(200).json({ status: true, message: 'Account permanently closed' }); }
        else { console.log('Error in deleting account :' + JSON.stringify(err, undefined, 2)); }
    });    
};


module.exports.edit = (req, res, next) =>{
            var bal = parseInt(req.body.transactions.money,10); 
            var oldbal = req.body.balance;
            if( bal < 0 && ((bal * -1) > oldbal)){
                return res.status(200).json({status: false, message: "Insufficient funds"});}
            if( bal> 0 && bal<100)
                return res.status(200).json({status: false, message: "Invalid transaction"});
            console.log(typeof bal,typeof oldbal);
            req.body.balance = bal + oldbal; 
            User.findByIdAndUpdate(req.params.id, {"balance":req.body.balance,$push:{'transactions':[req.body.transactions]}}, {new : false}, (err, doc)=>{
                // Handle any possible database errors
                if (err) 
                    return res.status(500).send(err);
                else
                    return res.send(doc);
            });
    }

