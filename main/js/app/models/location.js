// create the model
var Location = Spine.Model.setup('Location', ['raw', 'name', 'active', 'rawAddress', 'address', 'city', 'state', 'zip', 'lat', 'lon']);

//Location.extend(Spine.Model.Local);

Location.include({
	
	active: true,
	hello: function() {
		console.log('hello from ' + this.name);
	},
	fetchLocation: function() {
		$.ajax({
			url: 'http://dev.virtualearth.net/REST/v1/Locations',
			dataType: 'jsonp',
			contentType: "application/json; charset=utf-8",
				
			jsonp: 'jsonp',
			data: {
				query: this.raw,
				key: 'AizyhoiLfqzBSi2yjcHvfb9VZNX4Jc0iN44rx36ux0gt5km-1oPxFdtZL0gZl7dv'
			},
			success: this.proxy(function(data) {
				var addr = data.resourceSets[0].resources[0].address;
				var point = data.resourceSets[0].resources[0].point;
				this.updateAttributes({ 
					name: addr.addressLine,
					address: addr.addressLine,
					city: addr.locality,
					state: addr.adminDistrict,
					zip: addr.postalCode,
					lat: point.coordinates[0],
					lon: point.coordinates[1]
				});
				console.log('success! ', arguments);
			})
		});
	
	}
});

Location.bind('create', function(rec) {
	console.log('captured create for ', rec.name);
	rec.fetchLocation();
	
});

