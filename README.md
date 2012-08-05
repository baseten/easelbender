EaselBender
===========

Brings PixelBender style filters to EaselJS, with the help of GLSL and Three.js

This is more of a proof of concept than anything else. But perhaps it might
spark off some things ;)

I recently tried to recreate an animation coded in AS3 with the HTML5 Canvas API,
specifically using the EaselJS framework. The framework is great, but I couldn't
get an effect to render at anywhere near a decent framerate (A Canvas limitation
not EaselJS's). This effect was originally written in PixelBender, and since
PixelBender was massively inspired by GLSL in the first place, I wondered if I
could create a reusable filter for EaselJS that leveraged GLSL via WebGL (and
Three.js). So after a day's tinkering here is EaselBender.

Using Three.js is overkill really, but I had some knowledge of it and so could work
relatively quickly. If I feel up to it I might attempt to convert things to raw
WebGL calls... Or someone else can ;)

### How it works ###

- GLSLFilter.js extends the EaselJS Filter class
- When added as a filter to a DisplayObject, it's applyFilter method will be called
when that DisplayObject's cache is updated
- applyFilter takes the DisplayObject's (cached) canvas context and uses it as a
texture input for a user defined GLSL Fragment Shader
- This Fragment Shader is used to render a full screen quad in an offscreen
WebGL canvas context
- The existing EaselJS (cached) canvas context is cleared and drawImage is used
to fill it with the rendered WebGL canvas

### Example ###

See the example folder for more info, but basically like this:

```html
<script>
// uniforms are provided in standard Three.js format
// no need to supply a uniform for the texture input or it's width and height
// this is done internally by GLSLFilter
var uniforms = {
	'fDimension': {'type': 'f', 'value': 1.0}
};

// get the fragment shader text (here from a script tag in the html)
var fragmentShader = $('#fragmentShader').text();

// parameters for the Three.js renderTarget
var params = {
	'minFilter': THREE.NearestFilter,
	'magFilter': THREE.NearestFilter,
	'format': THREE.RGBAFormat,
	'stencilBuffer': false
};

var filter = new GLSLFilter(uniforms, fragmentShader, params);

// where stage is an EaselJS Stage instance and width and height are it's dimensions
// a cache is required by EaselJS for filters to appear
stage.filters = [filter];
stage.cache(0, 0, width, height);

// in order to animate the uniforms can be updated through the filter's shader property
// can easily be Tweened if desired
// stage.updateCache() is necessary for EaselJS to show the new canvas as is stage.tick()
function tick() {
	filter.shader.uniforms.fDimension.value++
	stage.updateCache();
	stage.tick();
}
</script>
```

### Known Issues ###

- <del>Current implementation won't work with animating canvases! Obviously this
massively effects the usefulness of the filter... Will fix ASAP!</del>
- <del>Resizing currently doesn't work correctly due to the different ways it is handled
by Three.js and EaselJS and I haven't spent the time trying to figure it out</del>
- In GLSLFilter's applyFilter method I'm having to reset the transform on EaselJS's
canvas context using targetCtx.setTransform(1, 0, 0, 1, 0, 0), otherwise the drawImage
call puts the WebGL output in completely the wrong place. I'm not sure why this
is as I'm not setting the transform anywhere myself. Doing this seems OK, but I'm
not sure if it will interfere with anything should these transforms be explicitly
set

### Change log ###

r2 05/08/2012

- Moved Three.js Renderer to static property of GLSLFilter
- Added GLSLFilter.hasWebGL static property to allow testing for availability
- If WebGL is not available filter will gracefully degrade and do nothing
- Moved texture input width and height uniforms into GLSLFilter
- Resizing now handled internally by GLSLFilter
- Example updated to reflect changes

r1 03/08/2012

- Initial release