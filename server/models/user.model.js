const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: 'Full name cannot be empty'
    },
    email: {
        type: String,
        required: 'Email cannot be empty',
        unique: true
    },
    mobile: {
        type: String,
        required: 'Mobile Number cannot be empty',
        unique: true
    },
    balance: {
        type: Number,
        default: 0
    },
    transactions:[{
            time: { type: Date, default: Date.now()},
            money: { type: Number}}
    ],
    password: {
        type: String,
        required: 'Password cannot be empty',
        minlength: [8, 'Password must be atleast 8 characters long']
    },
    saltSecret: String
});

// Custom validation for email
userSchema.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail');

 // Custom validation for mobile
userSchema.path('mobile').validate((val) => {
    mobileRegex = /^\d{10}$/;
    return mobileRegex.test(val);
}, 'Invalid Mobile Number');

// Custom validation for password
userSchema.path('password').validate((val) => {
    passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
    return passwordRegex.test(val);
}, 'Invalid password.');

// Events
userSchema.pre('save', function (next) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(this.password, salt, (err, hash) => {
                    this.password = hash;
                    this.saltSecret = salt;
                    next();

        });
    });
});

// Methods
userSchema.methods.verifyPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateJwt = function () {
    return jwt.sign({ _id: this._id},
        process.env.JWT_SECRET,
    {
        expiresIn: process.env.JWT_EXP
    });
}

mongoose.model('User', userSchema);