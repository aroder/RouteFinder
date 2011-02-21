dojo.provide('routeFinder.routing');

// for the widget declaration
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// for the string substitution
dojo.require('dojo.string');

// for the jsonp calls
dojo.require('dojo.io.script');

// to support the animation chaining of the flash method
dojo.require('dojo.fx');

dojo.require('dijit.form.TextBox');

dojo.require('dojo.DeferredList'); // used by Router to aggregate all the responses

//		dojo.registerModulePath('routeFinder', '../../routeFinder');


dojo.declare('routeFinder.Location', [dijit._Widget, dijit._Templated], {
  title: '',
  unformattedAddress: 'unknown',
  addressLine: 'unknown',
  city: 'unknown',
  state: 'CO', // two digit state code
  zip: 'unknown',
  country: 'US', // country code
  lat: 'unknown',
  lon: 'unknown',
  distance: Infinity,
  
  // TODO: investigate how dojo and the attributeMap, getters, setters,
  // etc might be able to handle nested items
  //coords: {
  //  lat: 'unknown',
  //  lon: 'unknown'
  //},
  
  constructor: function(args){
    this.title = args.title || 'Title';
    this.bingMapsApiKey = args.bingMapsApiKey || 'AizyhoiLfqzBSi2yjcHvfb9VZNX4Jc0iN44rx36ux0gt5km-1oPxFdtZL0gZl7dv';
    this.locationRequestTemplate = dojo.cache('routeFinder', 'templates/locationRequestUrl.txt');
    this.locationRequestByQueryTemplate = dojo.cache('routeFinder', 'templates/locationRequestByQueryUrl.txt');
    
  },
  
//  templatePath: dojo.moduleUrl('routeFinder', 'templates/location.html'),
  templateString: dojo.cache('routeFinder', 'templates/location.html'),

  postCreate: function(){
    this.lookupLocation();
    //this.flash();
  },
  
  attributeMap: {
    //title: { node: 'titleNode', type: 'innerHTML' },
    addressLine: {
      node: 'addressLineNode',
      type: 'innerHTML'
    },
    city: {
      node: 'cityNode',
      type: 'innerHTML'
    },
    state: {
      node: 'stateNode',
      type: 'innerHTML'
    },
    zip: {
      node: 'zipNode',
      type: 'innerHTML'
    }
  },
  
  // looks up the address using the Bing MAPS REST API.  
  lookupLocation: function(){
    // Bing Maps REST API chokes if there is a period (.) in the value of the jsonp query string parameter
    // this is how jsonp can be done in dojo.  However, the jsonp callback parameter value is something like 
    // dojo.io.script.jsonp_dojoIoScript1._jsonpCallback, which causes the Bing Maps API service to return an error:
    // "jsonp: The string value has an invalid format." and an HTTP status code of 400
    
    var jsonpCallbackFunctionName = 'dojo_locationLookupJsonpCallback_' + this.id;
    
    // a closure to hook the jsonp callback back into this widget
    (function(dijitId){
    
      // dynamically create a uniquely named global function, since the Bing Maps API cannot handle namespacing in the jsonp callback parameter value
      window[jsonpCallbackFunctionName] = function(response){
      
        if (!response.statusDescription === "OK") {
          alert('Something went wrong calling the Bing Maps API service: ' + response.errorDetails[0]);
        }
        
        // the current closure provides access to the wiget's id
        var widget = dijit.byId(dijitId);
        
        // basically, pass execution control back into the widget itself.  
        // these could potentially be an event through the dojo pub/sub apis
        if (0 === response.resourceSets.length ||
        'undefined' === typeof(response.resourceSets[0].resources[0]) ||
        'undefined' === typeof(response.resourceSets[0].resources[0].address)) {
          widget.markAsNotLocated(response);
        }
        
        widget.markAsLocated(response);
      }
    })(this.id);
    var jsonpArgs = {
      //url: dojo.string.substitute(this.locationRequestTemplate, this),
      url: this.locationRequestByQueryTemplate,
      handleAs: 'javascript',
      //callbackParamName: 'jsonp',  // if the Bing Maps API didn't barf on namespaces in the jsonp callback value, dojo would use this function to call the load operation
      content: {
        query: this.unformattedAddress,
        key: this.bingMapsApiKey,
        jsonp: jsonpCallbackFunctionName
      },
      // load: function(data) { this.markAsLocated(); },    // if the Bing Maps API didn't barf on namespaces, this would be called automagically
      error: function(error){
        console.error(error);
      }
    };
    dojo.io.script.get(jsonpArgs);
  },
  
  changeTitle: function(){
    alert('called');
    console.log(arguments);
  },
  
  markAsLocated: function(response){
    var address = response.resourceSets[0].resources[0].address;
    this.set('addressLine', address.addressLine);
    this.set('city', address.locality);
    this.set('state', address.adminDistrict);
    this.set('zip', address.postalCode);
    
	var point = response.resourceSets[0].resources[0].point;
	this.set('lat', point.coordinates[0]);
	this.set('lon', point.coordinates[1]);

    dojo.style(this.domNode, 'backgroundColor', '#0a0');
  },
  
  markAsNotLocated: function(response){
    console.log('could not find address');
  },
  
  flash: function(/*Number*/timesToFlash){
  
  
  
    // becuase this function is recursive, a zero passed in is significant.  It means we should not animate again
    if (0 === timesToFlash) {
      return;
    }
    
    // if not zero, but undefined, set the default to 3
    timesToFlash = timesToFlash || 3;
    
    // save the starting color so we can refer back to it after the flash
    var startingColor = dojo.style(this.addressLineNode, 'backgroundColor');
    
    // the basic animation is flashing to a color, then reverting back to the startingColor
    var animation = dojo.fx.chain([dojo.animateProperty({
      node: this.addressLineNode,
      duration: 100,
      properties: {
        backgroundColor: '#FFE600'
      }
    }), dojo.animateProperty({
      node: this.addressLineNode,
      duration: 100,
      properties: {
        backgroundColor: startingColor
      }
    })])
    
    // after the animation is over, we check to see if we decrement the number of times to flash and call this function again
    var handle = dojo.connect(animation, 'onEnd', dojo.hitch(this, function(){
      this.flash(timesToFlash - 1);
    }));
    
    animation.play();
  }
  
  
  
});












dojo.declare('routeFinder.Router', null, {
  startLocation: undefined,
  
  constructor: function(/*Object*/args){
    dojo.safeMixin(this, args);
  },
  
  _orderLocationsInternal: function(remainingLocations, orderedLocations, originalCallback){
    if (0 === remainingLocations.length) {
      originalCallback({
        orderedLocations: orderedLocations
      });
      return;
    }
    
    var deferreds = [];
    
    dojo.forEach(remainingLocations, function(location){
      var jsonpDeferred = dojo.io.script.get({
        url: "http://dev.virtualearth.net/REST/v1/Routes",
        content: {
          "wayPoint.1": dojo.string.substitute('${lat},${lon}', orderedLocations[orderedLocations.length - 1]),
          "wayPoint.2": dojo.string.substitute('${lat},${lon}', location),
          distanceUnit: "mi",
          key: "AizyhoiLfqzBSi2yjcHvfb9VZNX4Jc0iN44rx36ux0gt5km-1oPxFdtZL0gZl7dv",
          jsonso: location.widgetId
        },
        jsonp: "jsonp"
      });
      deferreds.push(jsonpDeferred);
    });
    
    var deferredList = new dojo.DeferredList(deferreds);
    
    var minDistanceLocation;
    
    deferredList.addCallback(dojo.hitch(this, function(resultArray){
      dojo.forEach(resultArray, function(item, index, array){
        var succeeded = item[0];
        var response = item[1];
        var distance = response.resourceSets[0].resources[0].travelDistance;
        
        if (!minDistanceLocation || distance < minDistanceLocation.distance) {
          minDistanceLocation = remainingLocations[index];
        }
      });
      
      remainingLocations.splice(remainingLocations.indexOf(minDistanceLocation), 1);
      orderedLocations.push(minDistanceLocation);
      
      if (0 < remainingLocations.length) {
        this._orderLocationsInternal(remainingLocations, orderedLocations, originalCallback);
      }
      else {
        originalCallback({
          orderedLocations: orderedLocations
        });
      }
      
    }));
    
  },
  
  orderLocations: function(/*Array*/locations, /*Object*/ startLocation, /*Function*/ callback){
    if (locations instanceof dijit.WidgetSet) {
      locations = locations.toArray();
    }
    
    startLocation.distance = 0;
    locations.splice(locations.indexOf(startingNode), 1);
    
    var orderedLocations = [startingNode];
    
    this._orderLocationsInternal(locations, orderedLocations, callback);
    
    
    // for each location, get the distance between last element of orderedLocations.
    // When all the calls have returned, then call getNextOrderedLocation
    // push the return onto orderedLocations, repeat
  
    // once the locations array is empty, reorder the locations, and call the service to get the map,
  
    // var counter = locations.length;
    // for (var i = 0; i < counter; i++) {
    //   var nextLocation = getNextOrderedLocation(locations);
    //   locations.splice(locations.indexOf(nextLocation), 1);
    //   orderedLocations.push(nextLocation);
  
    // reset the locations' distances:
  }
});


