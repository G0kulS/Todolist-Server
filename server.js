const express = require('express')
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const EmailValidator = require('email-deep-validator');
const emailValidator = new EmailValidator();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
app.use(cors())
app.use(express.json())
app.listen(process.env.PORT || 4000);

const URL = "mongodb+srv://dbuser:helloworld@cluster0.zwvcb.mongodb.net/Remainder?retryWrites=true&w=majority";
const DB = "Remainder";
var transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "unnamedbot2oo5@gmail.com", 
        pass: "Liverpool@2019" 
    }
  });

app.post("/register",async(req,res)=>{
    console.log("register");
   try{  
    let connection = await mongodb.connect(URL);
    let db = connection.db(DB);
    const { wellFormed, validDomain, validMailbox } = await emailValidator.verify(req.body.email);
    if(wellFormed && validDomain && validMailbox)
    {
    if((await db.collection("User").find({email:req.body.email}).toArray()).length==0)
    {
    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(req.body.password,salt);
    req.body.password = hash;
    await db.collection("User").insertOne(req.body);
    res.json({
        "message":"Registered"
    })
    }
    else
    {
        res.json({
            "message":"user already exist"
        })    
    } }
    else
    {
        res.json({
            "message":"Enter valid email id"
        })
    }
    connection.close();
   }
    catch(error)
    {
        console.log(error);
    }
   
})


app.post("/login",async(req,res)=>{
    console.log("login");
    let connection = await mongodb.connect(URL);
    let db = connection.db(DB);
   // console.log(req.body.email);
    let user = await db.collection("User").find({email:req.body.email}).toArray() ;
    //console.log("user",user);
    if(user.length!=0)
    {
      console.log(req.body.password,user[0].password)
      let isPassword = await bcrypt.compare(req.body.password,user[0].password);
      //console.log(isPassword);
      if(isPassword)
      {
             let token = jwt.sign({_id:user[0]._id},"ksdsfsdgsdgdfhdsabgdghsdlhgldsdsaf");
             res.json({
             "message" : "Allowed",
             token ,
             userid : user[0]._id
        })
      }else
      {
        res.json({
            "message" : "Login id or password is wrong"
        })
      }
      
    }
    else
    {
        res.json({
            "message" : "Account not found"
        }) 
    }
    connection.close();
})

app.post("/email",async (req,res)=>{
    console.log("email");
    try{  
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        const { wellFormed, validDomain, validMailbox } = await emailValidator.verify(req.body.email);
        if(wellFormed && validDomain && validMailbox)
        { 
            let user = await db.collection("User").find({email:req.body.email}).toArray();
            console.log(user)
            if(user.length!=0)
            {
                let mailOptions = {
                    from: 'unnamedbot2oo5@gmail.com', // TODO: email sender
                    to: req.body.email, // TODO: email receiver
                    subject: 'Password reset',
                    text: `Reset your password using the below link : http://localhost:3000/resetpassword/${user[0]._id}`
                };
                
                // Step 3
                transport.sendMail(mailOptions, (err, data) => {
                    if (err) {
                        console.log('Error occurs');
                    }
                    
                });
                res.json({"message":'Email sent!!! check your inbox',
                "sent":true});
            }
            else
            {
                res.json({
                    "message":"Please Register to access",
                    "sent":false
                })     
            }
        }
        else
        {
           res.json({
                "message":"Please enter valid email",
                "sent":false
            })
        } 
        connection.close();
    }
    catch(err)
    {
      console.log(err)
      res.json({
        "message":"Please enter valid email",
        "sent":false
    })
    }
})

app.post("/getsingletask/:id",async (req,res)=>{
    console.log("getsingletask");
    try{
    let connection = await mongodb.connect(URL);
    let db = connection.db(DB);
    let result = await db.collection("Task").find({_id:mongodb.ObjectID(req.params.id)}).toArray();
    if(result.length==0)
    {  
        res.json({"available":false})
    }
    else
    {
    result[0].available = true;    
    res.send(result[0]);
    }
   }
    catch(err)
    {
        console.log(err);
    }
    connection.close();
})
app.post("/updatesingletask/:id",async (req,res)=>{
    console.log("updatesingletask");
    try{
    let connection = await mongodb.connect(URL);
    let db = connection.db(DB);
    await db.collection("Task").updateOne({_id:mongodb.ObjectID(req.params.id)},{$set:{"Completed":req.body.Completed}});
    res.json({
        "message":"task updated"
    })
   }
    catch(err)
    {
        console.log(err);
    }
    connection.close();
})

app.post("/resetpassword/:id",async (req,res)=>{
    console.log("resetpassword");
    try{
    let connection = await mongodb.connect(URL);
    let db = connection.db(DB);
    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(req.body.password,salt);
    req.body.password = hash;
    await db.collection("User").updateOne({_id:mongodb.ObjectID(req.params.id)},{$set:{"password":req.body.password}});
    res.json({
        "message":"password updated"
    })
   }
    catch(err)
    {
        console.log(err);
    }
    connection.close();
})

app.post("/task",verification,async (req,res)=>{
    console.log("createtask");
    try{
    let connection = await mongodb.connect(URL);
    let db = connection.db(DB);
    await db.collection("Task").insertOne(req.body);
    res.json({
        "message":"added"
    })
 
   }
    catch(err)
    {
        console.log(err);
    }
    connection.close();
})

app.post("/gettask/:id",verification,async(req,res)=>{
    console.log("gettask");
    try{
    let connection = await mongodb.connect(URL);
    let db = connection.db(DB);
    let result = await db.collection("Task").find({Userid:req.params.id,Taskmonth:req.body.month,Taskdate:req.body.date}).toArray();
    console.log(result);
    res.send(result);
    }
    catch(err)
    {
       console.log(err)
    }
    connection.close();
})
app.post("/taskupdate/:id",verification,async(req,res)=>{
    console.log("taskupdate");
    try{
    let connection = await mongodb.connect(URL);
    let db = connection.db(DB);
    await db.collection("Task").updateOne({_id:mongodb.ObjectID(req.params.id)},{ $set: { "Taskname" : req.body.Taskname, "Taskdescription":req.body.Taskdescription ,"TaskTime":req.body.TaskTime,"Completed":req.body.Completed}})
    res.json({"message":"updated"})
    }
    catch(err)
    {
       console.log(err)
    }
    connection.close();
})

app.get("/getalltask/:id",verification,async(req,res)=>{
    console.log("getalltask");
    try{
    let connection = await mongodb.connect(URL);
    let db = connection.db(DB);
    let result = await db.collection("Task").find({Userid:req.params.id}).toArray();
    console.log(result);
    res.send(result);
    }
    catch(err)
    {
       console.log(err)
    }
    connection.close();
})

app.delete("/deletetask/:id",verification, async(req,res)=>{
    console.log("Delete task");
    try{
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
         await db.collection("Task").deleteOne({_id:mongodb.ObjectID(req.params.id)})
        
        res.json({"message":"Removed"})
        }
        catch(err)
        {
           console.log(err)
        }
        connection.close();
})

function verification(req,res,next)
{ 
    console.log("Verification",req.body)
      if(req.headers.authorization)
  {
      try
      {
          let check = jwt.verify(req.headers.authorization,"ksdsfsdgsdgdfhdsabgdghsdlhgldsdsaf");
          if(check)
          {
              next();
          }
          else
          {
              res.json({
                "message":"authorization failed"           
              })
          }
      }
      catch(err)
      {
        console.log(err)
        res.json({
            "message":"authorization failed"           
          })
      }
  }   
  else
  {
    res.json({
        "message":"authorization failed"           
      })  
  }
}


