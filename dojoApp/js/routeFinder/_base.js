dojo.provide('routefinder._base');

dojo.require('routefinder.topics');
dojo.require('dojo.parser');
dojo.require('dijit.InlineEditBox');
dojo.require('dijit.form.Button');
dojo.require('dojo.dnd.Source');

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


dojo.mixin(routefinder, {
  config: {
    useLiveMapService: true,
    useLiveLocationService: true,
    useLiveRoutingService: true
  },
  
  /**
   * 
   * @param {Object} config An object containing overrides to the default config values
   * {Boolean} useLiveMapService
   * {Boolean} useLiveLocationService
   * {Boolean} useLiveRoutingService 
   */
  init: function(config){
    
    // override default values with any values from the config argument
  	dojo.mixin(routefinder.config, config);
	
	// init any module dependencies that have an init function
  	routefinder.mapping.init();

	
    dojo.subscribe(routefinder.topics.onAddressAdded, function(address){
      var widget = new routefinder.Location({
        unformattedAddress: address,
        title: address
      });
      
      // make the widget draggable
      dojo.addClass(widget.domNode, 'dojoDndItem');
      widget.startup();
      widget.placeAt('locationHolder', 'last');
      
      dojo.removeClass(startLocationHolderWidget.node, 'hidden');
    });
    
    // create some drag and drop behavior    
    if (typeof(startLocationHolderWidget) != 'undefined') {
      startLocationHolderWidget.checkAcceptance = dojo.hitch(startLocationHolderWidget, function(source, nodes){
        var nodeCount = this.getAllNodes().length;
        return 0 === nodeCount;
      });
      
      dojo.connect(startLocationHolderWidget, 'onDndDrop', function(source, nodes, copy, target){
        routefinder._restyleItems(startLocationHolderWidget, locationHolderWidget);
      });
      dojo.connect(locationHolderWidget, 'onDndDrop', function(){
        routefinder._restyleItems(startLocationHolderWidget, locationHolderWidget);
      });
            
      var addressesNode = dojo.byId('addressInput');
      
      dojo.connect(dojo.byId('addressInput'), 'onkeyup', function(evt){
        if (evt.keyCode === dojo.keys.ENTER) {
          routefinder.locate(addressesNode);
        }
      });
      
      dojo.connect(dojo.byId('addAddressButton'), 'click', function(evt){
        routefinder.locate(addressesNode);
      });
    }
  },
  _restyleItems: function(startLocationHolderSource, locationHolderSource){
    dojo.forEach(locationHolderSource.getAllNodes(), function(node){
      dojo.removeClass(node, 'startLocation');
    });
    
    if (0 == startLocationHolderSource.getAllNodes().length) {
      dojo.style('startLocationPromptMessage', 'display', 'inline');
      dojo.addClass(startLocationHolderSource.node, 'emptyStartLocationHolder');
    }
    else {
      dojo.addClass(startLocationHolderSource.getAllNodes()[0], 'startLocation');
      dojo.style('startLocationPromptMessage', 'display', 'none');
      dojo.removeClass(startLocationHolderSource.node, 'emptyStartLocationHolder');
    }
  },
  
  locate: function locateAddresses(textAreaNode){
    lines = textAreaNode.value.split(/\r\n|\r|\n/);
    dojo.forEach(lines, function(singleLine){
      if (0 !== singleLine.length) {
        dojo.publish(routefinder.topics.onAddressAdded, [singleLine]);
      }
    });
    textAreaNode.value = '';
    textAreaNode.focus();
  },

/**
 * Flashes the node
 * @param {Object} or {String} node A DOM element or its ID
 * @param {Object} timesToFlash The number of times node should flash
 * @param {Object} color The hex value of the flash color, including # (e.g. #ff00cc
 */
  flash: function(node, timesToFlash, color){
  	
    node = dojo.byId(node);
    
    // becuase this function is recursive, a zero passed in is significant.  It means we should not animate again
    if (0 === timesToFlash) {
      return;
    }
    
    // if not zero, but undefined, set the default to 2
    timesToFlash = timesToFlash || 2;

	// default flash color is yellow
    color = color || '#FFE600';
	
    // save the starting color so we can refer back to it after the flash
    var startingColor = dojo.style(node, 'backgroundColor');
    
    // the basic animation is flashing to a color, then reverting back to the startingColor
    var animation = dojo.fx.chain([dojo.animateProperty({
      node: node,
      duration: 25,
      properties: {
        backgroundColor: color
      }
    }), dojo.animateProperty({
      node: node,
      duration: 150,
      properties: {
        backgroundColor: startingColor
      }
    })])
    
    // after the animation is over, we check to see if we decrement the number of times to flash and call this function again
    var handle = dojo.connect(animation, 'onEnd', dojo.hitch(this, function(){
      this.flash(node, timesToFlash - 1);
    }));
    
    animation.play();
  },
  isChildOf: function(child, parent){
    if (child != null) {
      while (child.parentNode) {
        if ((child = child.parentNode) == parent) {
          return true;
        }
      }
    }
    return false;
  }
});

//dojo.addOnLoad(routefinder, 'init');
