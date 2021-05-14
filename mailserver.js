const nodemailer = require('nodemailer');
let cron = require('node-cron');
const mongodb = require("mongodb");
const URL = "mongodb+srv://dbuser:helloworld@cluster0.zwvcb.mongodb.net/Remainder?retryWrites=true&w=majority";
const DB = "Remainder";

var transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "unnamedbot2oo5@gmail.com", 
        pass: "Liverpool@2019" 
    }
  });

  

cron.schedule('* * * * *',  async() => {
    let connection = await mongodb.connect(URL);
    let db = connection.db(DB);
    let task = await db.collection("Task").find({"Completed":false}).toArray();
    if(task.length!=0)
    {
      let date  = new Date();
      let currentmonth = date.getMonth();
      let currentdate = date.getDate();
      let currenthour = date.getHours();
      let currentmin = date.getMinutes();

      
      task.map(async(i)=>{
          let temp = i.TaskTime.split(":");
          if(i.Taskmonth===currentmonth&&i.Taskdate===currentdate&&+temp[0]===currenthour&&+temp[1]===currentmin)
          {
             let user = await db.collection("User").find({_id:mongodb.ObjectID(i.Userid)}).toArray();
             console.log(user);
             const message = {
                from: 'unnamedbot2oo5@gmail.com', // Sender address
                to: user[0].email,         // List of recipients
                subject: `Remainder for task-${i.Taskname}`, // Subject line
                text: `Hello ${user[0].Name}, \n\n It's time to start ${i.Taskname}. \n\n Use the  link below to registry the task completion or to cancel the task: \n\n http://localhost:3000/remainder/${i._id}` // Plain text body
            };
            transport.sendMail(message, function(err, info) {
                if (err) {
                  console.log(err)
                } else {
                  console.log(info);
                }
            });
          }
      })
    }
    connection.close();
 });