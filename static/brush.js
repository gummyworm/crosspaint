var Brush = {
  onMouseDown: function(x, y) {
    console.log("SET");
    prevPos = {x: x, y: y};
    setPixel(x, y, color);
  },
  onMouseUp: function(x, y) {
    
  },
  onMouseMove: function(x, y) {
    if(mouseDown) {
      line(x, y, prevPos.x, prevPos.y);
      prevPos.x = x;
      prevPos.y = y;
    }
  }
}

