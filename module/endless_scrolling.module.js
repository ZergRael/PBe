ext.modules.endless_scrolling = {
  name: 'endless_scrolling',
  dText: 'Endless scrolling',
  loaded: false,
  prepared: false,
  pages: [{
    path_name: '/|/index.php',
    options: {
      optName: 'main',
      loading: '#pager_index:last',
      loadingPosition: 'before',
      path: '/sphinx.php',
      domExtract: '#torrent_list tr:not(.head_torrent)',
      domInsertion: '#torrent_list',
      ignoreFirst: 10,
      pageModifier: -1
    }
  }, {
    path_name: '/sphinx.php',
    options: {
      optName: 'sphinx',
      loading: '.pager_align:last',
      loadingPosition: 'before',
      pagination: '.pager_align',
      domExtract: '#torrent_list tr:not(.head_torrent)',
      domInsertion: '#torrent_list',
      pageModifier: -1
    }
  }, {
    path_name: '/forums.php',
    params: {
      action: 'viewforum'
    },
    options: {
      optName: 'viewforum',
      loading: '.thin table',
      loadingPosition: 'after',
      pagination: '.linkbox:not(:first)',
      domExtract: 'tbody tr:not(.colhead)',
      domInsertion: '.thin tr:last',
      domInsertionPosition: 'after',
      scrollOffset: 180,
      stopInsertBottomOffset: 100,
      notListeningToTrigger: true,
      endOfStream: 'No posts to display!'
    }
  }, {
    path_name: '/forums.php',
    params: {
      action: 'viewtopic'
    },
    options: {
      optName: 'viewtopic',
      loading: '.thin table:last',
      loadingPosition: 'after',
      pagination: '.linkbox',
      domExtract: '.thin table',
      domInsertion: '.thin table:last',
      domInsertionPosition: 'after',
      scrollOffset: 600,
      stopInsertBottomOffset: 100
    }
  }, {
    path_name: '/logs.php',
    options: {
      optName: 'logs',
      loading: '.pager_align:last',
      loadingPosition: 'before',
      pagination: '.pager_align',
      domExtract: 'tbody tr:not(:first)',
      domInsertion: 'tbody',
      pageModifier: -1
    }
  }, {
    path_name: '/req.php',
    options: {
      optName: 'req',
      loading: '.pager_align:last',
      loadingPosition: 'before',
      pagination: '.pager_align',
      domExtract: '#requests_list tbody tr:not(:first)',
      domInsertion: '#requests_list tbody',
      pageModifier: -1,
      notListeningToTrigger: true
    }
  }, {
    path_name: '/series.php',
    options: {
      optName: 'series',
      loading: '.pager_align:last',
      loadingPosition: 'before',
      pagination: '.pager_align',
      domExtract: '#torrent_list tr:not(.head_torrent)',
      domInsertion: '#torrent_list tbody',
      pageModifier: -1
    }
  }, {
    path_name: '/my.php',
    params: {
      action: 'activity',
    },
    options: {
      optName: 'activity',
      loading: '.pager_align:last',
      loadingPosition: 'before',
      pagination: '.pager_align',
      domExtract: '#table_snatchlist tbody tr:not(:first)',
      domInsertion: '#table_snatchlist tbody',
      pageModifier: -1
    }
  }],

  defaultScrollOffset: 200,
  backTopButtonOffset: 10,
  loadingPage: false,
  waitForInsert: false,
  lostPage: false,
  ignoreScrolling: false,
  stopEndlessScrolling: false,
  pauseEndlessScrolling: false,

  dbg: function() {
    utils.dbg(this.name, arguments);
  },

  prepare: function(mOptions) {
    var module = this;
    module.options = mOptions;
    module.prepared = true;

    module.pager = {
      firstPage: 1 + (module.options.pageModifier || 0),
      pages: []
    };
    module.pager.thisPage = ext.url.params && ext.url.params.page ?
      (ext.url.params.page == 'last' ? false : Number(ext.url.params.page)) : Number(module.pager.firstPage);
    module.pager.maxPage = module.options.pagination ? module.pager.thisPage : false;

    module.nextPage = module.pager.thisPage !== false ? module.pager.thisPage + 1 : false;
    module.previousLookedPage = module.pager.thisPage;
    module.insertedOffsets = {
      0: module.previousLookedPage
    };

    module.extractPagerAlignData();
  },

  loadModule: function() {
    var module = this;
    module.loaded = true;

    module.dbg('loadModule : url relative pages : [%d/%d]', module.pager.thisPage, module.pager.maxPage);
    module.rewritePagination(module.pager.thisPage);
    module.interceptPaginationClicks();

    $(document).scroll(function() {
      module.endlessScroll();
    });

    // Auto endless scrolling pause if any textarea has been focused - mostly forums usage
    $('textarea').focus(function() {
      if (!module.waitForInsert) {
        module.dbg('loadModule : Focused textarea - Pause endless scrolling');
        module.waitForInsert = true;
      }
    });

    $(document).on('click', 'a[onclick]', function() {
      var onClickFunction = $(this).attr('onclick');
      if ((onClickFunction.indexOf('Quote') != -1 || onClickFunction.indexOf('insertion') != -1) && $(
          'textarea').length) {
        module.waitForInsert = true;
      }
    });

    // Listen to after dom modifications by other modules
    $(document).on('es_dom_process_done', function() {
      module.rebuildInsertedOffsets();
      $(document).trigger('scroll');
    });

    module.dbg('loadModule : Ready');
  },

  extractPagerAlignData: function() {
    var module = this;
    if (!module.options.pagination) {
      return;
    }

    var paginateBar = $(module.options.pagination);
    if (!paginateBar.length || !paginateBar.text().match(/\S/)) {
      return;
    }

    module.dbg('extractPagerAlignData : Analysing pages');
    var paginationUrls = paginateBar.html().match(/page=\d+/g);
    if (!paginationUrls) {
      return;
    }

    module.dbg('extractPagerAlignData : Extracting pages');
    $.each(paginationUrls, function(i, paginationUrl) {
      var pageId = paginationUrl.match(/\d+/);
      if (!pageId) {
        return;
      }
      module.pager.pages.push(Number(pageId[0]));
      module.pager.maxPage = Math.max(module.pager.maxPage, Number(pageId[0]));
    });

    module.dbg('extractPagerAlignData : Done');
  },

  pageToLink: function(page) {
    var module = this;
    var linkUrl = utils.clone(ext.url);
    linkUrl.params = linkUrl.params || {};
    linkUrl.cancelQ = module.options.cancelQ;
    linkUrl.cancelAmp = module.options.cancelAmp;
    linkUrl.params.page = page.pageId;
    var text = page.pageId - (module.options.pageModifier || 0);

    if (page.end) {
      text = '[' + text + ']';
    } else if (page.prec) {
      text = '<';
    } else if (page.next) {
      text = '>';
    }
    return '<a href="' + utils.craftUrl(linkUrl) + '">' + (page.thisPage ? '<strong>' + text + '</strong>' : text) +
      '</a>';
  },

  rewritePagination: function(thisPage) {
    var module = this;
    if (!opt.get(module.name, 'pagination_rewrite') || module.pager.maxPage == module.pager.firstPage) {
      return;
    }

    module.dbg('rewritePagination : We\'re at [%d] in [%d/%d]', thisPage, module.pager.firstPage, module.pager.maxPage);
    var maxPagesToShow = 5;
    var pagesEachSide = (maxPagesToShow - 1) / 2;
    var pagesToShow = [];
    var addLeft = 0;
    var i;
    for (i = thisPage - pagesEachSide; i <= thisPage + pagesEachSide; i++) {
      while (i < module.pager.firstPage) {
        i++;
        pagesEachSide++;
      }
      pagesToShow.push(i);
    }

    for (i = 0; i < pagesToShow.length; i++) {
      if (pagesToShow[i] && pagesToShow[i] > module.pager.maxPage) {
        pagesToShow.splice(i, 1);
        addLeft++;
        i--;
      }
    }

    for (i = 1; i <= addLeft; i++) {
      if (pagesToShow[0] == module.pager.firstPage) {
        break;
      }

      pagesToShow.unshift(pagesToShow[0] - 1);
    }
    module.dbg('rewritePagination : Rewriting with [%s]', pagesToShow.join(', '));

    var paginateBar = [];
    var hasPrec = false;
    var hasNext = false;
    if (thisPage != module.pager.firstPage) {
      paginateBar.push({
        pageId: module.pager.firstPage,
        end: true
      });
      paginateBar.push({
        pageId: thisPage - 1,
        prec: true
      });
      hasPrec = true;
    }
    for (i in pagesToShow) {
      paginateBar.push({
        pageId: pagesToShow[i],
        thisPage: (pagesToShow[i] == thisPage)
      });
    }
    if (thisPage != module.pager.maxPage) {
      paginateBar.push({
        pageId: thisPage + 1,
        next: true
      });
      hasNext = true;
      paginateBar.push({
        pageId: module.pager.maxPage,
        end: true
      });
    }

    var paginateBarHtml = '';
    for (i = 0; i < paginateBar.length; i++) {
      paginateBarHtml += module.pageToLink(paginateBar[i]);
      if (i == paginateBar.length - 1) {} else if (i === 0 && hasPrec || i == paginateBar.length - 2 && hasNext) {
        paginateBarHtml += ' ';
      } else {
        paginateBarHtml += ' | ';
      }
    }

    $(module.options.pagination).html(paginateBarHtml);
  },

  endlessScroll: function() {
    var module = this;
    if (!opt.get(module.name, 'endless_scrolling') || !opt.get(module.name, module.options.optName) ||
      module.nextPage === false) {
      return;
    }

    // Damnit Gecko
    var scrollTop = (document.body.scrollTop || document.documentElement.scrollTop);
    if (opt.get(module.name, 'adapt_url') && !module.lostPage) {
      var lookingAtPage = 0;
      // Find out what page we are looking at
      $.each(module.insertedOffsets, function(topOffset, page) {
        if (scrollTop < topOffset) {
          return false;
        }
        lookingAtPage = page;
      });

      // Looks like we changed page, updates
      if (lookingAtPage != module.previousLookedPage) {
        module.dbg('endlessScroll : Looking at page [%d]', lookingAtPage);

        // Update URL
        var thisUrl = utils.clone(ext.url);
        thisUrl.params = thisUrl.params || {};
        thisUrl.cancelQ = module.options.cancelQ;
        thisUrl.cancelAmp = module.options.cancelAmp;
        thisUrl.params.page = lookingAtPage;
        window.history.replaceState(null, null, utils.craftUrl(thisUrl));

        module.rewritePagination(lookingAtPage);
        module.previousLookedPage = lookingAtPage;
      }
    }

    // ignore scrolling when backToTop button is pushed
    if (module.ignoreScrolling) {
      return;
    }

    // Back to top button management
    if (scrollTop > module.backTopButtonOffset) {
      $('#backTopButton').show();
      $('#esPauseButton').show();
    } else {
      $('#backTopButton').hide();
      $('#esPauseButton').hide();
    }

    // ignore scrolling we already grabbed all pages
    if (module.stopEndlessScrolling || module.pauseEndlessScrolling) {
      return;
    }

    // If we know what page we're at && (we are at last page || the next page is obviously out of boundary)
    if (module.pager.maxPage !== false && module.nextPage > module.pager.maxPage) {
      return;
    }

    // If, at any point in time, the user went to the very bottom the page, wait for confirmation before injection
    if (opt.get(module.name, 'pause_scrolling') &&
      scrollTop + window.innerHeight >= document.documentElement.scrollHeight) {
      module.dbg('endlessScroll : Wait for data insertion');
      module.waitForInsert = true;
    }

    if ((scrollTop + window.innerHeight > document.documentElement.scrollHeight -
        (module.options.scrollOffset ? module.options.scrollOffset : module.defaultScrollOffset)) &&
      !module.loadingPage) {
      module.dbg('endlessScroll : Loading next page');
      // Prevent further unneeded fetching
      module.loadingPage = true;

      // Build the url object for the next page
      var nextUrl = utils.clone(ext.url);
      nextUrl.path = module.options.path ? module.options.path : nextUrl.path;
      nextUrl.params = nextUrl.params ? nextUrl.params : {};
      nextUrl.cancelQ = module.options.cancelQ || nextUrl.cancelQ || false;
      nextUrl.cancelAmp = module.options.cancelAmp || nextUrl.cancelAmp || false;
      nextUrl.params.page = module.nextPage;
      var loadingP = '<p class="page_loading"><img src="' + utils.getExtensionUrl(
        'images/loading.gif') + '" /><br />Réticulation des méta-données de la page suivante</p>';

      // Loading gif injection
      utils.insertHtml(loadingP, $(module.options.loading), module.options.loadingPosition);

      // Fetching
      utils.grabPage(nextUrl, function(data, pageI) {
        // Extract needed data
        insertionData = $(data).find(module.options.domExtract);
        module.dbg('endlessScroll : Grab ended');
        if (insertionData && insertionData.length && !(module.options.endOfStream && insertionData.text().indexOf(
            module.options.endOfStream) != -1)) {
          // We use a generic function we can cycle because of the pause_scrolling
          module.insertAjaxData(insertionData, pageI);
        } else {
          module.dbg('endlessScroll : No more data');
          $('.page_loading').text('Plus rien en vue cap\'tain !');
        }
      });
    }
  },

  insertAjaxData: function(data, pageI) {
    var module = this;
    if (module.waitForInsert) {
      module.dbg('insertAjaxData : Waiting for user confirmation in order to insert more');
      $('.page_loading').html('<a href="#" class="resume_endless_scrolling">Reprendre l\'endless scrolling</a>');
      $('.resume_endless_scrolling').click(function(e) {
        module.waitForInsert = false;
        // For an unknown reason, sometimes this button fucks up, prevent it
        e.preventDefault();
        module.insertAjaxData(data, pageI);
        return false;
      });
      return;
    }

    if (module.options.ignoreFirst && pageI === module.pager.firstPage + 1) {
      module.dbg('insertAjaxData : Removing [%s] lines', module.options.ignoreFirst);
      data = data.filter(function(i) {
        return i >= module.options.ignoreFirst;
      });
    }

    // Export data processing in another function in case we need some more parsing in the future
    var processedData = module.processData(data, pageI);

    // Inject data in the dom
    module.dbg('insertAjaxData : Got data - Inserting');
    utils.insertHtml(processedData, $(module.options.domInsertion), module.options.domInsertionPosition);

    // End the loading and prepare for next page
    module.nextPage++;
    module.loadingPage = false;
    $('.page_loading').remove();
    // Tell the other modules that we got some new data to process
    $(document).trigger('endless_scrolling_insertion_done');
    // If the module we are using does not need to process the data, we can build the offsets right now
    // else, we wait for the es_dom_process_done trigger
    if (module.options.notListeningToTrigger) {
      module.rebuildInsertedOffsets();
    }
    module.dbg('insertAjaxData : Insertion ended');
  },

  processData: function(data, pageI) {
    var module = this;
    module.dbg('processData : Found first dom element - Tagging it');
    data.first().addClass('dom_page_start').data('page', pageI);
    if (module.preInsertion) {
      data = module.preInsertion(data);
    }
    return data;
  },

  rebuildInsertedOffsets: function() {
    var module = this;
    module.dbg('rebuildInsertedOffsets : Rebuilding offets');
    // There is no .dom_page_start for the original(first) page, but the offset is always 0, so insert it manualy
    module.insertedOffsets = {
      0: module.insertedOffsets[0]
    };
    // Find the page marker and get the associed offset
    $('.dom_page_start').each(function() {
      var line = $(this);
      // Most browsers can't extract an offset from an hiden dom element
      if (!line.is(':visible')) {
        // Find the closest visible element, going down
        line = line.nextAll(':visible').first();
      }

      if (line.offset()) {
        module.insertedOffsets[line.offset().top] = $(this).data('page');
      }
    });
    module.dbg('rebuildInsertedOffsets : Offsets ready');
  },

  getOffsetByPage: function(pageSearch) {
    var module = this;
    module.dbg('getOffsetByPage : Looking for page [%d] in offsets object', pageSearch);
    var offset = false;
    $.each(module.insertedOffsets, function(top, page) {
      if (page == pageSearch) {
        offset = top;
        return false;
      }
    });
    return offset;
  },

  interceptPaginationClicks: function() {
    var module = this;
    // Remap href links to scroll to offset instead of load a new page
    // We don't modify links, just add a click listenner and prevent the browser to change page if we can scroll
    if (module.options.pagination && opt.get(module.name, 'adapt_url')) {
      $(document).on('click', module.options.pagination + ' a', function() {
        var href = $(this).attr('href');
        var hrefPage = href.match(/page=(\d+)/);
        if (hrefPage.length) {
          toTop = module.getOffsetByPage(hrefPage[1]);
          if (toTop !== false) {
            module.dbg('interceptPaginationClicks : Found it. Scrolling to [%d]', toTop);
            $(document).scrollTop(toTop);
            return false;
          }
        }
      });
    }
  },
};
