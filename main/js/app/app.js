jQuery(function($) {
	window.app = Spine.Controller.create({
		el: $('body'),
		
		elements: {
			'#locations': 'locationsEl'
		},
	
		init: function(){
			this.locationListController = LocationListController.init({ el: this.locationsEl });

			//Location.fetch();

			console.log('app initted');
		}
	}).init();
});