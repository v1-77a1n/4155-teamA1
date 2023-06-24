const mongoose = require('mongoose');
const model = require('../models/user');
const rToken = require('../models/resetToken');
const message = require('../models/message');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { user, pass } = require('../public/.hidden/secret');

//transporter for emailing
const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
        user: user,
        pass: pass
    }
});


//renders the signup page
exports.new = (req, res) => {
    return res.render('./user/new');
};

//handles signup POST request
exports.newUser = (req, res, next) => {
    let user = new model(req.body);
    user.save()
        .then(() => {
            req.flash('success', "You've successfully signed up for an account.");
            res.redirect('/users/login');
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
                err.message = "Bad Database Request";
            }

            if (err.name === 'MongoError') {
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

//Handles post request for logging in
exports.loggingIn = (req, res, next) => {
    let email = req.body.username;
    let password = req.body.password;

    model.findOne({ email: email }, (err, user) => {
        if (err) { next(err); }

        if (user) {
            user.comparePassword(password)
                .then((result) => {
                    if (result) {
                        req.session.user = user._id;
                        req.session.email = user.email;
                        req.flash('success', 'You have successfully logged in');
                        res.redirect('/');
                    } else {
                        req.flash('error', 'Wrong password');
                        res.redirect('/users/login');
                    }
                })
        } else {
            req.flash('error', 'Wrong username');
            res.redirect('/users/login');
        }
    })
}

//renders passwords change req link page
exports.requestPasswdLink = (req, res) => {
    res.render('./user/req-pass-change');
};

//handles POST req for sending password link
exports.sendPasswordReset = (req, res, next) => {
    let reqToken = crypto.randomBytes(8).toString('hex');
    let email = req.body.email;

    model.findOne({ email: email }, (err, user) => {
        if (err) {
            next(err);
        }

        if (user) {
            //stores id and token into the reset token collection. The hashed version of the id and token will be in the URL sent to the user itself
            let stored_token = new rToken({ createdAt: new Date(), token: reqToken, email: email });
            stored_token.save()
                .then((result) => {
                    if (result) {
                        let reset_link = "http://localhost:8080/users/reset-password?token=" + reqToken + "&email=" + email;
                        let about = "In The Loop Password Change Request";
                        let content = "<h1>You've Requested a Password Change</h1><br><p>To reset your password, click the following link or copy/paste it into your browser. The link will expire in 3 minutes and will become invalid once used.</p><br><a href='" + reset_link + "'>" + reset_link + "</a>";
                        sendEmail(email, about, content);
                        req.flash('success', 'Your link has been sent! If your email exists within our records, you will receive your link shortly');
                        res.redirect('/');
                    }
                })
                .catch((err) => next(err)); //current error catch is only temporary; still figuring out what to do with it
        } else {
            //This lets the user know that the email has been 'sent'; this is to avoid letting threat actors know that the email doesn't exist in the database
            req.flash('success', 'Your link has been sent! If your email exists within our records, you will receive your link shortly');
            res.redirect('/');
        }

    })
};

//renders the page for resetting passwords
exports.resetPassWdPage = (req, res, next) => {
    let urlToken = req.query.token;
    let urlEmail = req.query.email;

    rToken.findOne({ email: urlEmail }, (err, rToken) => {
        if (err) {
            next(err);
        }

        if (rToken) {
            rToken.compareTokens(urlToken)
                .then((result) => {
                    if (result) {
                        res.render('./user/reset-password', { email: urlEmail });
                    } else {
                        req.flash('error', 'This link is no longer valid');
                        res.redirect('/users/req-pass-change');
                    }
                })
        } else {
            req.flash('error', 'This link is no longer valid');
            res.redirect('/users/req-pass-change');
        }
    })
};

//handles POST req for resetting password as guest
exports.guestResetPasswd = (req, res, next) => {
    let email = req.body.userEmail;

    model.findOne({ email: email }, (err, user) => {
        if (err) {
            next(err);
        }

        if (user) {
            let password = req.body.password;
            bcrypt.hash(password, 10)
                .then((hash) => {
                    model.findOneAndUpdate({ email: email }, { password: hash })
                        .then((result) => {
                            if (result) {
                                let about = "Your Password Has Been Changed";
                                let content = "<p>Your password has recently been changed. If you did not request or authorized this change, it is recommended that you change your password immediately or contact us.";

                                req.flash('success', 'Your password has successfully been changed!');

                                sendEmail(email, about, content);
                                rToken.findOneAndDelete({ email: email }, (err, rToken) => {
                                    if (err) {
                                        next(err);
                                    }

                                    if (rToken || rToken == null) {
                                        res.redirect('/users/login');
                                    }
                                })

                            } else {
                                req.flash('error', 'We were unable to change your password. Try again or request a new link.');
                            }
                        })
                        .catch(err => next(err))
                })
                .catch(err => next(err))
        }
    })
};

//handles rendering of change email and change password pages
exports.changeEmail = (req, res) => {
    res.render('./user/change-email');
};
exports.changePassword = (req, res) => {
    res.render('./user/change-password');
};

//Handles post request for change of email while logged in
exports.emailChangeHandler = (req, res, next) => {
    let id = req.session.user;
    let currentEmail = "";
    let newEmail = req.body.email;
    let password = req.body.password;

    model.findOne({ _id: id }, (err, user) => {
        if (err) {
            next(err);
        }

        if (user) {
            currentEmail = user.email;
            user.comparePassword(password)
                .then((result) => {
                    if (result) {
                        model.findOneAndUpdate({ _id: id }, { email: newEmail }, (err, user) => {
                            if (err) {
                                next(err);
                            }

                            if (user) {
                                req.flash('success', 'Your email has successfully been changed!');
                                let about = "Your Email Has Been Changed!";
                                let content = "Your email was changed from " + currentEmail + " to " + newEmail + ". This notification has been sent to both your old and your new email.";
                                let to = currentEmail + ", " + newEmail;
                                sendEmail(to, about, content);
                                res.redirect('/settings');
                            } else {
                                req.flash('error', 'Something went wrong while trying to update your email. Please try again later.');
                                res.redirect('/settings');
                            }
                        })
                    } else {
                        req.flash('error', 'Wrong password');
                        res.redirect('/users/change-email');
                    }
                })
                .catch((err) => next(err))
        } else {
            let error = new Error();
            next(error);
        }
    })
};

//Handles post request for change of password while logged in
exports.passwordChangeHandler = (req, res, next) => {
    let id = req.session.user;
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;
    let newPassword = req.body.newPassword;

    model.findOne({ _id: id })
        .then((user) => {
            if (user && (confirmPassword === newPassword)) {
                user.comparePassword(password)
                    .then((result) => {
                        if (result) {
                            bcrypt.hash(newPassword, 10)
                                .then((hash) => {
                                    model.findOneAndUpdate({ _id: id }, { password: hash }, (err, user) => {
                                        if (err) { next(err); }

                                        if (user) {
                                            req.flash('success', "You've successfully changed your password!");
                                            let email = user.email;
                                            let about = "Your Password Has Been Changed";
                                            let content = "This is your confirmation email that you've changed your password.";
                                            sendEmail(email, about, content);
                                            res.redirect('/settings');
                                        } else {
                                            req.flash('error', 'There was an error attempting to update your password. Please try again later or contact us.');
                                            res.redirect('/')
                                        }
                                    })
                                })
                                .catch(err => next(err))
                        } else {
                            req.flash('error', 'The password you entered does not match the current password for your account');
                            res.redirect('/users/change-password');
                        }
                    })
                    .catch(err => next(err))
            } else {
                req.flash('error', 'New Password and Password Confirmation Not Matching');
                res.redirect('/users/change-password');
            }
        })
        .catch(err => next(err))
};

//Handles logout request
exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        } else {
            res.redirect('/');
        }
    })
};

function sendEmail(email, title, content) {
    let mailConfigs = {
        from: "intheloop.system@zohomail.com",
        to: email,
        subject: title,
        html: content
    }

    transporter.sendMail(mailConfigs, (err, info) => {
        if (err) {
            console.log(err.status + " " + err.message)
        }

    });
// s
    return true;
};

// Gets profile page
exports.profile = (req, res) => {
    let id = req.session.user;
    model.findOne({ _id: id }, (err, user) => {
        res.render('./user/profile', { user });
    });

};

// Gets messages page
exports.messages = (req, res) => {
    let id = req.session.user;
    model.findOne({ _id: id }).populate('inbox')
        .then((user) => {
            let inboxArr = user.inbox;
            res.render('./user/messages', { inboxArr });
        })
        .catch((err) => next(err));
};

//get individual message page - still needs testing
exports.viewMessage = (req, res, next) => {
    let messageId = req.query.message;
    let id = req.session.user;
    message.findOne({ _id: messageId, recipient: id }).populate('sender')
        .then((message) => {
            res.render('./user/viewMessage', { message });
        })
        .catch((err) => { next(err) });
}
//Gets page to send message
exports.sendMessagePage = (req, res, next) => {
    let email = req.query.friend;
    model.findOne({ email: email })
        .then((user) => {
            let firstName = user.firstName;
            let lastName = user.lastName;
            console.log(firstName + " " + lastName);
            res.render('./user/sendMessage', { firstName, lastName });
        })
        .catch((err) => {
            next(err);
        });
}

//Sends message - POST req
exports.sendMessage = (req, res, next) => {
    let fullName = req.body.friend.split(" ");
    let userId = req.session.user;
    let msgSubject = req.body.subject;
    let msgText = req.body.text;

    //finding the friend id
    model.findOne({ firstName: fullName[0], lastName: fullName[1] })
        .then((friend) => {
            model.findOne({ _id: userId })
                .then((user) => {
                    if (user.friends.includes(friend._id)) {
                        let newMessage = new message({ sender: userId, recipient: friend._id, subject: msgSubject, msg: msgText });
                        newMessage.save()
                            .then((message) => {
                                friend.inbox.push(message._id);
                                friend.save()
                                    .then((result) => {
                                        if (result) {
                                            req.flash('success', 'Your message has been sent.');
                                            res.redirect('/users/friends');
                                        } else {
                                            req.flash('error', 'There was an issue sending your message.');
                                            res.redirect('/users/friends');
                                        }
                                    })
                                    .catch((err) => next(err));
                            })
                            .catch((err) => next(err));
                    }
                })
                .catch((err) => next(err));
        })
        .catch((err) => next(err));
};

//GET reply page
exports.reply = (req, res, next) => {
    let edit = req.query.edit;
    let messageId = req.query.id;
    let id = req.session.user;

    if (messageId !== null && edit == "true") {
        message.findOne({ _id: messageId, recipient: id }).populate('sender')
            .then((message) => {
                let fullName = message.sender.firstName + " " + message.sender.lastName;
                res.render('./user/replyMessage', { recip: fullName, message });
            })
            .catch((err) => next(err))
    } else {
        req.flash('error', 'There was an error while attempting to retrieve the page.');
        res.redirect('/users/messages')
    }
}

//GET delete message
exports.deleteMessage = (req, res, next) => {
    let messageId = mongoose.Types.ObjectId(req.query.id);
    let userId = req.session.user;

    model.findOne({ _id: userId })
        .then((user) => {
            if (user.inbox.includes(messageId)) {
                user.inbox.pull(messageId);
                user.save()
                    .then((result) => {
                        if (result) {
                            message.findByIdAndDelete(messageId, { userFindAndModify: false, runValidators: true })
                                .then((result) => {
                                    if (result) {
                                        req.flash('success', 'Message has been deleted.');
                                        res.redirect('/users/messages');
                                    }
                                })
                                .catch((err) => next(err));
                        } else {
                            req.flash('error', 'There was an issue deleting the message');
                            res.redirect('/users/messages');
                        }
                    })
                    .catch((err) => next(err));
            } else {
                req.flash('error', 'The specified message does not exist or cannot be found.');
                res.redirect('/users/messages');
            }
        })
        .catch((err) => next(err));
}

// Gets friends page - GET
exports.friends = (req, res) => {
    let id = req.session.user;
    model.findOne({ _id: id }).populate('friends')
        .then((user) => {
            let friendArr = user.friends;
            res.render('./user/friends', { friendArr });
        })
        .catch((err) => next(err));
};

// Adding a friend to current users account - POST
exports.addFriend = (req, res, next) => {
    let userId = req.session.user;
    let friendEmail = req.body.email;
    userEmail = req.session.email;

    if (friendEmail === userEmail) { // user cannot add themselves
        req.flash('error', "You cannot add yourself as a friend.");
        res.redirect('/users/friends');
    } else {
        model.findOne({ email: friendEmail })
            .then((friend) => {
                model.findOne({ _id: userId })
                    .then((user) => {
                        if (user.friends.includes(friend._id)) {
                            req.flash('error', "You've already added this friend.");
                            res.redirect('/users/friends');
                        } else {
                            user.friends.push(friend._id);
                            friend.friends.push(userId);
                            user.save()
                                .then((result) => { console.log('save succeeded') })
                                .catch((err) => next(err));
                            friend.save()
                                .then((result) => { console.log('save for friend succeeded') })
                                .catch((err) => next(err));
                            req.flash('success', "You've successfully added this friend.");
                            res.redirect('/users/friends');
                        }
                    })
                    .catch((err) => next(err));
            })
            .catch((err) => next(err));
    }
};

// Deleting a friend from current users account - GET
exports.deleteFriend = (req, res, next) => {
    let userId = req.session.user;
    let friendId = req.params.friendId;

    model.findOne({ _id: userId })
        .then((user) => {
            if (user.friends.includes(friendId)) {
                user.friends.pull(friendId); // remove the friend ID from user's friends array
                user.save()
                    .then((result) => {
                        model.findOne({ _id: friendId })
                            .then((friend) => {
                                friend.friends.pull(userId); // remove the user ID from friend's friends array
                                friend.save()
                                    .then((result) => {
                                        req.flash('success', "You've successfully deleted this friend.");
                                        res.redirect('/users/friends');
                                    })
                                    .catch((err) => next(err));
                            })
                            .catch((err) => next(err));
                    })
                    .catch((err) => next(err));
            } else {
                req.flash('error', "This friend is not in your friend list.");
                res.redirect('/users/friends');
            }
        })
        .catch((err) => next(err));
};
