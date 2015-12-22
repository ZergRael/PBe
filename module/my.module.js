ext.modules.m_account = {
  name: 'my',
  dText: 'Account',
  pages: [{
    path_name: '/my.php',
    params: {
      action: 'settings'
    },
    options: {
      signature_input: 'textarea[name=signature]',
      customMenu_input: 'textarea[name=bloc_left]',
      previewDelay: 600
    }
  }],
  loaded: false,
  prepared: false,
  lastSignatureInput: false,
  lastCustomMenuInput: false,

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

    $(module.options.signature_input).keyup(function() {
      module.onSignatureUpdate($(this));
    });
    $(module.options.customMenu_input).keyup(function() {
      module.onCustomMenuUpdate($(this));
    });
    $(module.options.signature_input).trigger('keyup');
    module.lastCustomMenuInput = $(module.options.customMenu_input).val();

    module.dbg('loadModule : Ready');
  },

  onSignatureUpdate: function($e) {
    var module = this;
    var input = $e.val();
    var $outputArea = $('#signature_preview');
    if (!$outputArea.length) {
      $e.after('<div id="signature_preview"></div>');
      $outputArea = $('#signature_preview');
    }

    if (module.lastSignatureInput != input) {
      utils.delay(function() {
        utils.post({
          host: 'https://api.thetabx.net',
          path: '/utils/1/bbtohtml'
        }, {
          bbcode: input
        }, function(data) {
          $outputArea.html(data.html);
        });
      }, module.options.previewDelay);
      module.lastSignatureInput = input;
    }
  },

  onCustomMenuUpdate: function($e) {
    var module = this;
    var input = $e.val();
    if (module.lastCustomMenuInput != input) {
      utils.delay(function() {
        utils.post({
          host: 'https://api.thetabx.net',
          path: '/utils/1/bbtohtml'
        }, {
          bbcode: input
        }, function(data) {
          $('#custom_menu').html(data.html);
        });
      }, module.options.previewDelay);
      module.lastCustomMenuInput = input;
    }
  },
};
