var Draw = function() {
};

// setColor sets the pen color.
Draw.prototype.setColor = function(r, g, b, a) {
	this.color = {r: r, g: g, b: b, a: a};
}

// setPixel sets the pixel at (x, y).
Draw.prototype.setPixel = function(x, y) {
	setPixel(x, y, this.color);
}

// line draws a line from (x0, y0) to (x1, y1).
Draw.prototype.line = function(x0, y0, x1, y1) {
   var dx = Math.abs(x1-x0);
   var dy = Math.abs(y1-y0);
   var sx = (x0 < x1) ? 1 : -1;
   var sy = (y0 < y1) ? 1 : -1;
   var err = dx-dy;
   var e2 = 0

   //draw the line (bresenham)	   
   while(true){
     setPixel(x0, y0, this.color);
     if ((x0==x1) && (y0==y1)) {
	     break;
     }
     e2 = 2*err;
     if (e2 >-dy) {
	     err -= dy;
	     x0  += sx;
     }
     if (e2 < dx) {
	     err += dx;
	     y0  += sy;
     }
   }
};

// draw is the global Draw object for updating pixels.
var draw = new Draw();
