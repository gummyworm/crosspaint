// gl is the global OpenGL context.
var gl

// perspectiveMatrix is the matrix used for vertex shader's matrix mul's.
var perspectiveMatrix;


var Shader = function(vs, fs) {
	this.frag = 0;
	this.vert = 0;

	this.program = 0;
	this.attrPos = 0;
	this.attrTex = 0;
	this.vertexVBO = 0;
	this.indexVBO = 0;
	this.texcoVBO = 0;

	vert = this.get(vs);
	frag = this.get(fs);

	// create the shader program
	this.program = gl.createProgram();
	gl.attachShader(this.program, vert);
	gl.attachShader(this.program, frag);
	gl.linkProgram(this.program);

	if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program.");
	}
}

// get loads and compiles the given shader source.
Shader.prototype.get = function(id) {
	var shaderScript, shaderSrc, currentChild, shader;
	shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	shaderSrc = "";
	currentChild = shaderScript.firstChild;

	while(currentChild) {
		if (currentChild.nodeType == currentChild.TEXT_NODE) {
			shaderSrc+= currentChild.textContent;
		}
		currentChild = currentChild.nextSibling;
	}
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		// Unknown shader type
		return null;
	}

	// Compile the shader program
	gl.shaderSource(shader, shaderSrc);
	gl.compileShader(shader);

	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;
}

var Grid = function(x, y, width, height, lineW, c) {
	this.spacing = {x: x, y: y};
	this.color = c;
	this.buff = null;
	this.vbo = 0;
	this.lineW = lineW;

	this.width = width;
	this.height = height;

	xSteps = this.width / this.spacing.x;
	ySteps = this.height / this.spacing.y;
	this.buff = new Float32Array((xSteps * ySteps * 12));

	//vertical lines
	for(i = 0; i < xSteps; i++) {
		this.buff[12 * i + 0] = this.spacing.x * i;  //x
		this.buff[12 * i + 1] = 0.0         //y
		this.buff[12 * i + 2] = c.r        //r
		this.buff[12 * i + 3] = c.g;        //g
		this.buff[12 * i + 4] = c.b;        //b
		this.buff[12 * i + 5] = c.a;        //a
		this.buff[12 * i + 6] = this.spacing.x * i;
		this.buff[12 * i + 7] = this.height;
		this.buff[12 * i + 8] = c.r;
		this.buff[12 * i + 9] = c.g;      
		this.buff[12 * i + 10] = c.b;
		this.buff[12 * i + 11] = c.a;
	}

	//horizontal lines
	off = xSteps * 12;
	for(i = 0; i < ySteps; i++) {
		this.buff[off + 12 * i + 0] = 0.0;        //x
		this.buff[off + 12 * i + 1] = this.spacing.y * i;  //y
		this.buff[off + 12 * i + 2] = c.r;        //r
		this.buff[off + 12 * i + 3] = c.g;        //g
		this.buff[off + 12 * i + 4] = c.b;        //b
		this.buff[off + 12 * i + 5] = c.a;        //a
		this.buff[off + 12 * i + 6] = this.width;
		this.buff[off + 12 * i + 7] = this.spacing.y * i;
		this.buff[off + 12 * i + 8] = c.r;
		this.buff[off + 12 * i + 9] = c.g;
		this.buff[off + 12 * i + 10] = c.b;
		this.buff[off + 12 * i + 11] = c.a;
	}
	this.vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
	gl.bufferData(gl.ARRAY_BUFFER, this.buff, gl.STATIC_DRAW);

	// create the line shader.
	this.shader = new Shader("line-vs", "line-fs");
	gl.useProgram(this.shader.program);
	this.shader.attrPos = gl.getAttribLocation(this.shader.program, "aVertexPosition");
	this.shader.attrCol = gl.getAttribLocation(this.shader.program, "aColor");
	gl.bindAttribLocation(this.shader.program, 0, "aVertexPosition");
	gl.bindAttribLocation(this.shader.program, 1, "aColor");
}

Grid.prototype.constructor = Grid;

// draw renders the grid.
Grid.prototype.draw = function() { 
	gl.useProgram(this.shader.program)
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
	setMatrixUniforms(this.shader.program);
	gl.vertexAttribPointer(this.shader.attrPos, 2, gl.FLOAT, false, 4*6, 0);
	gl.vertexAttribPointer(this.shader.attrCol, 4, gl.FLOAT, false, 4*6, 8);
	gl.lineWidth(this.lineW);
	gl.drawArrays(gl.LINES, 0, (this.width/this.spacing.x) * (this.height/this.spacing.y));
}

// pixmap contains information about the bitmap being edited.
var Pixmap = function() {
	this.canvas = null;

	this.width = 320;  // the width of the pixmap
	this.height = 200; // the height of the pixmap

	this.pixels = new Uint8Array(this.width * this.height * 4)

	this.color = {r: 255, g: 255, b: 255, a: 255};

	this.majorGrid = null;
	this.minorGrid = null;

	this.majorGridOn = true;
	this.minorGridOn = true;

	// pixmapShader contains the OpenGL handles used for the pixmap drawing.
	this.pixmapShader = 0;
	
	// tex is the texture used as a surface for the pixels.
	this.tex = {
		id: 0,
		width: 0,  //power-of-2
		height: 0, //power-of-2
	}

	// lineShader contains the OpenGL handles used for the grid drawing.
	this.lineShader = {
		program: 0,
		attrPos: 0,
		attrCol: 0
	};
}

Pixmap.prototype.constructor = Pixmap;

// listen dispatches events for pixmap
Pixmap.prototype.listen = function() {
	this.canvas.addEventListener('mousedown', function(evt) {
		this.onMouseDown(evt);
	}.bind(this), false);

	this.canvas.addEventListener('mouseup', function(evt) {
		this.onMouseUp(evt);
	}.bind(this), false);

	this.canvas.addEventListener('touchstart', function(evt) {
		this.onTouch(evt);
	}.bind(this), false);

	this.canvas.addEventListener('touchend', function(evt) {
		this.onTouchEnd(evt);
	}.bind(this), false);

	this.canvas.addEventListener('mousemove', function(evt) {
		this.onMouseMove(evt);
	}.bind(this), false);

	this.canvas.addEventListener('touchmove', function(evt) {
		this.onTouchMove(evt);
	}.bind(this), false);

	setInterval(function() {
		this.redraw
	}.bind(this), 15);
}

Pixmap.prototype.drawStart = function(x, y) {
	this.setPixel(pixelPos.x, pixelPos.y, 0xff, 0x00, 0x00, 0xff);
	this.applyPixels();
	this.mouseIsDown = true;
	this.redraw();
}

Pixmap.prototype.drawStop = function(x, y) {
	this.mouseIsDown = false;
}

Pixmap.prototype.drawTo = function(x, y) {
	this.line(this.lastPos.x, this.lastPos.y, x, y);
	this.setPixel(x, y, this.color);
	this.applyPixels();
	this.redraw();
}

// onMouseDown is called when the mouse is moved over the canvas.
Pixmap.prototype.onMouseDown = function(evt) {
	var mousePos = this.getMousePos(evt);
	pixelPos = this.screen2Pixel(mousePos);
	this.drawStart(pixelPos.x, pixelPos.y);
	this.lastPos = pixelPos;
}

// onMouseDown is called when the mouse button is pressed on the canvas.
Pixmap.prototype.onMouseMove = function(evt) {
	var mousePos = this.getMousePos(evt);
	var pixelPos = this.screen2Pixel(mousePos);
	if(this.mouseIsDown) {
		this.drawTo(pixelPos.x, pixelPos.y);
	}
	this.lastPos = pixelPos;
}

// onMouseUp is called when the mouse button is released on the canvas.
Pixmap.prototype.onMouseUp = function(evt) {
	var mousePos = this.getMousePos(evt);
	var pixelPos = this.screen2Pixel(mousePos);
	this.drawStop(pixelPos.x, pixelPos.y);
}

// onTouch is called when a new touch event occurs.
Pixmap.prototype.onTouch = function(evt) {
	var touchPos = this.getTouchPos(evt);
	var pixelPos = this.screen2Pixel(touchPos);
	this.drawStop(pixelPos.x, pixelPos.y);
}

// onTouchMove is called when touch movement occurs.
Pixmap.prototype.onTouchMove = function(evt) {
	var mousePos = this.getTouchPos(evt);
	var pixelPos = this.screen2Pixel(mousePos);
	if(this.mouseIsDown) {
		this.drawTo(pixelPos.x, pixelPos.y);
	}
	this.lastPos = pixelPos;
}

// onTouchEnd is called when a touch event ends.
Pixmap.prototype.onTouchEnd = function(evt) {
	this.mouseIsDown = false;
}

// screen2Pixel returns the pixel coordinate at the given screen (mouse) coord.
Pixmap.prototype.screen2Pixel = function(pos) {
	return {
		x: Math.floor((pos.x / this.canvas.width) * this.width),
		y: Math.floor((pos.y / this.canvas.height) * this.height)
	};
}

// getMousePos returns the mouse position given the canvas' mouse event.
Pixmap.prototype.getMousePos = function(evt) {
	var rect = this.canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

// getTouchPos returns the touch position given the canvas' touch event.
Pixmap.prototype.getTouchPos = function(evt) {
	return {
		x: evt.changedTouches[0].pageX,
		y: evt.changedTouches[0].pageY
	};
}


// setColor sets the pen color.
Pixmap.prototype.setColor = function(color) {
	this.color = {r: color.r, g: color.g, b: color.b};
}

// line draws a line from (x0, y0) to (x1, y1).
Pixmap.prototype.line = function(x0, y0, x1, y1) {
	var dx = Math.abs(x1-x0);
	var dy = Math.abs(y1-y0);
	var sx = (x0 < x1) ? 1 : -1;
	var sy = (y0 < y1) ? 1 : -1;
	var err = dx-dy;
	var e2 = 0

	//draw the line (bresenham)	   
	while(true){
		this.setPixel(x0, y0, this.color);
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
	this.redraw();
};

// start begins the app.
Pixmap.prototype.start = function() {
	this.canvas = document.getElementById("pixmap");
	this.canvas.style.cursor = "crosshair";
	this.initWebGL(this.canvas);      // Initialize the GL context
	// Only continue if WebGL is available and working
	if (gl) {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
		gl.clearDepth(1.0);                 // Clear everything
		gl.enable(gl.DEPTH_TEST);           // Enable depth testing
		gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

		// init the pixmap
		this.initShaders();
		this.initTextures();
		this.initBuffers();

		// create the grids
		this.majorGrid = new Grid(8, 8, this.width, this.height, 2,
				{r: 1.0, g: 1.0, b: 1.0, a: 0.2});
		this.minorGrid = new Grid(1, 1, this.width, this.height, 1,
			       	{r: 1.0, g: 1.0, b: 1.0, a: 0.05});
	}
	// set up event handlers
	this.mouseIsDown = false;
	this.mousePos = {x: 0, y: 0};
	this.listen();

	this.redraw();
}

// initWebGL gets the OpenGL context from our canvas.
Pixmap.prototype.initWebGL = function() {
	gl = null;
	try {
		gl = this.canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	} catch(e) {
	}
	if (!gl) {
		alert("Unable to initialize WebGL. Your shitty browser may not support it.");
		gl = null;
	}
}

// initShaders initializes the pixmap and line (grid) shader programs.
Pixmap.prototype.initShaders = function() {
	this.pixmapShader = new Shader("shader-vs", "shader-fs");

	// set vertex attributes for the pixmap shader
	gl.useProgram(this.pixmapShader.program);
	this.pixmapShader.attrPos = gl.getAttribLocation(this.pixmapShader.program, "aVertexPosition");
	gl.enableVertexAttribArray(this.pixmapShader.attrPos);
	this.pixmapShader.attrTex = gl.getAttribLocation(this.pixmapShader.program, "aTextureCoord");
	gl.enableVertexAttribArray(this.pixmapShader.attrTex);
}


// applyPixels updates the pixmap.
Pixmap.prototype.applyPixels = function() {
	gl.bindTexture(gl.TEXTURE_2D, this.tex.id);
	gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, this.pixels);
}

// setPixel sets the pixel at (x, y) to the color c.
Pixmap.prototype.setPixel = function(x, y, c) {
	if(x < 0 || x > this.width || y < 0 || y > this.height) {
		return;
	}
	this.pixels[4 * (y * this.width + x)] = c.r;
	this.pixels[4 * (y * this.width + x) + 1] = c.g;
	this.pixels[4 * (y * this.width + x) + 2] = c.b;
	this.pixels[4 * (y * this.width + x) + 3] = 0xff;
}

// initTextures creates the texture that the pixmap is rendered with.
Pixmap.prototype.initTextures = function() {
	// get the nearest power of two for the texture dimensions
	sz = this.width;
	if(this.width < this.height) {
		sz = this.height;
	}
	sz = Math.pow(2, Math.ceil(Math.log(sz) / Math.LN2));
	this.tex.height = this.tex.width = sz;

	// allocate the texture buffer
	this.tex.id = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.tex.id);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sz, sz, 0, gl.RGBA,
			gl.UNSIGNED_BYTE, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	// buffer a black screen
	color = {r:0, g:0, b:0, a:255};
	for(i = 0; i < this.height;  i++) {
		for(j = 0; j < this.width ; j++) {
			this.setPixel(j, i, color);
		}
	}
	this.applyPixels();
}

// initBuffers initializes the OpenGL VBO's.
Pixmap.prototype.initBuffers = function() {
	var vertices = [
		0.0, this.height, 0.0,
		this.width, this.height, 0.0,
		this.width, 0.0, 0.0,
		0.0, 0.0, 0.0
	];
	var texcos = [
		0.0, 0.0,
		this.width/this.tex.width, 0.0,
		this.width/this.tex.width, this.height/this.tex.height,
		0.0, this.height/this.tex.height
	];
	var indices = [
		0,1,2,0,2,3
	];

	this.pixmapShader.vertexVBO = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.pixmapShader.vertexVBO);
	gl.bufferData(gl.ARRAY_BUFFER,
			new Float32Array(vertices), gl.STATIC_DRAW);

	this.pixmapShader.texcoVBO = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.pixmapShader.texcoVBO);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcos),
		gl.STATIC_DRAW);

	this.pixmapShader.indexVBO = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.pixmapShader.indexVBO);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 
			new Uint16Array(indices), gl.STATIC_DRAW);
}


// drawMinorGrid renders the minor grid.
Pixmap.prototype.drawMinorGrid = function() {

}

// redraw updates the display by performing a new render.
Pixmap.prototype.redraw = function() {
	// Clear the canvas before we start drawing on it.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// create the canvas projection.
	perspectiveMatrix = makeOrtho(0.0, this.width, 0.0, this.height, 0.01, 100.0);

	// Set the drawing position to the "identity" point, which is
	loadIdentity();
	mvTranslate([-0.0, 0.0, -1.0]);
	// array, setting attributes, and pushing it to GL.
	gl.useProgram(this.pixmapShader.program);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.pixmapShader.vertexVBO);
	gl.vertexAttribPointer(this.pixmapShader.attrPos, 3, gl.FLOAT, false, 0, 0);

	// set the texture coordinates attribute for the vertices.
	gl.bindBuffer(gl.ARRAY_BUFFER, this.pixmapShader.texcoVBO);
	gl.vertexAttribPointer(this.pixmapShader.attrTex, 2, gl.FLOAT, false, 0, 0);

	// map the texture
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.tex.id);
	gl.uniform1i(gl.getUniformLocation(this.pixmapShader.program, "uSampler"), 0);

	// draw the canvas.
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.pixmapShader.indexVBO);
	setMatrixUniforms(this.pixmapShader.program);
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

	// draw the grid(s)
	if(this.minorGridOn) {
		this.minorGrid.draw();
	}
	if(this.majorGridOn) {
		this.majorGrid.draw();
	}
}

setupControls = function() {
	document.getElementById("showMajor").addEventListener('click', 
	function(evt) {
		pixmap.majorGridOn = !pixmap.majorGridOn;
		if(pixmap.majorGridOn) {
			evt.target.style.color = "black";
		} else {
			evt.target.style.color = "grey";
		}
		pixmap.redraw();
	});

	document.getElementById("showMinor").addEventListener('click', 
	function(evt) {
		pixmap.minorGridOn = !pixmap.minorGridOn;
		if(pixmap.minorGridOn) {
			evt.target.style.color = "black";
		} else {
			evt.target.style.color = "grey";
		}
		pixmap.redraw();
	});
}

var pixmap = new Pixmap()
pixmap.start();
pixmap.redraw();
setupControls();
