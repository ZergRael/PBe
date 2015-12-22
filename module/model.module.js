ext.modules.model = {
  name: 'model',
  dText: 'Model display text',
  pages: [{
    path_name: '/.*/',
    params: {
      query: 'value'
    },
    options: {
      option: 'value'
    }
  }],
  loaded: false,
  prepared: false,
  bar: false,

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

    module.foo();

    module.dbg('loadModule : Ready');
  },

  foo: function() {
    var module = this;
    module.bar = true;
  },
};
