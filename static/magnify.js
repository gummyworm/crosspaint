var zoomLevel = 1.0f;
var zoomCenter = {x: 0, y: 0}
var Maginify = {
  draw: function(x, y) {
  }
  onActivate: function(x, y) {
    var w = zoomLevel * canvas.width;
    var h = zoomLevel * canvas.height;
    // if first zoom, set center offset.
    if(zoomLevel == 1.0) {
      zoomCenter.x = (canvas.width - w) / 2.0;
      zoomCenter.y = (canvas.height - h) / 2.0;
    }
    zoomLevel *= 2.0;
    setClip(zoomCenter.x - (w/2.0), zoomCenter.y - (h/2.0), 
      zoomCenter.x + (w/2.0), zoomCenter.y + (h/2.0));
  }
  onDeactivate: function(x, y) {
    zoomLevel = 1.0;
  }
  onMouseMove(x, y) {
  }
}

