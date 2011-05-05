jQuery(function($) {

	window.LocationListController = Spine.Controller.create({
		el: $('#locations'),
		
		proxied: ['addLocation'],
		
		elements: {
			'.locationsInput': 	'input',
			'.locationList':	'locations'
		},
		
		events: {
			'click 		.clear': 	'clear',
			'submit		form': 		'onInput'
		},
		
		init: function() {
			Location.bind('create', this.addLocation);
			
			this.input.focus();
		},
		
		clear: function() {
			console.log('cleared!');
		},
		
		onInput: function(e) {
			try {
			Location.create({ name: 'location: ' + this.input.val() });
			this.input.val('');
			this.input.focus();
			} catch (ex) {
				console.log(ex);
			}
			// cancel the form post
			e.preventDefault();
		},
		
		addLocation: function(location) {
			var view = LocationController.init({ item: location });
			this.locations.append(view.render().el);
		},
		
		hello: function() {
			console.log('hi from the location list controller');
		}
	});
	
	window.App = window.LocationListController.init();
});