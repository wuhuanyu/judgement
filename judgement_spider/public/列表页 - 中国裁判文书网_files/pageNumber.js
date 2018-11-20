/*edit by fukai*/
$.fn.pageNumberRender = function () {
    $(this).empty();
    var total;
    if ($(this).attr("total")) {
        total = Number($(this).attr("total"));
    }
    else {
        alert(uncompile(quiLanguage.pageNumber.errorMessage1));
    }

    var pageSize = 10;
    if ($(this).attr("pageSize")) {
        pageSize = Number($(this).attr("pageSize"));
    }
    else {
        $(this).attr("pageSize", pageSize);
    }
    var selWidth = 50;
    if ($(this).attr("selWidth") != null) {
        selWidth = Number($(this).attr("selWidth"));
    }

    var splitMode = false;
    if ($("#skin").attr("splitMode") == true || $("#skin").attr("splitMode") == "true") {
        splitMode = true;
    }
    var defaultPageSelWidth = 0;
    if (!splitMode) {
        var $parentThemeDom = $(window.top.document.getElementById("theme"));
        if ($parentThemeDom.attr("defaultPageSelWidth") != null) {
            defaultPageSelWidth = Number($parentThemeDom.attr("defaultPageSelWidth"));
        }
    }


    var centerPageNum = 3;
    if ($(this).attr("centerPageNum")) {
        centerPageNum = Number($(this).attr("centerPageNum"));
    }

    var edgePageNum = 1;
    if ($(this).attr("edgePageNum")) {
        edgePageNum = Number($(this).attr("edgePageNum"));
    }

    var page = 0;
    if ($(this).attr("page")) {
        page = Number($(this).attr("page"));
    }
    else {
        $(this).attr("page", page);
    }

    var prevText = uncompile(quiLanguage.pageNumber.prePageText);
    if ($(this).attr("prevText")) {
        prevText = $(this).attr("prevText");
    }

    var nextText = uncompile(quiLanguage.pageNumber.nextPageText);
    if ($(this).attr("nextText")) {
        nextText = $(this).attr("nextText");
    }
    var showSelect = false;
    if ($(this).attr("showSelect") == "true" || $(this).attr("showSelect") == true) {
        showSelect = true;
    }
    var selectData = { list: [{ key: 10, value: 10 }, { key: 20, value: 20 }, { key: 50, value: 50}] };
    if ($(this).attr("selectData")) {
        try {
            selectData = JSON.parse($(this).attr("selectData"));
        }
        catch (e) {
            selectData = { list: [{ key: 10, value: 10 }, { key: 20, value: 20 }, { key: 50, value: 50}] };
            alert(uncompile(quiLanguage.pageNumber.errorMessage2))
        }
    }

    var showInput = false;
    if ($(this).attr("showInput") == "true" || $(this).attr("showInput") == true) {
        showInput = true;
    }

    var selectDirection = "top";
    if ($(this).attr("selectDirection") == "bottom") {
        selectDirection = "bottom";
    }
    $(this).pagination(total, {
        items_per_page: pageSize,
        num_display_entries: centerPageNum,
        num_edge_entries: edgePageNum,
        current_page: page,
        prev_text: prevText,
        next_text: nextText,
        showSelect: showSelect,
        selectData: selectData,
        showInput: showInput,
        selectDirection: selectDirection,
        selWidth: selWidth,
        defaultPageSelWidth: defaultPageSelWidth
    })
};
jQuery.fn.pagination = function (maxentries, opts) {
    opts = jQuery.extend({
        items_per_page: 10, //每页数据条数
        num_display_entries: 5, //开头页码个数
        current_page: 0, //当前页
        num_edge_entries: 1, //结尾页码个数
        link_to: "javascript:void(0);",
        prev_text: uncompile(quiLanguage.pageNumber.prePageText),
        next_text: uncompile(quiLanguage.pageNumber.nextPageText),
        ellipse_text: "...",
        prev_show_always: true,
        next_show_always: true,
        showSelect: false,
        selectData: { list: [{ key: 10, value: 10 }, { key: 20, value: 20 }, { key: 50, value: 50}] },
        showInput: false,
        selectDirection: "top",
        selWidth: 50,
        defaultPageSelWidth: 0,
        callback: function () { return false; }
    }, opts || {});

    return this.each(function () {
        function numPages() {
            return Math.ceil(maxentries / opts.items_per_page);
        }

        function getInterval() {
            var ne_half = Math.ceil(opts.num_display_entries / 2);
            var np = numPages();
            var upper_limit = np - opts.num_display_entries;
            var start = current_page > ne_half ? Math.max(Math.min(current_page - ne_half, upper_limit), 0) : 0;
            var end = current_page >= ne_half ? Math.min(current_page + ne_half, np) : Math.min(opts.num_display_entries, np);
            return [start, end];
        }

        function pageSelected(page_id, evt, pageSize) {
            //限制20页
            if (page_id > 19)
                page_id = 19;
            current_page = page_id;
            drawLinks();
            var continuePropagation;
            //触发事件
            continuePropagation = panel.trigger("pageChange", current_page);

            //改变page属性
            panel.attr("page", current_page)

            if (pageSize) {
                //触发条数改变事件
                panel.trigger("sizeChange", pageSize);
            }


            //var continuePropagation = opts.callback(page_id, panel);
            if (!continuePropagation) {
                if (evt.stopPropagation) {
                    evt.stopPropagation();
                }
                else {
                    evt.cancelBubble = true;
                }
            }
            return continuePropagation;
        }

        function drawLinks() {
            panel.empty();
            var interval = getInterval();
            var np = numPages();
            var getClickHandler = function (page_id) {
                return function (evt) { return pageSelected(page_id, evt); }
            }
            var appendItem = function (page_id, appendopts) {
                page_id = page_id < 0 ? 0 : (page_id < np ? page_id : np - 1); // Normalize page id to sane value
                page_id = page_id > 19 ? 19 : (page_id < np ? page_id : np - 1); //只显示20页，最后一页时，禁用下一页
                appendopts = jQuery.extend({ text: page_id + 1, classes: "" }, appendopts || {});
                if (page_id == current_page) {
                    var lnk = jQuery("<span class='current'>" + (appendopts.text) + "</span>");
                }
                else {
                    var lnk = jQuery("<a>" + (appendopts.text) + "</a>")
						.bind("click", getClickHandler(page_id))
                    //.attr('href', opts.link_to.replace(/__id__/,page_id));


                }
                if (appendopts.classes) { lnk.addClass(appendopts.classes); }
                panel.append(lnk);
            }
            if (opts.prev_text && (current_page > 0 || opts.prev_show_always)) {
                appendItem(current_page - 1, { text: opts.prev_text, classes: "prev" });
            }
            if (interval[0] > 10) {
                interval = [10, 20];
            }
            if (interval[0] > 0 && opts.num_edge_entries > 0) {

                var end = Math.min(opts.num_edge_entries, interval[0]);
                for (var i = 0; i < end; i++) {
                    appendItem(i);
                }
                if (opts.num_edge_entries < interval[0] && opts.ellipse_text) {
                    jQuery("<span class='ellipse'>" + opts.ellipse_text + "</span>").appendTo(panel);
                }
            }
            for (var i = interval[0]; i < interval[1]; i++) {
                appendItem(i);
            }
            if (interval[1] < np && opts.num_edge_entries > 0) {
                if (np - opts.num_edge_entries > interval[1] && opts.ellipse_text) {
                    jQuery("<span class='ellipse'>" + opts.ellipse_text + "</span>").appendTo(panel);
                }
                var begin = Math.max(np - opts.num_edge_entries, interval[1]);
                for (var i = begin; i < np; i++) {
                    appendItem(i);
                }

            }
            if (opts.next_text && (current_page < np - 1 || opts.next_show_always)) {
                //appendItem(current_page+1,{text:opts.next_text, classes:"next"});
                if (current_page >= 19)
                    appendItem(current_page + 1, { text: opts.next_text, classes: "prev" });
                else
                    appendItem(current_page + 1, { text: opts.next_text, classes: "next" });
            }

            if (opts.showSelect == true) {
                var $select = $('<select></select>');
                $select.data("data", opts.selectData);
                var $selDom = $('<div style="float:left;padding:5px 0 0 5px">' + uncompile(quiLanguage.pageNumber.pageNumText1) + '</div><div style="float:left;padding:0 0 0 2px;"></div><div style="float:left;padding:5px 0 0 2px">' + uncompile(quiLanguage.pageNumber.pageNumText2) + '</div>')
                $selDom.eq(1).append($select);

                //获取当前pageSize
                var pageSize;
                pageSize = Number(panel.attr("pageSize"));

                //设置下拉框选中值
                $select.attr("selectedValue", pageSize);

                if (opts.defaultPageSelWidth != 0) {
                    $selDom.eq(1).width(opts.defaultPageSelWidth + 10);
                    $select.attr("selWidth", opts.defaultPageSelWidth);
                    $select.attr("boxWidth", opts.defaultPageSelWidth);
                }
                else {
                    $selDom.eq(1).width(opts.selWidth + 10);
                    $select.attr("selWidth", opts.selWidth);
                    $select.attr("boxWidth", opts.selWidth);
                }


                //设置下拉框展开方向
                $select.attr("openDirection", opts.selectDirection);

                $select.selectRender();
                $select.unbind("change");
                $select.bind("change", function () {
                    pageSize = $select.attr("relValue");

                    //改变pageSize
                    panel.attr("pageSize", pageSize)

                    //改变总页数
                    opts.items_per_page = Number(pageSize);

                    //重新设置当前页
                    var maxPage1 = numPages();
                    //条数改变后，如果原来的当前页大于后来的最大页
                    if (current_page > maxPage1 - 1) {
                        //这时页数改变
                        //选中后来的最大页
                        //第三个参数不为空代表触发页数改变事件后再触发条数改变事件
                        pageSelected(maxPage1 - 1, null, pageSize);
                    }
                    else {
                        //这时页数不变
                        //触发条数改变事件
                        panel.trigger("sizeChange", pageSize);
                    }
                    drawLinks();
                })
                panel.append($selDom);
            }

            if (opts.showInput == true) {
                var $input = $('<input type="text" style="width:30px;" inputMode="numberOnly"/>');
                var $inputDom = $('<div style="float:left;padding:5px 0 0 5px">' + uncompile(quiLanguage.pageNumber.pageJumpText1) + '</div><div style="float:left;padding:0 0 0 2px"></div><div style="float:left;padding:5px 0 0 2px">' + uncompile(quiLanguage.pageNumber.pageJumpText2) + '</div>')
                $inputDom.eq(1).append($input);
                $input.render();

                $input.keydown(function (event) {
                    if (event.keyCode == 13) {
                        var maxPage = numPages();
                        if (Number($input.val()) > maxPage) {
                            pageSelected(maxPage - 1);
                        }
                        else if (Number($input.val()) < 1) {
                            pageSelected(0);
                        }
                        else {
                            pageSelected(Number($input.val()) - 1);
                        }
                    }
                })

                panel.append($inputDom);
            }

            panel.append($('<div style="clear:both;"></div>'))

        }



        var current_page = opts.current_page;
        maxentries = (!maxentries || maxentries < 0) ? 1 : maxentries;
        opts.items_per_page = (!opts.items_per_page || opts.items_per_page < 0) ? 1 : opts.items_per_page;
        var panel = jQuery(this);
        panel.data("selectCurrent", opts.selectCurrent);

        this.selectPage = function (page_id) { pageSelected(page_id); }
        this.prevPage = function () {
            if (current_page > 0) {
                pageSelected(current_page - 1);
                return true;
            }
            else {
                return false;
            }
        }
        this.nextPage = function () {
            if (current_page < numPages() - 1) {
                pageSelected(current_page + 1);
                return true;
            }
            else {
                return false;
            }
        }
        drawLinks();

        // opts.callback(current_page, this);

    });


}

