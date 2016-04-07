var express = require('express');
var http = require('http');
var morgan = require('morgan');
var firebase = require('firebase');
var bodyParser = require('body-parser');
var firebaseRef = new Firebase("https://jeffrey-xiao-react.firebaseio.com");

var hostname = 'localhost';
var port = 8080;

var app = express();

app.use(morgan('dev'));

app.use("/", express.static(__dirname + '/'));

app.get("/api/comments", function (req, res, next) {
	var getComments = function (callback) {
		var comments = [];
		firebaseRef.once('value', function (snapshot) {
			snapshot.forEach(function (childSnapshot) {
				comments.push(
					{
						'id' : childSnapshot.key(),
						'author': childSnapshot.val().author,
						'text': childSnapshot.val().text
					}
				);
			});
			callback(comments);
		});
	};
	
	getComments(function (comments) {
    	res.setHeader('Content-Type', 'application/json');
    	res.send(JSON.stringify({'comments': comments}));
		return;
	});
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.post("/api/comments", function (req, res, next) {
	var key = Date().toString();
	var firebaseVal = new Firebase("https://jeffrey-xiao-react.firebaseio.com/"+key);
	firebaseVal.set({author: req.body.author, text: req.body.text});
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end("Successfully added to firebase database!");
});

app.listen(port, hostname, function () {
	console.log("Server is running at http://" + hostname + "/" + port);
});