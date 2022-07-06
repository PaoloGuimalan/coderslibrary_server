const express = require("express")
const app = express();
const PORT = process.env.PORT || 3001
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")

const connectionMongo = require("./connection/index")

const accountTransport = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth:{
        user: "coderslibrary.netlify.app@gmail.com",
        pass: "hsjxkumafjrhvezw"
    }
})

function makeid(length) {
    var result           = '';
    var characters       = '0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

app.use(bodyParser.urlencoded({extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200
}))

const Categories = require("./schemas/categories");
const Books = require("./schemas/books");
const Accounts = require("./schemas/accounts");
const Recents = require("./schemas/recents");
const Saves = require("./schemas/saves");
const Tags = require("./schemas/tags");
const Notifications = require("./schemas/notifications")
const e = require("express");

async function connectMongo(){
    return mongoose.connect(connectionMongo.url, connectionMongo.params)
}

const server_app = app.listen(PORT, () => {
    console.log(`Port Running: ${PORT}`)
    connectMongo().then(() => {
        console.log("Database Initialized!");
    }).catch((err) => {
        console.log(err);
    })
});

const jwtverifier = (req, res, next) => {
    const token = req.headers["x-access-token"];

    if(!token || token == ""){
        res.send({status: false, message: "No Token Received!"})
    }
    else{
        jwt.verify(token, "coderslibraryserver", (err, decode) => {
            if(err){
                res.send({status: false, message: "Token Denied!"})
            }
            else{
                // res.send(decode);
                // console.log(token)
                req.params.userName = decode.userNameLogin;
                req.params.token = token;
                next()
            }
        })
    }
}

app.get('/categories', (req, res) => {

    Categories.find({}, (err, result) => {
        if(err){
            console.log(err);
        }
        else{
            res.send(result);
        }
    })

})

app.get('/books', (req, res) => {

    Books.find({}, (err, result) => {
        if(err){
            console.log(err);
        }
        else{
            res.send(result);
        }
    })

})

app.get('/book/:id', (req, res) => {

    const book_id = req.params.id;

    Books.findOne({id: book_id}, (err, result) => {
        if(err){
            console.log(err)
        }
        else{
            res.send(result);
        }
    })

})

app.get("/allcontents", (req, res) => {

    Categories.find({}, (err, result) => {
        if(err){
            console.log(err);
        }
        else{
            Books.find({}, (err2, result2) => {
                if(err2){
                    console.log(err);
                }
                else{
                    res.send({categories: result.map((lst) => lst.category), books: result2})
                }
            })
        }
    })

})

app.get('/categoryList/:categoryName', (req, res) => {
    const category = req.params.categoryName;

    Books.find({category: category}, (err, result) => {
        if(err){
            console.log(err);
        }
        else{
            res.send(result);
        }
    })
})

app.post('/searchCategory', (req, res) => {
    const searchValue = req.body.searchCategoryValue;

    Categories.find({ category: { $regex: '.*' + searchValue + '.*' } }, (err, result) => {
        if(err){
            console.log(err);
        }
        else{
            res.send(result)
        }
    })
})

app.post('/searchBooks', (req, res) => {
    const searchValue = req.body.searchBooksValue;

    Books.find({ name: { $regex: '.*' + searchValue + '.*' } }, (err, result) => {
        if(err){
            console.log(err);
        }
        else{
            res.send(result)
        }
    })
})

app.post('/sendMailCode', (req, res) => {
    const emailAddress = req.body.email;
    const codeGenerated = makeid(8);

    const mailOptions = {
        from: 'Coder\'s Library',
        to: emailAddress,
        subject: 'Register Verification Code',
        text: `Your registration code for your email is ${codeGenerated}`
    }

    if(emailAddress == "" || emailAddress == null){
        res.send({status: false, message: "Email Invalid"})
    }
    else{
        accountTransport.sendMail(mailOptions, (err, info) => {
            if(err){
                // console.log(err);
                res.send({status: false, message: "Verification Code generation failed!"})
            }
            else{
                res.send({status: true, message: "Verification Code has been Sent!", code: codeGenerated })
            }
        })
    }
})

app.post('/createAccount', (req, res) => {
    // res.send(req.body)
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const userNameInit = firstName.split(" ").join("")
    var userNameRes = `${userNameInit}_${makeid(5)}`

    // res.write(userNameRes)

    const createAccountInit = (dataUserName) => {
        const newAccount = new Accounts({
            userName: dataUserName,
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        })

        newAccount.save().then(() => {
            res.send({status: true, message: "You have been Successfully Registered!"})
        }).catch((err) => {
            console.log(err);
            res.send({status: false, message: "Cannot Successfully Register!"});
        })
    }

    Accounts.find({email: email}, (err, result) => {
        if(err){
            console.log(err)
        }
        else{
            if(result.length != 0){
                res.send({status: false, message: "Email already used!"});
            }
            else{
                // res.send(true);
                Accounts.find({userName: userNameRes}, (err2, result2) => {
                    if(err2){
                        console.log(err2)
                    }
                    else{
                        if(result2.length != 0){
                            userNameRes = `${userNameInit}_${makeid(5)}`
                            // res.send(userNameRes);
                            createAccountInit(userNameRes)
                        }
                        else{
                            // res.send(userNameRes)
                            createAccountInit(userNameRes)
                        }
                    }
                })
            }
        }
    })
})

app.post('/userLogin', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    Accounts.findOne({email: email, password: password}, (err, result) => {
        if(err){
            // console.log(err);
            res.send({status: false, message: "Unable to Login!"})
        }
        else{
            // console.log(result);
            // res.send(result.userName)
            if(result != null){
                // res.send(result.userName)
                const userNameLogin = result.userName;
                const token = jwt.sign({userNameLogin}, "coderslibraryserver", {
                    expiresIn: 60 * 60 * 24 * 7
                })
                res.send({status: true, message: "Login Successful!", token: token, userName: userNameLogin});
            }
            else{
                res.send({status: false, message: "Account do not match!"})
            }
        }
    })
})

app.get('/loginVerifier', jwtverifier, (req, res) => {
    res.send({status: true, userName: req.params.userName, token: req.params.token})
    // res.send(req.params.token)
})

app.post('/addRecents', jwtverifier, (req, res) => {
    const book_id = req.body.book_id;
    const userName = req.params.userName;

    const newRecord = new Recents({
        userName: userName,
        bookID: book_id
    })

    newRecord.save()
})

app.get('/userRecentsList', jwtverifier, (req, res) => {
    const userName = req.params.userName;

    Recents.find({userName: userName}, {bookID: 1}, (err, response) => {
        if(err){
            console.log(err);
        }
        else{
            let arr = [];
            response.map((id) => {
                arr.push(id.bookID)
            })
            // res.send(arr);
            Books.find({id: arr}, (err2, result2) => {
                if(err2){
                    console.log(err2)
                }
                else{
                    res.send(result2);
                }
            })
        }
    })
})

app.get('/userProfileDetails', jwtverifier, (req, res) => {
    const userName = req.params.userName;

    Accounts.findOne({userName: userName}, (err, result) => {
        if(err){
            console.log(err)
        }
        else{
            const { userName, firstName, lastName, email } = result;
            res.send({userName, firstName, lastName, email})
        }
    })
})

app.get('/getBookInfo/:bookID/:userName', (req, res) => {
    const bookID = req.params.bookID;
    const userName = req.params.userName;

    Books.findOne({id: bookID}, (err, result) => {
        if(err){
            console.log(err)
        }
        else{
            if(userName){
                Saves.findOne({userName: userName, bookID: bookID}, (err2, result2) => {
                    if(err2){
                        console.log(err2)
                    }
                    else{
                        res.send({bookInfo: result, saveInfo: result2 == null? false : true})
                    }
                })
            }
            else{
                res.send({bookInfo: result, saveInfo: false})
            }
        }
    })
})

app.post('/saveBook', jwtverifier, (req, res) => {
    const bookID = req.body.bookID;
    const userName = req.params.userName

    const newSave = new Saves({
        userName: userName,
        bookID: bookID
    })

    newSave.save().then(() => {
        res.send({status: true, message: "Book has been Saved!"});
    })
})

app.get('/unsaveBook/:bookID', jwtverifier, (req, res) => {
    const userName = req.params.userName
    const bookID = req.params.bookID;

    Saves.deleteOne({userName: userName, bookID: bookID}, (err, result) => {
        if(err){
            res.send({status: false, message: "Unable to Unsave Book!"})
        }
        else{
            res.send({status: true, message: "Book has been Unsaved!"});
        }
    })

})

function getDateReturn(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    
    var today_fixed = mm + '/' + dd + '/' + yyyy;

    return today_fixed;
}

app.post('/postComment', jwtverifier, (req, res) => {
    const userName = req.params.userName;

    const fullName = req.body.fullName;
    const bookID = req.body.bookID;
    const content = req.body.content;
    var contentMentionCheck = req.body.content;
    const dateposted = getDateReturn();

    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    const timezone = hours >= 12? "pm" : "am";
    const hourConvert = hours > 12? hours - 12 : hours
    const minuteConvert = minutes < 10? `0${minutes}` : minutes 
    const timeposted = `${hourConvert}:${minuteConvert} ${timezone}`

    var mentionArr = []

    const checkUser = (wordShiftFinal) => {
        Accounts.findOne({userName: wordShiftFinal}, {userName: 1}, (err, result) => {
            if(err){
                console.log(err)
            }
            else{
                // console.log(result)
                if(result){
                    // console.log(result.userName)
                    // mentionArr.push(result.userName)
                    var mentionIndex = mentionArr.indexOf(result.userName);
                    if(mentionIndex < 0){
                        mentionArr.push(result.userName)
                    }
                }
            }
        })
    }

    const initiatePostComment = () => {
        const newTag = new Tags({
            userName: userName, 
            fullName: fullName, 
            bookID: bookID, 
            content: content,
            mentions: mentionArr, 
            dateposted: dateposted, 
            timeposted: timeposted
        })

        const newNotif = new Notifications({
            type: "tag",
            from: "",
            to: "",
            content: "have tagged you on a book.",
            date: dateposted,
            time: timeposted,
            linking: bookID
        })
    
        newTag.save().then(() => {
            mentionArr.map((accs, i) => {
                new Notifications({
                    type: "tag",
                    from: userName,
                    to: accs,
                    content: `${userName} have tagged you on a book.`,
                    date: dateposted,
                    time: timeposted,
                    linking: bookID
                }).save()
            })
            res.send({status: true, message: "Comment has been posted!"});
        })

        // res.send({
        //     userName: userName, 
        //     fullName: fullName, 
        //     bookID: bookID, 
        //     content: content,
        //     mentions: mentionArr, 
        //     dateposted: dateposted, 
        //     timeposted: timeposted
        // })
    }

    contentMentionCheck.split(" ").map((wrd, i) => {
        var contentLength = contentMentionCheck.split(" ").length;
        if(contentLength == i+1){
            // console.log(true)
            if(wrd.split("")[0] == "@"){
                var wordShift = wrd.split("")
                wordShift.shift()
                var wordShiftFinal = wordShift.join("")
                // mentionArr.push(wordShiftFinal)
                checkUser(wordShiftFinal)
            }
            setTimeout(() => {
                initiatePostComment()
            }, 1000)
            // console.log({contentLength, i})
        }
        else{
            // console.log(false)
            if(wrd.split("")[0] == "@"){
                var wordShift = wrd.split("")
                wordShift.shift()
                var wordShiftFinal = wordShift.join("")
                // mentionArr.push(wordShiftFinal)
                checkUser(wordShiftFinal)
            }
        }
        // console.log({contentLength, i})
    })
    
    // const newTag = new Tags({
    //     userName: userName, 
    //     fullName: fullName, 
    //     bookID: bookID, 
    //     content: content, 
    //     dateposted: dateposted, 
    //     timeposted: timeposted
    // })

    // newTag.save().then(() => {
    //     res.send({status: true, message: "Comment has been posted!"});
    // })
})

app.get('/getComments/:bookID', (req, res) => {
    const bookID = req.params.bookID

    Tags.find({bookID: bookID}, (err, result) => {
        if(err){
            console.log(err)
        }
        else{
            res.send(result)
        }
    })
})

app.get('/getActivityComments', jwtverifier, (req, res) => {
    const userName = 'Paolo_12426';
    
    Tags.find({userName: userName}, (err, result) => {
        if(err){
            console.log(err)
        }
        else{
            Tags.find({mentions: {$in: [userName]}}, (err2, result2) => {
                if(err2){
                    console.log(err2)
                }
                else{
                    res.send({comments: result, mentionsYou: result2})
                }
            })
        }
    })
})