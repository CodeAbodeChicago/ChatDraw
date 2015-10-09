// main.js for chat app

// thanks to Tamas Piros and Michael Mukhin
// http://socket.io/get-started/chat/
// http://www.tamas.io/simple-chat-application-using-node-js-and-socket-io/
// http://psitsmike.com/2011/09/node-js-and-socket-io-chat-tutorial/

// Moment.js for formatting dates
// http://momentjs.com/



// _____________________________________________________________________________
// Socket User Registration
// var chatSocket = io("http://localhost:8080/chat");
var chatSocket = io(window.location.origin + '/chat');
var nickname = prompt("What is your name?");
var profileUrl = "";

chatSocket.on("connect", function() {
	console.log("You have successfully connected!  Welcome!");
	chatSocket.emit("client register user", nickname);
});

chatSocket.on("server profile picture", function(url) {
	profileUrl = url;
});


// _____________________________________________________________________________
// Form input

var msgWrap = document.getElementById("msg-wrap");
var msgTemplate = msgWrap.querySelector(".msg-template");
msgWrap.removeChild(msgTemplate);
msgTemplate.style.visibility = "visible";

var chatForm = document.getElementById("msg-form");
var chatInput = chatForm.elements["new-msg"];
chatInput.focus();

chatForm.onsubmit = function(e) {
	e.preventDefault();
	if (chatInput.value === "") return false;

	var nowString = new Date().toISOString();
	var message = {
		user: nickname, 
		time: nowString, 
		text: chatInput.value, 
		imageUrl: profileUrl
	};
	console.log(message)
	chatSocket.emit("client new chat message", message);
	printMessage(message, false);
	chatInput.value = "";

	return false;
};

function printMessage(message, dim){
	var clone = msgTemplate.cloneNode(true);
	clone.querySelector(".profile").src = message.imageUrl;
	clone.querySelector(".username").textContent = message.user;
	clone.querySelector(".msg").textContent = message.text;
	var timeString = moment(message.time).format("h:mm:ss a");
	clone.querySelector(".time").textContent = timeString;
	if (dim) clone.style.opacity = "0.4"; // dim used for chat history
	msgWrap.appendChild(clone);
	clone.scrollIntoView(false); // scroll to bottom of page
}


// _____________________________________________________________________________
// Socket messages & history

chatSocket.on("server new chat message", function(message) {
	console.log("Another user sent a message!");
	printMessage(message, false);
});

chatSocket.on("server chat history", function(chatHistory) {
	for (var i = 0; i < chatHistory.length; i++) {
		printMessage(chatHistory[i], true);
	}
});



// _____________________________________________________________________________
// User list sidebar

// chatSocket.on("server user list", function(allUsers) {
// 	var userList = document.querySelector(".user-list");
// 	userList.innerHTML = "";
// 	for (var i = 0; i < allUsers.length; i += 1) {
// 		var newItem = document.createElement("li");
// 		newItem.textContent = allUsers[i];
// 		userList.appendChild(newItem);
// 	}
// });

