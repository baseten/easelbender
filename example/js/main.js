// author Alex Prokop
// www.baseten.co.uk

var $canvas, $window, $img, imageWidth, imageHeight, loaderAnimHeight, bitmap, stage, width, height, loaderFilter, loaderPosition, pixelFilter;
//var stats;

function main() {
	$canvas = $('#logo');
	$window = $(window);
	
	//$('body').append($(GLSLFilter.renderer.domElement).attr('id', 'webgl'));
	
	//stats = new Stats();
	//$(stats.domElement).attr('id', 'stats');
	//$('body').append(stats.domElement);
	
	$img = $('<img />').bind('load', onImageLoaded).attr('src', $canvas.attr('data-image'));
}

function onImageLoaded(e) {
	$img.unbind('load');
	
	imageWidth = $img[0].width;
	imageHeight = $img[0].height;
	
	bitmap = new Bitmap($img[0]);
	bitmap.snapToPixel = true;
	
	stage = new Stage($canvas[0]);
	stage.addChild(bitmap);
	
	setupLoaderFilter();
	stage.filters = [loaderFilter];
	
	$window.bind('resize', onResize);
	onResize();
			
	Ticker.setFPS(60);
	Ticker.useRAF = true;
	Ticker.addListener(updateLoaderAnimation);
}

function setupLoaderFilter() {
	loaderPosition = 0;
	
	var uniforms = {
		'fPosition': {'type': 'f', 'value': 0}
	};
	
	var fragmentShader = $('#loaderFragmentShader').text();
	
	var params = {
		'minFilter': THREE.NearestFilter,
		'magFilter': THREE.NearestFilter,
		'format': THREE.RGBAFormat,
		'stencilBuffer': false
	};
	
	loaderFilter = new GLSLFilter(uniforms, fragmentShader, params);
}

function updateLoaderAnimation() {	
	if(loaderPosition + 2 < imageHeight) {
		loaderPosition += 2;
		loaderFilter.shader.uniforms.fPosition.value = loaderPosition;
	}
	else {
		onLoaderAnimationComplete();
		return;
	}
	
	// updateCache seems to break positioning?
	stage.cache(bitmap.x, bitmap.y, imageWidth, loaderAnimHeight);
	stage.tick();
	//stats.update();
}

function onLoaderAnimationComplete() {
	Ticker.removeListener(updateLoaderAnimation);
	
	loaderFilter = null;
	
	setupPixelFilter();
	stage.filters = [pixelFilter];
	stage.cache(0, 0, width, height);
		
	var target = height > imageWidth ? height : imageWidth;
	
	Ticker.addListener(updatePixelAnimation);
	
	if(GLSLFilter.hasWebGL) {
		TweenLite.to(pixelFilter.shader.uniforms.fDimension, 2.5, {value:target, delay:0.5, ease:Quint.easeIn, onComplete:onPixelAnimationComplete});
	}
}

function setupPixelFilter() {	
	var uniforms = {
		'fDimension': {'type': 'f', 'value': 1.0}
	};
	
	var fragmentShader = $('#pixelFragmentShader').text();
	
	var params = {
		'minFilter': THREE.NearestFilter,
		'magFilter': THREE.NearestFilter,
		'format': THREE.RGBAFormat,
		'stencilBuffer': false
	};
	
	pixelFilter = new GLSLFilter(uniforms, fragmentShader, params);
}

function updatePixelAnimation() {
	stage.updateCache();
	stage.tick();
	//stats.update();
}

function onPixelAnimationComplete() {	
	Ticker.removeListener(updatePixelAnimation);
	
	stage.removeChild(bitmap);	
	stage.filters = [];
	stage.updateCache();
	stage.update();
}

function onResize() {
	width = $window.width();
	height = $window.height();
		
	$canvas[0].width = width;
	$canvas[0].height = height;
			
	bitmap.x = (width - imageWidth) >> 1;
	bitmap.y = (height - imageHeight) >> 1;
	
	loaderAnimHeight = height - bitmap.y;
	
	if(loaderFilter && GLSLFilter.hasWebGL) {
		loaderFilter.shader.uniforms.fPosition.value = loaderPosition;	
	}
	
	if(loaderFilter) {
		stage.cache(bitmap.x, bitmap.y, imageWidth, loaderAnimHeight);
	}
	else if(pixelFilter) {
		stage.cache(0, 0, width, height);
	}
}

$(document).ready(main);