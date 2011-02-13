dojo.provide('routeFinder.Location');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.fx'); // to support the animation chaining of the flash method
//dojo.require('dojo.cache');

dojo.declare('routeFinder.LocationWidget', [dijit._Widget, dijit._Templated], {
	address: 'unknown',
	city: 'unknown',
	state: 'unknown',
	zip: 'unknown',
	coords: {
		lat: 'unknown',
		lon: 'unknown'
	},
	templatePath: dojo.moduleUrl('routeFinder', 'templates/location.html'),
	postCreate: function() {
		this.flash();
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
			dojo.animateProperty({node: this.addressNode, duration: 150, properties: { backgroundColor: '#FFE600' }}),
			dojo.animateProperty({node: this.addressNode, duration: 150, properties: { backgroundColor: startingColor }})
		])
		
		// after the animation is over, we check to see if we decrement the number of times to flash and call this function again
		var handle = dojo.connect(animation, 'onEnd', dojo.hitch(this, function() {
			this.flash(timesToFlash - 1);
		}));
		
		animation.play();
	}
});