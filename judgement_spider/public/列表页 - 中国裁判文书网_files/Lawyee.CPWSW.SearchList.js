(function ($) {
    //    $("#btn_yzmsure").click(function () {
    //        SearchWords.prototype.YZMSure();
    //    })
    var SearchWords = function (element, option) {
        this.setting = {
            width: 600,
            height: 35,
            parameters: {},
            initText: "输入案由、关键词、法院、当事人、律师"
        }
        this.element = element;
        this.setting = $.extend({}, this.setting, option);
    }

    //生成Guid
    var guidCreate = function (type) {
        $("#diverror").html("");
        $("#txtValidateCode").val("");
        $("#txthidtype").val(type);
        var guid = createGuid() + createGuid() + "-" + createGuid() + "-" + createGuid() + createGuid() + "-" + createGuid() + createGuid() + createGuid(); //CreateGuid();
        $("#txthidGuid").val(guid);
        $("#divYzmImg").html("<img alt='点击刷新验证码！' name='validateCode' id='ImgYzm' onclick='ref()'  title='点击切换验证码' src='/ValiCode/CreateCode/?guid=" + guid + "' style='cursor: pointer;'  />");
    }
    var createGuid = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    var KeyWords = function (element, option) {
        this.setting = {
            width: 700,
            height: 40
        }
        this.element = element;
        this.setting = $.extend({}, this.setting, option);
    }
    KeyWords.prototype = {
        Init: function () { },
        WrodList: function () {
        },
        ArrParam: null,
        BuildTag: function (word) {
            var _this = this;
            var $this = $(this.element);
            var datas = $(this.setting.data);
            var k = 0;
            for (k; k < datas.length; k++) {
                var params = datas[k];
                //全文多关键词检索时，每个关键词后面都加一个删除符
                if ("全文检索,首部,事实,理由,判决结果,尾部".indexOf(params.condition.split(":")[0]) >= 0) {
                    var conditionTitle = params.condition.split(':')[0];
                    var conditionValue = params.condition.split(':')[1];
                    var cValuesArr = conditionValue.split(' ');
                    var text = $("<div class='condtionText'>" + conditionTitle + ":</div>");
                    for (var m = 0; m < cValuesArr.length; m++) {
                        if (cValuesArr[m] == "") { continue; }
                        var close = $("<span style='margin-right:5px;' val='" + cValuesArr[m] + "'><img src='/Assets/img/btn-close.png'></span>");
                        close.data("data", params);
                        text.append("<span class='contentCondtion'>" + cValuesArr[m] + "</span>");
                        text.append(close);
                        close.click(function () {
                            var prevSpan = $(this).prev("span").eq(0);
                            var parentDiv = $(this).parent();
                            if (prevSpan != undefined) {
                                prevSpan.remove();
                                $(this).remove();
                            }
                            var arr = new Array();
                            var cSpans = parentDiv.find("span");
                            var cConditions = "";
                            cSpans.each(function () {
                                cConditions = cConditions + $(this).text() + " ";
                            });
                            if (cConditions != "") { cConditions = cConditions.substring(0, cConditions.length - 2); }
                            params.condition = parentDiv.text().split(":")[0] + ":" + cConditions;
                            arr.push(params);
                            _this.ArrParam = { ArrParam: arr };
                            //guidCreate(6);
                            //$("#dialog").show();

                            Param("removeContent", arr);
                        })
                    }
                    $this.append(text);
                } else {
                    var text = $("<div class='condtionText' >" + params.condition + "</div>");
                    var close = $("<div class='removeCondtion' val='" + params.condition + "'/>");
                    close.data("data", params);
                    text.append(close);
                    close.click(function () {
                        //edit by lrh 参数统一用数组传输
                        var arr = new Array();
                        var param = $(this).data("data");
                        arr.push(param);
                        _this.ArrParam = { ArrParam: arr };
                        //guidCreate(5);
                        //$("#dialog").show();

                        Param("remove", arr);
                    })
                    $this.append(text);
                }
            }
        },
        CheckSearch: function (yzm, guid) {
            if (this.ArrParam.ArrParam != null) {
                Param("remove", this.ArrParam.ArrParam, yzm, guid);
                this.ArrParam = null;
            }
            //Param("remove", arr);
        }, removeContent: function (yzm, guid) {
            if (this.ArrParam.ArrParam != null) {
                Param("removeContent", this.ArrParam.ArrParam, yzm, guid);
                this.ArrParam = null;
            }
        }
    }
    SearchWords.prototype = {
        /*
        * 初始化方法
        */
        Init: function () {
            //获取data
        },
        /*
        *构造html
        */
        reloadCode: function () {
            alert(1);
        },
        BuildHtml: function (mark) {
            var $this = $(this.element);
            $this.empty();
            var s = this;
            var key = "";

            var $DivYzm = $("<div id='dialog' class='head_search_container'>");
            //var divClose = $("<p class='close'><a href='#' onclick='closeBg();'>关闭</a></p>")


            var inputtxt = $("<div style='color:#cd3c3f'>请输入验证码：<input type='text' class='dialogtxt' id='txtValidateCode' /><span id='diverror'></span></div>");

            //var inputimage = $("<img alt='点击刷新验证码！' name='validateCode' title='点击切换验证码' src='/ValiCode/CreateCode/?guid=" + guid + "' style='cursor: pointer;'  />")
            var inputimage = $("<div id='divYzmImg'>")
            var inputhidtxt = $("<input type='text' class='' id='txthidGuid' style='display:none' />");

            var inputhidtxttype = $("<input type='text' class='' id='txthidtype' style='display:none' />");

            var inputhidpage = $("<input type='text' class='' id='txthidpage' style='display:none' />");

            var inputhidpagesize = $("<input type='text' class='' id='txthidpagesize' style='display:none' />");
            var inputhidtree = $("<input type='text' class='' id='txthidtree' style='display:none' />");
            var inputhidtreekey = $("<input type='text' class='' id='txthidtreekey' style='display:none' />");
            var div1 = $("<div id='div1' style='bottom:20px'>");
            var btn1 = $("<input type='button' class='dialogbtn' id='btn_yzmsure' value='确定'  />");

            var btn2 = $("<input type='button' class='dialogbtn' id='btn_yzmcacle' value='取消'  />");
            //$DivYzm.append(divClose);
            div1.append(btn1)
            div1.append(btn2)
            $DivYzm.append(inputhidtxt);
            $DivYzm.append(inputhidtxttype);
            $DivYzm.append(inputhidpage);
            $DivYzm.append(inputhidpagesize);
            $DivYzm.append(inputhidtree);
            $DivYzm.append(inputhidtreekey);
            $DivYzm.append(inputimage);
            $DivYzm.append(inputtxt);
            $DivYzm.append(div1);
            //            $DivYzm.append(btn1);
            //            $DivYzm.append(btn2);
            $this.append($DivYzm);
            var $divContainer = $("<div class='head_search_container'>");

            var searchText = $("<input type='text' name='全文检索' key='全文检索' class='head_search_key' id='gover_search_key' value='" + this.setting.initText + "' />");

            //搜索输入框
            var maxSearchBtn = $("<div class='head_maxsearch_btn' id='head_maxsearch_btn'></div>");

            //搜索按钮
            var searchBtn = $("<button type='submit' id='btnSearch' class='head_search_btn'>搜索</input>");

            var $searchTextContain = $("<div class='head_search_middle'></div>");
            $searchTextContain.append(searchText);

            var $maxSearchBtnContain = $("<div class='head_search_leftfloat'></div>");
            $maxSearchBtnContain.append(maxSearchBtn);

            var $searchBtnContain = $("<div class='head_search_rightfloat'></div>");
            $searchBtnContain.append(searchBtn);

            var $helpBtnContain = $("<div class='helpBtn'></div>");
            var helpBtn = "<a href=\"/Index/Help\" target=\"_blank\"><img src='/Assets/img/Index/help.png' width='52' height='52' border='0' title='搜索帮助'/></a>"
            $helpBtnContain.append(helpBtn);

            var searchSuggest = $("<div id='suggestPanel' class='search_suggest'></div>");
            var maxSearchSuggest = $("<div id='advanceSearchPanel' class='head_maxsearch_txt'/>");

            var maxSearchSuggest = $("<div id='advanceSearchPanel' class='head_maxsearch_txt'/>");

            var divprompt = $("<div class='list_prompt'>输入案由、关键词、法院、当事人、律师</div>");
            var allli = searchSuggest.find('li');
            var ponitValue = searchText.val();
            var maxdata = $(this.setting.maxdata);
            var SearchHtml = s.buildMaxSearch(maxdata, mark);
            maxSearchSuggest.append(SearchHtml);
            maxSearchSuggest.append();
            searchText.keyup(function () {
                //键盘选择下拉项
                if (searchSuggest.css('display') == 'block' && event.keyCode == 38 || event.keyCode == 40) {
                    var current = searchSuggest.find('li.hover');
                    if (event.keyCode == 38) {
                        if (current.length > 0) {
                            var prevLi = current.removeClass('hover').prev();
                            if (prevLi.length == 0) {
                                prevLi = current.removeClass('hover').parent().prev().prev().find('li:first');
                            }
                            if (prevLi.length > 0) {
                                prevLi.addClass('hover');
                                searchText.val(prevLi.html());
                                $("#hidsearch").attr("key", prevLi.attr("name"));
                                $("#hidsearch").attr("val", prevLi.html());
                            }
                        } else {
                            var last = searchSuggest.find('li:last');
                            last.addClass('hover');
                            searchText.val(last.html());
                            $("#hidsearch").attr("key", last.attr("name"));
                            $("#hidsearch").attr("val", last.html());
                        }

                    } else if (event.keyCode == 40) {
                        if (current.length > 0) {
                            var nextLi = current.removeClass('hover').next();
                            if (nextLi.length == 0) {
                                nextLi = current.removeClass('hover').parent().next().next().find('li:first');
                            }
                            if (nextLi.length > 0) {
                                nextLi.addClass('hover');
                                searchText.val(nextLi.html());
                                $("#hidsearch").attr("key", nextLi.attr("name"));
                                $("#hidsearch").attr("val", nextLi.html());
                            }
                        } else {
                            var first = searchSuggest.find('li:first');
                            first.addClass('hover');
                            searchText.val(first.html());
                            $("#hidsearch").attr("key", first.attr("name"));
                            $("#hidsearch").attr("val", first.html());
                        }
                    }
                    //输入字符
                } else {
                    var valText = $.trim(searchText.val());
                    if (valText == '' || valText == key) {
                        searchSuggest.hide();
                        maxSearchSuggest.hide();
                        return;
                    }
                    else {
                        //setTimeout(function () {
                        //if (valText.length == $.trim(searchText.val()).length) {
                        s.searchFuc(valText, ponitValue);
                        key = valText;
                        //}
                        //}, 300);
                    }
                }
            })
            //搜索文本框点击时触发，判断是否显示默认文字
            searchText.click(function () {
                var valText = $.trim(searchText.val());
                if (valText == ponitValue) {
                    searchText.val("");
                    s.searchFuc(valText, ponitValue);
                }
            })
            //搜索问崩溃失去焦点时触发，判断是否显示默认文字
            searchText.blur(function () {
                var valText = $.trim(searchText.val());
                if (valText == "") {//2015年11月25日, wangzhange 修改bug1281
                    setTimeout(function () {
                        if (valText.length == $.trim(searchText.val()).length) {
                            searchText.val(ponitValue);
                        }
                    }, 500);
                };
            })
            //回车查询
            searchText.bind("keypress", function (event) {
                if (event.keyCode == "13") {
                    var valText = $.trim(searchText.val());
                    if (valText != "") {
                        //s.Search(1);
                        //guidCreate(1);
                        //$DivYzm.toggle();
                        $("#btnSearch").click();
                    }
                }
            })
            //搜索框高级检索按钮点击时，高级检索面板切换显示
            maxSearchBtn.click(function () {
                searchSuggest.hide();
                maxSearchSuggest.toggle();
            })

            searchBtn.click(function () {
                guidCreate(1);
                //$DivYzm.toggle();
                var valiguid = $("#txthidGuid").val();
                $.ajax({
                    url: "/ValiCode/GetCode", type: "POST", async: true,
                    data: { "guid": valiguid },
                    success: function (data) {
                        var type = $("#txthidtype").val();
                        if (type == 3) {
                            //var pageSize = $(this).attr('pageSize');
                            var index = $("#inputhidpage").val();
                            var pagesize = $("#inputhidpagesize").val();
                            var url = window.location.href;
                            listObj.PageChange();
                        } else if (type == 4) {
                            var tree = $("#txthidtree").val();
                            var treekey = $("#txthidtreekey").val();
                            var url = window.location.href;
                            url = decodeURI(url);
                            var params = new Array();
                            var parameter = {
                                type: "searchWord",
                                value: treekey,
                                sign: "",
                                pid: "",
                                condition: tree + ":" + treekey
                            };
                            params.push(parameter);
                            //处理URL

                            Param("treesearch", params, $("#txtValidateCode").val(), valiguid);
                        } else if (type == 5) {
                            //listObj.CheckSearch();
                            listUIKey.CheckSearch($("#txtValidateCode").val(), valiguid);
                            //Param("remove", arr);
                        } else if (type == 6) {
                            listUIKey.removeContent($("#txtValidateCode").val(), valiguid);
                        } else if (type == 7) {
                            listObj.SortCase($("#txtValidateCode").val(), valiguid);
                        } else {
                            s.Search(type, $("#txtValidateCode").val(), valiguid);
                        }

                    }
                });
            })
            btn2.click(function () {
                $("#dialog").hide();
            })
            btn1.click(function () {
                var valiguid = $("#txthidGuid").val();
                $.ajax({
                    url: "/ValiCode/GetCode", type: "POST", async: true,
                    data: { "guid": valiguid },
                    success: function (data) {
                        var type = $("#txthidtype").val();
                        if (data == "true") {
                            if (type == 3) {
                                //var pageSize = $(this).attr('pageSize');
                                var index = $("#inputhidpage").val();
                                var pagesize = $("#inputhidpagesize").val();
                                var url = window.location.href;
                                listObj.PageChange();
                            } else if (type == 4) {
                                var tree = $("#txthidtree").val();
                                var treekey = $("#txthidtreekey").val();
                                var url = window.location.href;
                                url = decodeURI(url);
                                var params = new Array();
                                var parameter = {
                                    type: "searchWord",
                                    value: treekey,
                                    sign: "",
                                    pid: "",
                                    condition: tree + ":" + treekey
                                };
                                params.push(parameter);
                                //处理URL

                                Param("treesearch", params, $("#txtValidateCode").val(), valiguid);
                            } else if (type == 5) {
                                //listObj.CheckSearch();
                                listUIKey.CheckSearch($("#txtValidateCode").val(), valiguid);
                                //Param("remove", arr);
                            } else if (type == 6) {
                                listUIKey.removeContent($("#txtValidateCode").val(), valiguid);
                            } else if (type == 7) {
                                listObj.SortCase($("#txtValidateCode").val(), valiguid);
                            } else {
                                s.Search(type, $("#txtValidateCode").val(), valiguid);
                            }
                        } else {
                            $("#diverror").html("验证码错误");
                        }
                    }
                });
            })
            var isChrome = navigator.userAgent.toLowerCase().match(/chrome/) != null;
            $("body").keydown(function () {
                if (event.keyCode == "13") {
                    var valText = $.trim(searchText.val());
                    if (valText != "") {
                    	$("#btnSearch").click();
                        //s.Search(1);
                        //guidCreate(1);
                        //$DivYzm.toggle();
                    }
                }
            })
            //检索框右侧检索按钮
            searchBtn.click(function () {
                //s.DailgYZM();
                // s.Search(1);
            })
            $divContainer.append($maxSearchBtnContain);
            $divContainer.append($searchTextContain);
            $divContainer.append($searchBtnContain);

            $divContainer.append($helpBtnContain);
            $divContainer.append(searchSuggest);
            $divContainer.append(maxSearchSuggest);
            $divContainer.append();
            $this.append($divContainer);
            $(".quitype").render();
            $(".quiselect").render();
            $("#beginTime").render()
            $("#endTime").render();
            $("#list_btnmaxsearch").render();
            $("#list_btnmaxreset").render();

            for (var p in this.setting.parameters) {
                var rebindParam = this.setting.parameters[p];
                if (rebindParam.sign == "QWJS") {
                    var select = $("#adsearch_dl");
                    select.setValue(rebindParam.value);
                    select.render();
                    $("#21_input").val("全文");
                    var word = rebindParam.condition.split(":")[1];
                    $("#completxt").val(word);
                } else {
                    this.selectCascadeUpdate(rebindParam.sign, rebindParam.value);
                    var select = $("#adsearch_" + rebindParam.sign);
                    select.setValue(rebindParam.value);
                    select.render();
                }
            }
        },

        //创建高级检索
        buildMaxSearch: function (maxdata, mark) {
            var th = this;
            var allwidths = "170";
            var maxscon = $("<div id='advanceSearchContent' class='list_maxcon'></div>");
            var btndiv = $("<div class='list_searchbtn'></div>");
            var btnsearch = $("<input id='list_btnmaxsearch' useMinWidth='true' type='button' value='检索'/>");
            var btnreset = $("<input id='list_btnmaxreset' useMinWidth='true' type='button' value='重置'/>");

            //阻止事件冒泡
            maxscon.click(function (e) {
                e.stopPropagation();
            });
            //从url中获取的参数
            if (typeof advanceDataTool == "undefined") {
                Lawyee.Tools.ShowMessage("请引入Lawyee.CPWSW.ListLoad.js");
                return;
            }
            //mark=0 表示检索框初始绑定，需要反绑定已有参数;mark=1表示点击"重置"按钮，不需要反绑定参数
            if (mark == 0) {
                this.setting.parameters = advanceDataTool.parameters;
            } else {
                this.setting.parameters = {};
            }

            var searchSuggestGJ = $("<div id='suggestPanelGJ' class='search_suggest'></div>");

            for (var i = 0; i < maxdata.length; i++) {
                //获取已有参数并设置已有参数所选项，在主面板渲染完成后，重新渲染联动的子节点。pid 不知道是干什么用的。因为其他代码有些看不明白的使用，凑合加上。
                var paramsValue = { type: "", filed: "", value: "", sign: "", condition: "", pid: "" };
                for (var j in this.setting.parameters) {
                    var condition = this.setting.parameters[j].condition.split(":");
                    if (condition[0] == maxdata[i].key) {
                        this.setting.parameters[j].sign = maxdata[i].sign
                        paramsValue = this.setting.parameters[j];
                        break;
                    }
                }
                var dataItem = {
                    key: maxdata[i].key,
                    value: maxdata[i].value,
                    type: maxdata[i].type,
                    parent: maxdata[i].parent,
                    datas: maxdata[i].data,
                    sign: maxdata[i].sign,
                    width: maxdata[i].width
                };
                var lidiv = $("<div class='list_maxli'></div>");
                var lititle = $("<div class='fieldtitle'><span key='' cls='' pid='' id='span" + dataItem.sign + "'>" + dataItem.key + ":</span></div>");
                var livalue = $("<div class='fieldvalue'></div>");
                var input = "";
                if (dataItem.type == "txt") {
                    var flyjBgCss = "";
                    if (dataItem.key == "法律依据") {
                        flyjBgCss = "background: url(/Assets/img/flyj_txt_bg.png)  repeat-x scroll left top #ffffff;";
                    }
                    input = $("<input type='text' type='" + dataItem.type + "' key='" + dataItem.key + "' sign='" + dataItem.sign + "' style=' width:" + dataItem.width + "px;" + flyjBgCss + "' class='quitype'/>");
                    if (dataItem.key == "法律依据") {
                        input.focus(function () {
                            $(this).css("background-image", "");
                        }).blur(function () {
                            if (input.val() == "") {
                                $(this).css("background-image", "url(/Assets/img/flyj_txt_bg.png)");
                            }
                        });
                    }
                    input.val(paramsValue.value);

                    input.blur(function () {
                        var val = $(this).val();
                        var span = $(this).parent().prev(".fieldtitle").find("span");
                        var name = span.text();
                        var sign = $(this).attr("sign");
                        var condition = "";
                        if (val != "") {
                            condition = name + val;
                        }
                        advanceDataTool.storeParas(name, val, sign, condition, "", span);
                    })
                    //设置ID属性
                    input.attr("id", "adsearch_" + dataItem.sign);
                    //                    if (dataItem.key == "案由" || dataItem.key == "法院名称") {
                    //                        input.keyup(function () {
                    //                            //键盘选择下拉项
                    //                            debugger;
                    //                            if (searchSuggestGJ.css('display') == 'block' && event.keyCode == 38 || event.keyCode == 40) {
                    //                                var current = searchSuggestGJ.find('li.hover');
                    //                                if (event.keyCode == 38) {
                    //                                    if (current.length > 0) {
                    //                                        var prevLi = current.removeClass('hover').prev();
                    //                                        if (prevLi.length == 0) {
                    //                                            prevLi = current.removeClass('hover').parent().prev().prev().find('li:first');
                    //                                        }
                    //                                        if (prevLi.length > 0) {
                    //                                            prevLi.addClass('hover');
                    //                                            $(this).val(prevLi.html());
                    //                                        }
                    //                                    } else {
                    //                                        var last = searchSuggestGJ.find('li:last');
                    //                                        last.addClass('hover');
                    //                                        $(this).val(last.html());
                    //                                    }

                    //                                } else if (event.keyCode == 40) {
                    //                                    if (current.length > 0) {
                    //                                        var nextLi = current.removeClass('hover').next();
                    //                                        if (nextLi.length == 0) {
                    //                                            nextLi = current.removeClass('hover').parent().next().next().find('li:first');
                    //                                        }
                    //                                        if (nextLi.length > 0) {
                    //                                            nextLi.addClass('hover');
                    //                                            $(this).val(nextLi.html());
                    //                                        }
                    //                                    } else {
                    //                                        var first = searchSuggestGJ.find('li:first');
                    //                                        first.addClass('hover');
                    //                                        $(this).val(first.html());
                    //                                    }
                    //                                }
                    //                                //输入字符
                    //                            } else {
                    //                                debugger;
                    //                                var valText = $.trim($(this).val());
                    //                                if (valText == '') {
                    //                                    searchSuggestGJ.hide();
                    //                                    return;
                    //                                }
                    //                                else {
                    //                                    var ponitValue = "";
                    //                                    th.searchFucGJ(dataItem.key, valText, ponitValue);
                    //                                }
                    //                            }
                    //                        });
                    //                    }
                }
                else if (dataItem.type == "list") {
                    var selectvalue = dataItem.value.split(';');
                    //下拉列表数据源
                    var selectDataSource = { "list": [{ "value": "none", "key": "请选择"}] };
                    if (dataItem.value != "") {
                        $.each(selectvalue, function () {
                            var item = { value: "", key: "" };
                            if (this.indexOf("=") > 0) {
                                item.value = this.split('=')[0];
                                item.key = this.split('=')[1]; ;
                                selectDataSource.list.push(item);
                            }
                        });
                    }
                    input = $("<select  selWidth='" + dataItem.width + "' name=" + dataItem.parent + " class='quiselect' key='" + dataItem.key +
                    "' sign='" + dataItem.sign + "' type='" + dataItem.type + "' condition='' ></select>"); //dropdowmlist
                    input.data("data", selectDataSource);
                    input.render();
                    input.bind("change", function () {
                        //选择值
                        var selectedValue = $(this).attr("relValue");
                        //选择文本
                        var selectedText = $(this).attr("relText");
                        //字典对应名称标记
                        var sign = $(this).attr("sign");
                        var key = $(this).attr("key");
                        th.selectCascadeUpdate(sign, selectedValue);
                        var span = $(this).parent().prev(".fieldtitle").find("span");
                        var name = span.text();
                        var condtion = "";
                        //如果选择了【请选择】则不选择条件
                        if (selectedText != "请选择" && selectedText != "") {
                            condtion = name + selectedText;
                        }
                        advanceDataTool.storeParas(key, selectedValue, sign, condtion, "", span);
                    })
                    //设置ID属性
                    input.attr("id", "adsearch_" + dataItem.sign);
                }
                else if (dataItem.type == "completxt") {
                    var comtxt = $("<input id='completxt' sign='" + dataItem.sign + "' type='text' key='" + dataItem.key + "' style=' width:" + dataItem.width + "px' class='quitype'/>");
                    comtxt.val(paramsValue.condition.split(":")[1]);
                    comtxt.blur(function () {
                        var $this = $(this);
                        var val = $this.val();
                        var span = $this.parent().parent().parent().parent().parent().prev(".fieldtitle").find("span");
                        var sign = $this.attr("sign");
                        var key = $this.attr("key");
                        var condition = "";
                        if (val != "") {
                            var select = $("#adsearch_dl");
                            if (select.attr("relText") == "全文") {
                                condition = key + ":" + val;
                                advanceDataTool.storeParas(key, val, sign, condition, "", span);
                            }
                        }
                    })
                    var selectdata = dataItem.datas.split(';');
                    //下拉列表数据源
                    var selectDataSource = { "list": [] };
                    $.each(selectdata, function () {
                        var item = { value: "", key: "" };
                        item.value = this;
                        item.key = this;
                        selectDataSource.list.push(item);
                    });
                    //段落
                    var select = $("<select id='adsearch_dl' selWidth='60' name=" + dataItem.parent + " class='quiselect' key='" + dataItem.key + "' sign='" + dataItem.sign + "' type='" + dataItem.type + "' condition='' ></select>");
                    select.data("data", selectDataSource);

                    select.render();
                    input = $("<table/>")
                    var tr = $("<tr>");
                    var tdInput = $("<td>");
                    var tdSelect = $("<td>");
                    tdInput.append(comtxt);
                    tdSelect.append(select);
                    tr.append(tdInput).append(tdSelect);

                    select.bind("change", function () {
                        var $this = $(this);
                        //选择值
                        var selectedValue = $(this).attr("relValue");
                        //选择文本
                        var selectedText = $(this).attr("relText");
                        var condtion = "";
                        var text = $("#completxt").val();
                        //如果选择了【请选择】则不选择条件
                        if (selectedText == "全文") {
                            return;
                        } else if (selectedText != "" && text != "") {
                            condtion = selectedText + ":" + text;
                        }
                        var span = $this.parent().parent().parent().parent().parent().prev(".fieldtitle").find("span");
                        var key = $this.attr("key");
                        var sign = $this.attr("sign");
                        advanceDataTool.storeParas(key, selectedValue, sign, condtion, "", span);
                    })
                    input.append(tr);
                    //设置ID属性
                    input.attr("id", "adsearch_" + dataItem.sign);
                }
                else if (dataItem.type == "date") {
                    //反向绑定
                    var beginTime = "";
                    var endTime = "";
                    if (typeof paramsValue.condition != "undefined" && paramsValue.condition != "") {
                        var value = paramsValue.condition.split(":")[1];
                        var timeArr = value.split("TO");
                        beginTime = timeArr[0];
                        if (timeArr.length > 1) {
                            endTime = timeArr[1];
                        }
                    }

                    input = $("<input type='text' id='beginTime" + dataItem.sign + "' sign='" + dataItem.sign + "' mark='timeSpan' value='" + beginTime + "' class='dateIcon'  style='width:" + dataItem.width +
                    "'/>-<input type='text' id='endTime" + dataItem.sign + "' sign='" + dataItem.sign + "' value='" + endTime + "' class='dateIcon' style='width:" + dataItem.width + "'/>");
                    //自定义点击触发日期控件
                    var beginTime = input[0];
                    beginTime.onfocus = function () {
                        var dateSkin = themeColor;
                        var $this = $(this);
                        var endtimeId = "endTime" + $this.attr("sign");
                        var endtimeTf = $dp.$(endtimeId);
                        WdatePicker({
                            skin: dateSkin, onpicked: function () { endtimeTf.focus(); }, maxDate: '#F{$dp.$D(\'' + endtimeId + '\')}'
                        });
                    };
                    var endTime = input[2];
                    endTime.onfocus = function () {
                        //这里设置了最大日期为当前日期，如果不需要则把maxDate:'%y-%M-%d'去掉
                        var beginTimeId = "beginTime" + $(this).attr("sign");
                        WdatePicker({ skin: themeColor, minDate: '#F{$dp.$D(\'' + beginTimeId + '\')}' });
                    }
                }
                else if (dataItem.type == "dict") {
                    input = $("<div class='selectTree' keepDefaultStyle='true' selWidth='" + dataItem.width +
                    "'  name='" + dataItem.parent + "'  class='quiselect'  key='" + dataItem.key + "' sign='" + dataItem.sign + "' type='" + dataItem.type + "'/>");
                    //考虑案由字典较大且已本地化处理，此处不做dataStore处理
                    if (typeof ayData == "undefined") {
                        Lawyee.Tools.ShowMessage("加载树失败，请确认已经引用了Lawyee.CPWSW.DictData.js");
                    }
                    else {
                        input.data("data", ayData);
                        input.render();
                        input.bind("change", function () {
                            //选择文本
                            var selectedText = $(this).attr("relText");
                            //选择值
                            var selectedValue = $(this).attr("relValue");
                            //字典对应名称标记
                            var sign = $(this).attr("sign");
                            var key = $(this).attr("key");
                            var span = $(this).parent().prev(".fieldtitle").find("span");
                            var name = span.text();
                            var condtion = "";
                            //如果选择了【请选择】则不选择条件
                            if (selectedText != "请选择" && selectedText != "") {
                                condtion = name + selectedText;
                            }
                            advanceDataTool.storeParas(key, selectedValue, sign, condtion, "", span);
                        })
                    }
                    //设置ID属性
                    input.attr("id", "adsearch_" + dataItem.sign);
                }
                livalue.append(input);
                lidiv.append(lititle);
                lidiv.append(livalue);
                maxscon.append(lidiv);

                //设置参数数据存储
                var storeSpan = lititle.find("#span" + dataItem.sign);
                advanceDataTool.storeParas(dataItem.key, paramsValue.value, dataItem.sign, paramsValue.condition, "", storeSpan);
            }
            //重置
            btnreset.click(function (maxdata) {
                th.BuildHtml(1);
                $(".head_maxsearch_txt").show();
                $(".head_maxsearch_txt").css("display", "block");
                return false;
            })

            //高级检索点击
            btnsearch.click(function () {
                try {
//                    //guidCreate(2);
//                    th.BuildHtml(1);
//                    th.Search(2);
//                    //$("#dialog").show();

                    guidCreate(2);
                    //$("#dialog").show();
                    var type = $("#txthidtype").val();
                    var valiguid = $("#txthidGuid").val();
                    $.ajax({
                        url: "/ValiCode/GetCode", type: "POST", async: true,
                        data: { "guid": valiguid },
                        success: function (data) {
                            th.Search(type, data, valiguid);
                        }
                    });
                } catch (e) {
                    Lawyee.Tools.ShowMessage("出现问题，请重哈寻试！")
                }
            })
            btndiv.append(btnsearch);
            btndiv.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
            btndiv.append(btnreset);
            maxscon.append(btndiv);
            maxscon.render();
            return maxscon;
        },
        //检索框智能分类提示
        searchFucGJ: function (keyType, keyWord, ponitValue) {
            var s = this;
            var aData = [];
            var type = "";
            if (keyWord == ponitValue) {
                type = "history";
                var data = ""; //获取Cook
                $.post("/List/GetSession", function (data) {
                    var datas = data.split('|');
                    s.dataDisplayGJ(type, datas);
                });
            }
            else {
                type = "search";
                //判断拼音0简拼1汉字2
                var wordtype = "0";
                if (escape(keyword).indexOf("%u") != -1) {
                    wordtype = "2";
                }
                $.get("/List/GetSuggestGJ", { "keyType": keyType, "keyWord": keyWord }, function (data) {
                    if (data != "[]") {
                        data = $.parseJSON(data);
                        s.dataDisplayGJ(type, data);
                    }
                });
            }
        },
        //请求返回后，执行数据展示
        dataDisplayGJ: function (type, data) {
            var suggestWrap = $("#suggestPanelGJ");
            suggestWrap.empty();
            var ul = $("<ul></ul>");
            if (data != undefined || data != null) {
                if (data.length <= 0) {
                    suggestWrap.hide();
                    return;
                }
            }
            else {
                return;
            }
            if (type == "history") {
                for (var i = 0; i < data.length; i++) {
                    if (data[i] != "") {
                        var li = $("<li style='cursor:pointer;' class='historyli'></li>");
                        li.append(data[i]);
                        ul.append(li);
                        li.bind("mouseover", function () {
                            $(this).css("background-color", "#F7F7F7");
                        }).bind("mouseout", function () {
                            $(this).css("background-color", "#FFFFFF");
                        }).bind("click", function () {
                            var searchValue = $(this).text();
                            $("#gover_search_key").val(searchValue);
                            suggestWrap.hide();
                        });
                    }
                }
                suggestWrap.append(ul);
            }
            else {
                var dicdata = [];
                for (var i = 0; i < data.length; i++) {
                    var obj = data[i];
                    var key = obj.Key;
                    var value = obj.Value
                    if (dicdata[key] == undefined) {
                        dicdata[key] = value;
                    }
                    else {
                        dicdata[key] += "|" + value;
                    }
                }
                for (var key in dicdata) {
                    var searchType = $("<div class='search_type'>" + key + "</div>");
                    var ul = $("<ul></ul>");
                    var str = dicdata[key];
                    var value = str.split('|');
                    for (var name in value) {
                        var li = $("<li style='cursor:pointer;' name='" + key + "'></li>");
                        li.append(value[name]);
                        ul.append(li);
                        li.bind("mouseover", function () {
                            $(this).css("background-color", "#F7F7F7");
                        }).bind("mouseout", function () {
                            $(this).css("background-color", "#FFFFFF");
                        }).bind("click", function () {
                            var searchKey = $(this).parent().prev("div").text();
                            var searchValue = $(this).text();
                            $("#gover_search_key").val(searchKey + ":" + searchValue);
                            suggestWrap.hide();
                        });
                    }
                    suggestWrap.append(searchType);
                    suggestWrap.append(ul);
                }
            }
            suggestWrap.show();
        },
        //检索框智能分类提示
        searchFuc: function (keyword, ponitValue) {
            var s = this;
            var aData = [];
            var type = "";
            if (keyword == ponitValue) {
                type = "history";
                var data = ""; //获取Cook
                $.post("/List/GetSession", function (data) {
                    var datas = data.split('|');
                    s.dataDisplay(type, datas);
                });
            }
            else {
                type = "search";
                //判断拼音0简拼1汉字2
                var wordtype = "0";
                if (escape(keyword).indexOf("%u") != -1) {
                    wordtype = "2";
                }
                $.get("/List/GetSuggest", { "keyWord": keyword }, function (data) {
                    if (data != "[]") {
                        data = $.parseJSON(data);
                        s.dataDisplay(type, data);
                    }
                });
            }
        },
        //请求返回后，执行数据展示
        dataDisplay: function (type, data) {
            var searchText = $(".head_search_key");
            var suggestWrap = $(".search_suggest");
            suggestWrap.empty();
            var ul = $("<ul></ul>");
            if (data != undefined || data != null) {
                if (data.length <= 0) {
                    suggestWrap.hide();
                    return;
                }
            }
            else {
                return;
            }
            if (type == "history") {
                for (var i = 0; i < data.length; i++) {
                    if (data[i] != "") {
                        var li = $("<li style='cursor:pointer;' class='historyli'></li>");
                        li.append(data[i]);
                        ul.append(li);
                        li.bind("mouseover", function () {
                            $(this).css("background-color", "#F7F7F7");
                        }).bind("mouseout", function () {
                            $(this).css("background-color", "#FFFFFF");
                        }).bind("click", function () {
                            var searchValue = $(this).text();
                            $("#gover_search_key").val(searchValue);
                            suggestWrap.hide();
                        });
                    }
                }
                suggestWrap.append(ul);
            }
            else {
                var dicdata = [];
                for (var i = 0; i < data.length; i++) {
                    var obj = data[i];
                    var key = obj.Key;
                    var value = obj.Value
                    if (dicdata[key] == undefined) {
                        dicdata[key] = value;
                    }
                    else {
                        dicdata[key] += "|" + value;
                    }
                }
                for (var key in dicdata) {
                    var searchType = $("<div class='search_type'>" + key + "</div>");
                    var ul = $("<ul></ul>");
                    var str = dicdata[key];
                    var value = str.split('|');
                    for (var name in value) {
                        var li = $("<li style='cursor:pointer;' name='" + key + "'></li>");
                        li.append(value[name]);
                        ul.append(li);
                        li.bind("mouseover", function () {
                            $(this).css("background-color", "#F7F7F7");
                        }).bind("mouseout", function () {
                            $(this).css("background-color", "#FFFFFF");
                        }).bind("click", function () {
                            var searchKey = $(this).parent().prev("div").text();
                            var searchValue = $(this).text();
                            $("#gover_search_key").val(searchKey + ":" + searchValue);
                            suggestWrap.hide();
                        });
                    }
                    suggestWrap.append(searchType);
                    suggestWrap.append(ul);
                }
            }
            suggestWrap.show();
        },
        getDate: function (type, num) {
            var dateresault = "";
            var d = new Date();
            var vyear = d.getFullYear();
            var vmon = d.getMonth() + 1;
            var vday = d.getDate();
            var nowdate = vyear + "/" + vmon + "/" + vday;
            var days = new Date(vyear, vmon, 0);
            var dyascount = days.getDate();
            if (type == "年") {
                vyear = vyear - num;
            }
            if (type == "月") {
                cutmon = vmon - num;
                if (cutmon < 0) {
                    vyear = vyear - 1;
                    vmon = 12 + cutmon;
                }
                else {
                    vmon = cutmon;
                }
            }
            if (type == "天") {
                cutday = vday - num;
                if (cutday < 0) {
                    vmon = vmon - 1;
                    vday = dyascount + cutday;
                }
                else {
                    vday = cutday;
                }
            }
            var stardate = vyear + "/" + vmon + "/" + vday;
            return stardate + "-" + nowdate;
        },
        getDateNow: function () {
            var date = new Date();
            var seperator1 = "-";
            var seperator2 = ":";
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
            return currentdate;
        },
        /*
        * 高级面板选择时级联更新及联动
        * 参数说明：parentSign:父节点标记
        */
        selectCascadeUpdate: function (parentSign, selectedValue) {
            if (typeof parentSign == "undefined" || parentSign == "") {
                return;
            }
            //获取该选项的子节点
            if (parentSign == "行政管理范围" || parentSign == "行政行为种类") {
                parentSign = "AY";
            }
            var data = advanceDataTool.getDataBySign(parentSign);
            //遍历子节点数据data
            for (var i in data.child) {
                var sonNode = data.child[i];
                var sonNodeDatas = sonNode.data;
                if (typeof sonNodeDatas == "undefined" && sonNode.type != "dict") {
                    continue;
                }
                //如果是后台字典
                if (sonNode.type == "dict") {
                    //获取下拉控件，重新赋值
                    var select = $("#adsearch_" + sonNode.sign);
                    var data = select.data("dataStore");
                    data = eval(data); ;
                    for (var j in data) {
                        if (data[j].key == selectedValue) {
                            select.data("data", data[j].value);
                        }
                    }
                    select.render();
                }
                else {
                    //edit by zhs 151105 添加mark标示，如果子节点data的key没有等于父节点的选中值，则不进行级联绑定
                    var selectDataSource = { "list": [{ "value": "none", "key": "请选择"}] };
                    for (var j in sonNodeDatas) {
                        //如果子节点data的key == 父节点的选中值，则进行级联绑定
                        if (sonNodeDatas[j].key == selectedValue) {
                            mark = 1;
                            if (sonNodeDatas[j].value != "") {
                                var valueStrArr = sonNodeDatas[j].value.split(";")
                                for (var k in valueStrArr) {
                                    var item = { value: "", key: "" };
                                    if (valueStrArr[k].indexOf("=") > 0) {
                                        item.value = valueStrArr[k].split('=')[0];
                                        item.key = valueStrArr[k].split('=')[1];
                                    }
                                    else {
                                        item.value = valueStrArr[k];
                                        item.key = valueStrArr[k];
                                    }
                                    selectDataSource.list.push(item);
                                }
                            }
                        }
                    }
                    //获取下拉控件，重新赋值
                    var select = $("#adsearch_" + sonNode.sign);
                    select.data("data", selectDataSource);
                    select.render();
                }
            }
        },
        Search: function (type, yzm, guid) {
            var parameters = new Array();
            //var url = window.location.href;
            var url = window.location.host + window.location.pathname + "?number=" + yzm + "&guid=" + guid + "&" + window.location.search.substring(1);
            url = decodeURI(url);
            parameters = manageUrl(url);

            //搜索框内的值
            var keyword = $(".head_search_key").val();

            //搜索框的搜索
            if (keyword != this.setting.initText && keyword.length < 200) {
                //存搜索session
                $.ajax({ url: "/List/SaveSession", type: "POST", async: true, data: { "number": keyword }, success: function (data) { } });
                var parameter =
                            { type: "searchWord",
                                value: "",
                                sign: "",
                                pid: "",
                                condition: ""
                            };

                //智能问句参数处理
                if (keyword.substring(0, 2) == "最近") {
                    var result = "";
                    $.ajax({
                        url: "/List/SmartAskSentence",
                        type: "POST",
                        async: false,
                        data: { "askString": keyword },
                        success: function (data) {
                            result = data;
                        }
                    });
                    if (result != "") {
                        //智能问句返回的值
                        var conditionArr = result.split(",");
                        for (var c in conditionArr) {
                            var reBuildValue = conditionArr[c].split(".");
                            var value = "";
                            var condtion = reBuildValue[0];
                            if (reBuildValue.length > 1) {
                                value = reBuildValue[1];
                            }
                            var para =
                            { type: "searchWord",
                                value: value,
                                sign: "",
                                pid: "",
                                condition: condtion
                            };
                            parameters.push(para);
                        }
                        Param("maxsearch", parameters);
                        return;
                    }
                } else if (keyword.indexOf(':') > 0) {
                    //分类推荐检索
                    parameter.value = keyword.split(":")[0];
                    parameter.condition = keyword;
                    parameters.push(parameter);
                }
                else {
                    //全文检索
                    //keyname="全文检索"
                    if (type == 2) { keyword = $("#comptext").val(); }
                    var keyname = $(".head_search_key").attr("key");
                    parameter.value = "QWJS";
                    parameter.condition = keyname + ":" + keyword;
                    var mark = 0;
                    for (var m = 0; m < parameters.length; m++) {
                        var para = parameters[m].condition;
                        var paraKey = parameters[m].condition.split(":")[0];
                        var paraVal = parameters[m].condition.split(":")[1];
                        if (para.indexOf(keyname) >= 0) {
                            mark = 1;
                            //原检索条件中包含“全文检索”条件,则将两次的查询条件进行对比
                            var keyWordArr = keyword.split(" ");
                            var oriKeyWordArr = paraVal.split(" ");
                            for (var kwi = 0; kwi < keyWordArr.length; kwi++) {
                                if (keyWordArr[kwi] == "") { continue; }
                                var isWordExist = 0;
                                for (var okwi = 0; okwi < oriKeyWordArr.length; okwi++) {
                                    if (oriKeyWordArr[okwi] == keyWordArr[kwi]) { isWordExist = 1; }
                                }
                                if (isWordExist == 0) { paraVal = paraVal + " " + keyWordArr[kwi]; }
                            }
                            parameters[m].condition = paraKey + ":" + paraVal;
                            break;
                        }
                    }
                    if (mark == 0) { parameters.push(parameter); }
                    if (parameters.length == 0) { parameters.push(parameter); }
                }
            }

            //点击高级检索框中的检索按钮时
            var $timeSpan = $("input[mark='timeSpan']");
            $timeSpan.each(function () {
                var timeSta = $(this).val();
                var timeEnd = $(this).next("input").val();
                var span = $(this).parent().prev(".fieldtitle").find("span");
                var name = span.text();
                var search = "";
                if (timeSta != "" && timeEnd != "") {
                    search = name + (timeSta + " TO " + timeEnd);
                } else {
                    if (timeSta != "" && timeEnd == "") {
                        search = name + (timeSta + " TO " + "2099-01-01");
                    }
                    if (timeSta == "" && timeEnd != "") {
                        search = name + ("1900-01-01" + " TO " + timeEnd);
                    }
                }
                var datePara = span.data("para");
                advanceDataTool.storeParas(datePara.filed, datePara.value, datePara.sign, search, "", span);
            });

            var field = $(".fieldtitle");
            var j = 0;
            var title = "searchWord";
            $.each(field, function (i) {
                var span = $(field[i]).find("span");
                //?sType ??干啥使的？
                var sType = span.attr("sType");
                var parameter = span.data("para");
                if (typeof parameter == "undefined") {
                    return;
                }
                if ($("#completxt").val() != "" && parameter.condition == "" && parameter.filed == "全文检索") {//wangzhange解决高级检索全文检索部分先选择下拉框后输入文本框，无法检索的问题
                    parameter.condition = parameter.value + ":" + $("#completxt").val()
                }
                parameter.type = title;
                if (typeof sType != "undefined") {
                    parameter.type = sType;
                }
                if (typeof parameter.filed != "undefined" && parameter.filed == "全文检索") {
                    var textSearchWord = $("#completxt").val();
                    if (textSearchWord == "") { return; }
                    var paraField = "全文检索";
                    if ($("#adsearch_dl").attr("reltext") != "全文") {
                        paraField = $("#adsearch_dl").attr("reltext");
                        var mark = 0;
                        for (var m = 0; m < parameters.length; m++) {
                            var para = parameters[m].condition;
                            var paraKey = parameters[m].condition.split(":")[0];
                            var paraVal = parameters[m].condition.split(":")[1];
                            if (para.indexOf(paraField) >= 0) {
                                //原检索条件中包含“全文检索”条件,则将两次的查询条件进行对比
                                var searchWordArr = textSearchWord.split(" ");
                                for (var kwi = 0; kwi < searchWordArr.length; kwi++) {
                                    if (searchWordArr[kwi] == "") { continue; }
                                    if (paraVal.indexOf(searchWordArr[kwi]) < 0) { paraVal = paraVal + " " + searchWordArr[kwi]; }
                                }
                                parameters[m].condition = paraKey + ":" + paraVal;
                                mark = 1;
                                break;
                            }
                        }
                        if (mark == 0) { parameters.push(parameter); }
                    } else {
                        var mark = 0;
                        for (var m = 0; m < parameters.length; m++) {
                            var para = parameters[m].condition;
                            var paraKey = parameters[m].condition.split(":")[0];
                            var paraVal = parameters[m].condition.split(":")[1];
                            if (para.indexOf("全文检索") >= 0) {
                                mark = 1;
                                //原检索条件中包含“全文检索”条件,则将两次的查询条件进行对比
                                var searchWordArr = textSearchWord.split(" ");
                                var oriKeyWordArr = paraVal.split(" ");
                                for (var kwi = 0; kwi < searchWordArr.length; kwi++) {
                                    if (searchWordArr[kwi] == "") { continue; }
                                    var isWordExist = 0;
                                    for (var okwi = 0; okwi < oriKeyWordArr.length; okwi++) {
                                        if (oriKeyWordArr[okwi] == searchWordArr[kwi]) { isWordExist = 1; }
                                    }
                                    if (isWordExist == 0) { paraVal = paraVal + " " + searchWordArr[kwi]; }
                                }
                                parameters[m].condition = paraKey + ":" + paraVal;
                                break;
                            }
                        }
                        if (mark == 0) { parameters.push(parameter); }
                        if (parameters.length == 0) { parameters.push(parameter); }
                    }
                } else {
                    if (parameter.condition != "") {
                        var mark = 0;
                        for (var m = 0; m < parameters.length; m++) {
                            if (parameters[m].condition.split(":")[0] == parameter.condition.split(":")[0]) {
                                parameters[m].condition = parameter.condition;
                                parameters[m].value = parameter.value;
                                mark = 1;
                            }
                        }
                        if (mark == 0) {
                            parameters.push(parameter);
                        }
                    }
                }
            })
            Param("maxsearch", parameters, yzm, guid);
        }
    }

    $.fn.UISearchWords = function (option) {
        var Search = new SearchWords(this, option);
        Search.Init();
        Search.BuildHtml(0);
    };
    $.fn.UIKeyWords = function (option) {
        var Key = new KeyWords(this, option);
        Key.Init();
        Key.BuildTag();
        return Key;
    };


})(jQuery)

var SearchParam = {
    SearchType: "",
    Cls: ""
}
function parameter() {
    this.key = "";
    this.sign = "";
    this.text = "";
    this.value = "";
    this.pid = "";
    this.condition = "";
}

