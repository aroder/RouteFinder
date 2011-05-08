jQuery(function($) {
	window.LocationController = Spine.Controller.create({
	
		proxied: ['render', 'remove'],
	
		init: function() {
			this.item.bind('update', this.render);
			this.item.bind('destroy', this.remove);
			
//			this.item.bind('save update create destroy change refresh error', function() { console.log(arguments); });
			
			this.item.save();
		},
	
		elements: {
		},
	
		events: {
			'click': 			'onClick',
			'click	.delete':	'destroy',
			'mouseover':		'over',
			'mouseout':			'out'
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
		},
		
		over: function() {
			this.el.addClass('hoverState');
		},
		
		out: function() {
			this.el.removeClass('hoverState');
		}
	});
});