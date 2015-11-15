var activeTool;
var mouseDown = false;                      //true if mouse is being held down
var prevPos = {x: 0, y: 0};                 //last polled mouse position
var color = {r: 255, g: 0, b: 255, a: 255}; //current color selection

function screen2Pixel(pos) {
  return {
    x: Math.floor((pos.x / canvas.width) * width),
    y: Math.floor((pos.y / canvas.height) * height)
  };
}

function line(x0, y0, x1, y1){
   var dx = Math.abs(x1-x0);
   var dy = Math.abs(y1-y0);
   var sx = (x0 < x1) ? 1 : -1;
   var sy = (y0 < y1) ? 1 : -1;
   var err = dx-dy;

   while(true){
     setPixel(x0,y0,color);  // Do what you need to for this
     if ((x0==x1) && (y0==y1)) break;
     var e2 = 2*err;
     if (e2 >-dy){ err -= dy; x0  += sx; }
     if (e2 < dx){ err += dx; y0  += sy; }
   }
}

function getMousePos(evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function onMouseMove(evt) {
  var mousePos = getMousePos(evt);
  var pixelPos = screen2Pixel(mousePos);
  activeTool.onMouseMove(pixelPos.x, pixelPos.y);

  applyPixels();
}

function onMouseDown(evt) {
  var mousePos = getMousePos(evt);
  var pixelPos = screen2Pixel(mousePos);
  console.log("SET");
  mouseDown = true;
  activeTool.onMouseDown(pixelPos.x, pixelPos.y);

  applyPixels();
}

function onMouseUp(evt) {
  var mousePos = getMousePos(evt);
  var pixelPos = screen2Pixel(mousePos);
  mouseIsDown = false;
  activeTool.onMouseUp(pixelPos.x, pixelPos.y);
  mouseDown = false;

  applyPixels();
}

function onKeyDown(evt) {
  switch(evt.keyCode) {
  case 48:
     console.log("OK");
     color = nextColor(activeValidator);
     break;
  }
}

function setTool(tool) {
  activeTool = tool;
  canvas.addEventListener("mousemove", onMouseMove, false);
  canvas.addEventListener("mousedown", onMouseDown, false);
  canvas.addEventListener("mouseup", onMouseUp, false);
}

document.addEventListener("keydown", onKeyDown);

