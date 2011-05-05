// create the model
var Location = Spine.Model.setup('Location', ['name', 'active', 'rawAddress']);

Location.include({

	active: true,
	hello: function() {
		console.log('hello from ' + this.name);
	}
});