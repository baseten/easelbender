// author Alex Prokop
// www.baseten.co.uk

var $canvas, $window, logo, stage, stats, width, height, pixelFilter, renderer;

function main() {
	$canvas = $('#logo');
	$window = $(window);
	
	renderer = new THREE.WebGLRenderer();
	//$(renderer.domElement).attr('id', 'webgl');
	//$('body').append(renderer.domElement);
		
	logo = new LogoLoader();
	
	logo.onImageLoadedCallback = function () {
		onLogoLoaded();
	}
	
	logo.onAnimationCompleteCallback = function () {
		onAnimationComplete();
	}
	
	logo.load($canvas.attr('data-image'));
}

function onLogoLoaded() {
	logo.onImageLoadedCallback = null;
	
	stage = new Stage($canvas[0]);
	stage.addChild(logo.background);
	stage.addChild(logo.bitmap);
				
	$window.resize(onResize);
	onResize();
	
	logo.update();
	
	Ticker.setFPS(60);
	Ticker.useRAF = true;
	Ticker.addListener(updateLoad);
}

function onResize() {
	width = $window.width();
	height = $window.height();
		
	renderer.setSize(width, height);
	
	if(pixelFilter) {
		pixelFilter.shader.uniforms.tWidth.value = width;
		pixelFilter.shader.uniforms.tHeight.value = height;
		stage.cache(0, 0, width, height);
	}
		
	$canvas.width(width);
	$canvas.height(height);
	$canvas[0].width = width;
	$canvas[0].height = height;
	
	logo.onResize(width, height);
}

function onAnimationComplete() {
	logo.onAnimationCompleteCallback = null;
	
	stage.removeChild(logo.bitmap);
	logo.bitmap = null;
	
	// setup filter
	
	var uniforms = {
		'tWidth': {'type': 'i', 'value': width},
		'tHeight': {'type': 'i', 'value': height},
		'fDimension': {'type': 'f', 'value': 1.0}
	};
	
	var fragmentShader = $('#fragmentShader').text();
	
	var params = {
		'minFilter': THREE.NearestFilter,
		'magFilter': THREE.NearestFilter,
		'format': THREE.RGBAFormat,
		'stencilBuffer': false
	};
	
	pixelFilter = new GLSLFilter(renderer, uniforms, fragmentShader, params);
	
	stage.filters = [pixelFilter];
	stage.cache(0, 0, width, height);
	
	var target = height > logo.width ? height : logo.width;
	
	Ticker.removeListener(updateLoad);
	Ticker.addListener(updatePixel);
	
	TweenLite.to(pixelFilter.shader.uniforms.fDimension, 2.5, {value:target, delay:0.5, ease:Quint.easeIn, onComplete:onPixellationComplete});
}

function updateLoad() {
	logo.update();
	stage.tick();
}

function updatePixel() {
	stage.updateCache();
	stage.tick();
}

function onPixellationComplete() {	
	Ticker.removeListener(updatePixel);
}

$(document).ready(main);