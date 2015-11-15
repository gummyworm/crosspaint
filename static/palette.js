var Color = function(r, g, b) {
	this.r = r;
	this.g = g;
	this.b = b;
}
Color.prototype.constructor = Color;

var Palette = function(c) {
	this.canvas = c;
	this.ctx = c.getContext("2d");
	this.colors = [];

	this.minWidth = 4;	//minimum pixel width of a color in the palette
	this.scroll = 0;	//the color offset to display (if not all colors fit)

	this.listen();
}

Palette.prototype.constructor = Palette;

// listen dispatches events for palette objects.
Palette.prototype.listen = function() {
	this.canvas.addEventListener('mousedown', function(evt) {
		this.onMouseDown(evt);
	}.bind(this), false);
}

// setColor sets the selected color for the palette
Palette.prototype.setColor = function(i) {
	if(this.colors.length > i) {
		this.selected = i;
	}
}

// addColor adds the given RGBA color to the palette
Palette.prototype.addColor = function(r, g, b) {
	this.colors.push(new Color(r, g, b));
}

// draw renders the palette to its canvas
Palette.prototype.draw = function() {
	var offset = 0;
	var xStep = this.canvas.width / this.colors.length;

	if(xStep < this.minColorW) {
		xStep = this.minColorW;
		offset = this.scroll;
	} 
	for(var i = 0; i < this.colors.length; i++) {
		c = this.colors[i + offset];
		this.ctx.fillStyle = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
		this.ctx.fillRect(xStep*i, 0, xStep, this.canvas.height);
	}
}

// onMouseDown sets the palette's active color to the one that was clicked.
Palette.prototype.onMouseDown = function(evt) {
	var x = evt.clientX - this.canvas.getBoundingClientRect().left;
	var xStep = this.canvas.width / this.colors.length;
	this.setColor(Math.floor(x / xStep));

	pixmap.setColor(this.colors[this.selected]);
}

