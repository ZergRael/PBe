ext.modules.shoutbox = {
  name: 'shoutbox',
  dText: 'Shoutbox',
  pages: [{
    path_name: '/shoutbox.php',
    options: {}
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

    module.$shoutbox = $('#shoutbox_contain');
    module.$dupe_shoutbox = null;

    module.removeSound();
    module.removeAvatars();

    window.addEventListener('message', function(e) {
      if (e.data.type == 'ext_shoutbox_ajaxsuccess') {
        ext.modules.twits.delayedColor();
        module.removeAvatars();
        module.updateDupeShoutbox();
      }
    }, false);

    // Insert script directly in html to catch ajax global events
    utils.insertScript('ext_shoutbox', function() {
      $(document).ajaxSuccess(function(e, xhr, settings, data) {
        window.postMessage({
          type: 'ext_shoutbox_ajaxsuccess'
        }, '*');
      });
    }, true);

    ext.modules.twits.delayedColor();
    module.duplicateShoutbox();

    module.dbg('loadModule : Ready');
  },

  removeSound: function() {
    var module = this;
    if (opt.get(module.name, 'no_sound')) {
      $('#son').prop('checked', false).parent().hide();
    }
  },

  removeAvatars: function() {
    var module = this;
    if (opt.get(module.name, 'no_avatar')) {
      module.$shoutbox.find('tr td:nth-child(2n+1)').hide();
    }
  },

  duplicateShoutbox: function() {
    this.$dupe_shoutbox = this.$shoutbox.clone().attr('id', 'dupe_shoutbox_contain');
    this.$shoutbox.hide().after(this.$dupe_shoutbox);
  },

  updateDupeShoutbox: function() {
    this.$dupe_shoutbox.html(this.$shoutbox.html());
  },
};
