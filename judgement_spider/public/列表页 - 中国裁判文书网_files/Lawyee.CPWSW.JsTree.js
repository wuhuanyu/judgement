(function ($) {
    var TreeLoad = function (element, option) {
        this.setting = {
            width: 60,
            height: 600
        }
        this.element = element;
        this.setting = $.extend({}, this.setting, option);
    };
    var guidCreate = function (type, index, pagesize, tree, treekey) {
        $("#diverror").html("");
        $("#txtValidateCode").val("");
        $("#txthidtype").val(type);
        $("#inputhidpage").val(index);
        $("#txthidpagesize").val(pagesize);
        $("#txthidtree").val(tree);
        $("#txthidtreekey").val(treekey);
        var guid = createGuid() + createGuid() + "-" + createGuid() + "-" + createGuid() + createGuid() + "-" + createGuid() + createGuid() + createGuid(); //CreateGuid();
        $("#txthidGuid").val(guid);
        $("#divYzmImg").html("<img alt='点击刷新验证码！' name='validateCode' id='ImgYzm' onclick='ref()'  title='点击切换验证码' src='/ValiCode/CreateCode/?guid=" + guid + "' style='cursor: pointer;'  />");
    }
    var createGuid = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    TreeLoad.prototype = {
        resaonTreeId: "",
        courtTreeId: "",
        courtZGCount: 0,
        Init: function () {
        },
        BuildHtml: function () {
            var treeMoreCount = 10;
            var $this = $(this.element);
            if ($this.attr("MoreCount") != undefined) {
                treeMoreCount = parseInt($this.attr("MoreCount")); //显示更多的设置
            }
            var s = this;
            var treedata;
            var treeObj;
            var param = $(this.setting.param);
            var treeparam = "";
            for (var i = 0; i < param.length; i++) {
                var parsplit = param[i].condition;
                treeparam += parsplit + ",";
            }
            treeparam = treeparam.substring(0, treeparam.length - 1);
            var guid = $("#txthidGuid").val();
            var yzm = $("#txtValidateCode").val();

            var url = window.location.href;
            var nyzm = url.indexOf("&number");
            var subyzm = url.substring(nyzm + 1);
            var n1yzm = subyzm.indexOf("&");
            var yzm1 = subyzm.substr(7, 4);

            var nyzm = url.indexOf("&guid");
            var subguid = url.substring(nyzm + 1);
            var n1guid = subguid.indexOf("&");
            var guid1 = subguid.substr(5, 35);
            guid1 = createGuid() + createGuid() + "-" + createGuid() + "-" + createGuid() + createGuid() + "-" + createGuid() + createGuid() + createGuid();
            $.ajax({
                url: "/ValiCode/GetCode", type: "POST", async: false,
                data: { "guid": guid1 },
                success: function (data) {
                    yzm1 = data;
                }
            });
            
            $.ajax({
                url: "/List/TreeContent",
                type: "POST",
                async: true,
                data: { "Param": treeparam, "vl5x": getKey(), "guid": guid1, "number": yzm1 },
                success: function (data) {
                    treedata = eval(data);
                    $this.empty();
                    var head = $("<div class='head'><div class='head_line'></div>所有类目</div>");
                    $this.append(head);
                    if (treedata != undefined) {
                        for (var i = 0; i < treedata.length; i++) {
                            var list = treedata[i];

                            //edit by zhs 151109 改为无数据的引导树不显示(如需显示全部引导树，则注释掉以下一行代码)
                            if (list == undefined || list.Value.length == 0) { continue; }

                            var title = list.Key;
                            var treevalue = list.Child;
                            var showTitle = "";
                            showTitle = "按" + title;

                            var key = $(this).title;
                            var treeKey = $("<div key='" + title + "' class='treeItem'/>");
                            var treeHead = $("<div class='itemhead'/>");
                            var expend = $("<div class='expand' more='" + ((list.Child.length > treeMoreCount) ? "1" : "0") + "'></div>");
                            if (title == "法院名称" || title.indexOf("法院编码") > -1 || title == "法院地域") {
                                showTitle = "按地域及法院"
                            }
                            if (title == "一级案由") {
                                showTitle = "按案由"
                            }
                            var span = $("<span>" + showTitle + "筛选</span>");
                            var listcontent = $("<div  class='itemlist'></div>");
                            var unfold = $("<div class='unfold'>查看更多</div>");
                            expend.click(function () {
                                var con = $(this).parent().parent().find(".itemlist");
                                var fold = $(this).parent().parent().find(".unfold");
                                if (!con.is(":visible")) {
                                    $(this).attr("class", "expand")
                                    con.show(300);
                                    var more = parseInt($(this).attr("more"));
                                    if (more == "1") {
                                        fold.show();
                                    }
                                }
                                else {
                                    $(this).attr("class", "collspand")
                                    con.hide(300);
                                    fold.hide();
                                }
                            })
                            unfold.click(function () {
                                var con = $(this).parent().find(".itemlist");
                                con.css("overflow-x", "auto");
                                con.css("overflow", "auto");
                                $(this).hide();
                            })
                            //edit by lrh 临时修改裁判年份为1的BUG，且排序
                            var tempTreeData = [];
                            if (title == "裁判年份") {
                                for (var j in treevalue) {
                                    if (treevalue[j].Key != "1") {
                                        tempTreeData.push(treevalue[j]);
                                    }
                                }
                                tempTreeData.sort(function (a, b) { return parseInt(b.Key) - parseInt(a.Key); })
                                treevalue = tempTreeData;
                            }

                            s.BuildTree(listcontent, title, treevalue, treeparam);

                            treeHead.append(expend);
                            treeHead.append(span);
                            treeKey.append(treeHead);
                            treeKey.append(listcontent);
                            treeKey.append(unfold);
                            $this.append(treeKey);

                            if (list.Child.length <= treeMoreCount && title != "一级案由") {
                                unfold.hide(); //duan 20151010
                            }
                        }
                    }
                }
            });
        },
        BuildTree: function (tree, title, treeData, treeparamval) {
            var s = this;
            var courtZGCount = 0;
            var url = window.location.href;
            url = decodeURI(url);
            var params = new Array();
            params = manageUrl(url);
            for (var i = 0; i < treeData.length; i++) {
                var key = treeData[i].Key;
                var field = treeData[i].Field;
                var value = treeData[i].Value;
                if (key == "null") {
                    //edit by zhs 151105 排除key值有"null"的情况
                    continue;
                }
                if (field == "裁判年份") {
                    //edit by lrh 151105 bug1089问题
                    var today = new Date();
                    if (parseInt(key) <= 1995 || parseInt(today.getFullYear()) < parseInt(key)) {
                        continue;
                    }
                }
                if (field == "审判程序") {
                    //edit by lrh 151109 bug1111问题
                    if (params.length > 0) {
                        if (key == "复核" && params[0].condition.indexOf("案件类型:行政案件") >= 0) {
                            continue;
                        }
                        if (key == "刑罚变更" && params[0].condition.indexOf("案件类型:行政案件") >= 0) {
                            continue;
                        }
                        if (key == "非诉执行审查" && params[0].condition.indexOf("案件类型:刑事案件") >= 0) {
                            continue;
                        }
                        if ((key == "复核" || key == "刑罚变更" || key == "非诉执行审查") && params[0].condition.indexOf("案件类型:民事案件") >= 0) {
                            continue;
                        }
                        if (params[0].condition.indexOf("案件类型:赔偿案件") >= 0) {
                            continue;
                        }
                        if (params[0].condition.indexOf("案件类型:执行案件") >= 0) {
                            continue;
                        }
                    }
                }
                if (field == "文书类型") {//2015年11月25日, PM 02:10:50 wangzhange 修改bug1279
                    if (key == "批复" || key == "答复" || key == "函" || key == "其他") {
                        continue;
                    }
                }
                //对法院中最高法院的特殊处理
                if (field == "法院层级") {
                    if (key == "最高法院") {
                        s.courtZGCount = value;
                    }
                }
                if (field == "法院地域") {
                    if (key == "最高人民法院") {
                        if (s.courtZGCount == 0) {
                            treeData.splice(i, 1);
                        } else {
                            value = s.courtZGCount;
                        }
                    }
                }
                if (treeData.length > 0) {
                    if (treeData[i].id == "") {
                        treeData[i].id = i;
                    }
                    if (treeData[i].parent == "") {
                        treeData[i].parent = "#";
                        treeData[i].state = { 'opened': false };
                    }
                    treeData[i].text = key + "(" + value + ")";
                    treeData[i].icon = false;
                }
            }
            //获取datajson treeData
            var treeObj = tree;
            treeObj.jstree({ 'core': { 'data': treeData} }).bind("select_node.jstree", function (event, data) {
                var nodeKey = data.node.original.Key;
                var nodeField = data.node.original.Field;
                //对法院中最高法院的特殊处理
                if (nodeField == "法院地域" && nodeKey == "最高人民法院") {
                    if (s.courtZGCount > 0) {
                        s.TreeUrlRedirect("法院层级", "最高法院");
                    }
                } else {
                    s.TreeUrlRedirect(nodeField, nodeKey);
                }
            }).bind("open_node.jstree", function (event, data) {
                var nodeKey = data.node.original.Key;
                var nodeField = data.node.original.Field;
                var nodeId = data.node.original.id;
                //案由和法院特殊处理
                var reasonFieldArr = ["一级案由", "二级案由", "三级案由", "四级案由", "五级案由"];
                if ($.inArray(nodeField, reasonFieldArr) > -1) {
                    s.BuildReasonTree(nodeId, nodeField, nodeKey, treeparamval, treeData, treeObj, "open");
                }
                var courtFieldArr = ["法院地域", "最高法院", "中级法院", "基层法院"];
                if ($.inArray(nodeField, courtFieldArr) > -1) {
                    s.BuildCourtTree(nodeId, nodeField, nodeKey, treeparamval, treeData, treeObj, "open");
                }
            }).bind("close_node.jstree", function (event, data) {
                var nodeKey = data.node.original.Key;
                var nodeField = data.node.original.Field;
                var nodeId = data.node.original.id;
                //案由和法院特殊处理
                var reasonFieldArr = ["一级案由", "二级案由", "三级案由", "四级案由", "五级案由"];
                if ($.inArray(nodeField, reasonFieldArr) > -1) {
                    s.BuildReasonTree(nodeId, nodeField, nodeKey, treeparamval, treeData, treeObj, "close");
                }
                var courtFieldArr = ["法院地域", "最高法院", "中级法院", "基层法院"];
                if ($.inArray(nodeField, courtFieldArr) > -1) {
                    s.BuildCourtTree(nodeId, nodeField, nodeKey, treeparamval, treeData, treeObj, "close");
                }
            });
        },
        BuildReasonTree: function (idStr, fieldStr, keyStr, paramStr, childData, treeObj, state) {
            var s = this;
            //防止重复加载
            if (s.resaonTreeId == idStr + state) {
                return false;
            }
            s.resaonTreeId = idStr + state;
            //加载案由树
            if (state == "open") {
                if (paramStr != "") {
                    paramStr += "," + fieldStr + ":" + keyStr
                } else {
                    paramStr = fieldStr + ":" + keyStr
                }
                $.ajax({
                    url: "/List/ReasonTreeContent",
                    type: "POST",
                    async: true,
                    data: { "Param": paramStr, "parval": keyStr },
                    success: function (reasondata) {
                        if (reasondata != "") {
                            var reasonObj = eval(reasondata)[0].Child;
                            if (reasonObj.length > 0) {
                                $.each(reasonObj, function (ri, rv) {
                                    for (var ii = 0; ii < childData.length; ii++) {
                                        if (childData[ii].id == reasonObj[ri].id) {
                                            childData.splice(ii, 1);
                                        }
                                        if (childData[ii].id == idStr) {
                                            childData[ii].state = { 'opened': true };
                                        }
                                    }
                                    reasonObj[ri].text = reasonObj[ri].Key + "(" + reasonObj[ri].Value + ")";
                                    reasonObj[ri].icon = false;
                                    childData.push(reasonObj[ri]);
                                });
                            }
                        }
                        treeObj.data('jstree', false).empty();
                        for (var ii = 0; ii < childData.length; ii++) {
                            if (childData[ii].id == "NULL" + idStr) {
                                childData.splice(ii, 1);
                            }
                        }
                        treeObj.jstree({ 'core': { 'data': childData} });
                    }
                });
            } else {
                treeObj.data('jstree', false).empty();
                for (var ii = 0; ii < childData.length; ii++) {
                    if (childData[ii].id == idStr) {
                        childData[ii].state = { 'opened': false };
                    }
                }
                treeObj.jstree({ 'core': { 'data': childData} });
            }
        },
        BuildCourtTree: function (idStr, fieldStr, keyStr, paramStr, childData, treeObj, state) {
            var s = this;
            //防止重复加载
            if (s.courtTreeId == idStr + state) {
                return false;
            }
            s.courtTreeId = idStr + state;
            //加载法院树
            if (state == "open") {
                if (paramStr != "") {
                    paramStr += "," + fieldStr + ":" + keyStr
                } else {
                    paramStr = fieldStr + ":" + keyStr
                }
                $.ajax({
                    url: "/List/CourtTreeContent",
                    type: "POST",
                    async: true,
                    data: { "Param": paramStr, "parval": keyStr },
                    success: function (courtdata) {
                        if (courtdata != "") {
                            var courtObj = eval(courtdata)[0].Child;
                            if (courtObj.length > 0) {
                                $.each(courtObj, function (ci, cv) {
                                    for (var ii = 0; ii < childData.length; ii++) {
                                        if (childData[ii].id == courtObj[ci].id) {
                                            childData.splice(ii, 1);
                                        }
                                        if (childData[ii].id == idStr) {
                                            childData[ii].state = { 'opened': true };
                                        }
                                    }
                                    courtObj[ci].text = courtObj[ci].Key + "(" + courtObj[ci].Value + ")";
                                    courtObj[ci].icon = false;
                                    childData.push(courtObj[ci]);
                                });
                            }
                        }
                        treeObj.data('jstree', false).empty();
                        for (var ii = 0; ii < childData.length; ii++) {
                            if (childData[ii].id == "NULL" + idStr) {
                                childData.splice(ii, 1);
                            }
                        }
                        treeObj.jstree({ 'core': { 'data': childData} });
                    }
                });
            } else {
                treeObj.data('jstree', false).empty();
                for (var ii = 0; ii < childData.length; ii++) {
                    if (childData[ii].id == idStr) {
                        childData[ii].state = { 'opened': false };
                    }
                }
                treeObj.jstree({ 'core': { 'data': childData} });
            }
        },
        TreeUrlRedirect: function (treeField, treeKey) {
            guidCreate(4, 1, 5, treeField, treeKey);
            //$("#dialog").show();
            var valiguid = $("#txthidGuid").val();
            $.ajax({
                url: "/ValiCode/GetCode", type: "POST", async: true,
                data: { "guid": valiguid },
                success: function (data) {
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

                    Param("treesearch", params, data, valiguid);
                }
            });
            //            var url = window.location.href;
            //            url = decodeURI(url);
            //            var params = new Array();
            //            var parameter = {
            //                type: "searchWord",
            //                value: treeKey,
            //                sign: "",
            //                pid: "",
            //                condition: treeField + ":" + treeKey
            //            };
            //            params.push(parameter);
            //            //处理URL
            //            Param("treesearch", params);
        }

    }
    $.fn.UITree = function (option) {
        var Tree = new TreeLoad(this, option);
        Tree.Init();
        Tree.BuildHtml();
    }
})(jQuery)