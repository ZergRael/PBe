ext.modules.global = {
  name: 'global',
  dText: 'Global',
  prepared: false,
  loaded: false,

  dbg: function() {
    utils.dbg(this.name, arguments);
  },

  prepare: function(mOptions) {
    var module = this;
    module.options = mOptions;
    module.prepared = true;

    var optionsFrameButtons = '<li><a href="#" id="options_ext">' + ext.displayName + '</a></li>';
    $('#navig_bloc_user ul').append(optionsFrameButtons);
    $('#options_ext').click(function() {
      if ($('#ext_options').length) {
        var optionsFrame = $('#ext_options');
        if (optionsFrame.is(':visible')) {
          optionsFrame.hide();
        } else {
          optionsFrame.show();
        }
      } else {
        module.createOptionsFrame();
      }
      return false;
    });
  },

  loadModule: function() {
    var module = this;
    module.loaded = true;

    module.dbg('loadModule : Starting');
    // Execute functions

    module.listenToCtrlEnter();
    module.fetchBookmarks();
    module.refreshBookmarksOnBookmark();

    module.dbg('loadModule : Ready');
  },

  listenToCtrlEnter: function() {
    var module = this;
    module.dbg('listenToCtrlEnter : Started');
    $(document).on('keydown', 'textarea', function(e) {
      if (!opt.get(ext.modules.global.name, 'form_validation') || (!e.ctrlKey && !e.metaKey)) {
        return;
      }

      if (e.which == 13) {
        var submitButton = $(this).closest('form').find('input[type=submit]');
        if (!submitButton.length) {
          submitButton = $(this).closest('tbody').find('input[value=" Envoyer "]'); // TODO checkme
        }
        submitButton.click();
      }
    });
  },

  getOptionChilds: function(moduleName, parent) {
    var module = this;
    var childs = [];
    $.each(opt.options[moduleName], function(option, oData) {
      if (oData.parent && oData.parent == parent) {
        childs.push(option);
        childs.concat(module.getOptionChilds(moduleName, option));
      }
    });
    return childs;
  },

  createOptionInput: function(moduleName, optionName, oData) {
    var module = this;
    var optionHtml = '';
    if (oData.type == 'select') {
      var optionChoices = '';
      $.each(oData.choices, function(k, optionChoice) {
        optionChoices += '<option value="' + optionChoice + '"' + (oData.val == optionChoice ?
          ' selected="selected"' : '') + '>' + optionChoice + '</option>';
      });
      optionHtml = '<select id="ext_' + moduleName + '_' + optionName + '" ' + (oData.parent && !opt.get(
          moduleName, oData.parent) ? 'disabled="disabled" ' : '') + '>' + optionChoices +
        '</select> <label for="ext_' + moduleName + '_' + optionName + '"' + (oData.tooltip ? ' title="' +
          oData.tooltip + '"' : '') + '>' + oData.dispText + '</label><br />';
    } else if (oData.type == 'text') {
      optionHtml = '<input type="text" id="ext_' + moduleName + '_' + optionName + '" ' + (oData.parent && !
          opt.get(moduleName, oData.parent) ? 'disabled="disabled" ' : '') + 'value="' + opt.get(moduleName,
          optionName) + '"' + ' size="' + oData.width + '"/> <input id="ext_' + moduleName + '_' +
        optionName + '_savebutton" type="button" value="Ok"/> <label for="ext_' + moduleName + '_' +
        optionName + '"' + (oData.tooltip ? ' title="' + oData.tooltip + '"' : '') + '>' + oData.dispText +
        '</label><br />';
    } else {
      optionHtml = '<input type="checkbox" id="ext_' + moduleName + '_' + optionName + '" ' + (oData.parent &&
          !opt.get(moduleName, oData.parent) ? 'disabled="disabled" ' : '') + (opt.get(moduleName,
          optionName) ? 'checked="checked"' : '') + '/><label for="ext_' + moduleName + '_' + optionName +
        '"' + (oData.tooltip ? ' title="' + oData.tooltip + '"' : '') + '>' + oData.dispText + '</label><br />';
    }
    return '<span id="ext_' + moduleName + '_' + optionName + '_span"' + (oData.parentDeep ?
      'class="ext_opt_has_parent_' + oData.parentDeep + '"' : '') + '>' + optionHtml + '</span>';
  },

  createOptionsFrame: function() {
    var module = this;
    var optionsFrameData = '';
    // Full options pannel
    var optionsFrameHeader = '<div class="ext_options_header_button">Tout</div>';

    module.dbg('createOptionsFrame : Building frame');
    $.each(opt.options, function(moduleName, options) {
      var optionsSection = '<div id="ext_options_data_' + moduleName +
        '" class="ext_options_section"><div class="ext_frame_section_header">' + ext.modules[moduleName].dText +
        '</div>';
      var showSection = false;
      $.each(options, function(option, oData) {
        if (oData.showInOptions) {
          optionsSection += module.createOptionInput(moduleName, option, oData);
          showSection = true;
        }
      });
      optionsSection += '</div>';
      if (showSection) {
        // If there is no options to be shown for this section, just skip the whole div
        optionsFrameHeader += '<div class="ext_options_header_button" section="' + moduleName + '">' +
          ext.modules[moduleName].dText + '</div>';
        optionsFrameData += optionsSection;
      }
    });

    var onCloseCallback = function() {
      var section = $('.ext_options_header_button_selected').attr('section');
      opt.set(module.name, 'options_section', section);
    };

    var buttons = [{
      id: 'im_export',
      text: 'Importer/Exporter',
      callback: module.createImportExportFrame
    }];

    var copyright = '<a href="/forums.php?action=viewtopic&topicid=91">' + ext.displayName + '</a> by ' +
      '<a href="/account.php?id=130">' + ext.author + '</a><span class="ext_debug">.</span>';
    utils.appendFrame({
      id: 'options',
      title: 'PBenhanced Options',
      data: optionsFrameData,
      relativeToId: 'logolink',
      top: 8,
      left: 230,
      buttons: buttons,
      header: optionsFrameHeader,
      onCloseCallback: onCloseCallback,
      underButtonsText: copyright
    });

    $.each(opt.options, function(moduleName, options) {
      if (!$('#ext_options_data_' + moduleName).length) {
        // Since the section is not even shown, don't cycle through all options
        return;
      }

      $.each(options, function(option, oData) {
        if (oData.showInOptions) {
          var childs = module.getOptionChilds(moduleName, option);

          if (!oData.type || oData.type == 'select') {
            $('#ext_' + moduleName + '_' + option).change(function() {
              var state = null;
              if ($(this).is('select')) {
                state = $(this).val();
              } else {
                state = $(this).prop('checked');
              }
              opt.set(moduleName, option, state);
              module.dbg('createOptionsFrame : [%s] [%s] is %s', moduleName, option, opt.get(moduleName,
                option));
              if (oData.callback) {
                oData.callback(state);
              }

              if (childs.length) {
                $.each(childs, function(i, child) {
                  if (state) {
                    $('#ext_' + moduleName + '_' + child).prop('disabled', false);
                  } else {
                    $('#ext_' + moduleName + '_' + child).prop('checked', false);
                    $('#ext_' + moduleName + '_' + child).triggerHandler('change');
                    $('#ext_' + moduleName + '_' + child).prop('disabled', true);
                  }
                });
              }
            });
          } else if (oData.type == 'text') {
            $('#ext_' + moduleName + '_' + option + '_savebutton').click(function() {
              var val = $('#ext_' + moduleName + '_' + option).val();
              if (oData.regex) {
                if (!oData.regex.test(val)) {
                  opt.set(moduleName, option, oData.defaultVal);
                  $('#ext_' + moduleName + '_' + option).val(opt.get(moduleName, option));
                  return;
                }
              }
              opt.set(moduleName, option, val);
              module.dbg('createOptionsFrame : [%s] [%s] is %s', moduleName, option, opt.get(moduleName,
                option));
              if (oData.callback) {
                oData.callback(state);
              }
            });
          }

          if (oData.parent) {
            $('#ext_' + moduleName + '_' + option + '_span').hover(function() {
              $('#ext_' + moduleName + '_' + oData.parent + '_span').addClass(
                'ext_option_required');
            }, function() {
              $('#ext_' + moduleName + '_' + oData.parent + '_span').removeClass(
                'ext_option_required');
            });
          }
        }
      });
    });

    $('.ext_options_header_button').hover(function() {
      $('.ext_options_header_button').removeClass('ext_options_header_button_selected');
      $(this).addClass('ext_options_header_button_selected');

      var section = $(this).attr('section');
      if (section) {
        $('.ext_options_section').hide();
        $('#ext_options_data_' + section).show();
      } else {
        $('.ext_options_section').show();
      }
    }, function() {});

    var section = opt.get(ext.modules.global.name, 'options_section');
    if (section) {
      $('.ext_options_header_button[section=' + section + ']').trigger('mouseenter');
    } else {
      $('.ext_options_header_button:first-child').trigger('mouseenter');
    }

    $('.ext_debug').dblclick(function() {
      ext.DEBUG = !ext.DEBUG;
    });

    module.dbg('createOptionsFrame : Frame ready');
  },

  createImportExportFrame: function() {
    var module = this;
    $('#ext_options_close').click();

    module.dbg('createImportExportFrame : Generate link');
    var savedData = {
      opt: opt.exportAll(),
      gData: gData.exportAll()
    };
    var blob = new Blob([JSON.stringify(savedData)], {
      type: 'application/json'
    });
    var url = URL.createObjectURL(blob);

    var frameData = [
      '<div class="ext_frame_section_header">Exporter</div>',
      '<a href="' + url + '" download="drakkar.backup.json">Télécharger l\'export des options</a>',
      '<div class="ext_frame_section_header">Importer</div>',
      '<input id="import_file" type="file" />',
      '<div id="import_result"></div>'
    ];
    utils.appendFrame({
      id: 'im_export',
      title: 'Drakkar Import/Export',
      data: frameData.join(''),
      relativeToId: 'content',
      top: 8,
      left: 230
    });
    $('#import_file').change(function() {
      var result = $('#import_result');
      module.dbg('createImportExportFrame.import : Got file');
      result.html('Ouverture du fichier');
      var fileInput = $(this).get(0).files[0];
      if (fileInput) {
        var reader = new FileReader();
        reader.onload = function(e) {
          module.dbg('createImportExportFrame.import : Reading file');
          result.html(result.html() + '<br />Lecture en cours');
          var file = e.target.result;
          if (file) {
            var obj = JSON.parse(file);
            if (obj && obj.opt) {
              module.dbg('createImportExportFrame.import : Importing opt');
              result.html(result.html() + '<br />Import des options');
              opt.importAll(obj.opt);
            }
            if (obj && obj.gData) {
              module.dbg('createImportExportFrame.import : Importing gData');
              result.html(result.html() + '<br />Import des données');
              gData.importAll(obj.gData);
            }
          }
          result.html(result.html() + '<br />Importation terminée. La page va être rafraîchie.');
          setTimeout(function() {
            window.location.reload();
          }, 5000);
        };
        reader.readAsText(fileInput);
      }
    });
  },

  timeOffsets: {
    'bookmarks': 24 * 60 * 60 * 1000,
  },
  isDataUsable: function(data) {
    return new Date().getTime() < (gData.get(data, 'last_check') + this.timeOffsets[data]);
  },

  fetchBookmarks: function(force) {
    var module = this;
    if (!force && module.isDataUsable('bookmarks')) {
      return;
    }
    module.dbg('fetchBookmarks : Grab bookmarks');
    var snatchedUrl = {
      host: ext.url.host,
      path: '/bookmark.php'
    };
    utils.grabPage(snatchedUrl, function(data) {
      module.parseBookmarks($(data).find('#bookmark_list tr:not(:first)'));
    });
  },

  parseBookmarks: function(torrents) {
    var module = this;
    gData.setFresh('bookmarks');
    if (!torrents.length) {
      module.dbg('parseBookmarks : No bookmarks found - Bail out');
      gData.set('bookmarks', 'torrents', []);
      return;
    }

    var torrentIds = [];
    torrents.each(function() {
      var torrentLink = $(this).find('a:nth(1)').attr('href');
      var torrentId = torrentLink.match(/id=(\d+)/)[1];
      torrentIds.push(torrentId);
    });
    gData.set('bookmarks', 'torrents', torrentIds);
    module.dbg('parseBookmarks : Found %d bookmarks', torrentIds.length);
  },

  refreshBookmarksOnBookmark: function() {
    var module = this;
    $(document).on('click', 'a[onclick]', function() {
      var aLink = $(this);
      if (aLink.attr('onclick').indexOf('AutoBook') != -1) {
        module.dbg('refreshBookmarksOnBookmark : Bookmark added - Force refresh');
        module.fetchBookmarks(true);
        if ($(this).parent().hasClass('added')) {
          var cross = $(this).parents('tr').prev().find('td:nth(1) img:nth(0)');
          if (cross && gData.get('bookmarks', 'torrents').indexOf(cross.attr('id').substring(10)) == -1) {
            cross.after(' <img class="remove_bookmark_star" src="' + utils.getExtensionUrl(
              'images/bookmark.png') + '" />');
          }
        }
      }
    });
  },
};
