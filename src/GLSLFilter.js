// author - Alex Prokop
// www.baseten.co.uk
var GLSLFilter = function (renderer, uniforms, fragmentShader, params) {
	
	this.renderer = renderer;
	
	this.uniforms = uniforms;
	this.fragmentShader = fragmentShader;
	this.params = params;
	
	this.texture = new THREE.Texture();
	this.texture.generateMipmaps = false;
	this.texture.minFilter = params.minFilter !== undefined ? params.minFilter : THREE.LinearFilter;
	this.texture.magFilter = params.magFilter !== undefined ? params.magFilter : THREE.LinearFilter;
	this.texture.format = params.format !== undefined ? params.format : THREE.RGBAFormat;
	this.texture.needsUpdate = true;
	
	var shader = {
		'uniforms': this.uniforms,
		
		'vertexShader': [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2(uv.x, uv.y);",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),
		
		'fragmentShader': fragmentShader
	};
	
	this.shader = new THREE.ShaderPass(shader, 'tInput');
	this.shader.uniforms.tInput = {type: 't', value: 0, texture: null};
	this.shader.renderToScreen = true;
			
	this.effectComposer = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(renderer.domElement.width, renderer.domElement.height, params));
	this.effectComposer.renderTarget2 = this.texture;
	this.effectComposer.addPass(this.shader);
}

GLSLFilter.prototype = new Filter();
GLSLFilter.prototype.constructor = GLSLFilter;

/**
 * Returns a rectangle with values indicating the margins required to draw the filter.
 * For example, a filter that will extend the drawing area 4 pixels to the left, and 7 pixels to the right
 * (but no pixels up or down) would return a rectangle with (x=-4, y=0, width=11, height=0).
 * @method getBounds
 * @return {Rectangle} a rectangle object indicating the margins required to draw the filter.
 **/
GLSLFilter.prototype.getBounds = function () {
	return new Rectangle(0, 0, 0, 0);
}

/**
 * Applies the filter to the specified context.
 * @method applyFilter
 * @param ctx The 2D context to use as the source.
 * @param x The x position to use for the source rect.
 * @param y The y position to use for the source rect.
 * @param width The width to use for the source rect.
 * @param height The height to use for the source rect.
 * @param targetCtx Optional. The 2D context to draw the result to. Defaults to the context passed to ctx.
 * @param targetX Optional. The x position to draw the result to. Defaults to the value passed to x.
 * @param targetY Optional. The y position to draw the result to. Defaults to the value passed to y.
 **/
GLSLFilter.prototype.applyFilter = function(ctx, x, y, width, height, targetCtx, targetX, targetY) {
	targetCtx = targetCtx || ctx;
	
	if(targetX == null) { targetX = x; }
	if(targetY == null) { targetY = y; }
	
	this.texture.image = ctx.canvas;
			
	this.effectComposer.renderTarget1.width = width;
	this.effectComposer.renderTarget1.height = height;
	this.effectComposer.render();
		
	// seem to need to reset the transform, otherwise drawImage occurs in completely the wrong place
	// not sure where it's been changed in the first place though!?
	targetCtx.setTransform(1, 0, 0, 1, 0, 0);
	targetCtx.clearRect(0, 0, width, height);
	targetCtx.drawImage(this.renderer.domElement, 0, 0);
}

GLSLFilter.prototype.clone = function () {
	return new GLSLFilter(this.renderer, this.uniforms, this.fragmentShader, this.params);
}

GLSLFilter.prototype.toString = function () {
	return "[GLSLFilter (name="+  this.name +")]";
}