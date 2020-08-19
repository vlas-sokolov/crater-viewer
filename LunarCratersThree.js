import { OrbitControls } from 'https://unpkg.com/three@0.119.1/examples/jsm/controls/OrbitControls.js';

var container;
var camera, scene, renderer, controls;
var mesh, texture;

function init3D() {
    container = document.getElementById( 'container' );
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xbfd1e5 );
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    camera.position.y = 0;
    camera.position.z = 10000;

    // Controls
    controls = new OrbitControls( camera, renderer.domElement );

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    //controls.minDistance = 100;
    //controls.maxDistance = 500;

    controls.maxPolarAngle = Math.PI / 2;

    window.addEventListener( 'resize', onWindowResize, false );
}

function initMesh(arrayData, scalingFactor) {
    var { width, height } = arrayData;
    var heightMap = arrayData['0'];

    var geometry = new THREE.PlaneBufferGeometry( 7500, 7500, width - 1, height - 1 );
    geometry.rotateX( - Math.PI / 2 );

    var vertices = geometry.attributes.position.array;

    for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
        vertices[ j + 1 ] = heightMap[ i ] * scalingFactor;
    }

    texture = new THREE.CanvasTexture( generateTexture( heightMap, width, height ) );
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    var material = new THREE.MeshBasicMaterial( { map: texture } )

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    container.appendChild( renderer.domElement );
}

init3D();
animate();

//var url = "http://0.0.0.0:8000/data/tycho.tif";
var url = "http://0.0.0.0:8000/data/kepler.tif";

fetch( url ).then( response => response.arrayBuffer() )
    .then( GeoTIFF.fromArrayBuffer )
    .then( tiff => tiff.getImage() )
    .then( image => image.readRasters() )
    .then( data => initMesh(data, 0.3) );

function animate() {
    requestAnimationFrame( animate );
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    render();
}

function render() {
    renderer.render( scene, camera );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

// Taken from the tutorial example - should get the API to make a texture in numpy instead
function generateTexture( data, width, height ) {
    var canvas, canvasScaled, context, image, imageData, vector3, sun, shade;

    vector3 = new THREE.Vector3( 0, 0, 0 );

    sun = new THREE.Vector3( 1, 1, 1 );
    sun.normalize();

    canvas = document.createElement( 'canvas' );
    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext( '2d' );
    context.fillStyle = '#000';
    context.fillRect( 0, 0, width, height );

    image = context.getImageData( 0, 0, canvas.width, canvas.height );
    imageData = image.data;

    // Never fully got what exactly the color vars control - all the more reason for a rewrite!
    var topColor = 96;
    var bottomColor = 32;
    var scalingData = 0.0002;
    var scalingOffset = 1;
    var shadeFactor = 1.2;

    for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {
        vector3.x = data[ j - 2 ] - data[ j + 2 ];
        vector3.y = 2;
        vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
        vector3.normalize();

        shade = vector3.dot( sun ) * shadeFactor;

        imageData[ i ] = ( topColor + shade * 128 ) * ( scalingOffset + data[ j ] * scalingData );
        imageData[ i + 1 ] = ( bottomColor + shade * topColor ) * ( scalingOffset + data[ j ] * scalingData );
        imageData[ i + 2 ] = ( shade * topColor ) * ( scalingOffset + data[ j ] * scalingData );
    }

    context.putImageData( image, 0, 0 );

    // Scaled 4x
    canvasScaled = document.createElement( 'canvas' );
    canvasScaled.width = width * 4;
    canvasScaled.height = height * 4;

    context = canvasScaled.getContext( '2d' );
    context.scale( 4, 4 );
    context.drawImage( canvas, 0, 0 );

    image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
    imageData = image.data;

    for ( var i = 0, l = imageData.length; i < l; i += 4 ) {
        var v = ~ ~ ( Math.random() * 5 );

        imageData[ i ] += v;
        imageData[ i + 1 ] += v;
        imageData[ i + 2 ] += v;
    }

    context.putImageData( image, 0, 0 );

    return canvasScaled;
}
