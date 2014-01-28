#About Tilted.js

Tilted.js is a multi-browser Javascript library designed to simplify browser access to Accelerometer and Gyroscope data.

#API

##Feature Detection

###Detecting Orientation

Returns boolean value.
 
    $tilted.hasOrientation();

Callback with a boolean parameter.

    $tilted.hasOrientation( function(value){
        // do something...
    } );

###Detecting Motion

Returns boolean value.
 
    $tilted.hasMotion();

Callback with a boolean parameter.

    $tilted.hasMotion( function(value){
        // do something...
    } );


##Tracking measurement data

Get current measurement data.

    $tilted.getCurrentMeasure(); 
	
Set a tracker by name & callback.

    $tilted.setTracker('trackerName', function(measure) {
        // do something...
    }, 1000);

Remove a tracker by name.

	$tilted.clearTracker('trackerName');


##Event listeners & handlers

###Setting event listeners & handlers

Set a event listener & handler.

    $tilted.on('eventName', callback[, useCapture]);

>Note: **useCapture** is not mandatory.

#####Example:

    $tilted.on('shake', function(event) {
         // do something
    });

###Removing event listeners & handlers

Remove all event listeners & handlers with a specific event name. 

    $tilted.off('eventName'[, callback, useCapture]);

>Note: **callback** & **useCapture** are not mandatory.

Remove a listener & handler with a specific callback.

    $tilted.off('eventName', callback[, useCapture]);

>Note: **useCapture** is not mandatory.

#####Example:

    $tilted.off('shake');


##Creating Gestures

Create a custom gesture.

    $tilted.createGesture('gestureName', {property: 2000}, function(measure) {
        // do something...
    });

#####Example:

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


#####Example of attaching a event listener & handler to a custom gesture:

    $tilted.on('shake', function(event) {
        alert(event.gesture);
    });

>**Note:** **createGesture** uses its **.trigger()** method for dispatching events. Also, you can attach data to the Event object by passing the data as a parameter into the **.trigger(data)** method, so that the data will be accessible in the event handler by **event.gesture**.




