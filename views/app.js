//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemsSchema = {
  name:String
};


const listSchema = {
  name: String,
  items: [itemsSchema],
};

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

// const item1 = new Item ({
//   name:"Welcome to your todolist!",
// });
//
// const item2 = new Item ({
//   name:"Hit the + button to add a new item",
// });
//
// const item3 = new Item({
//   name:"<-- Hit this to delete an item."
// });
//
//
// const defaultItems = [item1, item2, item3];

const defaultItems = [
  new Item({
    name: "Welcome to your todolist!",
  }),
  new Item({
    name: "Hit the + button to add a new item",
  }),
  new Item({
    name: "<-- Hit this to delete an item.",
  }),
];







// const day = date.getDate();





  //               .then(function () {
  //   console.log("Succesfully added");
  // }).catch(function (err) {
  //   console.log(err);
  // });


  // ,function(err){
  //   if(err){
  //     console.log(err);
  //   }else{
  //     console.log("Succesfully saved!");
  //   }
  // }

  Item.find({}).then(function (foundItems) {

    if(foundItems.length === 0){
      Item.insertMany(defaultItems).then(function () {
   console.log("Successfully added");
}).catch(function (err) {
   console.log(err);
});

      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  }).catch(function (err) {
  console.log(err);
  });
  //
  // Item.deleteMany({}).then(function () {
  // console.log("Succesfuly deleted!");
  // }).catch(function (err) {
  // console.log(err);
  // });




});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item ({
    name:itemName
  });


if (listName==="Today"){
  item.save();


res.redirect("/");
} else{
  List.findOne({name: listName}).then(function (foundList) {
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});


app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndDelete(checkedItemId).then(function (err) {
      if(!err){
        console.log("Succesfully deleted Checkedd item");
        res.redirect("/");
      }
    });


  }else{

  };
  })



app.get("/:customListName", function(req, res){
    const customListName = req.params.customListName;

List.findOne({name: customListName}).then(function (foundList) {
//Show an existing List

res.render("list",{listTitle: foundList.name , newListItems: foundList.items});
}).catch(function (err) {
  //Create an new List
  const list = new List({
        name: customListName,
        items: [defaultItems],
      });

 list.save();
 res.redirect("/" + customListName);
});





});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
