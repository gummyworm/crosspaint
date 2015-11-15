var C64 = function() {
	this.palette = new Palette(document.getElementById("palette"));
	this.palette.addColor(0, 0, 0); //black
	this.palette.addColor(255, 255, 255); //white
	this.palette.addColor(104, 55, 43); //red
	this.palette.addColor(112, 164, 178); //cyan
	this.palette.addColor(111, 61, 134); //purple
	this.palette.addColor(88, 141, 67); //green
	this.palette.addColor(53, 40, 121); //blue
	this.palette.addColor(184, 199, 111); //yellow
	this.palette.addColor(111, 79, 37); //orange
	this.palette.addColor(67, 57, 0); //brown
	this.palette.addColor(154, 103, 89); //light red
	this.palette.addColor(68, 68, 68); //dark grey
	this.palette.addColor(108, 108, 108); //grey
	this.palette.addColor(154, 210, 132); //light green
	this.palette.addColor(108, 94, 181); //light blue
	this.palette.addColor(149, 149, 149); //light grey

	this.palette.draw();
}
C64.prototype = Object.create(Platform.prototype);

