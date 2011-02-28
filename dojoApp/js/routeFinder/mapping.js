dojo.provide('routefinder.mapping');

dojo.require('dojo.string');

dojo.require('routefinder.topics');

// we can't call this onload, because we want the caller to be able to change the config values
// when calling _base's init.  _base's init should call this init
//    dojo.addOnLoad(routefinder.mapping, 'init');

dojo.mixin(routefinder.mapping, {
    init: function(){
        if (routefinder.config.useLiveMapService) {
            dojo.mixin(routefinder.mapping, {
                dependencyLoadOp: new dojo.Deferred(), // indicates whether the dependency script has loaded
                isDependencyLoaded: false,
            });
            
            
            dojo.io.script.get({
                url: 'http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=6.2',
                checkString: 'VEMap',
                load: function(){
                    routefinder.mapping.isDependencyLoaded = true;
                    routefinder.mapping.dependencyLoadOp.callback();
                }
            });
            
            dojo.declare('routefinder.Map', [dijit._Widget, dijit._Templated], {
                route: {},
                
                /**
                 *
                 * @param {Array}  an array of type routefinder.Location (is a widget)
                 */
                constructor: function(route, domId){
                    if (!routefinder.mapping.isDependencyLoaded) {
                        console.error('external mapping dependency is not yet loaded');
                        alert('external mapping dependency has not yet loaded');
                    }
                    this.route = route;
                    this.domId = domId;
                },
                postCreate: function(){
                },
                startup: function(){
                    var map = new VEMap(this.domId);
                    map.LoadMap();
                    
                    // take each of the ordered locations and put them into an array of VELatLong objects (bing map api)
                    var pointArray = dojo.map(this.route, function(location){
                        return new VELatLong(location.lat, location.lon);
                    });
                    
                    // apply the route to the map, and show the route
                    var myOptions = new VERouteOptions();
                    myOptions.SetBestMapView = true;
                    myOptions.RouteCallback = myRouteHandler;
                    map.GetDirections(pointArray, myOptions);
                },
                
                templatePath: dojo.moduleUrl('routefinder', 'templates/map.html')
            
            });
            
            // todo: get this into the Location object and figure out what to do with the directions text
            function myRouteHandler(route){
            
            }
        }
        else {
            dojo.declare('routefinder.Map', dijit._Widget, {
                buildRendering: function(){
                    this.domNode = dojo.create('img', {
                        src: '../assets/img/staticmap.png'
                    });
                }
            });
        }
    }
});

/*

 // Unroll route and populate alert text

 var legs = route.RouteLegs;

 var turns = "Turn-by-Turn Directions\n";

 var leg = null;

 var turnNum = 0; // The turn #

 var totalDistance = 0; // The sum of all leg distances

 // Get intermediate legs

 for (var i = 0; i < legs.length; i++) {

 // Get this leg so we don't have to dereference multiple times

 leg = legs[i]; // Leg is a VERouteLeg object

 // Unroll each intermediate leg

 var turn = null; // The itinerary leg

 var legDistance = null; // The distance for this leg

 for (var j = 0; j < leg.Itinerary.Items.length; j++) {

 turnNum++;

 // turn is a VERouteItineraryItem object

 turn = leg.Itinerary.Items[j];

 turns += turnNum + ":  " + turn.Text;

 legDistance = turn.Distance;

 totalDistance += legDistance;

 

 // Round distances to 1/10ths

 // Note that miles is the default

 turns += " (" + legDistance.toFixed(1) + " miles)\n";

 }

 }

 turns += "Total distance:  " + totalDistance.toFixed(1) + " miles\n";

 

 // Show directions

 alert(turns);

 */


