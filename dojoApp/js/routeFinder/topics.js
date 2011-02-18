dojo.provide('routeFinder.topics');

dojo.mixin(routeFinder.topics, {
	onAddressAdded: 'routeFinder/onAddressAdded',
	onExternalDependencyLoaded: 'routeFinder/onDependencyLoaded' // args: [ 'nameOfDependency' ]
});
