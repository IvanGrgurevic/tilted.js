/*
The MIT License (MIT)

Copyright (c) 2014 Ivan Grgurevic

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/


"use strict";

(function (window) {
	// Private
	// ------------------------------------------------------------------------------------------

	/**
	Map class is used as a utility for the $tilted library

	@private
	@class Map
	@constructor
	**/
	function Map() {
		var keys = []
		, data = {};

		this.put = function(key, value) {
			if(data[key] == null) {
				keys.push(key);
			}
			data[key] = value;
		}
		this.get = function(key) {
			return data[key];
		}
		this.remove = function(key) {
			keys.remove(key);
			data[key] = null;
		}
		this.each = function(callback) {
			if(typeof callback == 'function') {
				for(var i=0;i<keys.length;i++) {
					var key = keys[i];
					callback(key, data[key]);
				}
			}
		}
		this.entrys = function() {
			var entrys = [];
			for (var i=0;i<keys.length;i++) {
				entrys[i] = {
					key : keys[i],
					value : data[i]
				};
			}
			return entrys;
		}
		this.isEmpty = function() {
			return keys.length == 0;
		}
		this.size = function() {
			return keys.length;
		}

		return this;
	};

	// private Maps
	var trackerMap = new Map() // holds named trakers
	, gestureMap = new Map() // holds different types of gestuers
	, eventListenerMap = new Map() // holds different types of event listeners
	, dispatchedEventsMap = new Map(); // contains a boolean value that determines if an event was dispatched

	/**
	Measure class holds the IMU data

	@private
	@class measure
	@static
	**/
	var measure = {}; //you will get null if hardware is missing
	// orientation
	measure.orientation = {
		absolute: null,
		alpha: null,
		beta: null,
		gamma: null,
		timeStamp: null
	};
	// motion
	measure.motion = {
		acceleration: {
			x: null,
			y: null,
			z: null
		},
		accelerationIncludingGravity: {
			x: null,
			y: null,
			z: null
		},
		rotationRate: {
			alpha: null,
			beta: null,
			gamma: null
		},
		interval: null,
		timeStamp: null
	};

	/**
	Checks if all events were dispatched, and returns a boolean value indicating so

	@private
	@method allEventsDispatched
	@return {Boolean} whether all IMU events were dispatched or not 
	**/
	function allEventsDispatched() {
		var events = dispatchedEventsMap.size();
		var count = 0;

		// get count of true values
		dispatchedEventsMap.each(function(key, value) {
			if(value) {
				count++;
			}
		});

		if(count === events) {
			// put all values in map to false 
			dispatchedEventsMap.each(function(key, value) {
				dispatchedEventsMap.put(key, false);
			});

			return true;
		}

		return false;
	}

	/**
	Calls all gesture detector methods in 'gestureMap' if all registered events were dispatched

	@private
	@method detectGestures
	**/
	function detectGestures() {
		if(allEventsDispatched()) {
			// detect gestures
			gestureMap.each(function(key, gesture) {
				gesture.detector(measure);
			});
		}
	}

	/**
	Adds supported event listeners, registers the events, and calls 'detectGestures' method

	@private
	@method addEventListeners
	**/
	function addEventListeners() {
		// attach orientation event listener
		if(window.DeviceOrientationEvent != undefined) { // dont if(window.DeviceOrientationEvent) because of safari
			window.addEventListener('deviceorientation', function(event) {	
				measure.orientation.absolute = event.absolute;
				measure.orientation.alpha = event.alpha;
				measure.orientation.beta = event.beta;
				measure.orientation.gamma = event.gamma;
				measure.orientation.timeStamp = event.timeStamp;

				dispatchedEventsMap.put('deviceorientation', true);

				detectGestures();
			}, false);
		}
		// attach motion event listener
		if(window.DeviceMotionEvent != undefined) { // dont if(window.DeviceMotionEvent) because of safari
			window.addEventListener('devicemotion', function(event) {
				measure.motion.acceleration = event.acceleration;
				measure.motion.accelerationIncludingGravity = event.accelerationIncludingGravity
				measure.motion.rotationRate = event.rotationRate;
				measure.motion.interval = event.interval;
				measure.motion.timeStamp = event.timeStamp;

				dispatchedEventsMap.put('devicemotion', true);

				detectGestures();
			}, false);
		}
	}
	addEventListeners();


	// Public
	// ------------------------------------------------------------------------------------------
	
	/**
	$tilted Class

	@class $tilted
	@static
	**/
	var $tilted = {};

	/**
	Returns boolean value depending on whether 'DeviceOrientationEvent' is supported,
	or if provided a callback in the parameter, it will pass the boolean value as a parameter of the callback

	@method hasOrientation
	@param {Function} callback A callback function with a boolean parameter
	@return {Boolean} whether 'measureOrientationEvent' is supported 
	**/
	$tilted.hasOrientation = function(callback) {
		var has = (window.DeviceOrientationEvent != undefined) ? true : false;

		if(callback != undefined) {
			callback(has);
		}
		else {
			return has;
		}
	}

	/**
	Returns boolean value depending on whether 'DeviceMotionEvent' is supported,
	or if provided a callback in the parameter, it will pass the boolean value as a parameter of the callback

	@method hasOrientation
	@param {Function} callback A callback function with a boolean parameter
	@return {Boolean} whether 'measureMotionEvent' is supported 
	**/
	$tilted.hasMotion = function(callback) {
		var has = (window.DeviceMotionEvent != undefined) ? true : false;

		if(callback != undefined) {
			callback(has);
		}
		else {
			return has;
		}
	}

	/**
	Returns current measurements

	@method getCurrentMeasure
	@return {Object} Current measurements of orientation and motion
	**/
	$tilted.getCurrentMeasure = function() {
		return measure;
	}

	/**
	Creates a interval where each interval calls and passes a measure object into the provided callback

	@method setTracker
	@param {String} name The name of the tracker
	@param {Function} callback A callback function with a object parameter
	@param {Integer} interval A integer that defines the interval rate in milliseconds
	**/
	$tilted.setTracker = function(name, callback, interval) {
		trackerMap.put(name, setInterval(function() {
			callback(measure)
		}, interval));
	}

	/**
	Removes a tracker by name

	@method clearTracker
	@param {String} name The name of the tracker
	**/
	$tilted.clearTracker = function(name) {
		clearInterval(trackerMap.get(name));
		trackerMap.remove(name)
	}

	/**
	Creates a custom gesture object and a gesture event. When the event is dispatched, the data from
	the gesture will be attached to event object (Event.gesture) 

	@method createGesture
	@param {String} gestureName The name of the gesture
	@param {Object} defaultProperties A object that contains properties for the gesture
	@param {Function} gestureDetector A function that evaluates the measurement data,
		and determines whether it was a gesture or not
	@return {Gesture} A gesture object
	**/
	$tilted.createGesture = function(gestureName, defaultProperties, gestureDetector) {
		// add detector
		defaultProperties.detector = gestureDetector;
		// create gesture event
		var gestureEvent = new Event(gestureName);
		// add trigger method
		defaultProperties.trigger = function(data) {
			gestureEvent.gesture = data;
			window.dispatchEvent(gestureEvent);
		}
		
		/**
		Gesure Class

		@class Gesture
		@constructor
		@private
		**/
		var Gesture = function() {
			return this;
		};
		Gesture.prototype = defaultProperties;
		// store gesture object
		var gesture = new Gesture();
		// add to gesture map
		gestureMap.put(gestureName, gesture);

		return gesture;
	}

	/**
	Returns a gesture object by name

	@method getGesture
	@param {String} gestureName Name of gesture
	@return {Gesture} A gesture object
	**/
	$tilted.getGesture = function(gestureName) {
		return gestureMap.get(gestureName);
	}

	/**
	Adds a event listener to the window

	@method on
	@param {String} type Type of gesture
	@param {Function} callback A callback function with event parameter
	@param {Boolean} Whether to use capture or not
	**/
	$tilted.on = function(type, callback, useCapture) {
		// attach listener
		window.addEventListener(type, callback, useCapture);
		// if no listeners
		if(eventListenerMap.get(type) == undefined) {
			eventListenerMap.put(type, []);
		}
		// add to an array of event handlers
		eventListenerMap.get(type).push(callback);
	}

	/**
	Removes a event listener or listeners from the window

	@method off
	@param {String} type Type of gesture
	@param {Function} callback A callback function which was used with the 'on' method
	@param {Boolean} Whether to use capture or not
	**/
	$tilted.off = function(type, callback, useCapture) {
		// remove that type of listener with a callback
		if(callback != undefined) {
			window.removeEventListener(type, callback, useCapture);

			var eventHandlerArr = eventListenerMap.get(type);
			if(eventHandlerArr) {
				var arr = [];
				for(var i=0;i<eventHandlerArr.length;i++) {
					if(callback != eventHandlerArr[i]) {
						arr.push(eventHandlerArr[i]);
					}
				}
				eventListenerMap.put(type, arr);
			}
		}
		// remove all listeners from that type of event
		else {
			var eventHandlerArr = eventListenerMap.get(type);
			if(eventHandlerArr) {
				for(var i=0;i<eventHandlerArr.length;i++) {
					window.removeEventListener(type, listenerArr[i], useCapture);
				}
				eventListenerMap.put(type, []);
			}
		}
	}

	// add to global scope
	window.$tilted = $tilted;


	// Gestures
	// ------------------------------------------------------------------------------------------

	// shake gesture
	$tilted.createGesture('shake', {threshold: 7, delay: 1000}, function(measure) {
		var current = measure.motion.accelerationIncludingGravity;

		if(this.last != undefined && current.x != null && current.y != null && current.z != null) {
			var deltaX = Math.abs(this.last.x - current.x)
			, deltaY = Math.abs(this.last.y - current.y)
			, deltaZ = Math.abs(this.last.z - current.z);

			if( (deltaX > this.threshold && deltaY > this.threshold) ||
				(deltaX > this.threshold && deltaZ > this.threshold) || 
				(deltaY > this.threshold && deltaZ > this.threshold) ) {
				var currentTime = measure.motion.timeStamp
				, timeDifference = currentTime - this.last.time;

				if (timeDifference > this.delay) {
					this.last.time = measure.motion.timeStamp;
					this.trigger(measure);
				}
			}
		}
		else {
			this.last = {};
			this.last.time = 0;
		}
		
		this.last.x = current.x;
		this.last.y = current.y;
		this.last.z = current.z;
	});

})(window);
