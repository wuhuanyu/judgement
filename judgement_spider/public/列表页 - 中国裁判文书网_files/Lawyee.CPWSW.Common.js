$(function () {
    LoadUserInfo();
    InitMenuShow();
});

//加载用户信息
function LoadUserInfo() {
    if (typeof (userData) == "undefined"){
        $.ajax({
            url: "/Index/UserInfo",
            async: true,
            type: "post",
            success: function(outdata) {
                var data = eval("(" + outdata + ")");
                if (data.status) {
                    $("#loginInfo").html("欢迎您,<a target='_blank' href='/User/UserCenter'>" + data.user.name + "</a>&nbsp;<a href='javascript:LoginOut();'>退出</a>");
                } else {
                    $("#loginInfo").html("<a onclick='SaveUrl()' href=\"/User/RegisterAndLogin?Operate=1\">登录</a> <a href=\"/User/RegisterAndLogin\">注册</a>");
                }
            }
        });
    } else {
        var userDatas = eval("(" + userData + ")");
        if (userDatas.status) {
            $("#loginInfo").html("欢迎您,<a target='_blank' href='/User/UserCenter'>" + data.user.name + "</a>&nbsp;<a href='javascript:LoginOut();'>退出</a>");
        } else {
            $("#loginInfo").html("<a onclick='SaveUrl()' href=\"/User/RegisterAndLogin?Operate=1\">登录</a> <a href=\"/User/RegisterAndLogin\">注册</a>");
        }
    }
}

function SaveUrl() {
    var url = window.location.pathname + window.location.search;
    $.post("/User/SaveUrl", { "url": url }, function () { });
}

//初始化菜单显示(相应页面对应的菜单选项选中)
function InitMenuShow() {
    var url = window.location.href;
    url = decodeURI(url);
    var conditions = url.split('&conditions=');
    for (var i = 1; i < conditions.length; i++) {
        var parsplit = conditions[i].split('+');
        if (parsplit.length == 5) {
            var condition = parsplit[4];
            var menuVal = condition.split(':')[1];
            var $menus = $("a[type='menu']");
            $menus.each(function () {
                if ($.trim($(this).text()) == menuVal) {
                    $(this).attr("class", "menuclick");
                }
            });
        }
    }
}

//弹出建议框
function ShowSuggest() {
    $.ajax({
        url: "/Content/CheckLogin",
        type: "POST",
        async: false,
        data: {},
        success: function (res) {
            if (res == "0") {
                window.location = '/User/RegisterAndLogin?Operate=1';
            } else {
                var iWidth = 900; //弹出窗口的宽度;
                var iHeight = 600; //弹出窗口的高度;
                var iTop = (window.screen.availHeight - 30 - iHeight) / 2; //获得窗口的垂直位置;
                var iLeft = (window.screen.availWidth - 10 - iWidth) / 2; //获得窗口的水平位置;
                window.open("/User/AddSuggest", "意见建议 - 中国裁判文书网", "height=" + iHeight + ", width=" + iWidth + ", top=" + iTop + ", left=" + iLeft);
            }
        }
    });
}

//提交建议
function SubmitSuggest() {
    var e = $("#SubmitSuggest");
    var suggestType = $("input[type='radio']:checked").attr("value");
    var suggestContent = $("#suggestcontent").val();
    var caseSource = $("#casesource").val();
    var court = $("#court").val();
    var remark = $("#remark").val();
    if (suggestContent == "") { alert("请填写建议内容!"); } else {
        if (suggestContent != "") {
            e.attr("disabled", true);
            $.post("/Index/SubmitSuggest", { "suggestType": suggestType, "suggestContent": suggestContent, "caseSource": caseSource, "court": court, "remark": remark }, function (data) {
                if (data == 1) {
                    alert("提交成功!");
                    ResetSuggest();
                } else {
                    alert("提交失败，请联系网站管理员!");
                }
                e.attr("disabled", false);
            });
        } else {
            alert("请填写建议后提交!");
        }
    }
}
//建议重置
function ResetSuggest() {
    $("#suggestcontent").val("");
    $("#casesource").val("");
    $("#court").val("");
    $("#remark").val("");
    $("input[type='radio']").eq(0).attr("checked","checked");
}

//退出登陆
function LoginOut() {
    $.post("/User/LoginOut", function (data) {
        if (data == "1") {
            //判断是否退出登陆后需要跳转页面(用户中心退出后需要跳转到首页)
            var hidIsReturnIndex = $("#IsReturnIndex");
            if (hidIsReturnIndex != undefined && hidIsReturnIndex.val() == "true") {
                window.location.href = "/Index";
            }
            LoadUserInfo();
        } else {
            alert(data);
        }
    });
}

//建议重置
function LongNum2ShortNum(numStr) {
    if (numStr.length > 0) {
        if ( numStr.length <= 4) {
            return numStr;
        }
        if (numStr.length = 5 && numStr.length<6) {
            return numStr.substring(0, numStr.length - 4) + "." + numStr.substring(1, numStr.length - 3) + "万";
        }
        if (numStr.length = 7 && numStr.length < 8) {
            return numStr.substring(0, numStr.length - 6) + "百万";
        }
        if (numStr.length = 8 && numStr.length < 9) {
            return numStr.substring(0, numStr.length - 7) + "千万";
        }
        if (numStr.length = 10 && numStr.length < 11) {
            return numStr.substring(0, numStr.length - 8) + "亿";
        }
        if (numStr.length = 12 && numStr.length < 13) {
            return numStr.substring(0, numStr.length - 10) + "百亿";
        }
        if (numStr.length = 13 && numStr.length < 14) {
            return numStr.substring(0, numStr.length - 11) + "千亿";
        }
    } else {
        return "";
    }
}

function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}