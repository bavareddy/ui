const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
// const Student  = require('./studentSchema')
const csvtojson = require('csvtojson')
const fs=require('fs')
const path=require('path')
const app = express()

const bodyParser=require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
mongoose.connect('mongodb://localhost:27017/MongoExcelDemo').then(() => {     // MongoDB connection
    console.log('database connected')
});


app.use(express.static('public'))    // static folder
app.set('view engine','ejs')             // set the template engine








const studentSchema = mongoose.Schema({
        name : {type : String, required : true},
        rollno : {type: Number, required : true},
        img:{type: String, required : true}
})


Student= mongoose.model('Student', studentSchema)
var excelStorage = multer.diskStorage({  
    destination:(req,file,cb)=>{  
         cb(null,__dirname+'/excelUploads');      // file added to the public folder of the root directory
    },  
    filename:(req,file,cb)=>{  
         cb(null,file.originalname);  
    }  
});  
var excelUploads = multer({storage:excelStorage}); 
app.get('/',(req,res) => {
       res.render('welcome');
      
       
})
app.post('/c',(req,res)=>{
    res.render('index')
})
// upload excel file and import in mongodb
app.post('/uploadExcelFile', excelUploads.single("uploadfile"), (req, res) =>{  
       importFile(__dirname+'/excelUploads/' + req.file.filename);
            
       function importFile(filePath){
              //  Read Excel File to Json Data
                var arrayToInsert = [];
                csvtojson().fromFile(filePath).then(source => {
              // Fetching the all data from each row
              //obj={data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),contentType: 'image/png'}
                for (var i = 0; i < source.length; i++) {
                    console.log(source[i]["name"])
                    var singleRow = {
                        name: source[i]["name"],
                        rollno: source[i]["rollno"],
                        img: source[i] ["img"]
                        
                    };
                    arrayToInsert.push(singleRow);
                }
             //inserting into the table student
             Student.insertMany(arrayToInsert, (err, result) => {
                    if (err) console.log(err);
                        if(result){
                            console.log("File imported successfully.");
                            res.send("sucess bro!!")
                        }
                    });
                });
           }
})



app.listen(3000, () => {
    console.log('server started at port 3000')
})

app.post('/post',(req,res)=>{
    var name=req.body.search
    Student.find({name},(err,data)=>{
        res.render('post',{
            data:data
        })
    })
})

