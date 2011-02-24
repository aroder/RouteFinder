dojo.provide('routeFinder.routing');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.string');
dojo.require('dojo.io.script');
dojo.require('dojo.fx');
dojo.require('dijit.form.TextBox');
dojo.require('dojo.DeferredList');

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
  
  startup: function(){
  	
    dojo.connect(this.domNode, 'onmouseover', dojo.hitch(this, function(evt){
      var query = dojo.query('.closeButton', evt.target);
      if (0 < query.length) {
        var anchorNode = query[0];
        dojo.removeClass(anchorNode, 'hidden');
      }
    }));
    dojo.connect(this.domNode, 'onmouseout', dojo.hitch(this, function(evt){
      if (this.domNode == evt.relatedTarget || routeFinder.isChildOf(evt.relatedTarget, this.domNode)) {
        return;
      }
      var anchorNode = dojo.query('.closeButton', evt.target)[0];
      dojo.addClass(anchorNode, 'hidden');
      
    }));
	dojo.query('.closeButton', this.domNode).connect('onclick', dojo.hitch(this, function(evt) {
		this.destroyRecursive();
	}));
	
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
    if (routeFinder.config.useLiveLocationService) {
      var jsonpArgs = {
        url: this.locationRequestByQueryTemplate,
        handleAs: 'json',
        callbackParamName: 'jsonp',
        content: {
          query: this.unformattedAddress,
          key: this.bingMapsApiKey
        },
        load: dojo.hitch(this, function(response){
          if (!response.statusDescription === "OK") {
            alert('Something went wrong calling the Bing Maps API service: ' + response.errorDetails[0]);
          }
          if (0 === response.resourceSets.length ||
          'undefined' === typeof(response.resourceSets[0].resources[0]) ||
          'undefined' === typeof(response.resourceSets[0].resources[0].address)) {
            this.markAsNotLocated(response);
          }
          else {
            this.markAsLocated(response);
          }
        }),
        error: function(error){
          console.error(error);
        }
      };
      dojo.io.script.get(jsonpArgs);
    }
    else {
      var fakeResponse = {
        resourceSets: [{
          resources: [{
            address: {
              addressLine: '123 Fake St',
              locality: 'Faketown',
              adminDistrict: 'FL',
              postalCode: '77777'
            },
            point: {
              // return a somewhat random set of coordinates
              coordinates: [30.0000 + Math.floor(Math.random() * 11), -108.0000 + Math.floor(Math.random() * 11)]
            }
          }]
        }]
      };
      this.markAsLocated(fakeResponse);
    }
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
    
    //TODO: do entrance animation
    //dojo.style(this.domNode, 'backgroundColor', '#0a0');
  },
  
  markAsNotLocated: function(response){
    console.log('could not find address');
  },
});

dojo.declare('routeFinder.Router', null, {
  startLocation: undefined,
  
  constructor: function(args){
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
        originalCallback(orderedLocations);
      }
    }));
  },
  
  orderLocations: function(/*Array*/locations, /*Object*/ startLocation, /*Function*/ callback){
    if (locations instanceof dijit.WidgetSet) {
      locations = locations.toArray();
    }
    
    if (!routeFinder.config.useLiveRoutingService) {
      callback(locations);
      return;
    }
    
    startLocation.distance = 0;
    locations.splice(locations.indexOf(startingNode), 1);
    
    var orderedLocations = [startingNode];
    
    this._orderLocationsInternal(locations, orderedLocations, callback);
  },
  
  /**
   *
   * @param {Array} route - an array of Location widgets called orderedLocations
   * @param {Object} numberOfRoutes - the number of routes route should be split into
   * @param {Object} startLocation - optional.  If not included, the first location is stripped out and used as the start location for all routes
   * @return {Array} an array of route arrays
   */
  splitRoute: function(route, numberOfRoutes, startLocation){
    if ('undefined' == typeof(startLocation)) {
      startLocation = route.splice(0, 1);
    }
    
    var routesAfterSplitting = [];
    var routeSize = Math.floor(route.length / numberOfRoutes);
    for (var i = 0; i < numberOfRoutes; i++) {
      routesAfterSplitting.push(route.splice(0, routeSize));
      
      // on the last iteration, add any remaining Locations
      if (numberOfRoutes == i + 1 && 0 < route.length) {
        routesAfterSplitting[i] = routesAfterSplitting[i].concat(route);
      }
    }
    return routesAfterSplitting;
  }
});


