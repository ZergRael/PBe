ext.modules.logs = {
  name: 'logs',
  dText: 'Logs',
  pages: [{
    path_name: '/logs.php',
    options: {
      buttons: '#head_notice_left',
      auto_refresh_interval: 60000
    }
  }],
  loaded: false,
  prepared: false,
  refreshTimer: false,
  filtersArray: {
      'uploads_filter': {
        className: 'log_upload'
      },
      'delete_filter': {
        className: 'log_upload_delete'
      },
      'edit_filter': {
        className: 'log_upload_edit'
      },
      'request_filter': {
        className: 'log_requests_new'
      },
      'request_fill_filter': {
        className: 'log_requests_filled'
      },
      'summary_edit_filter': {
        className: 'log_summary_edit'
      },
      'summary_new_filter': {
        className: 'log_summary_new'
      }
    },

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

    var buttons = [
      '<span id="uploads_filter" class="g_state_button g_filter g_state_' + (opt.get(module.name,
        'uploads_filter') ? '2' : '0') + '">Uploads</span>',
      '<span id="delete_filter" class="g_state_button g_filter g_state_' + (opt.get(module.name, 'delete_filter') ?
        '2' : '0') + '">Delete</span>',
      '<span id="edit_filter" class="g_state_button g_filter g_state_' + (opt.get(module.name, 'edit_filter') ?
        '2' : '0') + '">Edits</span>',
      '<span id="request_filter" class="g_state_button g_filter g_state_' + (opt.get(module.name,
        'request_filter') ? '2' : '0') + '">Requests</span>',
      '<span id="request_fill_filter" class="g_state_button g_filter g_state_' + (opt.get(module.name,
        'request_fill_filter') ? '2' : '0') + '">Requests filled</span>',
      '<span id="summary_edit_filter" class="g_state_button g_filter g_state_' + (opt.get(module.name,
        'summary_edit_filter') ? '2' : '0') + '">Summary edit</span>',
      '<span id="summary_new_filter" class="g_state_button g_filter g_state_' + (opt.get(module.name,
        'summary_new_filter') ? '2' : '0') + '">Summary new</span>',
      '<span id="auto_refresh" class="g_state_button g_button g_state_' + Number(opt.get(module.name,
        'auto_refresh')) + '">Auto refresh</span>',
    ];
    $(module.options.buttons).prepend(buttons.join(' '));

    $('.g_state_button').click(function() {
      var $button = $(this);
      var optName = $button.attr('id');
      var optState = opt.get(module.name, optName);

      if ($button.hasClass('g_filter')) {
        $button.removeClass('g_state_' + (optState ? '2' : '0'));
        optState = !optState;
        opt.set(module.name, optName, optState);
        module.refreshFilters();
        $(document).trigger('scroll');
        $button.addClass('g_state_' + (optState ? '2' : '0'));
      } else {
        $button.removeClass('g_state_' + Number(optState));
        optState = !optState;
        opt.set(module.name, optName, optState);
        if (optName == 'auto_refresh') {
          module.dbg('loadModule : autoRefresh is %s', opt.get(module.name, 'auto_refresh'));
          if (optState) {
            module.autoRefresh();
          } else {
            clearInterval(module.refreshTimer);
          }
        }
        $button.addClass('g_state_' + Number(optState));
      }
    });

    if (opt.get(module.name, 'auto_refresh')) {
      module.dbg('loadModule : autoRefresh starting');
      module.autoRefresh();
    }

    $(document).on('endless_scrolling_insertion_done', function() {
      module.dbg('loadModule : Endless scrolling module specific functions');
      module.refreshFilters(true);
      module.forceIdLinks();
      $(document).trigger('scroll');
    });

    module.initFilters();
    module.refreshFilters(true);
    module.forceIdLinks();

    module.dbg('loadModule : Ready');
  },

  autoRefresh: function() {
    var module = this;
    if (ext.url.params && ext.url.params.page != '0') {
      module.dbg('autoRefresh : Not first page');
      return;
    }

    module.refreshTimer = setInterval(function() {
      module.dbg('autoRefresh : Grabing this page');
      utils.grabPage(ext.url, function(data) {
        logsTR = $(data).find('tbody tr');
        module.dbg('autoRefresh : Got data');
        if (logsTR && logsTR.length) {
          var firstTR = $('tbody tr:nth(1)');
          var foundFirst = false;
          $(logsTR.get().reverse()).each(function() {
            if ($(this).text() == firstTR.text()) {
              foundFirst = true;
              return;
            }
            if (foundFirst && !$(this).find('.date_head').length) {
              $('tbody tr:first').after($(this));
              $('tbody tr:last').remove();
            }
          });
          module.refreshFilters(true);
          module.forceIdLinks();
        } else {
          module.dbg('autoRefresh : No data');
        }
      });
    }, module.options.auto_refresh_interval);
  },

  initFilters: function() {
    var module = this;
    $.each(module.filtersArray, function(filter, filterData) {
      filterData.show = !opt.get(module.name, filter);
      filterData.lastStatus = filterData.show;
    });
  },

  refreshFilters: function(notAnInput) {
    var module = this;
    module.dbg('refreshFilters : Refresh');
    $.each(module.filtersArray, function(filter, filterData) {
      filterData.show = !opt.get(module.name, filter);
      if (notAnInput || filterData.show != filterData.lastStatus) {
        if (filterData.show) {
          $('#log_list span.' + filterData.className).parents('tr').show();
        } else {
          $('#log_list span.' + filterData.className).parents('tr').hide();
        }
        filterData.lastStatus = filterData.show;
      }
    });
    module.dbg('refreshFilters : Done');
    $(document).trigger('es_dom_process_done');
  },

  forceIdLinks: function() {
    var module = this;
    module.dbg('forceIdLinks : Refresh');
    $('.log_upload, .log_upload_edit').each(function() {
      $(this).html($(this).html().replace(/Torrent (\d+)/, 'Torrent <a href="/torrent.php?id=$1">$1</a>'));
    });
    $('.log_summary_new, .log_summary_edit').each(function() {
      $(this).html($(this).html().replace(/Summary (\d+)/, 'Summary <a href="/summary.php?id=$1">$1</a>'));
    });
    $('.log_requests_new').each(function() {
      $(this).html($(this).html().replace(/Requests : ([^<]+)/, 'Request : <a href="/req.php?q=$1">$1</a>'));
    });
    $('.log_requests_filled').each(function() {
      $(this).html($(this).html().replace(/Requests ([^<]+) filled./,
        'Request <a href="/req.php?q=$1">$1</a> filled.'));
    });
    module.dbg('forceIdLinks : Done');
  },
};
