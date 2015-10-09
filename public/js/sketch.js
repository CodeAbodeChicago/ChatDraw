/*
	Client - the workhorse of our app :)

	It handles drawing and passes along messages to the server anytime the user
	draws a line.  It also listens for incoming messages that let it know what
	the other players have drawn.
*/

// _____________________________________________________________________________
// Global Variables

// var drawSocket = io("http://localhost:8080/chat");
var drawSocket = io(window.location.origin + '/draw');
var marker;
var eraser;


// _____________________________________________________________________________
// Handle button events

var palette = [
	{h: 211, s: 24, b: 44},
	{h: 176, s: 62, b: 80},
	{h: 45, s: 68, b: 99},
	{h: 0, s: 58, b: 100},
	{h: 354, s: 61, b: 77}
];

var buttons = document.querySelectorAll(".controls .button");
for (var i = 0; i < buttons.length; i += 1) {
	bindButtonClick(buttons[i], palette[i]);
}
function bindButtonClick(button, color) {
	button.onclick = function (event) {
		event.preventDefault();
		marker.color = color;
	}
}

// _____________________________________________________________________________
// p5 Events

function setup() {
	colorMode(HSB, 360, 100, 100, 1);
	var winWidth = (windowWidth-250);
	var winHeight = (windowHeight-4);
	var canvas = createCanvas( winWidth, winHeight );	
	canvas.parent('draw-wrap');
	background(0);
	strokeCap(ROUND);

	var randHue = random(0, 360);
	marker = new Marker({h: randHue, s: 100, b: 100}, 10);
	eraser = new Marker({h: 0, s: 0, b: 0}, 50);
}

function draw() {
	if (mouseIsPressed) {
		// Draw with marker
		if (mouseButton === LEFT) {
			var p1 = {x: pmouseX, y: pmouseY};
			var p2 = {x: mouseX, y: mouseY};
			marker.drawLine(p1, p2);
			sendMarkerMessage(p1, p2, marker);
		}
		// Eraser (e.g. draw with black)
		else if (mouseButton === RIGHT) {
			var p1 = {x: pmouseX, y: pmouseY};
			var p2 = {x: mouseX, y: mouseY};
			eraser.drawLine(p1, p2);
			sendMarkerMessage(p1, p2, eraser);
		}
	}
}

function windowResized() {
	var winWidth = (windowWidth-250);
	var winHeight = (windowHeight-4);
	resizeCanvas(winWidth, winHeight);
	background(0);
	drawSocket.emit("request history");
}

// _____________________________________________________________________________
// Socket Logic

function sendMarkerMessage(point1, point2, currentMarker) {
	drawSocket.emit("player draw line", {
		p1: point1,
		p2: point2,
		color: currentMarker.color,
		thickness: currentMarker.thickness
	});	
}

drawSocket.on("draw history", function (drawHistory) {
	console.log("draw history");
	for (var i = 0; i < drawHistory.length; i += 1) {
		var drawData = drawHistory[i];
		var otherMarker = new Marker(drawData.color, drawData.thickness);
		otherMarker.drawLine(drawData.p1, drawData.p2);
	}
});

drawSocket.on("other player draw line", function (drawData) {
	var otherMarker = new Marker(drawData.color, drawData.thickness);
	otherMarker.drawLine(drawData.p1, drawData.p2);
});