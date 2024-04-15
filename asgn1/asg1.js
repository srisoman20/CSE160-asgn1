// Srinidhi Somangili
// sksomang@ucsc.edu


// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position; 
  uniform float u_Size;
  void main() {
    gl_Position = a_Position; 
    //gl_PointSize = 20.0;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

  // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

  // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

// constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// globals related to UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_selectedSegs = 6;

// set up actions for HTML UI elements
function addActionsForHtmlUI() {
    // button events 
    document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; };
    document.getElementById('red').onclick = function() { g_selectedColor = [1.0,0.0,0.0,1.0]; };
    // clear
    document.getElementById('clearButton').onclick = function() {g_shapesList=[]; renderAllShapes(); };

    document.getElementById('pointButton').onclick = function() { g_selectedType = POINT };
    document.getElementById('triButton').onclick = function() { g_selectedType = TRIANGLE };
    document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE };

    // color slider events
    document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });
    document.getElementById('transSlide').addEventListener('mouseup', function() { g_selectedColor[3] = this.value/100; });

    // size slider events
    document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });

    // num segments in circle event
    document.getElementById('segSlide').addEventListener('mouseup', function () { g_selectedSegs = this.value; });
}

function main() {
  
    // set up canvas and GL vars
    setupWebGL();
    // set up GLSL shaders programs + connect GLSL vars
    connectVariablesToGLSL();

    // set up actions for HTML UI elements
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    //canvas.onmousemove = click;
    canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);  
}

// class Point {
//     constructor() {
//         this.type='point';
//         this.position = [0.0,0.0,0.0];
//         this.color = [1.0,1.0,1.0,1.0];
//         this.size = 5.0;
//     }

//     render() {
//         var xy = this.position;
//         var rgba = this.color;
//         var size = this.size;
//         // var xy = g_shapesList[i].position;
//         // var rgba = g_shapesList[i].color;
//         // var size = g_shapesList[i].size;

//         // Pass the position of a point to a_Position variable
//         gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
//         // Pass the color of a point to u_FragColor variable
//         gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
//         // Pass the size of a point to u_Size variable
//         gl.uniform1f(u_Size, size);

//         // Draw
//         gl.drawArrays(gl.POINTS, 0, 1);
//     }
// }

var g_shapesList = [];
// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = []; // The array to store the size of a point

function click(ev) {
  
    // extract event click + return it in WebGL coords
    let [x,y] = convertCoordinatesEventToGL(ev);

    // create + store new point
    let point;
    if (g_selectedType==POINT) {
        point = new Point();
    } else if (g_selectedType==TRIANGLE) {
        point = new Triangle();
    } else {
        point = new Circle();
        point.segments = g_selectedSegs;
    }
    point.position=[x, y];
    point.color = g_selectedColor.slice()
    point.size = g_selectedSize;
    g_shapesList.push(point)

    // // Store the coordinates to g_points array
    // g_points.push([x, y]);

    // // Store the color to g_colors array
    // g_colors.push(g_selectedColor.slice());

    // // Store the size to the g_sizes array
    // g_sizes.push(g_selectedSize);

    // Store the coordinates to g_points array
    // if (x >= 0.0 && y >= 0.0) {      // First quadrant
    //     g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
    // } else if (x < 0.0 && y < 0.0) { // Third quadrant
    //     g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
    // } else {                         // Others
    //     g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
    // }

    // draw every shape that should be in canvas
    renderAllShapes();
}

// extract event click + return it in WebGL coords
function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return ([x, y]);
}

// draw every shape that should be in canvas
function renderAllShapes() {
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;
    for(var i = 0; i < len; i++) {
        g_shapesList[i].render();

        // var xy = g_shapesList[i].position;
        // var rgba = g_shapesList[i].color;
        // var size = g_shapesList[i].size;

        // // var xy = g_points[i];
        // // var rgba = g_colors[i];
        // // var size = g_sizes[i];

        // // Pass the position of a point to a_Position variable
        // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // // Pass the color of a point to u_FragColor variable
        // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // // Pass the size of a point to u_Size variable
        // gl.uniform1f(u_Size, size);

        // // Draw
        // gl.drawArrays(gl.POINTS, 0, 1);
    }
}