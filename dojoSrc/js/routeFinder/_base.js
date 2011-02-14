dojo.provide('routeFinder._base');

dojo.require('routeFinder.topics');
dojo.require('routeFinder.Location');
dojo.require('dojo.parser');
dojo.require('dijit.InlineEditBox');
dojo.require('dijit.form.Button');

dojo.mixin(routeFinder, {
	init: function() {
		dojo.subscribe(routeFinder.topics.onAddressAdded, function(address) {
			var locationList = dojo.byId('locationList');
			new routeFinder.LocationWidget({ unformattedAddress: address, title: address }).placeAt(locationList, 'last');
		});
	}
});

dojo.addOnLoad(routeFinder, 'init');