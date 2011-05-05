jQuery(function($) {
	window.LocationController = Spine.Controller.create({
	
		proxied: ['render', 'remove'],
	
		init: function() {
			this.item.bind('update', this.render);
			this.item.bind('destroy', this.remove);
		},
	
		events: {
			'click': 			'onClick',
			'click	.delete':	'destroy'	
		},
		
		render: function() {
			this.el.html(this.template(this.item));
			return this;
		},
		
		remove: function() {
			this.el.remove();
		},
		
		template: function(items) {
			return ($('#locationTemplate').tmpl(items));
		},
		
		onClick: function(e) {
			this.item.active = !this.item.active;
			this.item.save();
		},
		
		destroy: function() {
			this.item.destroy();
		}
	});
});