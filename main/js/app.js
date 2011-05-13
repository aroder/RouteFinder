jQuery(function($) {
	window.app = Spine.Controller.create({
		el: $('body'),
		
		elements: {
			'#locations': 'locationsEl',
			'#map': 'mapEl'
		},
	
		init: function(){
			this.mapController = mapController.init({ el: this.mapEl });
			this.locationListController = LocationListController.init({ el: this.locationsEl });

			//Location.fetch();
			

			
			console.log('app initted');
			
			
		}
	})
});