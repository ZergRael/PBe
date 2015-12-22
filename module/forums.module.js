ext.modules.forums = {
  name: 'forums',
  dText: 'Forums',
  pages: [{
    path_name: '/forums.php',
    params: {
      action: 'viewtopic'
    },
    options: {
      buttons: '.linkbox:first'
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

    $(document).on('endless_scrolling_insertion_done', function() {
      module.dbg('loadModule : Endless scrolling module specific functions');
      $(document).trigger('recolor_twits');
      module.hideSignatures();
      $(document).trigger('es_dom_process_done');
    });
  },

  loadModule: function() {
    var module = this;
    module.loaded = true;

    module.dbg('loadModule : Starting');
    // Execute functions

    module.addSignatureToggler();
    module.hideSignatures();

    module.dbg('loadModule : Ready');
  },

  addSignatureToggler: function() {
    var module = this;
    if (!opt.get(module.name, 'hidable_sigs')) {
      return;
    }

    module.dbg('addSignatureToggler : Added');
    $(document).on('click', 'p.sig_separator', function() {
      module.dbg('addSignatureToggler : Clicked');
      $(this).next('.usersignature').toggle();
    });
  },

  hideSignatures: function() {
    var module = this;
    if (!opt.get(module.name, 'hide_signatures')) {
      return;
    }

    $('.usersignature').hide();
  },
};
