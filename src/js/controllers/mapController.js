jQuery(function($) {
	window.mapController = Spine.Controller.create({
		map: undefined, // defined in init
		
		proxied: ['addPin'],
		
		init: function() {
			this.map = new Microsoft.Maps.Map(this.el[0], {credentials:'AizyhoiLfqzBSi2yjcHvfb9VZNX4Jc0iN44rx36ux0gt5km-1oPxFdtZL0gZl7dv'});			

			Location.bind('locationFound', this.addPin);
			
			// center on current geolocation if supported,
			// and create a Location object for it
			var that = this;
			if (Modernizr.geolocation){
				navigator.geolocation.getCurrentPosition(function(position) {
					that.map.setView({zoom: 14, center: new Microsoft.Maps.Location(position.coords.latitude, position.coords.longitude)});
					Location.create({ raw: position.coords.latitude + ', ' + position.coords.longitude});
				});
			}
		},
		
		// adds a pin to the map for a given location
		// assumes the lat and lon are populated
		addPin: function(location) {
				var pushpin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(location.lat, location.lon), null); 
				this.map.entities.push(pushpin);
		}
	});
});