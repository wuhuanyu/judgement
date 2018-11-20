var _gsq = _gsq || [];
var GlobalId = "c" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
var toGridsum = (function ($) {
    var toApp = {
        SearchList: function (keyword) {//站内搜索
            _gsq.push(["T", "GWD-002808", "trackSiteSearch", keyword, null, "utf-8", false]);
            var _gsElements = document.getElementsByClassName("dataItem");
            if (_gsElements.length > 0) {
                _gsq.push(["T", "GWD-002808", "bindSearchResults", _gsElements[0]]);
            }
        },
        MainList: function () {//全部页面
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = (location.protocol == 'https:' ? 'https://ssl.' : 'http://static.') + 'gridsumdissector.com/js/Clients/GWD-002808-030F33/gs.js';
            var firstScript = document.getElementsByTagName('script')[0];
            firstScript.parentNode.insertBefore(s, firstScript);
        },
        GetSuggestList: function (suggest, type, content, source, court, remark) {//意见建议
            var orderid = GlobalId;
            _gsq.push(["T", "GWD-002808", "addOrder", orderid, 1]);
            _gsq.push(["T", "GWD-002808", "addProduct", orderid, location.pathname, location.pathname, 1, 1, "Page"]);
            _gsq.push(["T", "GWD-002808", "addProduct", orderid, suggest, suggest, 1, 1, "FormName"]);
            _gsq.push(["T", "GWD-002808", "addProduct", orderid, type, type, 1, 1, "建议类型"]);
            _gsq.push(["T", "GWD-002808", "addProduct", orderid, content, content, 1, 1, "建议内容"]);
            _gsq.push(["T", "GWD-002808", "addProduct", orderid, source, source, 1, 1, "案件来源"]);
            _gsq.push(["T", "GWD-002808", "addProduct", orderid, court, court, 1, 1, "所属法院"]);
            _gsq.push(["T", "GWD-002808", "addProduct", orderid, remark, remark, 1, 1, "备注"]);
            // 更多addProduct
            _gsq.push(["T", "GWD-002808", "trackECom"]);
        },
        GetFullPage: function (type, name, detail) {//详情页
            _gsq.push(["T", "GWD-002808", "trackEvent", type, name, detail]);
        }
    };
    toApp.MainList();
    return {
        SearchList:toApp.SearchList,
        GetSuggestList: toApp.GetSuggestList,
        GetFullPage:toApp.GetFullPage
    };
})(jQuery);
