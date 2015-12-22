ext.modules.bookmark = {
  name: 'bookmark',
  dText: 'Bookmarks',
  pages: [{
    path_name: '/bookmark.php',
    options: {},
  }],
  prepared: false,
  loaded: false,
  order: 'desc',
  sort: 'sortDate',

  dbg: function() {
    utils.dbg(this.name, arguments);
  },

  prepare: function(mOptions) {
    var module = this;
    module.options = mOptions;
    module.prepared = true;

    var colSortButtons = ['sortName', 'sortDate', 'sortSize', 'sortS', 'sortL'];
    var i = 0;
    $('#bookmark_list tr:first td').each(function() {
      if (colSortButtons[i]) {
        $(this).wrapInner('<a id="' + colSortButtons[i] + '" class="sortCol" href="#">');
      }
      i++;
    });

    $(document).on('click', '.dl a', module.setHighlight);

    $('.sortCol').click(function() {
      module.sortColumnClick($(this));
    });
  },

  loadModule: function() {
    var module = this;
    module.loaded = true;

    module.dbg('loadModule : Starting');
    // Execute functions

    ext.modules.global.parseBookmarks($('#bookmark_list tr:not(:first)'));

    module.dbg('loadModule : Ready');
  },

  setHighlight: function() {
    $('#torrent tbody tr').removeClass('bookmark_highlight');
    $(this).parents('tr').addClass('bookmark_highlight');
  },

  sortColumnClick: function($e) {
    var module = this;
    if (module.sort == $e.attr('id')) {
      module.order = (module.order == 'desc' ? 'asc' : 'desc');
    } else {
      module.sort = $e.attr('id');
      module.order = 'asc';
    }
    module.dbg('sortColumnClick : Click on column [%s > %s]', module.sort, module.order);
    module.sortData();
    return false;
  },

  sortData: function() {
    var module = this;
    if (!module.sort) {
      return;
    }
    module.dbg('sortData : Started');

    var sortFunc = false;
    switch (module.sort) {
      case 'sortName':
        sortFunc = function(a, b) {
          var aN = $(a).find('td:nth-child(1)').text();
          var bN = $(b).find('td:nth-child(1)').text();
          return module.order == 'desc' ? (aN > bN ? -1 : 1) : (aN > bN ? 1 : -1);
        };
        break;
      case 'sortDate':
        sortFunc = function(a, b) {
          var aN = $(a).find('td:nth-child(2)').text();
          var bN = $(b).find('td:nth-child(2)').text();
          return module.order == 'desc' ? (utils.dateToDuration(aN).minTot > utils.dateToDuration(bN).minTot ? -1 :
            1) : (utils.dateToDuration(aN).minTot > utils.dateToDuration(bN).minTot ? 1 : -1);
        };
        break;
      case 'sortSize':
        sortFunc = function(a, b) {
          var aN = $(a).find('td:nth-child(3)').text().trim();
          var bN = $(b).find('td:nth-child(3)').text().trim();
          return module.order == 'desc' ? (utils.strToSize(aN).koTot > utils.strToSize(bN).koTot ? -1 : 1) :
            (utils.strToSize(aN).koTot > utils.strToSize(bN).koTot ? 1 : -1);
        };
        break;
      case 'sortS':
        sortFunc = function(a, b) {
          var aN = Number($(a).find('td:nth-child(4)').text());
          var bN = Number($(b).find('td:nth-child(4)').text());
          return module.order == 'desc' ? (aN > bN ? -1 : 1) : (aN > bN ? 1 : -1);
        };
        break;
      case 'sortL':
        sortFunc = function(a, b) {
          var aN = Number($(a).find('td:nth-child(5)').text());
          var bN = Number($(b).find('td:nth-child(5)').text());
          return module.order == 'desc' ? (aN > bN ? -1 : 1) : (aN > bN ? 1 : -1);
        };
        break;
    }
    $('#bookmark_list tr:not(:first)').detach().sort(sortFunc).appendTo($('#bookmark_list'));
    module.dbg('sortData : Done');
  },
};
