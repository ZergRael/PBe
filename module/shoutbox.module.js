ext.modules.shoutbox = {
  name: 'shoutbox',
  dText: 'Shoutbox',
  pages: [{
    path_name: '/shoutbox.php',
    options: {
    }
  }],
  loaded: false,
  prepared: false,

  dbg: function() {
    utils.dbg(this.name, arguments);
  },

  prepare: function(mOptions) {
    var module = this;
    module.options = mOptions;
    module.prepared = true;
  },

  loadModule: function() {
    var module = this;
    module.loaded = true;

    module.dbg('loadModule : Starting');
    // Execute functions

    module.removeSound();

    module.dbg('loadModule : Ready');
  },

  removeSound: function() {
    var module = this;
    if (opt.get(module.name, 'no_sound')) {
      $('#son').prop('checked', false).parent().hide();
    }
  },
};
