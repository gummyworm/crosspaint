layers = {
  LAYER0: 0
};

var validatorC64MC = {
  dim: {w: 320, h: 200};
  setup: function() {
    cellDims[layers.LAYER0].x = 8;
    cellDims[layers.LAYER0].y = 8;
  },
  isValid: function(x, y, c) {
    if(numColorsInCell(x, y, layers.LAYER0) == 4 && 
        (colorIsInCell(x, y, layers.LAYER0, c))) {
      return false;
    }
    return true;
  },
  //the pepto palette
  palette: {
    colors: [
      {r: 0x00, g: 0x00, b: 0x00, a:0xff}, //black
      {r: 0xff, g: 0xff, b: 0xff, a:0xff}, //white
      {r: 0x68, g: 0x37, b: 0x2b, a:0xff}, //
      {r: 0x70, g: 0xa4, b: 0xb2, a:0xff}, //
      {r: 0x6f, g: 0x3d, b: 0x86, a:0xff}, //
      {r: 0x58, g: 0x8d, b: 0x43, a:0xff}, //
      {r: 0x35, g: 0x28, b: 0x79, a:0xff}, //
      {r: 0xb8, g: 0xc7, b: 0x6f, a:0xff}, //
      {r: 0x6f, g: 0x4f, b: 0x25, a:0xff}, //
      {r: 0x43, g: 0x39, b: 0x00, a:0xff}, //
      {r: 0x9a, g: 0x67, b: 0x59, a:0xff}, //
      {r: 0x44, g: 0x44, b: 0x44, a:0xff}, //
      {r: 0x6c, g: 0x6c, b: 0x6c, a:0xff}, //
      {r: 0x9a, g: 0xd2, b: 0x84, a:0xff}, //
      {r: 0x6c, g: 0x5e, b: 0xb5, a:0xff}, //
      {r: 0x95, g: 0x95, b: 0x95, a:0xff}, //
    ]
  }
}

