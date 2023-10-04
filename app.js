//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

const itemsSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

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

// ... (previous code)

app.get("/", function (req, res) {
  Item.find({}) // Remove the callback function
    .then(function (foundItems) {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(function () {
            console.log("Successfully added default items");
          })
          .catch(function (err) {
            console.error(err);
          });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    })
    .catch(function (err) {
      console.error(err);
    });
});

// ... (the rest of your code)


app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).maxTimeMS(30000)
      .then(function (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch(function (err) {
        console.error(err);
      });
  }
});

// app.post("/delete", function (req, res) {
//   const checkedItemId = req.body.checkbox;
//   const listName = req.body.listName;
//
//   if (listName === "Today") {
//     Item.findByIdAndDelete(checkedItemId, function (err) {
//       if (!err) {
//         console.log("Successfully deleted Checked item");
//         res.redirect("/");
//       }
//     });
//   } else {
//     // Handle deletion for custom lists
//   }
// });

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then(function () {
        console.log("Successfully deleted Checked item");
        res.redirect("/");
      })
      .catch(function (err) {
        console.error(err);
      });
  } else {
    // Handle deletion for custom lists
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    )
      .then(function () {
        res.redirect("/" + listName);
      })
      .catch(function (err) {
        console.error(err);
      });
  }
});




app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }).maxTimeMS(30000)
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save().then(() => {
          res.redirect("/" + customListName);
        });
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    })
    .catch(function (err) {
      console.error(err);
    });
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: [] });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
