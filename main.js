var ext = {
  DEBUG: true,
  name: 'pbe',
  displayName: 'PBe',
  author: 'PillBat',

  dbg: function() {
    utils.dbg(this.name, arguments);
  },

  // Parse our url string from the browser
  url: utils.parseUrl(window.location.href),

  // Each module will be inserted in the modules object for an easier inter-modules communication
  modules: {},
};

ext.dbg('main : Started');
$(document).trigger(ext.name + '_started');
// Each .module.js from the manifest will now be read by the javascript engine
// then the loader will launch them if the url is matching
