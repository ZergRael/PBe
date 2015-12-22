ext.modules.torrent_list = {
  name: 'torrent_list',
  dText: 'Liste torrents',
  pages: [{
    path_name: '/|/index.php',
    options: {
      buttons: '#sort',
      btnPos: 'prepend',
      canRefresh: true,
      canMark: true,
      canFilter: true,
      canSort: true
    }
  }, {
    path_name: '/sphinx.php',
    options: {
      buttons: '.form_search',
      btnPos: 'append',
      canFilter: true,
      canSort: true
    }
  }, {
    path_name: '/summary.php',
    options: {
      buttons: '.torrent_list',
      btnPos: 'prepend',
      canFilter: true
    }
  }, {
    path_name: '/series.php',
    options: {
      buttons: '#torrent_list',
      btnPos: 'before',
      canFilter: true
    }
  }],
  loaded: false,
  prepared: false,
  torrentList: [],
  bookmarksList: [],
  basicFilters: {
    freeleech: 0,
    nuked: 0,
  },
  stringFilters: {
    original: '',
    ready: false,
  },
  filterProperties: {
    c: 'completed',
    s: 'seed',
    l: 'leech',
    m: 'comments'
  },
  filterOperators: {
    '<': 0,
    '=': 1,
    '>': 2
  },
  autorefreshInterval: false,
  isRefreshable: false,
  columns_def: {
    1: 'normal',
    3: 'coms',
    4: 'size',
    5: 'complets',
    6: 'seeders',
    7: 'leechers'
  },

  dbg: function() {
    utils.dbg(this.name, arguments);
  },

  prepare: function(mOptions) {
    var module = this;
    module.options = mOptions;
    module.prepared = true;

    module.refreshDate();
  },

  loadModule: function() {
    var module = this;
    module.loaded = true;

    ext.modules.endless_scrolling.preInsertion = module.tagTorrents;

    var filterButtons = ['<span id="filter_freeleech" class="g_state_button g_filter g_state_' + opt.get(
        module.name, 'filter_freeleech') + '">FreeLeech</span>',
      '<span id="filter_nuked" class="g_state_button g_filter g_state_' + opt.get(module.name, 'filter_nuked') +
      '">Nuked</span>'
    ].join(' ');
    var stringFilterInput =
      '<input type="text" id="filter_string" placeholder="Filtre" size="12" title="Options de filtrage\n' +
      'Complétés : c<10\nSeeders : s=1\nLeechers : l>12\nCommentaires : m>0\nChaine de caractères\n' +
      'Opérateurs : && || !\n\nExemples :\nDVDRiP ou BDRiP avec +10 seeders\n\'dvdrip || bdrip && s>10\'' +
      '\n\nExclure FUNKY et CARPEDIEM\n\'!funky && !carpediem\'" />';
    var refreshButton = '<span id="auto_refresh" class="g_state_button g_button g_state_' + Number(opt.get(
      module.name, 'auto_refresh')) + '">Auto refresh</span>';
    var buttons = [];

    module.dbg('loadModule : Starting');

    // Adding buttons
    if (!ext.url.params || !ext.url.params.sort || (ext.url.params.sort == 'id' && ext.url.params.order == 'desc')) {
      module.isRefreshable = true;
    }
    if (module.options.canRefresh && module.isRefreshable) {
      buttons.push(refreshButton);
    }
    if (module.options.canFilter) {
      buttons.push(filterButtons);
      if (opt.get(module.name, 'filter_string')) {
        buttons.push(stringFilterInput);
      }
    }

    utils.insertHtml(buttons.join(' '), $(module.options.buttons), module.options.btnPos);

    // Torrents filtering
    $('.g_state_button').click(function() {
      var $button = $(this);
      var optName = $button.attr('id');
      var optStatus = opt.get(module.name, optName);
      $button.removeClass('g_state_' + Number(optStatus));
      if ($button.hasClass('g_filter')) {
        optStatus = ++optStatus > 2 ? 0 : optStatus;
        opt.set(module.name, optName, optStatus);
        module.dbg('loadModule : Filter %s is %s', optName, opt.get(module.name, optName));
        module.filtersChanged();
      } else {
        optStatus = !optStatus;
        opt.set(module.name, optName, optStatus);
        if (optName == 'auto_refresh') {
          if (optStatus) {
            module.dbg('loadModule : Starting auto refresh');
            module.startAutorefresh();
          } else {
            module.dbg('loadModule : Ended auto refresh');
            clearInterval(module.autorefreshInterval);
          }
        }
      }
      $button.addClass('g_state_' + Number(optStatus));
    });

    $('#filter_string').on('change', function() {
      module.filtersChanged();
    }).on('keydown', function(e) {
      if (e.which == 13) {
        e.preventDefault();
      }
    }).on('keyup', function(e) {
      if (e.which == 13) {
        module.filtersChanged();
      }
    });

    module.initColumns();
    module.tagTorrents($('#torrent_list tr:not(.head_torrent)'));
    module.filtersChanged();
    module.columnSorter();

    $('#torrent_list').on('mouseenter', 'a', function() {
        module.showTorrentComments($(this));
      }).on('click', 'a.autoget_link', module.autogetOnClick)
      .on('click', 'a.bookmark_link', module.bookmarkOnClick)
      .on('mouseenter mouseleave', 'img[alt="+"]', function(e) {
        module.previewTorrent(e, $(this));
      });

    module.startAutorefresh();

    $(document).on('endless_scrolling_insertion_done', function() {
      module.dbg('loadModule : Endless scrolling module specific functions');
      module.refreshDate();
      module.applyFilters();
      $(document).trigger('es_dom_process_done');
    });

    module.dbg('loadModule : Ready');
  },

  tagTorrents: function(torrentLines) {
    var module = ext.modules.torrent_list;
    module.dbg('tagTorrents : Scanning torrents');
    module.bookmarksList = gData.get('bookmarks', 'torrents');
    var jumpMe = false;
    torrentLines.each(function() {
      if (jumpMe) {
        jumpMe = false;
        return;
      }
      jumpMe = true;

      module.torrentList.push(module.tagTorrent($(this)));
    });
    module.dbg('tagTorrents : Ended scanning');
    return torrentLines;
  },

  tagTorrent: function($node) {
    var module = this;
    var t = {
      node: $node,
      name: $node.find('strong').text(),
      status: {},
      shown: true,
      nextNode: $node.next()
    };
    t.lName = t.name.toLowerCase();
    var imgs = $node.find('img');
    $.each(imgs, function() {
      if (module.bookmarksList) {
        var imgId = $(this).attr('id');
        if (imgId) {
          var id = imgId.substring(10);
          t.id = id;
          if (module.bookmarksList.indexOf(id) != -1) {
            $node.find('img:nth(1)').after(' <img src="' + utils.getExtensionUrl('images/bookmark.png') +
              '" />');
            t.status.bookmark = true;
          }
        }
      }
      switch ($(this).attr('alt')) {
        case 'Torrent en FreeLeech':
          t.status.freeleech = true;
          break;
        case ' Nuke ! ':
          t.status.nuked = true;
          break;
      }
      var tds = $node.find('td');
      t.comments = Number(tds.eq(3).text().trim());
      t.completed = Number(tds.eq(5).text().trim());
      t.seed = Number(tds.eq(6).text().trim());
      t.leech = Number(tds.eq(7).text().trim());
    });

    var tds = $node.find('td');
    var tdNumber = 0;
    if (tds.eq(1).hasClass('name_torrent_1')) { // Keep background-color alternance
      tdNumber = 1;
    }

    var cols = [];
    if (module.ageCol) {
      // Append our age td
      cols.push('<td class="age_torrent ext_col_' + tdNumber + '">' +
        utils.shortDurationFormat($node.next().text()) + '</td>');
    }
    if (module.bookmarkCol) {
      cols.push('<td class="bookmark_torrent ext_col_' + tdNumber +
        '"><a href="#" class="bookmark_link"><img src="' + utils.getExtensionUrl(
          'images/bookmark.png') + '" /></a></td>');
    }
    if (module.autogetCol) {
      cols.push('<td class="autoget_torrent ext_col_' + tdNumber +
        '"><a href="#" class="autoget_link"><img src="static/images/site/rss.gif" /></a></td>');
    }

    tds.eq(1).after(cols);
    return t;
  },

  filtersChanged: function() {
    var module = this;
    if (!module.torrentList.length) {
      return;
    }
    module.refreshFilterSet();
    module.dbg('filtersChanged : Filters ready');
    module.applyFilters();
    module.dbg('filtersChanged : Done');
    $(document).trigger('es_dom_process_done');
  },

  refreshFilterSet: function() {
    var module = this;
    module.basicFilters = {
      freeleech: opt.get(module.name, 'filter_freeleech'),
      nuked: opt.get(module.name, 'filter_nuked')
    };
    var stringFilterString = $('#filter_string').val() || '';
    var noFilterActive = true;
    for (var filter in module.basicFilters) {
      if (module.basicFilters[filter] > 0) {
        noFilterActive = false;
      }
    }
    if (opt.get(module.name, 'filter_string') && stringFilterString != module.stringFilters.original) {
      module.stringFilters = module.compileStringFilter(stringFilterString);
    }
    if (module.stringFilters.ready) {
      noFilterActive = false;
    }
  },

  applyFilters: function() {
    var module = this;
    var showTorrents = [];
    var hideTorrents = [];
    $.each(module.torrentList, function(index, t) {
      var shouldShow = true;

      // Basic filters
      for (var filter in module.basicFilters) {
        var filterStatus = module.basicFilters[filter];
        if (filterStatus == 1) {
          if (!t.status[filter]) {
            shouldShow = false;
          }
        } else if (filterStatus == 2) {
          if (t.status[filter]) {
            shouldShow = false;
          }
        }
      }

      // String filter
      if (shouldShow && module.stringFilters.ready) {
        for (var i in module.stringFilters.orFilters) { // Loop all || blocks
          for (var j in module.stringFilters.orFilters[i]) { // Loop && blocks
            var f = module.stringFilters.orFilters[i][j];
            if (f.fType === 0) {
              if (f.operator === 0) {
                shouldShow = (t[f.prop] < f.val);
              } else if (f.operator == 1) {
                shouldShow = (t[f.prop] == f.val);
              } else if (f.operator == 2) {
                shouldShow = (t[f.prop] > f.val);
              }
            } else if (f.fType == 1) {
              shouldShow = (t.lName.indexOf(f.str) == -1);
            } else if (f.fType == 2) {
              shouldShow = (t.lName.indexOf(f.str) > -1);
            }

            if (!shouldShow) { // In a &&, stop loop as soon as one member is false
              break;
            }
          }

          if (shouldShow) { // In a ||, stop loop as soon as one && block is true
            break;
          }
        }
      }

      if (shouldShow && !t.shown) {
        t.shown = true;
        showTorrents.push(t.node, t.nextNode);
      }
      if (!shouldShow && t.shown) {
        t.shown = false;
        hideTorrents.push(t.node, t.nextNode);
      }
    });

    if (showTorrents.length > 0) {
      dbg('applyFilters : Showing [%d] lines', showTorrents.length);
      $.each(showTorrents, function() {
        $(this).show();
      });
    }
    if (hideTorrents.length > 0) {
      dbg('applyFilters : Hiding [%d] lines', hideTorrents.length);
      $.each(hideTorrents, function() {
        $(this).hide();
      });
    }
  },

  compileStringFilter: function(str) {
    var module = this;
    var sFilter = {
      original: str,
      proper: '',
      ready: false
    };
    sFilter.proper = str.toLowerCase().trim();
    if (sFilter.proper !== '') {
      sFilter.ready = true;
      sFilter.orFilters = [];
      var orSplit = sFilter.proper.split('||');
      for (var i in orSplit) {
        var sOr = orSplit[i].trim();
        var andSplit = sOr.split('&&');
        var andFilters = [];
        for (var j in andSplit) {
          var s = andSplit[j].trim();
          var f = {};
          var nFilter = s.match(/\b([cslm])\s*([<=>])\s*(\d+)\b/);
          if (nFilter) {
            f.fType = 0;
            f.prop = filterProperties[nFilter[1]];
            f.operator = filterOperators[nFilter[2]];
            f.val = Number(nFilter[3]);
            module.dbg('compileStringFilter : %s %s %s', f.prop, f.operator, f.val);
          } else if (s.indexOf('!') === 0) {
            f.fType = 1;
            f.str = s.substring(1);
            module.dbg('compileStringFilter : NOT %s', f.str);
          } else {
            f.fType = 2;
            f.str = s;
            module.dbg('compileStringFilter : %s', f.str);
          }
          andFilters.push(f);
        }
        sFilter.orFilters.push(andFilters);
      }
    }
    return sFilter;
  },

  recalcAgeColumn: function() {
    var module = this;
    if (!opt.get(module.name, 'age_column')) {
      return;
    }

    module.dbg('recalcAgeColumn : Started torrents date recalc');
    var alreadyDated = false;
    $('tbody tr').each(function() {
      if (!$(this).hasClass('head_torrent')) {
        var tds = $(this).find('td');
        if (tds.first().hasClass('alt1')) { // Don't mind the hidden td
          return;
        }

        // Append our age td
        tds.eq(2).text(utils.shortDurationFormat($(this).next().text()));
      }
    });
    module.dbg('recalcAgeColumn : Ended');
  },

  initColumns: function() {
    var module = this;
    module.dbg('initColumns : Started');
    var bgHeader = $('.name_torrent_head:first').css('background-color');
    var bg0 = $('.name_torrent_0:first').css('background-color');
    var bg1 = $('.name_torrent_1:first').css('background-color');
    var customCss = [];

    if (bgHeader) {
      customCss.push('.ext_col_head {background-color: ' + bgHeader + '}');
    }
    if (bg0) {
      customCss.push('.ext_col_0 {background-color: ' + bg0 + '}');
    }
    if (bg1) {
      customCss.push('.ext_col_1 {background-color: ' + bg1 + '}');
    }
    $('#ext_css').append(customCss.join(' '));

    module.autogetCol = opt.get(module.name, 'autoget_column');
    module.bookmarkCol = opt.get(module.name, 'bookmark_column');
    module.ageCol = opt.get(module.name, 'age_column');

    var $nameTd = $('#torrent_list tr.head_torrent td:nth(1)');
    var cols = [];
    if (module.ageCol) {
      if (module.options.canSort) {
        var sortedUrl = utils.clone(ext.url);
        sortedUrl.path = '/sphinx.php';
        sortedUrl.params = sortedUrl.params || {};
        sortedUrl.params.page = 0;
        sortedUrl.params.sort = 'id';
        sortedUrl.params.order = 'desc';
        if (ext.url.params && ext.url.params.sort == 'id' && ext.url.params.order != 'asc') {
          sortedUrl.params.order = 'asc';
        }

        cols.push('<td class="ext_col_head age_torrent_head"><a href="' + utils.craftUrl(sortedUrl) +
          '">Age</a></td>');
      } else {
        cols.push('<td class="ext_col_head age_torrent_head">Age</td>');
      }
    }
    if (module.bookmarkCol) {
      cols.push('<td class="ext_col_head bookmark_torrent_head">Bkm</td>');
    }
    if (module.autogetCol) {
      cols.push('<td class="ext_col_head autoget_torrent_head">Get</td>');
    }
    $nameTd.after(cols);
    module.dbg('initColumns : Done');
  },

  autogetOnClick: function() {
    $(this).parents('tr').next().find('a[onclick^=AutoGet]').get(0).click();
    return false;
  },

  bookmarkOnClick: function() {
    $(this).parents('tr').next().find('a[onclick^=AutoBook]').get(0).click();
    return false;
  },

  startAutorefresh: function() {
    var module = this;
    if (!opt.get(module.name, 'auto_refresh') || !module.options.canRefresh || !module.isRefreshable) {
      return;
    }

    module.autorefreshInterval = setInterval(function() {
      module.dbg('autorefresh : Grabing this page');
      utils.grabPage(ext.url, function(data) {
        torrentsTR = $(data).find('#torrent_list tr');
        module.dbg('autorefresh : Got data');
        if (torrentsTR && torrentsTR.length) {
          var firstTorrentId = module.torrentList[0].id;
          var foundFirst = false;
          var insertedTrs = false;
          var tdNumber = 0;
          $(torrentsTR.get().reverse()).each(function() {
            if (!foundFirst && !$(this).find('.alt1').length && !$(this).hasClass('head_torrent') &&
              Number($(this).find('td:nth(1) img:first').attr('id').substring(10)) >=
              firstTorrentId) {
              foundFirst = true;
              return;
            }
            if (foundFirst && !$(this).hasClass('head_torrent')) {
              var torrentTR = $(this);
              if (!torrentTR.find('.alt1').length) {
                torrentTR.find('td:nth(1)').css('background-color', opt.get(module.name,
                  'auto_refresh_color'));
                module.torrentList.unshift(module.tagTorrent(torrentTR));
              }
              $('#torrent_list tr:first').after(torrentTR);
              $('#torrent_list tr:last').remove();
              insertedTrs = true;
            }
          });
          if (insertedTrs) {
            module.dbg('autorefresh : Inserted torrents');
            $(document).trigger('endless_scrolling_insertion_done');
          } else {
            module.dbg('autorefresh : Nothing new');
          }
          module.refreshDate();
          module.recalcAgeColumn();
        } else {
          module.dbg('autorefresh : No data');
        }
      });
    }, 60000);
  },

  columnSorter: function() {
    var module = this;
    if (!module.options.canSort) {
      return;
    }

    var sortedUrl = utils.clone(ext.url);
    sortedUrl.path = '/sphinx.php';
    sortedUrl.params = sortedUrl.params || {};
    sortedUrl.params.page = 0;

    $('.head_torrent:first td').each(function(k, td) {
      if (module.columns_def[k]) {
        sortedUrl.params.sort = module.columns_def[k];
        sortedUrl.params.order = 'desc';
        if (ext.url.params && ext.url.params.sort == module.columns_def[k] && ext.url.params.order != 'asc') {
          sortedUrl.params.order = 'asc';
        }

        $(this).wrapInner('<a href="' + utils.craftUrl(sortedUrl) + '"></a>');
      }
    });
  },

  showTorrentComments: function(commLink) {
    var module = this;
    if (opt.get(module.name, 'direct_comments') && commLink.attr('href').indexOf('#torrent_comments') != -1 &&
      commLink.text() != '0') {
      utils.grabPage(commLink.attr('href'), function(data) {
        $('#ext_t_comm').remove();

        var $content = $(data.replace(/<script type="text\/javascript" src="static\/js\/.*"><\/script>/g,
          '')).find('#torrent_comments');

        utils.appendFrame({
          id: 't_comm',
          title: 'Commentaires pour le torrent ' + commLink.attr('href').match(/\d+/)[0],
          data: $content,
          relativeToWindow: true,
          top: 20,
          left: true,
          css: {
            minWidth: 500,
            maxWidth: 780,
            maxHeight: 600
          },
          removeOnOutsideClick: true
        });
        //$('#ext_t_comm').find('#ext_t_comm_data p, #ext_t_comm_data #com').remove();
        $('#ext_t_comm_data #com').hide();
        $('#ext_t_comm_data p:first').click(function() {
          $('#ext_t_comm_data #com').slideToggle();
        });
        $('#ext_t_comm').mouseleave(function() {
          $(this).remove();
        });
      });
    }
  },

  previewTorrent: function(e, $e) {
    var module = this;
    if (!opt.get(module.name, 'preview')) {
      return;
    }
    var torrentId = $e.attr('id').substring(10);

    if (e.type == 'mouseleave') {
      module.dbg('previewTorrent : Remove');
      $('#ext_preview_' + torrentId).remove();
    } else {
      var pos = $e.offset();
      $('#global').after('<div id="ext_preview_' + torrentId + '" class="ext_preview"><img src="' +
        utils.getExtensionUrl('images/loading.gif') + '" /></div>');
      $('#ext_preview_' + torrentId).offset({
        top: pos.top - 6,
        left: pos.left - 38
      });
      module.dbg('previewTorrent : Fetch torrent info');
      utils.grabPage('/torrent.php?id=' + torrentId + '', function(data) {
        var previewDiv = $('#ext_preview_' + torrentId);
        if (!previewDiv.length) {
          module.dbg('previewTorrent : Abort !');
          return;
        }

        var imgs = [];
        $(data).find('#torrent fieldset img').each(function() {
          imgs.push($(this).attr('src'));
        });
        $(data).find('#summary img').each(function() {
          imgs.push($(this).attr('src'));
        });
        if (!imgs.length) {
          $(data).find('#torrent div.bbcenter img').each(function() {
            imgs.push($(this).attr('src'));
          });
        }

        if (!imgs.length) {
          previewDiv.remove();
          return;
        }

        module.dbg('previewTorrent : Got torrent info with some imgs');
        var img = new Image();
        var i = 0;
        img.onload = function() {
          var top = pos.top;
          var scrollTop = (document.body.scrollTop || document.documentElement.scrollTop);
          var windowHeight = $(window).height();
          var resizedHeight = (this.width > 300 ? this.height * (300 / this.width) : this.height);
          if (top + resizedHeight + 4 > scrollTop + windowHeight) {
            top = (scrollTop + windowHeight) - resizedHeight - 4;
          }
          previewDiv.offset({
            top: top,
            left: pos.left - 6 - Math.min(this.width, 300)
          });
          $('#ext_preview_' + torrentId + ' img').attr('src', this.src);
        };
        img.src = imgs[i];
      });
    }
  },

  refreshDate: function() {
    utils.updateSiteRelativeDate();
  },
};
