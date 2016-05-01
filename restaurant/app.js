var http = require('http');
var port = process.env.PORT || 1337;
var url = require('url');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

//database setting
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var urlDb = 'mongodb://admin:admin@ds032319.mlab.com:32319/restaurant4314';
var assert = require('assert');
var db;
var cursor;
var util = require('util');
var prettyjson = require('prettyjson');

//db connect
MongoClient.connect(urlDb,(err, database) => {
	if (err) return console.log(err);
	db = database;
}); 

//pretty json 
function prettyJSON(data) {
	return prettyjson.render(data);
}

//find restaurant
function findAllRes(res, db) {
	db.collection('rests').find().toArray(function (err, result) {
		if (err) {
            console.log(err);
            res.status('400').send({ error: err });
        } else if (result.length) {
            mk = result;
            res.render('lists.ejs', { items: mk });
        } else {
            console.log('No document(s) found with defined "find" criteria!');
            res.status('400').send({ error: 'No document(s) found' });
        }
	});
}

//find restaurant with keywords
function findAllResWithKey(req, res, db, selection) {
	switch (selection) {
		case 1:
			db.collection('rests').find({ "name": new RegExp(req.params.keywords) }).toArray(function (err, result) {
				if (err) {
					res.status('400').send({ error: err });
					console.log(err);

				} else if (result.length) {
					mk = result;
					console.log(mk);
					res.render('search.ejs', { items: mk });
				} else {
					console.log('No document(s) found with defined "find" criteria!');
					res.status('400').send({ error: 'No document(s) found' });
				}
			});
			break;
		case 2:
			db.collection('rests').find({ "borough": new RegExp(req.params.keywords) }).toArray(function (err, result) {
				if (err) {
					console.log(err);
					res.status('400').send({ error: err });
				}
				else if (result.length) {
					mk = result;
					res.render('search.ejs', { items: mk });
				} else {
					console.log('No document(s) found with defined "find" criteria!');
					res.status('400').send({ error: 'No document(s) found' });
				}
			});
			break;
		case 3:
			db.collection('rests').find({ "restaurant_id": new RegExp(req.params.keywords) }).toArray(function (err, result) {
				if (err) {
					console.log(err);
					res.status('400').send({ error: err });
				}
				else if (result.length) {
					mk = result;
					res.render('search.ejs', { items: mk });
				} else {
					console.log('No document(s) found with defined "find" criteria!');
					res.status('400').send({ error: 'No document(s) found' });
				}
			});
			break;
	}
}

//create restaurant function
function createRestaurant(req, res) {
	db.collection('rests').insertOne({
		"address": {
			"street": req.params.street,
			"zipcode": req.params.zipcode,
			"building": req.params.building,
			"coord": [req.params.lon, req.params.lat]
		},
		"grades":[],
		"borough": req.params.borough,
		"cuisine": req.params.cuisine,
		"name": req.params.name,
		"restaurant_id": req.params.restaurant_id
	});
	res.render("createR.ejs", { items: "Create Success" });
}

//update restaurant function
function updateRestaurant(req, res) {
	db.collection('rests').count({ "restaurant_id": req.body.rests_id },function(err,result){
		
		if(result!=0){
			db.collection('rests').update({
				restaurant_id: req.body.rests_id
			}, {
				$set: { name: req.body.name }
			}
			);
			res.render("updateR.ejs", { items: "Update Success" });
		}else{
			res.render("err.ejs",{items:"Sorry update is not success, The requested restaurant id does not match the database"});
		}		
	});
	
}

//update place function
function updatePlace(req,res){
		db.collection('rests').count({ "restaurant_id": req.body.rests_id },function(err,result){
		
		if(result!=0){
			db.collection('rests').update({
				restaurant_id: req.body.rests_id
			}, {
				$set: { borough: req.body.borough,
					address:{
						building:req.body.building,
						coord:[req.body.lon,req.body.lat],
						street:req.body.street,
						zipcode:req.body.zipcode						
					} }
			}
			);
			res.render("updatePlace.ejs", { items: "Update Success" });
		}else{
			res.render("err.ejs",{items:"Sorry update is not success, The requested restaurant id does not match the database"});
		}		
	});
	
}
//delete restaurant function
function deleteRestaurant(req, res) {
	db.collection('rests').count({ "restaurant_id": req.body.rests_id },function(err,result){
		if(result!=0){
			db.collection('rests').remove({ "restaurant_id": req.body.newDocument }, function (err) {
				if (err) {
					console.log(err);
					return;
				}
				res.render("deleteR.ejs", { items: "Delete Success" });
			});
		}else{
			res.render("err.ejs", { items: "Delete Not Success" });
		}
	});
	
}

//rate restaurant function
function rateRestaurant(req, res) {
	//date
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1;
	var yyyy = today.getFullYear();
	if(dd<10) {
	    dd='0'+dd;
	} 
	if(mm<10) {
	    mm='0'+mm;
	} 
	today = dd+'/'+mm+'/'+yyyy;
	//
	db.collection('rests').count({"restaurant_id":req.body.rests_id}, function(err, result){
		if(result){
			db.collection('rests').update({
		restaurant_id: req.body.rests_id
	   }, {
			$push:{grades:{grade: req.body.rateGrade , score: req.body.rateScore , comment: req.body.commentDoc, date: today}}
		});
				res.render("rate.ejs", { items: "Rate Success"});
		}
	   else{
		   res.render("rate.ejs", { items: "No restaurant match"});
	   }
	});
	
		}
//index page
app.get("/", function (req, res) {
	res.sendfile("./views/index.html");
});

//listing page
app.get("/lists", function (req, res) {
	findAllRes(res, db, function (err) {
		if (err) {
			res.render("list.ejs", { items: "There is no data" });
		}
	});
});


//searching
app.get("/search", function (req, res) {
	res.sendfile('./views/search.html');
});
app.post("/search", function (req, res) {
	if (req.body.newDocument != "") {
		res.redirect('/search/searchSelector/' + req.body.searchSelector + '/keywords/' + req.body.newDocument);
	}else{
		res.redirect('/search/err');
	}
});
app.get("/search/searchSelector/:searchSelector/keywords/:keywords", function (req, res) {
	var searchSelection = 0;
	if (req.params.searchSelector == "findByName") {
		searchSelection = 1;
	} else if (req.params.searchSelector == "findByPlace") {
		searchSelection = 2;
	} else if (req.params.searchSelector == "findById") {
		searchSelection = 3;
	}
	console.log(searchSelection);
	findAllResWithKey(req, res, db, searchSelection, function (err) {
		if (err) {
			res.render("search.ejs", { items: "Search Not Success" });
		}
	});
});
app.get("/search/err",function(req,res){
	res.render("err.ejs",{items:"Please Enter the Keyword!"});
});

//creating new restaurant
app.get("/create", function (req, res) {
	res.sendfile('./views/createR.html');
});
app.post("/create", function (req, res) {
	res.redirect('/create/name/' + req.body.name + '/building/' + req.body.building + '/street/' + req.body.street + '/zipcode/' + req.body.zipcode + '/lon/' + req.body.lon + '/lat/' + req.body.lat + '/borough/' + req.body.borough + '/cuisine/' + req.body.cuisine + '/restaurant_id/' + req.body.restaurant_id);
});
app.get("/create/name/:name/building/:building/street/:street/zipcode/:zipcode/lon/:lon/lat/:lat/borough/:borough/cuisine/:cuisine/restaurant_id/:restaurant_id", function (req, res) {
	createRestaurant(req, res, function (err) {
		if (err) {
			res.render("createR.ejs", { items: "Create Not Success" });
		}
	});
});

//update restaurant
app.get("/update", function (req, res) {
	res.sendfile('./views/updateR.html');
});
app.post("/update", function (req, res) {
	if(req.body.rests_id!="" ||req.body.name!=""){
		updateRestaurant(req, res);
	}else{
		res.render("err.ejs",{items:"Please Enter Update Value!"});
	}
		
});

//update place
app.get("/updateplace", function (req, res) {
	res.sendfile('./views/updatePlace.html');
});
app.post("/updateplace", function (req, res) {
	updatePlace(req,res,function(err){
	if(err){
		res.render("err.ejs",{items:"Please Enter Update Value!"});
	}
	});
});
//deleting one restaurant
app.get("/delete", function (req, res) {
	res.sendfile('./views/deleteR.html');
});
app.post('/delete', function (req, res) {
	if(req.body.newDocument!=""){
		deleteRestaurant(req, res);
	}else{
		res.render("err.ejs",{items:"Please Enter The Wanted Delete Restaurant ID!"});
	}
});

//rate restaurant
app.get("/rate", function (req, res) {
	res.sendfile('./views/rate.html');
});

app.post("/rate", function (req, res) {
	rateRestaurant(req, res, function (err) {
		if (err) {
			res.render("rate.ejs", { items: "Rate Not Success" });
		}
	});
});


//start server
var server = http.createServer(app);
server.listen(port);

