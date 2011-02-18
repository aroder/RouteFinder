dojo.provide('routeFinder.mapping');

dojo.require('routeFinder.topics');

dojo.mixin(routeFinder.mapping, {
  dependencyLoadOp: new dojo.Deferred(), // indicates whether the dependency script has loaded
  isDependencyLoaded: false,
  init: function(){
    dojo.io.script.get({
      url: 'http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=6.2',
      checkString: 'VEMap',
      load: function(){
        routeFinder.mapping.isDependencyLoaded = true;
        routeFinder.mapping.dependencyLoadOp.callback();
      }
    });
  }
});

dojo.addOnLoad(routeFinder.mapping, 'init');

dojo.declare('routeFinder.Map', [dijit._Widget, dijit._Templated], {
  route: {},
  
  constructor: function(route){
    if (!routeFinder.mapping.isDependencyLoaded) {
  	  console.error('external mapping dependency is not yet loaded');  
      alert('external mapping dependency has not yet loaded');
    }
    this.route = route;
  },
  postCreate: function(){
  },
  startup: function() {
  	console.log('startup');
    var map = new VEMap('map_' + this.id);
    console.log('map placed at map_' + this.id);
    map.LoadMap();
  },
  templatePath: dojo.moduleUrl('routeFinder', 'templates/map.html')

});

