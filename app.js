/*
	The Ultimate Drawing App
*/

// Setup
var path = require("path");
var express = require("express");
var app = express();

// Serve static files (public/) with express
var publicPath = path.join(__dirname, "public");
var staticServer = express.static(publicPath);
app.use(staticServer);

// Start express server and piggyback socket.io connection over the same server
var port = process.env.PORT || 8080;
var server = app.listen(port);
var io = require("socket.io")(server);


// store namespace in variable
var drawServer = io.of("/draw");
var chatServer = io.of("/chat");


// Real time communication
var drawHistory = [];
drawServer.on("connection", function (socket) {
	// New connection setup
	console.log("a drawing user connected");
	socket.emit("draw history", drawHistory);

	socket.on("request history", function () {
		socket.emit("draw history", drawHistory);
	});

	// When a client draws, notify all other clients
	socket.on("player draw line", function(drawData) {
		socket.broadcast.emit("other player draw line", drawData);	
		drawHistory.push(drawData);
	});

	socket.on("disconnect", function() {
		console.log("draw a user has left!");
	});
});


var allUsers = [];
var chatHistory = [];
var serverUrl = "";
chatServer.on("connection", function (socket) {
	// New connection setup
	console.log("a chatting user connected");
	socket.emit("draw history", drawHistory);

	var nickname = "";
	var randPicIndex = Math.floor(Math.random() * 24);
	var profileUrl = "/images/" + randPicIndex + ".jpg";
	socket.emit("server chat history", chatHistory);

	socket.on("client register user", function(name) {
		nickname = name;
		// Update user list and notify clients
		allUsers.push(name);
		chatServer.emit("server user list", allUsers);
		// Add connect message to history and send it to clientss
		var nowString = new Date().toISOString();
		var message = {
			user: name + " joined", 
			time: nowString, 
			text: "", 
			imageUrl: profileUrl
		};
		chatHistory.push(message)
		chatServer.emit("server new chat message", message);
		socket.emit("server profile picture", profileUrl);
	});

	socket.on("client new chat message", function(message) {
		chatHistory.push(message);
		socket.broadcast.emit("server new chat message", message);
	});

	socket.on("disconnect", function() {
		console.log("a user has left!");
		// Remove the user from the user list and update the remaining clients
		var index = allUsers.indexOf(nickname);
		allUsers.splice(index, 1);
		chatServer.emit("server user list", allUsers);
		// Send a disconnect message to the clients
		var nowString = new Date().toISOString();
		var message = {
			user: nickname + " disconnected",
			time: nowString, 
			text: "", 
			imageUrl: profileUrl
		};
		chatHistory.push(message)
		chatServer.emit("server new chat message", message);
	});

});
