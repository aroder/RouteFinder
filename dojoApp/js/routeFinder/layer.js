dojo.provide('routeFinder.layer');

dojo.require('dojo.dnd.Source');
dojo.require('dojo.DeferredList');
dojo.require('routeFinder._base');
dojo.require('routeFinder.topics');
dojo.require('routeFinder.Location');
dojo.require('routeFinder.routing.Map');
dojo.require('routeFinder.routing.Route');
dojo.require('routeFinder.io.script');  // does some overrides to get the Bing Maps REST API to work with dojo.io.script and dojo.Deferreds

