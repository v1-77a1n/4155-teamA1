const model = require('../models/user');
const rToken = require('../models/resetToken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

//transporter for emailing
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: "intheloop.sys@gmail.com",
        pass: "vbkipgwdvibtjhys"
    }
});


//renders the signup page
exports.new = (req, res)=>{
    return res.render('./user/new');
};

//handles signup POST request
exports.newUser = (req, res, next) => {
    let user = new model(req.body);
    user.save()
    .then(() => res.redirect('/users/login'))
    .catch(err => {
        if(err.name === 'ValidationError') {
            err.status = 400;
            err.message = "Bad Database Request";
        }

        if(err.name === 'MongoError') {
            err.status = 400;
            err.message = "Bad Database Request";
        }

        next(err);

    });
};

//renders the login page
exports.login = (req, res) => {
    res.render('./user/login');
};

//renders passwords change req link page
exports.requestPasswdLink = (req, res) => {
    res.render('./user/req-pass-change');
};

//handles POST req for sending password link !!CURRENT FUNCTIONALITY TO RESET PASSWD VIA LINK IS NOT AVAILABLE YET!!
exports.sendPasswordReset = (req, res, next) => {
    let reqToken = crypto.randomBytes(8).toString('hex');
    let email = req.body.email;
    model.findOne({email: email})
    .then(()=> {
        //stores id and token into the reset token collection. The hashed version of the id and token will be in the URL sent to the user itself
        let stored_token = new rToken({createdAt: new Date(), token: reqToken, email: email});
        stored_token.save()
        .then(() => {
            
            let reset_link = "http://localhost:8080/users/reset-password?token=" + reqToken;
            let mailConfigs = {
                from: "intheloop.sys@gmail.com",
                to: email,
                subject: "In The Loop Password Change Request",
                html: "<h1>You've Requested a Password Change</h1><br><p>To reset your password, click the following link or copy/paste it into your browser. The link will expire in 3 minutes.</p><br><a href='" + reset_link + "'>" + reset_link + "</a>"
            };

             transporter.sendMail(mailConfigs, function(error, info) {
        
                if(error) {
                    console.log(error.status + " " + error.message)
                }

                let title = "Reset Link Sent!";
                let msg = "If your email exists within our records, you will receive your password reset link shortly.";
                res.render('./user/notification', {title, msg});
            });
        })
        .catch(err=>console.log(err)); //current error catch is only temporary; still figuring out what to do with it
        })
    .catch(()=>{
        //This lets the user know that the email has been 'sent'; this is to avoid letting threat actors know that the email doesn't exist in the database
        let title = "Reset Link Sent!";
        let msg = "If your email exists within our records, you will receive your password reset link shortly.";
        res.render('./user/notification', {title, msg});
    });

};

exports.changeEmail = (req, res) => {
    res.render('./user/change-email');
};
exports.changePassword = (req, res) => {
    res.render('./user/change-password');
};
