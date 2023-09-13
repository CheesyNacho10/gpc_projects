// Crear contexto de weGL básico
var canvas = document.getElementById("canvas");
var gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL not supported");
}

// Borrar el canvas

gl.clearColor(0, 0, 1, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

// Crear shaders
const vertexShader = `#version 300 es
    precision mediump float;
    in vec2 position;
    in vec3 color;
    out vec3 vColor;
    void main() {
        gl_Position = vec4(position, 0, 1);
        vColor = color;
    }`;

const fragmentShader = `#version 300 es  
    precision mediump float;
    out vec4 fragColor;
    in vec3 vColor;
    void main() {
        fragColor = vec4(vColor, 1);
    }`;

// Compilar shaders
const vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vertexShader);
gl.compileShader(vs);
if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(vs));
}

const fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fragmentShader);
gl.compileShader(fs);
if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(fs));
}

// Crear programa
const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
}

gl.useProgram(program);

// Crear vertices
const vertices = [
    -0.5, 0.5,
    -0.5, -0.5,
    0.5, 0.5,
    0.5, -0.5
];

const colors = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
    1, 1, 0
];

// Crear buffer
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
const position = gl.getAttribLocation(program, 'position');
gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(position);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
const color = gl.getAttribLocation(program, 'color');
gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(color);

// Dibujar
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
