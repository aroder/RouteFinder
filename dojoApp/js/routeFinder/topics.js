dojo.provide('routefinder.topics');

dojo.mixin(routefinder.topics, {
	onAddressAdded: 'routefinder/onAddressAdded',
	onExternalDependencyLoaded: 'routefinder/onDependencyLoaded' // args: [ 'nameOfDependency' ]
});
