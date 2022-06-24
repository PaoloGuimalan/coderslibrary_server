const express = require("express")
const app = express();
const PORT = process.env.PORT || 3001
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer")

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