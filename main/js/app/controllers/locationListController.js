jQuery(function($) {

	window.LocationListController = Spine.Controller.create({
		proxied: ['addLocation', 'addAll'],
		
		elements: {
			'.locationsInput': 	'input',
			'.locationList':	'locations'
		},
		
		events: {
			'submit		form': 		'onInput'
		},
		
		init: function() {
			Location.bind('create', this.addLocation);
			Location.bind('refresh', this.addAll);
			
			this.input.focus();
		},
				
		onInput: function(e) {
			try {
			Location.create({ raw: this.input.val() });
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
		
		addAll: function() {
			Location.each(this.addLocation);
		},
		
		hello: function() {
			console.log('hi from the location list controller');
		}
	});
	

});