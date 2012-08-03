// author Alex Prokop
// www.baseten.co.uk
var LogoLoader = function () {
	this.width = 0;
	this.height = 0;
	this.stageHeight = 0;
	this.x = 0;
	this.y = 0;
	this.dy = 0;
	this.bitmap = null;
	this.background = null;
	this.animStep = 2;
	
	this.onImageLoadedCallback = null;
	this.onAnimationCompleteCallback = null;
}

LogoLoader.prototype.load = function (src) {
	var self = this;
	
	var $img = $('<img />').bind('load', function (e) {
		self.onImageLoaded(e);
	}).attr('src', src);
}

LogoLoader.prototype.onImageLoaded = function (e) {
	var img = e.target;
	
	$(img).unbind('load');
	
	this.width = img.width;
	this.height = img.height;
	
	this.background = new Bitmap(img);
	
	this.bitmap = new Bitmap(img);
	this.bitmap.snapToPixel = true;
	this.bitmap.sourceRect = new Rectangle(0,0,this.width,1);
	
	if($.isFunction(this.onImageLoadedCallback)) {
		this.onImageLoadedCallback.call(this);
	}
}

LogoLoader.prototype.update = function () {	
	if(!this.bitmap) return;
	
	var height;
	
	this.dy = this.bitmap.sourceRect.y;
	
	if(this.dy + this.animStep < this.height) {
		this.dy += this.animStep;
		
		height = this.stageHeight > this.height ? this.stageHeight : this.height;
		
		this.bitmap.y = this.y + this.dy;
		this.bitmap.sourceRect.y = this.dy;
		this.bitmap.scaleY = height - this.dy;
		this.bitmap.scaleY = this.bitmap.scaleY >= 1 ? this.bitmap.scaleY : 1;
	}
	else {
		if($.isFunction(this.onAnimationCompleteCallback)) {
			this.onAnimationCompleteCallback.call(this);
		}
	}
}

LogoLoader.prototype.onResize = function (stageWidth, stageHeight) {
	this.stageHeight = stageHeight;
	
	this.x = (stageWidth - this.width) >> 1;
	this.y = (stageHeight - this.height) >> 1;
	
	if(this.bitmap) {
		this.bitmap.x = this.x;
		this.bitmap.y = this.y + this.dy;
	}
	if(this.background) {
		this.background.x = this.x;
		this.background.y = this.y;
	}
}