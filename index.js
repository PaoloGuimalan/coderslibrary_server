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
                res.send({status: true, message: "Login Successful!", token: token});
            }
            else{
                res.send({status: false, message: "Account do not match!"})
            }
        }
    })
})