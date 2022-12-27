const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
const currDate = require(__dirname + "/date.js")

const app = new express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", { useNewUrlParser: true });
mongoose.set('strictQuery', false);

const List = mongoose.model("List", {
    category: {
        type: String,
        required: true
    },
    items: [{
        name: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        active: {
            type: Boolean,
            required: true,
            default: true
        }
    }]
});

let listItems = [];

app.get("/", function (req, res) {
    res.redirect("/default");
});

app.get("/:listCategory", function (req, res) {
    
    const listCategory = _.capitalize(req.params.listCategory);
    
    listItems = [];

    List.findOne({ category: listCategory }, function (err, document) {
        if (err) {
            console.log("error retrieving items from database.")
        } else {
            if (document)
                document.items.forEach(element => {
                    listItems.push({
                        id: element._id,
                        name: element.name,
                        active: element.active
                    });
                });
            res.render("list", {
                listType: listCategory,
                date: currDate.getDate(),
                listItems: listItems
            })
        }
    });
});

app.post("/", function (req, res) {
    const listCategory = req.body.button;

    List.findOne({ category: listCategory }, function (err, document) {
        if (err) {
            console.log("error retrieving items from database");
        } else {
            if (document) {
                listItems = document.items;
                listItems.push({ name: req.body.listItem });
            }
            else
                listItems = [{ name: req.body.listItem }];
            List.findOneAndUpdate({ category: listCategory }, { items: listItems }, { upsert: true }, function (e) {
                if (!e)
                    res.redirect("/" + listCategory);
            })
        }
    })
});

app.post("/delete", function (req, res) {
    const item = req.body.item;
    const itemId = item.split(":")[0];
    const listCategory = item.split(":")[1];

    List.findOne({category: listCategory}, function(err, document){
        if(err)
            console.log("error retrieving items from database")
        else{
            document.items.forEach(element => {
                if(element._id == itemId)
                    element.active = false;
            });
            List.findOneAndUpdate({ category: listCategory }, { items: document.items }, { upsert: true }, function (e) {
                if (!e)
                    res.redirect("/" + listCategory);
            })
        }
    });
});


app.listen(process.env.PORT || port, function () {
    console.log("Todo list app is up and running.");

});