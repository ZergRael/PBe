ext.loader = {
  dbg: function() {
    utils.dbg('loader', arguments);
  },

  // Non DB related operations
  prepare: function() {
    this.dbg('loader : Prepare');
    $.each(ext.modules, function(moduleName, m) {
      if (!m.pages) {
        m.prepare();
        return;
      }

      $.each(m.pages, function(i, p) {
        if (m.loaded) {
          return false;
        }

        if (ext.url.path.search('^(' + p.path_name + ')$') != -1) {
          if (p.params === false && ext.url.params) {
            return;
          }

          if (!p.params) {
            m.prepare(p.options);
            return false;
          }

          if (!ext.url.params) {
            return;
          }

          var validParams = 0;
          $.each(p.params, function(q, v) {
            if (ext.url.params[q] && (ext.url.params[q] == v || v ==
                '*')) {
              validParams++;
            }
          });

          if (Object.keys(p.params).length == validParams) {
            m.prepare(p.options);
          }
        }
      });
    });
    this.dbg('loader : Awating DB');
  },

  // Post DB loading operations
  run: function() {
    // Insert custom CSS
    this.dbg('loader : Starting');
    utils.insertCSS();
    utils.insertDivs();

    $.each(ext.modules, function(moduleName, m) {
      if (m.prepared && !m.loaded) {
        m.loadModule();
      }
    });

    $(document).trigger('scroll').trigger(ext.name + '_ready');
    this.dbg('loader : Ready');
  },

  requiredLoads: 2,
  warmUp: function() {
    if (--ext.loader.requiredLoads !== 0) {
      return;
    }
    ext.loader.run();
  },

  load: function() {
    if ($('#body').length) {
      this.dbg('loader : Loading');

      // Load all options
      opt.load(this.warmUp);
      // Load global saved data
      gData.load(this.warmUp);

      this.prepare();
    }
  },
};

ext.loader.load();
