dojo.provide('routeFinder.Location');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.string');
dojo.require('dojo.io.script');
dojo.require('dojo.fx'); // to support the animation chaining of the flash method
//dojo.require('dojo.cache');

function bla(data) {
	//console.log(data);
}

dojo.declare('routeFinder.LocationWidget', [dijit._Widget, dijit._Templated], {
	address: 'unknown',
	city: 'unknown',
	state: 'CO',  // two digit state code
	zip: 'unknown',
	country: 'US', // country code
	coords: {
		lat: 'unknown',
		lon: 'unknown'
	},
	
	constructor: function(args) {
		this.bingMapsApiKey = args.bingMapsApiKey || 'AizyhoiLfqzBSi2yjcHvfb9VZNX4Jc0iN44rx36ux0gt5km-1oPxFdtZL0gZl7dv';
		this.locationRequestTemplate = dojo.cache('routeFinder', 'templates/locationRequestUrl.txt');
	},
	
	templatePath: dojo.moduleUrl('routeFinder', 'templates/location.html'),
	postCreate: function() {
		this.lookupLocation();
		//this.flash();
	},
	
	// looks up the address using the Bing MAPS REST API.  
	lookupLocation: function() {
		// Bing Maps REST API chokes if there is a period (.) in the value of the jsonp query string parameter
		// this is how jsonp can be done in dojo.  However, the jsonp callback parameter value is something like 
		// dojo.io.script.jsonp_dojoIoScript1._jsonpCallback, which causes the Bing Maps API service to return an error:
		// "jsonp: The string value has an invalid format." and an HTTP status code of 400
				
		var jsonpCallbackFunctionName = 'dojo_locationLookupJsonpCallback_' + this.id;
		
		// a closure to hook the jsonp callback back into this widget
		(function(dijitId) {		
		
			// dynamically create a uniquely named global function, since the Bing Maps API cannot handle namespacing in the jsonp callback parameter value
			window[jsonpCallbackFunctionName] = function(response) {
				if (!response.statusDescription === "OK") {
					alert('Something went wrong calling the Bing Maps API service: ' + response.errorDetails[0]);
				}
				
				// because we are in a closure, we have access to the wiget's id
				var widget = dijit.byId(dijitId);
				
				// basically, pass execution control back into the widget itself.  
				// this could potentially be an event through the dojo pub/sub apis
				widget.markAsLocated();
			}
		})(this.id);
		
		var jsonpArgs = {
			url: dojo.string.substitute(this.locationRequestTemplate, this),
			handleAs: 'javascript',
			//callbackParamName: 'jsonp',  // if the Bing Maps API didn't barf on namespaces in the jsonp callback value, dojo would use this function to call the load operation
			content: {
				key: this.bingMapsApiKey,
				jsonp: jsonpCallbackFunctionName
			},
			// load: function(data) { this.markAsLocated(); },    // if the Bing Maps API didn't barf on namespaces, this would be called automagically
			error: function(error) {
				console.log(error);
			}
		};
		dojo.io.script.get(jsonpArgs);
		
	},
	
	markAsLocated: function() {
		dojo.style(this.addressNode, 'backgroundColor', '#0a0');
//		this.flash(2);
	},
	
	flash: function(/*Number*/ timesToFlash) {
	
		// becuase this function is recursive, a zero passed in is significant.  It means we should not animate again
		if (0 === timesToFlash) {
			return;
		}
		
		// if not zero, but undefined, set the default to 3
		timesToFlash = timesToFlash || 3;

		// save the starting color so we can refer back to it after the flash
		var startingColor = dojo.style(this.addressNode, 'backgroundColor');

		// the basic animation is flashing to a color, then reverting back to the startingColor
		var animation = dojo.fx.chain([
			dojo.animateProperty({node: this.addressNode, duration: 100, properties: { backgroundColor: '#FFE600' }}),
			dojo.animateProperty({node: this.addressNode, duration: 100, properties: { backgroundColor: startingColor }})
		])
		
		// after the animation is over, we check to see if we decrement the number of times to flash and call this function again
		var handle = dojo.connect(animation, 'onEnd', dojo.hitch(this, function() {
			this.flash(timesToFlash - 1);
		}));
		
		animation.play();
	}
});