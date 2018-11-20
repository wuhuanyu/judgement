//网站日志统计
//20151021

//*********config 配置说明************
//Util 开启默认统计功能 默认空
//--Country	访问国家
//--Area 访问省份
//--City	访问地市
//--Region	访问区域
//--IP	    访问IP
//--Source	访问来源
//--StartYear访问开始时间（年）
//--EndYear	访问结束时间（年）
//--StartMonth	访问开始时间（月）
//--EndMonth	访问结束时间（月）
//--StartDay	访问开始时间（日）
//--EndDay		访问结束时间（日）
//--Device	    访问设备
//--PageURL	    访问页面
//--CreateDateTime 记录时间
//Mode 统计模式
//--WebLog  默认
//--DataLog 数据模式
//--KeyWordLog关键词模式
var WebsiteLog = {
    //配置
    Config: {
        Util: "",
        Mode: "WebLog"
    },
    //获取查询关键词条件
    GetParamsFromUrl: function () {
        var url = window.location.href;
        url = decodeURI(url);
        var conditions = url.split('&conditions=');
        var parameter = "";
        for (var i = 1; i < conditions.length; i++) {
            var parsplit = conditions[i].split('+');
            //edit by lrh 为空时报异常
            //var parameter = "";
            if (parsplit.length == 5) {
                parameter = parsplit[1] + "|";
            }
            if (parameter.length > 0) {
                parameter = parameter.substring(0, parameter.length - 1);
            }
        }
        return parameter;
    },
    //获取案件信息
    GetCaseInfo: function () {
        //var caseinfoOject = eval($("#hidCaseInfo").val());
        var caseinfoParm = "";
        if ($("#hidCaseInfo").val() != "") {
            var caseinfoOject = $.parseJSON($("#hidCaseInfo").val());
            if (caseinfoOject.length >= 1) {
                for (var cases in caseinfoOject[0]) {
                    if (WebsiteLog.CaseInfoDic(cases.toString()) != "") {
                        caseinfoParm += "\"" + WebsiteLog.CaseInfoDic(cases.toString()) + "\":\"" + caseinfoOject[0][cases.toString()].toString() + "\",";
                    }
                }
            }
            if (caseinfoParm.length > 0) {
                caseinfoParm = caseinfoParm.substring(0, caseinfoParm.length - 1);
            }
        }
        return caseinfoParm;
    },
    //案件字段转日志字段
    CaseInfoDic: function (dicName) {
        switch (dicName) {
            case "文书ID":
                return "CaseDocId";
                break;
            case "案件名称":
                return "CaseName";
                break;
            case "法院名称":
                return "CaseCourt";
                break;
            case "法院国家":
                return "CaseNation";
                break;
            case "法院省份":
                return "CaseProvince";
                break;
            case "法院地市":
                return "CaseCity";
                break;
            case "法院区县":
                return "CaseCounty";
                break;
            case "法院区域":
                return "CaseArea";
                break;
            case "案件类型":
                return "CaseType";
                break;
            case "审判程序":
                return "CaseTrialLevel";
                break;
            case "文书类型":
                return "CaseFileType";
                break;
            case "案号":
                return "CaseNumber";
                break;
            case "案由":
                return "CaseReason";
                break;
            case "姓名或名称":
                return "CasePerson";
                break;
            case "审判人员":
                return "CaseTrialPerson";
                break;
            case "书记员":
                return "CaseClerk";
                break;
            case "裁判年份":
                return "CaseYear";
                break;
            case "裁判月份":
                return "CaseMonth";
                break;
            case "裁判日份":
                return "CaseDay";
                break;
            case "上传法院":
                return "CaseUploadCourt";
                break;
            case "上传部门":
                return "CaseUploadDept";
                break;
            case "上传人员":
                return "CaseUploadPerson";
                break;
            case "上传日份":
                return "CaseUploadDay";
                break;
            case "上传年份":
                return "CaseUploadYear";
                break;
            case "上传月份":
                return "CaseUploadMonth";
                break;
            case "上传包ID":
                return "CaseUploadCaseDocId";
                break;
            case "补正文书":
                return "CaseFileMend";
                break;
            case "一级法院":
                return "CaseCourtLevel1";
                break;
            case "二级法院":
                return "CaseCourtLevel2";
                break;
            case "三级法院":
                return "CaseCourtLevel3";
                break;
            case "四级法院":
                return "CaseCourtLevel4";
                break;
        }
        return "";
    },
    //初始化
    Init: function () {
        var Parm = "";
        switch (WebsiteLog.Config.Mode) {
            case "DataLog":
                Parm = WebsiteLog.GetCaseInfo().toString();
                break;
            case "KeyWordLog":
                Parm = "\"keyword\":\"" + WebsiteLog.GetParamsFromUrl().toString() + "\"";
                break;
            default:
                Parm = "";
                break;
        }
        $.ajax({
            url: "/Index/WebsiteLog",
            type: "post",
            async: true,
            data: { "util": WebsiteLog.Config.Util, "mode": WebsiteLog.Config.Mode, "parm": Parm},
            cache: false,
            async: false,
            success: function (data) { },
            error: function (xhr) { }
        });
    }
}



