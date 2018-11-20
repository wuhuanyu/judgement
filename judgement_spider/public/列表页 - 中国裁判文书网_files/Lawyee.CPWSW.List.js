(function ($) {
    var GetList = function (element, option) {
        this.element = element;
        this.setting = {
            width: 600,
            height: 35
        }
        this.setting = $.extend({}, this.setting, option);
    }
    var guidCreate = function (type, index, pagesize) {
        $("#diverror").html("");
        $("#txtValidateCode").val("");
        $("#txthidtype").val(type);
        $("#txthidpage").val(index);
        $("#txthidpagesize").val(pagesize)
        var guid = createGuid() + createGuid() + "-" + createGuid() + "-" + createGuid() + createGuid() + "-" + createGuid() + createGuid() + createGuid(); //CreateGuid();
        $("#txthidGuid").val(guid);
        $("#divYzmImg").html("<img alt='点击刷新验证码！' name='validateCode' id='ImgYzm' onclick='ref()'  title='点击切换验证码' src='/ValiCode/CreateCode/?guid=" + guid + "' style='cursor: pointer;'  />");
    }
    var createGuid = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    GetList.prototype = {
        Init: function () {
            $("#hidOrder").attr("order", "法院层级");
            $("#hidOrder").attr("direction", "asc");
        },
        SortObj: null,
        SortCase: function (yzm, guid) {
            if (this.SortObj != null) {
                this.SortObj.BuildList(this.SortObj, 1, 5, 1, yzm, guid);
                $("#dialog").hide();
                $("#txtValidateCode").val("");
                this.SortObj = null;
            }
        },
        BuildHead: function () {
            var s = this;
            var $this = $(this.element);
            var param = $(this.setting.param);
            var datalist = "";
            var list_top = $("#sort");
            list_top.html("");
            //add by zhs 20151027 文书收藏和下载
            var $list_operate = $("#operate");
            $list_operate.html("");
            //head头部
            var orderlist = [{ key: '法院层级', value: '法院层级' }, { key: '裁判日期', value: '裁判日期' }, { key: '审判程序', value: '审判程序'}];
            for (var i = 0; i < orderlist.length; i++) {
                var key = orderlist[i].key;
                var value = orderlist[i].value;
                var $divSort;
                if (i == 0) {
                    $divSort = $("<div class=\"buttonclick\" key='desc'>" + value + "<div class=\"descico\"></div></div>");
                } else {
                    $divSort = $("<div class=\"button\" key='desc'>" + value + "<div class=\"descico\"></div></div>");
                }
                var _this = this;
                $divSort.click(function () {
                    var direction = "asc";
                    if ($(this).text() == "法院层级") {
                        if ($(this).attr("key") == "asc") {
                            $(this).find("div:first").attr("class", "descico");
                            $(this).attr("key", "desc");
                            direction = "asc";
                        } else {
                            $(this).find("div:first").attr("class", "ascico");
                            $(this).attr("key", "asc");
                            direction = "desc";
                        }
                    } else {
                        if ($(this).attr("key") == "asc") {
                            $(this).find("div:first").attr("class", "descico");
                            $(this).attr("key", "desc");
                        } else {
                            $(this).find("div:first").attr("class", "ascico");
                            $(this).attr("key", "asc");
                        }
                        direction = $(this).attr('key');
                    }
                    $(this).parent().find("div[class='buttonclick']").attr("class", "button");
                    $(this).attr("class", "buttonclick");
                    $(this).siblings().find(".ascico").attr("class", "descico");
                    $(this).siblings().attr("key", "desc");
                    var order = $(this).text();
                    $("#hidOrder").attr("order", order);
                    $("#hidOrder").attr("direction", direction);
                    _this.SortObj = s;
                    guidCreate(7);
                    //$("#dialog").show();
                    var valiguid = $("#txthidGuid").val();
                    $.ajax({
                        url: "/ValiCode/GetCode", type: "POST", async: true,
                        data: { "guid": valiguid },
                        success: function (data) {
                            s.BuildList(s, 1, 5, 1, data, valiguid);
                        }
                    });

                });
                list_top.append($divSort);
            }
            //edit by zhs 20151027 批量下载改为单选框选中的文书才批量下载
            //添加列表页下载按钮事件

            var $divListDownLoad = $("<div class='list-operate'><span>批量下载</span></div>");
            $divListDownLoad.click(function () {
                downDocList();
            });
            var $divListCollect = $("<div class='list-operate' id='listplsc'><span>批量收藏</span></div>");
            $divListCollect.click(function () {
                collectDocList();
            });
            var $ckList = $("<input class='listck' type='checkbox' id='ckall' name='ckall'/>");
            $ckList.click(function () {
                var ckState = $("#ckall").prop("checked");
                $("input[name='ckList']").prop("checked", ckState);
            });
            $list_operate.append($ckList);
            $list_operate.append($divListCollect);
            $list_operate.append($divListDownLoad);
            //end add  kingirvin 2015-10-13
            //总条数
            var $divListDataCount = $("<div class=\"list_datacount\">共找到<span id='span_datacount' style='color:red;'>0</span>个结果，显示前200条。<div class=\"downloadico\"></div></div>");
            list_top.append($divListDataCount);
        },
        DateTimeFormat: function (fmt, addDay, addMonth, addYear) {
            today = new Date();
            var o = {
                "M+": today.getMonth() + 1 + addMonth,                 //月份 
                "d+": today.getDate() + addDay,                    //日 
                "h+": today.getHours(),                   //小时 
                "m+": today.getMinutes(),                 //分 
                "s+": today.getSeconds(),                 //秒 
                "q+": Math.floor((today.getMonth() + 3) / 3), //季度 
                "S": today.getMilliseconds()             //毫秒 
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (today.getFullYear() + addYear + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        },
        BuildList: function (obj, index, page, type, yzm, guid) {
            var url = window.location.href;
            var nyzm = url.indexOf("&number");
            var subyzm = url.substring(nyzm + 1);
            var n1yzm = subyzm.indexOf("&");
            var yzm1 = subyzm.substr(7, 4);

            var nyzm = url.indexOf("&guid");
            var subguid = url.substring(nyzm + 1);
            var n1guid = subguid.indexOf("&");
            var guid1 = subguid.substr(5, 35);
            if (yzm != undefined && yzm != "undefined") {
                yzm1 = yzm;
            } if (guid != undefined && guid != "undefined") {
                guid1 = guid;
            }
            var s = this;
            var $this = $(this.element);
            var param = $(this.setting.param);
            var datalist = "";
            var list_center = $("#resultList");
            list_center.html("<div style='height:25px;line-height:25px;vertical-align:middle;'><img src='/Assets/js/libs/icons/loading.gif'/><span>正在加载，请稍候...</span></div>");
            //center中部数据
            //1.取数据
            var listparam = "";
            for (var i = 0; i < param.length; i++) {
                var parsplit = param[i].condition;
                listparam += parsplit + ",";
            }
            listparam = listparam.substring(0, listparam.length - 1);
            var order = $("#hidOrder").attr("order");

            //审判程序排序时，根据审判程序代码字段排序
            if (order == "审判程序") { order = "审判程序代码"; }

            var direction = $("#hidOrder").attr("direction");
            var dataCount = 0;

            //edit by zhs 151124
            //限制用户的最大翻页次数(100页后不可再次翻页)
            if (index > 25) {
                Lawyee.Tools.ShowMessage("返回的结果过多，推荐您精确检索条件后再次查询!");
                list_center.css("height", "500px");
                list_center.css("font-size", "18px");
                list_center.html("无符合条件的数据...");
                return false;
            }
            var guid1 = createGuid() + createGuid() + "-" + createGuid() + "-" + createGuid() + createGuid() + "-" + createGuid() + createGuid() + createGuid();
            var yzm1; //dzf 20180805 验证码没什么作用，屏蔽
            //            $.ajax({
            //                url: "/ValiCode/GetCode", type: "POST", async: false,
            //                data: { "guid": guid1 },
            //                success: function (data) {
            //                    yzm1 = data;
            //                }
            //            });


            $.ajax({
                url: "/List/ListContent",
                type: "POST",
                async: true,
                data: { "Param": listparam, "Index": index, "Page": page, "Order": order, "Direction": direction, "vl5x": getKey(), "number": yzm1, "guid": guid1 },
                success: function (data) {
                    //datalist = $.parseJSON(data);

                    if (data == "remind") {
                        window.location.href = "/Html_Pages/VisitRemind20180914.html";
                    }
                    datalist = eval("(" + data + ")");

                    var currentDocId = "";
                    //2.加载数据
                    list_center.html("");
                    if (datalist != undefined && datalist != null) {
                        if (datalist.length > 1) {
                            dataCount = (datalist[0].Count != undefined ? datalist[0].Count : 0);
                            if (datalist[0].RunEval != undefined) {
                                eval(unzip(datalist[0].RunEval));
                            }
                            $("#span_datacount").text(dataCount);
                            var keyWordArr = new Array();
                            if (listparam != "") {
                                var paramArr = listparam.split(',');
                                for (var i = 0; i < paramArr.length; i++) {
                                    var keyWord = "";
                                    //获取检索条件中的关键词和全文检索的参数值，在列表页和全文页高亮显示
                                    var paramKey = paramArr[i].split(":")[0];
                                    if (paramKey != undefined && ("关键词,全文检索,首部,事实,理由,判决结果,尾部".indexOf(paramKey) >= 0)) {
                                        keyWord = paramArr[i].split(":")[1];
                                        var reg = /\s+/g;
                                        keyWord = keyWord.replace(reg, ' ');
                                        var kwarr = keyWord.split(" ");
                                        for (var m = 0; m < kwarr.length; m++) {
                                            keyWordArr.push(kwarr[m]);
                                        }
                                    }
                                }
                            }

                            //转换当页列表数据的案件类型值(int型转成string型)
                            var caseTypeStr = "", relateFiles = "";
                            for (var i = 1; i < datalist.length; i++) {
                                var key = datalist[i].文书ID != undefined ? datalist[i].文书ID : "";
                                var caseCourt = datalist[i].法院名称 != undefined ? datalist[i].法院名称 : "";
                                var caseNumber = datalist[i].案号 != undefined ? datalist[i].案号 : "";
                                var caseTypeInt = datalist[i].案件类型 != undefined ? datalist[i].案件类型 : "";
                                caseTypeStr = caseTypeStr + caseTypeInt + ",";
                                relateFiles = (relateFiles == "" ? relateFiles : (relateFiles + "~")) + key + "|" + caseCourt + "|" + caseNumber + "|" + caseTypeInt;
                            }
                            caseTypeStr = obj.GetDicValue("AJLX", caseTypeStr);
                            var caseTypeArray = caseTypeStr.split(",");

                            for (var i = 1; i < datalist.length; i++) {
                                var key = datalist[i].文书ID != undefined ? datalist[i].文书ID : "";
                                var caseNameTitle = datalist[i].案件名称 != undefined ? datalist[i].案件名称.replace(",", "，") : "";
                                currentDocId += key + ",";
                                title = caseNameTitle;
                                if (title == "") { continue; }
                                titleOri = caseNameTitle;
                                var caseTypeInt = datalist[i].案件类型 != undefined ? datalist[i].案件类型 : "";

                                //查找字典值
                                var caseType = (caseTypeArray[i - 1] != undefined ? caseTypeArray[i - 1] : "");
                                var trialRound = datalist[i].审判程序 != undefined ? datalist[i].审判程序 : "";

                                //做判断，取两个字显示
                                var style = "";
                                if (trialRound == "再审审查与审判监督") { trialRound = "审监" }
                                if (trialRound == "非诉执行审查") { trialRound = "非诉" }
                                if (trialRound == "刑罚变更") { caseType = ""; style = "width:48px;"; }

                                if (trialRound == "其他") { trialRound = ""; }
                                if (trialRound == "执行" && caseType == "执行") { trialRound = ""; }

                                var caseCourt = datalist[i].法院名称 != undefined ? datalist[i].法院名称 : "";
                                var caseNumber = datalist[i].案号 != undefined ? datalist[i].案号 : "";
                                var caseContent = datalist[i].DocContent != undefined ? datalist[i].DocContent : "";
                                var judgeDate = datalist[i].裁判日期 != undefined ? datalist[i].裁判日期 : "";
                                var notpublic = datalist[i].不公开理由;
                                //add by zhs 151213 裁判日期大于当前日期时，把裁判日期置为空
                                judgeDate == "0001-01-01" ? "" : judgeDate;

                                var today = new Date();

                                var dateNow = obj.DateTimeFormat("yyyy-MM-dd", 0, 0, 0);
                                if (obj.DataCompare(judgeDate, dateNow) > 0) {
                                    judgeDate = "";
                                }

                                var titleInfo = "【裁判理由】";

                                var linkA = "/content/content?DocID=" + key;
                                var keyWords = "";
                                //文书名称中命中的关键字标红
                                if (keyWordArr.length > 0) {
                                    keyWords = keyWordArr.join("|");
                                    linkA = "/content/content?DocID=" + key + "&KeyWord=" + keyWords;
                                    titleInfo = "【命中结果】";
                                    keyWord = keyWordArr[0];

                                    //将caseContent全角转半角显示
                                    caseContent = obj.ToCDB(caseContent);
                                    //将命中结果中的&#xA;类似符号替换掉
                                    caseContent = caseContent.replace(/&amp;#xA;/g, "");
                                    caseContent = caseContent.replace(/&amp;nbsp;/g, "");
                                    caseContent = caseContent.replace(/&amp;gt;/g, "");
                                    caseContent = caseContent.replace(/&amp;lt;/g, "");

                                    if (caseContent.indexOf(keyWord) >= 0) {
                                        var keyWordIndex = caseContent.indexOf(keyWord);
                                        var startIndex = keyWordIndex - 60;
                                        var markRedCon = "";
                                        if (startIndex <= 0) {
                                            markRedCon = markRedCon + caseContent.substr(0, keyWordIndex) + keyWord;
                                            markRedCon = markRedCon + caseContent.substr(keyWordIndex + keyWord.length, 130 - keyWordIndex);
                                        } else {
                                            markRedCon = markRedCon + caseContent.substr(keyWordIndex - 60, 60) + keyWord;
                                            markRedCon = markRedCon + caseContent.substr(keyWordIndex + keyWord.length, 60);
                                        }
                                        caseContent = "..." + markRedCon + "...";
                                    } else {
                                        caseContent = caseContent.substr(0, 130);
                                    }
                                    //关键字标红
                                    title = obj.KeyWordsMarkRed(title, keyWordArr);
                                    caseContent = obj.KeyWordsMarkRed(caseContent, keyWordArr);
                                } else {
                                    if (notpublic == "" || notpublic == undefined) {
                                        var cpyz = datalist[i].裁判要旨段原文 != undefined ? datalist[i].裁判要旨段原文 : "";
                                        caseContent = cpyz;
                                        caseContent = obj.ToCDB(caseContent);
                                        caseContent = caseContent.substr(0, 130) + "...";
                                    } else {
                                        titleInfo = "【不公开理由】";
                                        caseContent = datalist[i].不公开理由;
                                    }
                                }
                                var listitemid = "dataItem" + i;
                                if (caseContent == "" || caseContent == "...") { titleInfo = ""; caseContent = ""; }
                                var li = $("<div class=\"dataItem\" id=\"" + listitemid + "\" key=\"" + key + "\" title=\"" + titleOri + "\" caseCourt=\"" + caseCourt + "\" caseNumber=\"" + caseNumber + "\" judgeDate=\"" + judgeDate + "\">"
                                        + "<div class=\"label\">"
                                            + (caseType != "" ? ("<div class=\"ajlx_lable\">" + caseType + "</div>") : "")
                                            + (trialRound != "" ? ("<div class=\"ajlx_lable\" style=\"" + style + "\">" + trialRound + "</div>") : "")
                                        + "</div>"
                                        + "<table>"
                                            + "<tr>"
                                                + "<td colspan='2'>"
                                                    + "<div class=\"wstitle\">"
                                                    + "<input type=\"hidden\" class=\"DocIds\" value=\"" + key + "|" + titleOri + "|" + judgeDate + "\" >"
                                                    + "<input class='listck' type='checkbox' name='ckList' downloadValue=\"" + key + "|" + titleOri + "|" + judgeDate + "\"  value=\"" + key + "^" + title + "^" + caseCourt + "^" + caseNumber + "^" + judgeDate + "\"/>&nbsp;"
                                //+  "<a href='/content/contents?DocID=" + key+"'  target='_blank' style='color:Black; text-decoration:none;display:none'>" + title + "</a>"
                                                    + "<a href='javascript:void(0)' onclick='javascript:Navi(\"" + key + "\",\"" + keyWords + "\")' target='_self' style='color:Black; text-decoration:none'>" + title + "</a>"
                                                    + "</div>"
                                                + "</td>"
                                            + "</tr>"
                                             + "<tr>"
                                               + "<td colspan='2'>"
                                               + "<div class=\"fymc\">"
                                               + caseCourt
                                               + (caseNumber == "无" ? "" : ("&nbsp;&nbsp;&nbsp;&nbsp;" + caseNumber))
                                               + "&nbsp;&nbsp;&nbsp;&nbsp;"
                                               + judgeDate
                                               + "</div>"
                                               + "</td>"
                                            + "</tr>"
                                            + "<tr>"
                                               + "<td colspan='2'>"
                                               + "<div class=\"mzjg\">"
                                               + titleInfo
                                               + "</div>"
                                               + "</td>"
                                            + "</tr>"
                                            + "<tr>"
                                                + "<td class=\"wszy\" colspan='2'>"
                                                + caseContent
                                                + "</td>"
                                            + "</tr>"
                                            + "<tr>"
                                                + "<td class=\"\" colspan='2'>"
                                                + "<div id='ListItem" + (i - 1) + "'></div>"
                                                + "</td>"
                                            + "</tr>"

                                        + "</table>"
                                            + "<div class=\"scxz\">"
                                                + "<div class=\"download\">"
                                                + "<img style=\"cursor:pointer; margin-bottom:5px;\" title='通过中国司法案例网身份认证的会员（主要包括法官、律师、法律学者、法律院校学生）才能推荐裁判文书到中国司法案例网，经全体会员众筹投票，符合条件可收入最高人民法院司法案例库' onclick=\"Casefx('" + key + "');\" src=\"/Assets/img/list/wytal-hove.png\" alt=\"通过中国司法案例网身份认证的会员（主要包括法官、律师、法律学者、法律院校学生）才能推荐裁判文书到中国司法案例网，经全体会员众筹投票，符合条件可收入最高人民法院司法案例库\"/>"
                                                + "</div>"
                                                + "<div class=\"download\">"
                                                + "<img style=\"cursor:pointer;\" title='下载' onclick=\"DownLoadCaseNew('" + listitemid + "');\" src=\"/Assets/img/list/list_download.png\" alt=\"下载\"/>"
                                                + "</div>"
                                                + "<div class=\"collect\">"
                                                + "<img style=\"cursor:pointer;\" title='收藏'  onclick=\"CollectCaseNew('" + listitemid + "');\" src=\"/Assets/img/list/list_collect.png\"  alt=\"收藏\"/>"
                                                + "</div>"
                                            + "</div>"
                                + "</div>");
                                list_center.append(li);
                            }
                        } else {
                            list_center.css("height", "500px");
                            list_center.css("font-size", "18px");
                            list_center.html("无符合条件的数据...");
                        }
                        //获取关联文书，显示在列表中
                        list_center.render();
                        try {
                            var getGs = $("#hidConditions").val();
                            toGridsum.SearchList(getGs); //国双
                        } catch (e)
                        { }
                        if (currentDocId != "") {
                            currentDocId = currentDocId.substring(0, currentDocId.lastIndexOf(','));
                        }
                        rfDataList = obj.GetRelateFiles(obj, relateFiles, currentDocId);

                    } else {
                        list_center.css("height", "500px");
                        list_center.css("font-size", "18px");
                        list_center.html("无符合条件的数据...");
                    }
                    if (type == 1) {
                        obj.BuildBottom(obj, dataCount);
                    }
                }
            });
        },
        PageObj: null,
        BuildBottom: function (obj, dataCount) {
            var list_bottom = $("#docbottom");
            list_bottom.html("");
            //分页bottom
            //分页bottom
            //var $pager = $('<div style="margin-top:20px;" id="pageNumber" class="pageNumber" total="' + dataCount + '"  pageSize="5" showSelect="true" selectDirection="bottom" centerPageNum="5" edgePageNum="0"  prevText="上一页" nextText="下一页" selectData=\'{"list":[{"key":5,"value":5},{"key":10,"value":10},{"key":15,"value":15},{"key":20,"value":20}]}\'></div>');
            //update by dongmiaonan 20180925
            var $pager = $('<div style="margin-top:20px;" id="pageNumber" class="pageNumber" total="' + dataCount + '"  pageSize="10" showSelect="false" selectDirection="bottom" centerPageNum="10" edgePageNum="0" page="0"  prevText="上一页" nextText="下一页" selectData=\'{"list":[{"key":5,"value":5},{"key":10,"value":10},{"key":15,"value":15},{"key":20,"value":20}]}\'></div>');
            $pager.attr("total", dataCount);
            list_bottom.append($pager);
            $pager.render();
            var _this = this;
            $pager.bind("pageChange", function (e, index) {
                var pageSize = $(this).attr('pageSize');
                _this.PageObj = { pageSize: pageSize, obj: obj, index: index };

                guidCreate(3, index, pageSize);
                //$("#dialog").show();
                var valiguid = $("#txthidGuid").val();
                $.ajax({
                    url: "/ValiCode/GetCode", type: "POST", async: true,
                    data: { "guid": valiguid },
                    success: function (data) {
                        var type = $("#txthidtype").val();
                        $("#txtValidateCode").val(data);
                        if (type == 3) {
                            //var pageSize = $(this).attr('pageSize');
                            var index = $("#txthidpage").val();
                            var pagesize = $("#txthidpagesize").val();
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


                //                var pageSize = $(this).attr('pageSize');
                //                obj.BuildList(obj, index + 1, pageSize, 0);


                //                $("html,body").animate({ scrollTop: 0 }, 'fast');
            });
            $pager.bind("sizeChange", function (e, num) {
                _this.PageObj = { pageSize: num, obj: obj, index: 1 };
                guidCreate(3, 1, num);
                //$("#dialog").show();
                var valiguid = $("#txthidGuid").val();
                $.ajax({
                    url: "/ValiCode/GetCode", type: "POST", async: true,
                    data: { "guid": valiguid },
                    success: function (data) {
                        obj.BuildList(obj, 1, num, 0, data, valiguid);
                    }
                });
            });
        },
        PageChange: function (data) {
            if (this.PageObj != null) {
                var guid = $("#txthidGuid").val();
                var yzm = $("#txtValidateCode").val();
                this.PageObj.obj.BuildList(this.PageObj.obj, this.PageObj.index + 1, this.PageObj.pageSize, 0, yzm, guid);
                $("#dialog").hide();
                $("#txtValidateCode").val("");
                this.PageObj = null;

                $("html,body").animate({ scrollTop: 0 }, 'fast');
            }
        },
        GetRelateFiles: function (obj, caseInfoAll, currentDocId) {
            var dataList;
            //获取关联文书
            var htmlStr = "";
            $.ajax({
                url: "/List/GetAllRelateFiles",
                type: "POST",
                async: true,
                data: { "caseInfoAll": caseInfoAll },
                success: function (data) {
                    try {
                        dataList = $.parseJSON(data);
                    } catch (error) {
                        dataList = "";
                    }
                    var relateFilesArray = obj.BuildRFHtml(obj, dataList, currentDocId);
                    for (var rfi = 0; rfi < relateFilesArray.length; rfi++) {
                        $("#ListItem" + rfi).html(relateFilesArray[rfi]);
                        if (htmlStr != "" && relateFilesArray[rfi] != "<table></table>") {
                            $("#ListItem" + rfi).prepend(htmlStr);
                        }
                    }
                }
            });
        },
        BuildRFHtml: function (obj, dataList, currentDocId) {
            var relateFilesArray = [];
            var arry_arrentId = currentDocId.split(',');
            if (dataList != undefined && dataList.RelateFiles != undefined && dataList.RelateFiles.length > 0) {
                for (var i = 0; i < dataList.RelateFiles.length; i++) {
                    //创建关联文书

                    var html = "<table>";
                    var relateFile = dataList.RelateFiles[i].RelateFile;
                    if ($.isArray(relateFile)) {
                        if (relateFile.length > 0) {
                            var fileType = "0"; var img = ""; var relateId = "";
                            for (var ii = 0; ii < relateFile.length; ii++) {

                                var fileTypeii = relateFile[ii].Type;
                                var judgeTime = relateFile[ii].裁判日期 == "0001-01-01" ? "" : relateFile[ii].裁判日期;
                                var title = "【关联文书】";

                                if (arry_arrentId[i] == relateFile[ii].文书ID) {
                                    if (ii == 0) {
                                        img += "<img src=\"/Assets/img/list/bp_18.png\" style=\"padding-left:2px;\"/><img style=\"padding-bottom: 5px;\" src=\"/Assets/img/list/dot_10.png\"/>";
                                    } else if (ii == relateFile.length - 1 && relateFile.length == 2) {
                                        img += "<img style=\"padding-left:2px;\" src=\"/Assets/img/list/bp_18.png\"/><img style=\"margin-bottom: 10px;margin-right: 5px;\" src=\"/Assets/img/list/dot_04.png\"/>";
                                    } else if (ii < relateFile.length - 1) {
                                        img += "<img style=\"margin-bottom:10px;\" src=\"/Assets/img/list/bp_18.png\"/><img src=\"/Assets/img/list/dotLine_03.png\"/>";
                                    } else {
                                        img += "<img src=\"/Assets/img/list/bp_18.png\" style=\"padding-left:2px;\" /><img style=\"padding-right: 4px;padding-bottom: 11px;\" src=\"/Assets/img/list/dot_07.png\"/>";
                                    }

                                } else {
                                    if (ii == 0) {
                                        img += "<img style=\"padding-bottom: 5px;margin-left:10px;margin-top: 10px;\" src=\"/Assets/img/list/dot_10.png\"/>";
                                    } else if (ii < relateFile.length - 1) {
                                        img += "<img style=\"margin-left:45px\" src=\"/Assets/img/list/dotLine_03.png\"/>";
                                    } else if (ii == relateFile.length - 1 && relateFile.length == 2) {
                                        img += "<img style=\"margin-left:48px;margin-right: 5px;\" src=\"/Assets/img/list/dot_04.png\"/>";
                                    } else {
                                        img += "<img style=\"padding-right: 4px;padding-top: 8px;\" src=\"/Assets/img/list/dot_07.png\"/>";
                                    }
                                }
                            }
                            for (var ii = 0; ii < relateFile.length; ii++) {

                                var fileTypeii = relateFile[ii].Type;
                                var judgeTime = relateFile[ii].裁判日期 == "0001-01-01" ? "" : relateFile[ii].裁判日期;
                                var title = "【关联文书】";
                                if (ii > 0) {
                                    title = "";
                                }
                                var colStr = 0;
                                if (relateFile.length == 2) {
                                    colStr = relateFile.length + 1;
                                } else {
                                    colStr = relateFile.length * 2;
                                }
                                html += "<tr>";
                                html += "<td class='list-glws-title' colspan=\"2\">";
                                html += "<lable title=\"关联文书仅以本网收录的裁判文书为依据，如果对此结果有疑义，请联系作出裁判文书的人民法院。\">" + title + "</lable>";
                                html += "</td>";
                                html += "</tr>";
                                html += "<tr>";
                                if (ii == 0) {
                                    html += "<td  rowspan=" + colStr + " style=\"text-align: right;width: 70px;\"><div style=\"width: 70px;float: right; margin-bottom: 10px;\">" + img + "</div></td>";
                                }
                                if (arry_arrentId[i] == relateFile[ii].文书ID) {
                                    html += "<td class='list-glws'>";
                                    html += "&nbsp;" + relateFile[ii].Mark + "";
                                    html += "&nbsp;" + relateFile[ii].审理法院 + "";
                                    html += "&nbsp;<a  title='本篇文书' target='_blank' >" + relateFile[ii].案号 + "</a>";
                                    html += "&nbsp;" + judgeTime + "";
                                    html += "&nbsp;" + relateFile[ii].结案方式 + "";
                                    html += "</td>";
                                } else {
                                    html += "<td class='list-glws'>";
                                    html += "&nbsp;" + relateFile[ii].Mark + "";
                                    html += "&nbsp;" + relateFile[ii].审理法院 + "";
                                    html += "&nbsp;<a style='text-decoration:underline;' title='点击查看全文' target='_blank' href=\"/Content/Content?DocID=" + relateFile[ii].文书ID + "\">" + relateFile[ii].案号 + "</a>";
                                    html += "&nbsp;" + judgeTime + "";
                                    html += "&nbsp;" + relateFile[ii].结案方式 + "";
                                    html += "</td>";
                                }
                                html += "</tr>";
                                if (ii == 0) {
                                    if (relateFile[ii + 1] != undefined) {
                                        var fileTypeNext = relateFile[ii + 1].Type;
                                        if (fileTypeNext !== fileTypeii) {
                                            /*html += "<tr>";
                                            html += "<td class=\"list-glws_dot\"></td>";
                                            html += "<td class='list-glws'>";
                                            html += "<div style='margin-left:7px;height:1px;border-bottom:1px dashed #666666;'></div>";
                                            html += "</td>";
                                            html += "</tr>";
                                            fileType = fileTypeii;*/
                                        }
                                    }
                                }
                                if (ii == relateFile.length - 1 && fileTypeii != fileType) {
                                    html += "<tr>";
                                    html += "<td class=\"list-glws_dot\"></td>";
                                    html += "<td class='list-glws'>";
                                    html += "<div style='margin-left:7px;height:1px;border-bottom:1px dashed #666666;'></div>";
                                    html += "</td>";
                                    html += "</tr>";
                                    fileType = fileTypeii;
                                }

                            }
                        }
                    }
                    html += "</table>";
                    relateFilesArray.push(html);
                }
            }
            return relateFilesArray;
        },
        ToCDB: function (str) {
            //全角转换为半角函数 
            var tmp = "";
            for (var i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) > 65248 && str.charCodeAt(i) < 65375) {
                    tmp += String.fromCharCode(str.charCodeAt(i) - 65248);
                }
                else {
                    tmp += String.fromCharCode(str.charCodeAt(i));
                }
            }
            return tmp;
        },
        DataCompare: function (a, b) {
            var arr = a.split("-");
            var starttime = new Date(arr[0], arr[1], arr[2]);
            var starttimes = starttime.getTime();

            var arrs = b.split("-");
            var lktime = new Date(arrs[0], arrs[1], arrs[2]);
            var lktimes = lktime.getTime();

            if (starttimes >= lktimes) {
                return 1;
            }
            else {
                return 0;
            }
        },
        GetDicValue: function (dicId, dicKey) {
            //获取字典值
            var dicValue = "";
            $.ajax({
                url: "/List/GetDicValue",
                type: "POST",
                async: false,
                data: { "dicId": dicId, "dicKey": dicKey },
                success: function (data) {
                    dicValue = data;
                }
            });
            return dicValue;
        },
        KeyWordsMarkRed: function (content, keyWordArr) {
            for (var keyi = 0; keyi < keyWordArr.length; keyi++) {
                if (content.indexOf(keyWordArr[keyi]) >= 0) {
                    eval('content = content.replace(/' + keyWordArr[keyi] + '/g, "<span style=\'color:red\'>' + keyWordArr[keyi] + '</span>")');
                }
            }
            return content;
        }
    }
    $.fn.UIList = function (option) {
        var List = new GetList(this, option);
        List.Init();
        List.BuildHead();
        //List.BuildList(List, 1, 5, 1); 
        //update by dongmiaonan 20180925
        List.BuildList(List, 1, 10, 1);
        return List;
    }
})(jQuery)
function collectDocList() {
    var getListDocIds = $("input[name='ckList']:checked");
    if (getListDocIds.length > 0) {
        var DocIds = new Array();
        var realid = "";		
        getListDocIds.each(function () {          
			var $dataitem = $(this).parents(".dataItem");
			var id = $dataitem.attr("key");
            var unzipid = unzip(id);			
            try {
                realid = com.str.Decrypt(unzipid);
                if (realid == "") {
                    setTimeout("collectDocList()", 1000); 

					return;
                } else {
                    DocIds.push(realid+"^"+$dataitem.attr("title")+"^"+$dataitem.attr("caseCourt")+"^"+$dataitem.attr("caseNumber")+"^"+$dataitem.attr("judgeDate"));
                }
            } catch (ex) {
                setTimeout("collectDocList()", 1000);
                return;
            }
        });
    }else{
		Lawyee.Tools.ShowMessage('请选择需要收藏的文书!');
	}
	if(DocIds.length==0){
		return;
	}
    $.ajax({
        url: "/Content/CheckLogin",
        type: "POST",
        async: false,
        data: {},
        success: function (res) {
            if (res == "0") {
                SaveUrl(); //保存当前url路径
                window.location = '/User/RegisterAndLogin?Operate=1';
            } else {
                var ckChecked = $("input[name='ckList']:checked");
                var caseInfo = "";
                if (DocIds.length > 0) {
                   // $.each(DocIds,function () {
                   //     caseInfo = caseInfo + $(this) + "&";
                   // });
					caseInfo= DocIds.join("&");
                    $("#hidCaseInfo").val(caseInfo);
                    top.Dialog.confirm("是否收藏到新的案例包中？|提示|是否", function () {
                        var $conditions = $(".removeCondtion");
                        var conditions = "";
                        $conditions.each(function () {
                            conditions += $(this).attr("val") + "&";
                        });
                        conditions = conditions.substr(0, conditions.length - 1);
                        if (conditions.split('&').length >= 2) {
                            var conArry = conditions.split('&');
                            conditions = conArry[0] + conArry[1];
                        }
                        conditions = conditions.replace(/:/g, "为").replace(/&/g, "且");
                        var dates = new Date();
                        var _years = dates.getFullYear();
                        var _months = dates.getMonth() + 1;
                        var _days = dates.getDay();
                        var _hours = dates.getHours();
                        var _minutes = dates.getMinutes();
                        var _seconds = dates.getSeconds();
                        var _mill = dates.getMilliseconds();
                        var nowTimes = _years + "" + _months + "" + _days + "" + _hours + "" + _minutes + "" + _seconds + "" + _mill;
                        AddPackage(conditions + nowTimes);
                    }, function () {
                        List.Package.BindPackageList();
                        $("#divCasePackage").show();
                    });
                }
            }
        }
    });
}
function downDocList() {
    var getListDocIds = $("input[name='ckList']:checked");
    if (getListDocIds.length > 0) {
        var DownloadDocIds = new Array();
        var realid = "";
        getListDocIds.each(function () {
           	var $dataitem = $(this).parents(".dataItem");
			var id = $dataitem.attr("key");
            var unzipid = unzip(id);
            try {
                realid = com.str.Decrypt(unzipid);
                if (realid == "") {
                    setTimeout("downDocList()", 1000); return;
                } else {
                    DownloadDocIds.push(realid+"|"+$dataitem.attr("title")+"|"+$dataitem.attr("judgeDate"));
                }
            } catch (ex) {
                setTimeout("downDocList()", 1000);
                return;
            }
        });
    }else{
		Lawyee.Tools.ShowMessage('请选择需要下载的文书!');
	}
	if(DownloadDocIds.length==0){
		return;
	}
    if (getListDocIds.length > 0) {
        var thebody = document.body;
        var formid = 'DownloadForm';
        var url = '/CreateContentJS/CreateListDocZip.aspx?action=1';
        var theform = document.createElement('form');
        theform.id = formid;
        theform.action = url;
        theform.method = 'POST';

        //获取检索条件，作为压缩包名称
        var $conditions = $(".removeCondtion");
        var conditions = "";
        $conditions.each(function () {
            conditions += $(this).attr("val") + "&";
        });
        conditions = conditions.substr(0, conditions.length - 1);
        conditions = conditions.replace(/:/g, "为").replace(/&/g, "且");

        var theInput = document.createElement('input');
        theInput.type = 'hidden';
        theInput.id = 'conditions';
        theInput.name = 'conditions';
        theInput.value = encodeURI(conditions);
        theform.appendChild(theInput);

        var theInput = document.createElement('input');
        theInput.type = 'hidden';
        theInput.id = 'docIds';
        theInput.name = 'docIds';
        theInput.value = DownloadDocIds.toString();
        theform.appendChild(theInput);

        //验证码功能暂未启用
        var theInput = document.createElement('input');
        theInput.type = 'hidden';
        theInput.id = 'keyCode';
        theInput.name = 'keyCode';
        theInput.value = '';
        theform.appendChild(theInput);

        thebody.appendChild(theform);
        theform.submit();
    }
}
//增加7道爬虫防御 段智峰 20180807
function Navi(id, keyword) {
    var unzipid = unzip(id);
    try {
        var realid = com.str.Decrypt(unzipid);
        if (realid == "") {
            setTimeout("Navi('" + id + "','" + keyword + "')", 1000);
        } else {
            var url = "/content/content?DocID=" + realid + "&KeyWord=" + encodeURI(keyword); 
            openWin(url);
        }
    } catch (ex) {
        setTimeout("Navi('" + id + "','" + keyword + "')", 1000);
    }
}
function openWin(url) {
    $('body').append($('<a href="' + url + '" target="_blank" id="openWin"></a>'))
    document.getElementById("openWin").click(); //点击事件
    $('#openWin').remove();
}