``//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const lodash = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:test123@cluster0.f9cczuc.mongodb.net/todoListDb");

const itemSchema=mongoose.Schema({
    name:String
});

const Item = mongoose.model("Item",itemSchema);

const playGame=new Item({
     name:"Playgame"
});
const eat=new Item({
  name:"Eat Food"
});
const volley=new Item({
  name:"Play Volley"
});
// Item.insertMany([playGame,eat,volley]);

const arr = [playGame,eat,volley];

const listSchema = {
  name:String,
  items:[itemSchema]

};

const List = mongoose.model("List",listSchema);




app.get("/", function(req, res) {

  const find = async() =>{
    try{
      const ans = await Item.find({});
      if(ans.length==0){
        Item.insertMany([playGame,eat,volley]);
      
      }
      res.render("list", {listTitle: "Today", newListItems: ans});
      
    }catch(error){
      console.log(error);
    }
  }
  
  find();

});

app.post("/", async function(req, res){

  const item = req.body.newItem;
  const listTitle=req.body.list;
  const itemToInsert = new Item({
      name:item
  }); 

  if(listTitle==="Today"){
    itemToInsert.save();
    res.redirect("/");
  }else{
    const foundlist = await List.findOne({name:listTitle});
    foundlist.items.push(itemToInsert);
    foundlist.save();
    res.redirect("/" + listTitle);
  }

 
});

// app.post("/delete",function(req,res){
//     const id =req.body.checkbox;
//     await Item.findByIdAndRemove(id);
//     res.redirect("/");
// });
app.post("/delete", async function(req, res) {
  try {
    const id = req.body.checkbox;
    const listName = req.body.listName;
    if(listName==="Today"){
      await Item.findByIdAndRemove(id);
      res.redirect("/");
    }else{
      await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}});
      res.redirect("/"+listName);
    }
   
  } catch (error) {
    // Handle any error that occurred during deletion
    console.error(error);
    res.redirect("/");
  }
});

app.get("/:listName", async function(req,res){
   try{
    const listName = lodash.capitalize(req.params.listName);

    const find = await List.findOne({name:listName});
    if(!find){
      const list = new List({
        name :listName,
        items:arr
      });
      list.save();
      res.redirect("/"+listName);
    }else{
      res.render("list", {listTitle: find.name, newListItems: find.items});
    }
  }catch(error){
    console.log(error);
  }
      
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000 || process.env.PORT, function() {
  console.log("Server started on port 3000");
});
