dojo.provide('routeFinder.routing.Route');

dojo.declare('routeFinder.routing.Route', null, {
	startLocation: undefined,
	
	constructor: function(/*Object*/ args) {
		dojo.safeMixin(this, args);
	}
});


