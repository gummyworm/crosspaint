var activeValidator;
var activeValidatorColor = 0;
var cellDims;

function setCellDims(w, h, layer) {
  cellDims[layer].x = w;
  cellDims[layer].y = h;
}

function colorIsInCell(x, y, layer, c) {
  var xstart = Math.floor(x / cellDims[layer].x) * cellDims[layer].x;
  var ystart = Math.floor(y / cellDims[layer].y) * cellDims[layer].y;
  for(x = xstart; x < xstart + cellDims[layer].x; ++x) {
    for(y = ystart; y < yStart + cellDims[layer].y; ++y) {
      if(pic[y][x] == c) {
        return true;
      }
    }
  }
  return false;
}

function numColorsIsInCell(x, y, layer, c) {
  var xstart = Math.floor(x / cellDims[layer].x) * cellDims[layer].x;
  var ystart = Math.floor(y / cellDims[layer].y) * cellDims[layer].y;
  var numFound = 0;
  var found = {};

  for(x = xstart; x < xstart + cellDims[layer].x; ++x) {
    for(y = ystart; y < yStart + cellDims[layer].y; ++y) {
      if(!(c in found)) {
        found[c] = true;
        numFound++;
      }
    }
  }
  return numFound;
}

function isValidPixel(x, y, c) {
  return activeValidator.isValid(x, y, c);
}

function nextColor(validator) {
  colors = validator.palette.colors;
  activeValidatorColor = (activeValidatorColor + 1) % colors.length;
  console.log(colors[activeValidatorColor]);
  return colors[activeValidatorColor];
}
 
function setValidator(v) {
  activeValidator = v;
}

