function Marker(markerColor, markerThickness) {
	this.color = markerColor;
	this.thickness = markerThickness;	
}
Marker.prototype.drawLine = function (p1, p2) {
	strokeWeight(this.thickness);
	stroke(this.color.h, this.color.s, this.color.b);
	line(p1.x, p1.y, p2.x, p2.y);
}