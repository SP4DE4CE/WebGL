var canvas;
var gl;
var ColorLocation;
var points = [];
var num = 0;
var initialized = false;
var numTimesToSubdivide = 0;

var colorPalette = [
       
        rgb( 255, 0, 0 ),
        rgb( 0, 255, 0 ),
        rgb( 0, 0, 255 ),
        rgb( 255, 255, 0 ),
        rgb( 0, 255, 255 ),
        rgb( 255, 0, 255 ),
        rgb( 0, 0, 0 )
    ];

function rgb( r, g, b )   // returns array of normalized rgb values
{
    return [ r, g, b ];
}

function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // First, initialize the corners of our gasket with three points.


    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 16000000, gl.STATIC_DRAW );
    

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

        document.getElementById("slider").onchange = function(event) {
        numTimesToSubdivide = parseInt(event.target.value);
    };

    
    ColorLocation = gl.getUniformLocation(program, "uColor");

    document.getElementById("colorButton").onclick = function() { 
        var myColor = colorPalette[num%colorPalette.length];
        num++;
        gl.uniform4f(ColorLocation, myColor[0]/255.0, myColor[1]/255.0, myColor[2]/255.0, 1.0);

     };
     gl.uniform4f(ColorLocation, 0.0, 0.0, 0.0, 1.0);

    render();
};

function square( a, b, c, d )
{
    points.push( a, b, c );
    points.push( a, c, d );
}

function divideRectangle( a, b, c, d, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        square( a, b, c, d );
    }
    else {

        //bisect the sides

        var ab1 = mix( a, b, 1/3 );
        var ab2 = mix( a, b, 2/3 );
        var bc1 = mix( b, c, 1/3 );
        var bc2 = mix( b, c, 2/3 );
        var cd1 = mix( c, d, 1/3 );
        var cd2 = mix( c, d, 2/3 );
        var da1 = mix( d, a, 1/3 );
        var da2 = mix( d, a, 2/3 );
        var p0 = mix(ab1, cd2, 1/3);
        var p1 = mix(ab2, cd1, 1/3);
        var p2 = mix(ab2, cd1, 2/3);
        var p3 = mix(ab1, cd2, 2/3);
        --count;

        // three new triangles

        divideRectangle( a, ab1, p0, da2, count ); //lower left
        divideRectangle( ab1, ab2, p1, p0, count ); //lower middle
        divideRectangle( ab2, b, bc1, p1, count ); //lower right
        divideRectangle( da2, p0, p3, da1, count ); //middle left
        //divideRectangle( p0, p1, p2, p3, count ); //middle
        divideRectangle( p1, bc1, bc2, p2, count ); // middle right
        divideRectangle( da1, p3, cd2, d, count ); //upper left
        divideRectangle( p3, p2, cd1, cd2, count ); //upper middle
        divideRectangle( p2, bc2, c, cd1, count ); //upper right

    }
}

window.onload = init;

function render()
{
    
    points = [];

    var vertices = [
        vec2( -1, -1 ),
        vec2( -1,  1 ),
        vec2(  1,  1 ),
        vec2(  1, -1 )
    ];
    divideRectangle( vertices[0], vertices[1], vertices[2], vertices[3],
                    numTimesToSubdivide );

    gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(points) );

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );

    requestAnimFrame( render );
}