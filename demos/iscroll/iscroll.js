/**
 * 
 * Find more about the scrolling function at
 * http://cubiq.org/iscroll
 *
 * Copyright (c) 2009 Matteo Spinelli, http://cubiq.org/
 * Released under MIT license
 * http://cubiq.org/dropbox/mit-license.txt
 * 
 * Version 3.4.5 - Last updated: 2010.07.04
 * 
 */

(function(){
function iScroll (el, options) {
	this.element = typeof el == 'object' ? el : document.getElementById(el);
	this.wrapper = this.element.parentNode;

	this.element.style.webkitTransitionProperty = '-webkit-transform';
	this.element.style.webkitTransitionTimingFunction = 'cubic-bezier(0,0,0.25,1)';
	this.element.style.webkitTransitionDuration = '0';
	this.element.style.webkitTransform = has3d ? 'translate3d(0,0,0)' : 'translate(0,0)';

	// Default options
	this.options = {
		bounce: has3d,
		momentum: has3d,
		checkDOMChanges: true,
		topOnDOMChanges: false,
		hScrollbar: has3d,
		vScrollbar: has3d,
		fadeScrollbar: isIphone || isIpad || !isTouch,
		shrinkScrollbar: isIphone || isIpad,
		desktopCompatibility: false,
		overflow: 'auto'
	};
	
	// User defined options
	if (typeof options == 'object') {
		for (var i in options) {
			this.options[i] = options[i];
		}
	}
	
	if (this.options.desktopCompatibility) {
		this.options.overflow = 'hidden';
	}
	
	this.wrapper.style.overflow = this.options.overflow;
	
	this.refresh();

	window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', this, false);

	if (isTouch || this.options.desktopCompatibility) {
		this.element.addEventListener(START_EVENT, this, false);
	}
	
	if (this.options.checkDOMChanges) {
		this.element.addEventListener('DOMSubtreeModified', this, false);
	}
	
	if (!isTouch) {
		this.element.addEventListener('click', this, true);
	}
}

iScroll.prototype = {
	x: 0,
	y: 0,
	dist: 0,

	handleEvent: function (e) {
		switch (e.type) {
			case 'click':
				if (!e._fake) {
					// e.stopPropagation();
				}
				break;
			case START_EVENT:
				this.touchStart(e);
				break;
			case MOVE_EVENT:
				this.touchMove(e);
				break;
			case END_EVENT:
				this.touchEnd(e);
				break;
			case 'webkitTransitionEnd':
				this.transitionEnd(e);
				break;
			case 'orientationchange':
			case 'resize':
				this.refresh();
				break;
			case 'DOMSubtreeModified':
				this.onDOMModified(e);
				break;
		}
	},
	
	onDOMModified: function (e) {
		this.refresh();
		
		if (this.options.topOnDOMChanges && (this.x!=0 || this.y!=0)) {
			this.scrollTo(0,0,'0');
		}
	},

	refresh: function () {
		this.scrollWidth = this.wrapper.clientWidth;
		this.scrollHeight = this.wrapper.clientHeight;
		this.maxScrollX = this.scrollWidth - this.element.offsetWidth;
		this.maxScrollY = this.scrollHeight - this.element.offsetHeight;

		var resetX = this.x, resetY = this.y;
		if (this.scrollX) {
			if (this.maxScrollX >= 0) {
				resetX = 0;
			} else if (this.x < this.maxScrollX) {
				resetX = this.maxScrollX;
			}
		}
		if (this.scrollY) {
			if (this.maxScrollY >= 0) {
				resetY = 0;
			} else if (this.y < this.maxScrollY) {
				resetY = this.maxScrollY;
			}
		}
		if (resetX!=this.x || resetY!=this.y) {
			this.setTransitionTime('0');
			this.setPosition(resetX, resetY, true);
		}

		this.scrollX = this.element.offsetWidth > this.scrollWidth ? true : false;
		this.scrollY = !this.scrollX || this.element.offsetHeight > this.scrollHeight ? true : false;

		// Update horizontal scrollbar
		if (this.options.hScrollbar && this.scrollX) {
			this.scrollBarX = (this.scrollBarX instanceof scrollbar) ? this.scrollBarX : new scrollbar('horizontal', this.wrapper, this.options.fadeScrollbar, this.options.shrinkScrollbar);
			this.scrollBarX.init(this.scrollWidth, this.element.offsetWidth);
		} else if (this.scrollBarX) {
			this.scrollBarX = this.scrollBarX.remove();
		}

		// Update vertical scrollbar
		if (this.options.vScrollbar && this.scrollY && this.element.offsetHeight > this.scrollHeight) {
			this.scrollBarY = (this.scrollBarY instanceof scrollbar) ? this.scrollBarY : new scrollbar('vertical', this.wrapper, this.options.fadeScrollbar, this.options.shrinkScrollbar);
			this.scrollBarY.init(this.scrollHeight, this.element.offsetHeight);
		} else if (this.scrollBarY) {
			this.scrollBarY = this.scrollBarY.remove();
		}
	},

	setPosition: function (x, y, hideScrollBars) { 
		this.x = x;
		this.y = y;

		this.element.style.webkitTransform = has3d ? 'translate3d(' + this.x + 'px,' + this.y + 'px,0px)' : 'translate(' + this.x + 'px,' + this.y + 'px)';

		// Move the scrollbars
		if (!hideScrollBars) {
			if (this.scrollBarX) {
				this.scrollBarX.setPosition(this.x);
			}
			if (this.scrollBarY) {
				this.scrollBarY.setPosition(this.y);
			}
		}
	},
	
	setTransitionTime: function(time) {
		time = time || '0';
		this.element.style.webkitTransitionDuration = time;
		
		if (this.scrollBarX) {
			this.scrollBarX.bar.style.webkitTransitionDuration = time;
			this.scrollBarX.wrapper.style.webkitTransitionDuration = has3d && this.options.fadeScrollbar ? '300ms' : '0';
		}
		if (this.scrollBarY) {
			this.scrollBarY.bar.style.webkitTransitionDuration = time;
			this.scrollBarY.wrapper.style.webkitTransitionDuration = has3d && this.options.fadeScrollbar ? '300ms' : '0';
		}
	},
		
	touchStart: function(e) {
/*	    if (e.touches.length != 1) {
	        return false;
        }*/
		
		e.preventDefault();
		//e.stopPropagation();

		this.moved = false;
		this.dist = 0;

		this.setTransitionTime('0');

		// Check if the scroller is really where it should be
		if (this.options.momentum) {
			var matrix = new WebKitCSSMatrix(window.getComputedStyle(this.element).webkitTransform);
			if (matrix.e != this.x || matrix.f != this.y) {
				this.element.removeEventListener('webkitTransitionEnd', this, false);
				this.setPosition(matrix.e, matrix.f);
				this.moved = true;
			}
		}

		this.touchStartX = isTouch ? e.touches[0].pageX : e.pageX;
		this.scrollStartX = this.x;

		this.touchStartY = isTouch ? e.touches[0].pageY : e.pageY;
		this.scrollStartY = this.y;

		this.scrollStartTime = e.timeStamp;

		this.element.addEventListener(MOVE_EVENT, this, false);
		this.element.addEventListener(END_EVENT, this, false);
	},
	
	touchMove: function(e) {
/*		if (e.targetTouches.length != 1) {
			return false;
		}*/

		var pageX = isTouch ? e.touches[0].pageX : e.pageX,
			pageY = isTouch ? e.touches[0].pageY : e.pageY,
			leftDelta = this.scrollX === true ? pageX - this.touchStartX : 0,
			topDelta = this.scrollY === true ? pageY - this.touchStartY : 0,
			newX = this.x + leftDelta,
			newY = this.y + topDelta;

		this.dist+= Math.abs(this.touchStartX - pageX) + Math.abs(this.touchStartY - pageY);

		this.touchStartX = pageX;
		this.touchStartY = pageY;

//		this.moved = true;

		// Slow down if outside of the boundaries
		if (newX > 0 || newX < this.maxScrollX) { 
			newX = this.options.bounce ? Math.round(this.x + leftDelta / 3) : newX >= 0 ? 0 : this.maxScrollX;
		}
		if (newY > 0 || newY < this.maxScrollY) { 
			newY = this.options.bounce ? Math.round(this.y + topDelta / 3) : newY >= 0 ? 0 : this.maxScrollY;
		}

		if (this.dist > 5) {			// 5 pixels threshold is needed on Android, but also on iPhone looks more natural
			this.setPosition(newX, newY);
			this.moved = true;
		}

		// Prevent slingshot effect
		/*
		if( e.timeStamp-this.scrollStartTime > 250 ) {
			this.scrollStartX = this.x;
			this.scrollStartY = this.y;
			this.scrollStartTime = e.timeStamp;
		}*/
	},
	
	touchEnd: function(e) {
		this.element.removeEventListener(MOVE_EVENT, this, false);
		this.element.removeEventListener(END_EVENT, this, false);

/*
		if (e.targetTouches.length > 0) {
			return false;
		}
*/
		var time = e.timeStamp - this.scrollStartTime;
		
		if (!this.moved) {
			this.resetPosition();

			// Find the last touched element
			var target = isTouch ? e.changedTouches[0].target : e.target;
			while (target.nodeType != 1) {
				target = target.parentNode;
			}
			
			if (e.type === 'touchend') {
  			// Create the fake event
  			var ev = document.createEvent('MouseEvents');
  			ev.initMouseEvent("click", true, true, e.view, 1,
  				target.screenX, target.screenY, target.clientX, target.clientY,
  				e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
  				0, null);
  			ev._fake = true;
  			target.dispatchEvent(ev);

        return false;
			}
		}

		if (!this.options.momentum || time > 250) {			// Prevent slingshot effetct
			this.resetPosition();
			return false;
		}

		var momentumX = this.scrollX === true
			? this.momentum(this.x - this.scrollStartX,
							time,
							this.options.bounce ? -this.x + this.scrollWidth/5 : -this.x,
							this.options.bounce ? this.x + this.element.offsetWidth - this.scrollWidth + this.scrollWidth/5 : this.x + this.element.offsetWidth - this.scrollWidth)
			: { dist: 0, time: 0 };

		var momentumY = this.scrollY === true
			? this.momentum(this.y - this.scrollStartY,
							time,
							this.options.bounce ? -this.y + this.scrollHeight/5 : -this.y,
							this.options.bounce ? (this.maxScrollY < 0 ? this.y + this.element.offsetHeight - this.scrollHeight : 0) + this.scrollHeight/5 : this.y + this.element.offsetHeight - this.scrollHeight)
			: { dist: 0, time: 0 };

		if (!momentumX.dist && !momentumY.dist) {
			this.resetPosition();
			return false;
		}

		var newDuration = Math.max(Math.max(momentumX.time, momentumY.time), 1);		// The minimum animation length must be 1ms
		var newPositionX = this.x + momentumX.dist;
		var newPositionY = this.y + momentumY.dist;

		this.scrollTo(newPositionX, newPositionY, newDuration + 'ms');
	},
	
	transitionEnd: function () {
		this.element.removeEventListener('webkitTransitionEnd', this, false);
		this.resetPosition();
	},

	resetPosition: function (time) {
		var resetX = this.x,
		 	resetY = this.y,
			that = this,
			time = time || '500ms';

		if (this.x >= 0) {
			resetX = 0;
		} else if (this.x < this.maxScrollX) {
			resetX = this.maxScrollX;
		}

		if (this.y >= 0 || this.maxScrollY > 0) {
			resetY = 0;
		} else if (this.y < this.maxScrollY) {
			resetY = this.maxScrollY;
		}

		if (resetX != this.x || resetY != this.y) {
			this.scrollTo(resetX, resetY, time);
//			this.setTransitionTime(time);
//			this.setPosition(resetX, resetY);
		} else if (this.scrollBarX || this.scrollBarY) {
			// Hide the scrollbars
			if (this.scrollBarX) {
				this.scrollBarX.hide();
			}
			if (this.scrollBarY) {
				this.scrollBarY.hide();
			}
		}
	},

	scrollTo: function (destX, destY, runtime) {
		this.element.addEventListener('webkitTransitionEnd', this, false);	// At the end of the transition check if we are still inside of the boundaries
		this.setTransitionTime(runtime || '450ms');
		this.setPosition(destX, destY);
	},

	momentum: function (dist, time, maxDistUpper, maxDistLower) {
		var friction = 1.25,
			deceleration = 1.05,
			speed = Math.abs(dist) / time * 1000,
			newDist = speed * speed / friction / 1000,
			newTime = 0;

		// Proportinally reduce speed if we are outside of the boundaries 
		if (dist > 0 && newDist > maxDistUpper) {
			speed = speed * maxDistUpper / newDist / friction;
			newDist = maxDistUpper;
		} else if (dist < 0 && newDist > maxDistLower) {
			speed = speed * maxDistLower / newDist / friction;
			newDist = maxDistLower;
		}
		
		newDist = newDist * (dist < 0 ? -1 : 1);
		newTime = speed / deceleration;

		return { dist: Math.round(newDist), time: Math.round(newTime) };
	},
	destroy: function (full) {
		window.removeEventListener('resize', this, false);
		this.element.removeEventListener(START_EVENT, this, false);
		this.element.removeEventListener(MOVE_EVENT, this, false);
		this.element.removeEventListener(END_EVENT, this, false);
		this.element.removeEventListener('DOMSubtreeModified', this, false);
		this.element.removeEventListener('click', this, true);
		this.element.removeEventListener('webkitTransitionEnd', this, false);
		if (this.scrollBarX) {
			this.scrollBarX = this.scrollBarX.remove();
		}
		if (this.scrollBarY) {
			this.scrollBarY = this.scrollBarY.remove();
		}
		if (full) {
			this.wrapper.parentNode.removeChild(this.wrapper);
		}
		return null;
	}
};

var scrollbar = function (dir, wrapper, fade, shrink) {
	this.dir = dir;
	this.fade = fade;
	this.shrink = shrink;

	// Create main scrollbar
	this.bar = document.createElement('div');

	var style = 'position:absolute;top:0;left:0;-webkit-transition-timing-function:cubic-bezier(0,0,0.25,1);pointer-events:none;-webkit-transition-duration:0;-webkit-transition-delay:0;-webkit-transition-property:-webkit-transform;z-index:10;background:rgba(0,0,0,0.5);' +
		(has3d ? '-webkit-transform:translate3d(0,0,0);' : '-webkit-transform:translate(0,0);') +

		(dir == 'horizontal' ? '-webkit-border-radius:3px 2px;min-width:6px;min-height:5px' : '-webkit-border-radius:2px 3px;min-width:5px;min-height:6px'),
		size, ctx;
	
	this.bar.setAttribute('style', style);

	// Create scrollbar wrapper
	this.wrapper = document.createElement('div');
	style = '-webkit-mask:-webkit-canvas(scrollbar' + this.dir + ');position:absolute;pointer-events:none;overflow:hidden;opacity:0;-webkit-transition-duration:' + (fade ? '300ms' : '0') + ';-webkit-transition-delay:0;-webkit-transition-property:opacity;' +
		(this.dir == 'horizontal' ? 'bottom:2px;left:1px;right:7px;height:5px' : 'top:1px;right:2px;bottom:7px;width:5px;');
	this.wrapper.setAttribute('style', style);

	// Add scrollbar to the DOM
	this.wrapper.appendChild(this.bar);
	wrapper.appendChild(this.wrapper);
	if (this.dir == 'horizontal') {
		size = this.wrapper.offsetWidth;
		ctx = document.getCSSCanvasContext("2d", "scrollbar" + this.dir, size, 5);
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.beginPath();
		ctx.arc(2.5, 2.5, 2.5, Math.PI/2, -Math.PI/2, false);
		ctx.lineTo(size-2.5, 0);
		ctx.arc(size-2.5, 2.5, 2.5, -Math.PI/2, Math.PI/2, false);
		ctx.closePath();
		ctx.fill();
	} else {
		size = this.wrapper.offsetHeight;
		ctx = document.getCSSCanvasContext("2d", "scrollbar" + this.dir, 5, size);
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.beginPath();
		ctx.arc(2.5, 2.5, 2.5, Math.PI, 0, false);
		ctx.lineTo(5, size-2.5);
		ctx.arc(2.5, size-2.5, 2.5, 0, Math.PI, false);
		ctx.closePath();
		ctx.fill();
	}
}

scrollbar.prototype = {
	init: function (scroll, size) {
/*		var offset = this.dir == 'horizontal' ? this.bar.offsetWidth - this.bar.clientWidth : this.bar.offsetHeight - this.bar.clientHeight;
		this.maxSize = scroll - 8;		// 8 = distance from top + distance from bottom
		this.size = Math.round(this.maxSize * this.maxSize / size) + offset;
		this.maxScroll = this.maxSize - this.size;
		this.toWrapperProp = this.maxScroll / (scroll - size);
		this.bar.style[this.dir == 'horizontal' ? 'width' : 'height'] = (this.size - offset) + 'px';*/
		this.maxSize = this.dir == 'horizontal' ? this.wrapper.clientWidth : this.wrapper.clientHeight;
		this.size = Math.round(this.maxSize * this.maxSize / size);
		this.maxScroll = this.maxSize - this.size;
		this.toWrapperProp = this.maxScroll / (scroll - size);
		this.bar.style[this.dir == 'horizontal' ? 'width' : 'height'] = this.size + 'px';
	},
	
	setPosition: function (pos, hidden) {
		if (!hidden && this.wrapper.style.opacity != '1') {
			this.show();
		}

		pos = this.toWrapperProp * pos;
		
			if (pos < 0) {
			pos = this.shrink ? pos + pos*3 : 0;
			if (this.size + pos < 5) {
				pos = -this.size+5;
			}
			} else if (pos > this.maxScroll) {
			pos = this.shrink ? pos + (pos-this.maxScroll)*3 : this.maxScroll;
			if (this.size + this.maxScroll - pos < 5) {
				pos = this.size + this.maxScroll - 5;
			}
		}

		if (has3d) {
			pos = this.dir == 'horizontal' ? 'translate3d(' + Math.round(pos) + 'px,0,0)' : 'translate3d(0,' + Math.round(pos) + 'px,0)';
		} else {
			pos = this.dir == 'horizontal' ? 'translate(' + Math.round(pos) + 'px,0)' : 'translate(0,' + Math.round(pos) + 'px)';
		}

		this.bar.style.webkitTransform = pos;
	},

	show: function () {
		if (has3d) {
			this.wrapper.style.webkitTransitionDelay = '0';
		}
		this.wrapper.style.opacity = '1';
	},

	hide: function () {
		if (has3d) {
			this.wrapper.style.webkitTransitionDelay = '200ms';
		}
		this.wrapper.style.opacity = '0';
	},
	
	remove: function () {
		this.wrapper.parentNode.removeChild(this.wrapper);
		return null;
	}
};

// Is translate3d compatible?
var has3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()),
// Device sniffing
	isIphone = navigator.appVersion.match(/iphone/gi) ? true : false,
	isIpad = navigator.appVersion.match(/ipad/gi) ? true : false,
	isAndroid = navigator.appVersion.match(/android/gi) ? true : false,
	isTouch = isIphone || isIpad || isAndroid,
	START_EVENT = isTouch ? 'touchstart' : 'mousedown',
	MOVE_EVENT = isTouch ? 'touchmove' : 'mousemove',
	END_EVENT = isTouch ? 'touchend' : 'mouseup';

// Expose iScroll to the world
window.iScroll = iScroll;
})();