/*by fukai*/
var IMAGESPATH =''; //图片路径配置，如在有iframe情况下使用，此路径为最顶层窗口页面的相对路径	
var HideScrollbar=true;//弹出Dialog时是否隐藏滚动条
/*************************一些公用方法和属性****************************/
var agt =   window.navigator.userAgent;
var isIE = agt.toLowerCase().indexOf("msie") != -1;
var isGecko = agt.toLowerCase().indexOf("gecko") != -1;
var ieVer = isIE ? parseInt(agt.split(";")[1].replace(/(^\s*)|(\s*$)/g,"").split(" ")[1]) : 0;
var isIE8 = !!window.XDomainRequest && !!document.documentMode;
var isIE7 = ieVer==7 && !isIE8;
var ielt7 = isIE && ieVer<7;
var isQuirks = document.compatMode == "BackCompat";
var maxIndex=900;
var instance;
var dialogTaskTop;
var $id = function (id) {
    return typeof id == "string" ? document.getElementById(id) : id;
};
//var getDom = $id;
function stopEvent(evt){//阻止一切事件执行,包括浏览器默认的事件
	evt = window.event||evt;
	if(!evt){
		return;
	}
	if(isGecko){
		evt.preventDefault();
		evt.stopPropagation();
	}
	evt.cancelBubble = true
	evt.returnValue = false;
}
function removeWinArray(winArray,s, dust){//如果dust为ture，则返回被删除的元素
	if (dust) {
        var dustArr = [];
        for (var i = 0; i < winArray.length; i++) {
            if (s == winArray[i]) {
                dustArr.push(winArray.splice(i, 1)[0]);
            }
        }
        return dustArr;
    }
    for (var i = 0; i < winArray.length; i++) {
        if (s == winArray[i]) {
            winArray.splice(i, 1);
        }
    }
    return winArray;
}
/*
Array.prototype.remove = function (s, dust) { //如果dust为ture，则返回被删除的元素
    if (dust) {
        var dustArr = [];
        for (var i = 0; i < this.length; i++) {
            if (s == this[i]) {
                dustArr.push(this.splice(i, 1)[0]);
            }
        }
        return dustArr;
    }
    for (var i = 0; i < this.length; i++) {
        if (s == this[i]) {
            this.splice(i, 1);
        }
    }
    return this;
}
*/
if(!isIE&&HTMLElement){
	if(!HTMLElement.prototype.attachEvent){
		window.attachEvent = document.attachEvent = HTMLElement.prototype.attachEvent = function(evtName,func){
			evtName = evtName.substring(2);
			this.addEventListener(evtName,func,false);
		}
		window.detachEvent = document.detachEvent = HTMLElement.prototype.detachEvent = function(evtName,func){
			evtName = evtName.substring(2);
			this.removeEventListener(evtName,func,false);
		}
	}
}else if(isIE&&ieVer<8){
	try{ document.execCommand('BackgroundImageCache',false,true); }catch(e){}
}
var $topWindow = function () {
    var parentWin = window;
   // while (parentWin != parentWin.parent) {
       // if (parentWin.parent.document.getElementsByTagName("FRAMESET").length > 0) break;
       // parentWin = parentWin.parent;
   // }
    return parentWin;
};
var $bodyDimensions = function (win) {
    win = win || window;
    var doc = win.document;
    var cw = doc.compatMode == "BackCompat" ? doc.body.clientWidth : doc.documentElement.clientWidth;
    var ch = doc.compatMode == "BackCompat" ? doc.body.clientHeight : doc.documentElement.clientHeight;
    var sl = Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft);
    var st = Math.max(doc.documentElement.scrollTop, doc.body.scrollTop);
    var sw = Math.max(doc.documentElement.scrollWidth, doc.body.scrollWidth);
    var sh = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
	if(sh<ch)
		sh=ch; //IE下在页面内容很少时存在scrollHeight<clientHeight的情况
    return {
        "clientWidth": cw,
        "clientHeight": ch,
        "scrollLeft": sl,
        "scrollTop": st,
        "scrollWidth": sw,
        "scrollHeight": sh
    }
}

var fadeEffect = function(element, start, end, speed, callback){//透明度渐变：start:开始透明度 0-100；end:结束透明度 0-100；speed:速度1-100
	if(!element.effect)
		element.effect = {fade:0, move:0, size:0};
	clearInterval(element.effect.fade);
	var speed=speed||20;
	element.effect.fade = setInterval(function(){
		start = start < end ? Math.min(start + speed, end) : Math.max(start - speed, end);
		element.style.opacity =  start / 100;
		element.style.filter = "alpha(opacity=" + start + ")";
		if(start == end){
			clearInterval(element.effect.fade);
			if(callback)
				callback.call(element);
		}
	}, 20);
};

/*************************弹出框类实现****************************/
var topWin = $topWindow();
var topDoc = topWin.document;
var Dialog = function () {
    /****以下属性以大写开始，可以在调用show()方法前设置值****/
    this.ID = null;
    this.Width = 550;
    this.Height = 380;
    this.URL = null;
	this.OnLoad=null;
    this.InnerHtml = ""
    this.InvokeElementId = ""
    this.Top = "50%";
    this.Left = "50%";
    this.Title = "　";
    this.OkButtonText =uncompile(quiLanguage.dialog.okButtonText);
    this.CancelButtonText =uncompile(quiLanguage.dialog.cancelButtonText);
	this.maxButtonTitle=uncompile(quiLanguage.dialog.maxButtonTitle);
	this.minButtonTitle=uncompile(quiLanguage.dialog.minButtonTitle);
	this.closeButtonTitle=uncompile(quiLanguage.dialog.closeButtonTitle);
	this.decreaseButtonTitle=uncompile(quiLanguage.dialog.decreaseButtonTitle);
	this.autoCloseMessage=uncompile(quiLanguage.dialog.autoCloseMessage);
	this.errorMessage=uncompile(quiLanguage.dialog.errorMessage);
	this.errorMessage2=uncompile(quiLanguage.dialog.errorMessage2);
	this.alertTitleMessage=uncompile(quiLanguage.dialog.alertTitleMessage);
	this.confirmTitleMessage=uncompile(quiLanguage.dialog.confirmTitleMessage);
    this.OKEvent = null; //点击确定后调用的方法
    this.CancelEvent = null; //点击取消及关闭后调用的方法
    this.MaxEvent = null; 
    this.DecreaseEvent = null; 
    this.MinEvent = null; 
    this.ShowButtonRow = false;
    this.ShowOkButton = true;
    this.ShowCancelButton = true;
    this.MessageIcon = "window.gif";
    this.MessageTitle = "";
    this.Message = "";
    this.ShowMessageRow = false;
    this.Modal = true;
    this.Drag = true;
    this.AutoClose = null;
    this.ShowCloseButton = true;
    this.ShowMaxButton = false;
    this.ShowMinButton = false;
	this.Animator = !ielt7;
	this.MsgForESC = "";
	this.InnerFrameName = null;
	this.Style="normal";
	this.ButtonAlign="right";
	this.DecreaseResetPosition=false;
	this.ResizeResetPosition=true;
	this.Alpha=40;
	this.Bgcolor="#333333";
	this.CloseHideScroller=false;
	this.ShowHideScroller=true;
	this.AllowChangeIndex=null;
	this.MinToTask=false;
	this.IconClass="dialog_icon_default";
	this.IconSrc="";
	this.ParamsObj=null;
	this.showShadow=true;
    /****以下属性以小写开始，不要自行改变****/
    this.dialogDiv = null;
	this.bgDiv=null;
    this.openerWindow = null;
    this.openerDialog = null;
    this.innerFrame = null;
    this.innerWin = null;
    this.innerDoc = null;
    this.zindex = 900;
    this.cancelButton = null;
    this.okButton = null;
    this.maxButton = null;
    this.minButton = null;
    this.unauthorized = false;
	this.maxFlag=false;
	this.minFlag=false;
	this.defaultFontSize=12;
	this.defaultFontFamily="宋体";
	this.dialogWidthFix=26;
	if($("#skin").attr("splitMode")==true||$("#skin").attr("splitMode")=="true"){
	}
	else{
		var $parentThemeDom=$(window.top.document.getElementById("theme"));
		if($parentThemeDom.attr("defaultFontSize")!=null){
			this.defaultFontSize=Number($parentThemeDom.attr("defaultFontSize"));
		}
		if($parentThemeDom.attr("defaultFontFamily")!=null){
			this.defaultFontFamily=$parentThemeDom.attr("defaultFontFamily");
		}
		if($parentThemeDom.attr("dialogWidthFix")!=null){
			this.dialogWidthFix=Number($parentThemeDom.attr("dialogWidthFix"));
		}
	}

    if (arguments.length > 0 && typeof(arguments[0]) == "string") { //兼容旧写法
        this.ID = arguments[0];
    } else if (arguments.length > 0 && typeof(arguments[0]) == "object") {
        Dialog.setOptions(this, arguments[0])
    }
	if(!this.ID)
        this.ID = topWin.Dialog._dialogArray.length + "fk";

	instance=this;
};
Dialog._dialogArray = [];
Dialog._childDialogArray = [];
Dialog._taskArray = [];
Dialog.bgDiv = null;
Dialog.setOptions = function (obj, optionsObj) {
    if (!optionsObj) return;
    for (var optionName in optionsObj) {
        obj[optionName] = optionsObj[optionName];
    }
};
Dialog.attachBehaviors = function () {
	document.attachEvent("onkeydown", Dialog.onKeyDown);
	window.attachEvent('onresize',function(){
				Dialog.setBgDivSize();
				for (var i = 0, len = topWin.Dialog._dialogArray.length; i < len; i++) {
					var instance=topWin.Dialog._dialogArray[i];
					if(instance.ResizeResetPosition){
						 instance.setPosition();
					}
			    }
		}
	 );
	if(!HideScrollbar&&ielt7)
		window.attachEvent("onscroll", Dialog.resetPosition);
};
Dialog.prototype.attachBehaviors = function () {
	var self = this;
    if (this.Drag && topWin.Drag){//注册拖拽方法
		var dragHandle=topWin.$id("_Draghandle_" + this.ID),dragBody=topWin.$id("_DialogDiv_" + this.ID);
		topWin.Drag.init(dragHandle, dragBody);
		dragBody.onDragStart = function (left,top,mouseX,mouseY) {
			if (!isIE && self.URL) { //非ie浏览器下在拖拽时用一个层遮住iframe，以免光标移入iframe失去拖拽响应
				topWin.$id("_Covering_" + self.ID).style.display = ""
			}
		}
		dragBody.onDragEnd = function(left,top,mouseX,mouseY){
			if (!isIE && self.URL) {
				topWin.$id("_Covering_" + self.ID).style.display = "none"
			}
			var bd = $bodyDimensions(topWin);
			if(left<0)
				this.style.left='0px';
			if(left+this.clientWidth>bd.clientWidth)
				this.style.left=bd.clientWidth-this.clientWidth+'px';
			if(self.fixedPosition){
				if(top<0)
					this.style.top='0px';
				if(top+33>bd.clientHeight)
					this.style.top=bd.clientHeight-33+'px';
			}else{
				if(top<bd.scrollTop)
					this.style.top=bd.scrollTop+'px';
				if(top+33>bd.scrollTop+bd.clientHeight)
					this.style.top=bd.scrollTop+bd.clientHeight-33+'px';
			}
		}
	}
};
Dialog.prototype.displacePath = function () {
    if (this.URL.substr(0, 7) == "http://" || this.URL.substr(0, 1) == "/" || this.URL.substr(0, 11) == "javascript:") {
        return this.URL;
    } else {
        var thisPath = this.URL;
        var locationPath = window.location.href;
        locationPath = locationPath.substring(0, locationPath.lastIndexOf('/'));
        while (thisPath.indexOf('../') >= 0) {
            thisPath = thisPath.substring(3);
            locationPath = locationPath.substring(0, locationPath.lastIndexOf('/'));
        }
        return locationPath + '/' + thisPath;
    }
};
Dialog.prototype.setPosition = function () {
    var bd = $bodyDimensions(topWin);
    var thisTop = this.Top,
        thisLeft = this.Left,
		thisdialogDiv=this.getDialogDiv();
    if (typeof this.Top == "string" && this.Top.indexOf("%") != -1) {
        var percentT = parseFloat(this.Top) * 0.01;
			thisTop =this.fixedPosition
				? bd.clientHeight * percentT - thisdialogDiv.scrollHeight * percentT
				: bd.clientHeight * percentT - thisdialogDiv.scrollHeight * percentT + bd.scrollTop;
    }
    if (typeof this.Left == "string" && this.Left.indexOf("%") != -1) {
        var percentL = parseFloat(this.Left) * 0.01;
        thisLeft = ielt7?bd.clientWidth * percentL - thisdialogDiv.scrollWidth * percentL + bd.scrollLeft:bd.clientWidth * percentL - thisdialogDiv.scrollWidth * percentL;
    }
	if(thisdialogDiv){
		 thisdialogDiv.style.top = Math.round(thisTop) + "px";
    	thisdialogDiv.style.left = Math.round(thisLeft) + "px";
	}
   
};
Dialog.setBgDivSize = function () {
    var bd = $bodyDimensions(topWin);
	if(Dialog.bgDiv){
			if(ielt7){
				Dialog.bgDiv.style.height = bd.clientHeight + "px";
				Dialog.bgDiv.style.top=bd.scrollTop + "px";
				Dialog.bgDiv.childNodes[0].style.display = "none";//让div重渲染,修正IE6下尺寸bug
				Dialog.bgDiv.childNodes[0].style.display = "";
			}else{
				Dialog.bgDiv.style.height = bd.scrollHeight + "px";
			}
		}
};
Dialog.resetPosition = function () {
    Dialog.setBgDivSize();
    for (var i = 0, len = topWin.Dialog._dialogArray.length; i < len; i++) {
			 topWin.Dialog._dialogArray[i].setPosition();
    }
};
Dialog.prototype.create = function () {
    var bd = $bodyDimensions(topWin);
    if (typeof(this.OKEvent)== "function") this.ShowButtonRow = true;
    if (!this.Width) this.Width = Math.round(bd.clientWidth * 4 / 10);
    if (!this.Height) this.Height = Math.round(this.Width / 2);
    if (this.MessageTitle || this.Message) this.ShowMessageRow = true;
    var DialogDivWidth = this.Width+ this.dialogWidthFix;
    var DialogDivHeight = this.Height + 33 + 13 + (this.ShowButtonRow ? 40 : 0) + (this.ShowMessageRow ? 50 : 0);

    if (DialogDivWidth > bd.clientWidth) this.Width = Math.round(bd.clientWidth - 26);
    if (DialogDivHeight > bd.clientHeight) this.Height = Math.round(bd.clientHeight - 46 - (this.ShowButtonRow ? 40 : 0) - (this.ShowMessageRow ? 50 : 0));
    var html="";
	if(this.Style=="normal"){
		html = '\
  <table id="_DialogTable_{thisID}" width="' + (this.Width + this.dialogWidthFix) + '" cellspacing="0" cellpadding="0" border="0" style="font-size:' + (this.defaultFontSize) + 'px; font-family:' + (this.defaultFontFamily) + '; line-height:1.4;border-collapse: collapse;">\
    <tr id="_Draghandle_{thisID}" onselectstart="return false;" style="-moz-user-select: -moz-none; ' + (this.Drag ? "cursor: move;" : "") + '">\
      <td class="dialog_lt dialog_borderWidth"><div class="dialog_borderWidth"></div></td>\
      <td class="dialog_ct" ><div class="dialog_title"><span id="_Title_{thisID}" class="'+(this.IconClass!="" ? this.IconClass : "")+'" style="float:left;'+(this.IconSrc!="" ? "background-repeat: no-repeat;background-position: 0 40%;padding-left:18px;display:inline-block;background-image:url("+this.IconSrc +")" : "")+'">' + this.Title + '</span><input type="button" class="dialog_trans_icon"/></div>\
        <div id="_ButtonClose_{thisID}" onclick="fixProgress();Dialog.getInstance(\'{thisID}\').cancelButton.onclick.apply(Dialog.getInstance(\'{thisID}\').cancelButton,[]);" title="' + this.closeButtonTitle  + '" class="dialog_closebtn" onmouseout="this.className=\'dialog_closebtn\'" onmouseover="this.className=\'dialog_closebtn_over\'" style=" '  + (this.ShowCloseButton ? "" : "display:none;") + '"></div><div id="_ButtonMax_{thisID}" onclick="Dialog.getInstance(\'{thisID}\').max()" title="' + this.maxButtonTitle  + '" class="dialog_maxbtn"  style="' + (this.ShowMaxButton ? "" : "display:none;") + '"></div><div id="_ButtonMin_{thisID}" onclick="Dialog.getInstance(\'{thisID}\').minHandler()" title="' + this.minButtonTitle  + '" class="dialog_minbtn"  style="' + (this.ShowMinButton ? "" : "display:none;") + '"></div></td>\
      <td class="dialog_rt dialog_borderWidth"><div class="dialog_borderWidth"><a id="_forTab_{thisID}" href="#;"></a></div></td>\
    </tr>\
    <tr valign="top">\
      <td class="dialog_mlm dialog_borderWidth"></td>\
      <td align="center"><table width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff">\
          <tr id="_MessageRow_{thisID}" style="' + (this.ShowMessageRow ? "" : "display:none") + '">\
            <td valign="top" height="50"><table width="100%" cellspacing="0" cellpadding="0" border="0" class="dialog_bg" id="_MessageTable_{thisID}">\
                <tr>\
                  <td width="50" height="50" align="center"><input type="button"  class="dialog_messageIcon"  id="_MessageIcon_{thisID}"/></td>\
                  <td align="left" style="line-height: 16px;"><div id="_MessageTitle_{thisID}" style="font-weight:bold">' + this.MessageTitle + '</div>\
                    <div id="_Message_{thisID}">' + this.Message + '</div></td>\
                </tr>\
              </table></td>\
          </tr>\
          <tr>\
            <td valign="top"><div id="_Container_{thisID}" style="text-align:left;position: relative; width: ' + this.Width + 'px; height: ' + this.Height + 'px;">\
                <div  style="position: absolute; height: 100%; width: 100%; display: none; background-color:#fff; opacity: 0.5;" id="_Covering_{thisID}">&nbsp;</div>\
	' + (function (obj) {
        if (obj.InnerHtml) return obj.InnerHtml;
        if (obj.URL) return '<iframe width="100%" height="100%" frameborder="0" style="background-color:#ffffff;border:none 0;" id="_DialogFrame_' + obj.ID + '" ' + (obj.InnerFrameName?'name="'+obj.InnerFrameName+'"':'')+' src="' + obj.displacePath() + '"></iframe>';
        return "";
    })(this) + '\
              </div></td>\
          </tr>\
          <tr id="_ButtonRow_{thisID}" style="' + (this.ShowButtonRow ? "" : "display:none") + '">\
            <td height="36"><div id="_DialogButtons_{thisID}" style="text-align:' + this.ButtonAlign + '; border-top: 1px solid #DADEE5; padding: 8px 20px;background-color:#f6f6f6;">\
                <input type="button" style="' + (this.ShowOkButton ? "" : "display:none") + '"  value="' + this.OkButtonText + '" id="_ButtonOK_{thisID}"/>\
                <input type="button" style="' + (this.ShowCancelButton ? "" : "display:none") + '"  value="' + this.CancelButtonText + '" onclick="Dialog.getInstance(\'{thisID}\').close();" id="_ButtonCancel_{thisID}"/>\
              </div></td>\
          </tr>\
        </table></td>\
      <td class="dialog_mrm dialog_borderWidth"></td>\
    </tr>\
    <tr>\
      <td class="dialog_lb dialog_borderWidth"></td>\
      <td class="dialog_cb"></td>\
      <td class="dialog_rb dialog_borderWidth"><a onfocus=\'$id("_forTab_{thisID}").focus();\' href="#;"></a></td>\
    </tr>\
  </table>\
</div>\
';
	}
	else if(this.Style=="simple"){
		html ='\
  <table id="_DialogTable_{thisID}" width="' + (this.Width + this.dialogWidthFix) + '" cellspacing="0" cellpadding="0" border="0" style="font-size:' + (this.defaultFontSize) + 'px;font-family:' + (this.defaultFontFamily) + '; line-height:1.4;border-collapse: collapse;">\
    <tr id="_Draghandle_{thisID}" onselectstart="return false;" style="-moz-user-select: -moz-none; ' + (this.Drag ? "cursor: move;" : "") + '">\
      <td ><div class="dialog_sample_top"><div style="padding: 9px 0 0 4px; float: left; "><span id="_Title_{thisID}">' + this.Title + '</span></div>\
        <div id="_ButtonClose_{thisID}" onclick="fixProgress();Dialog.getInstance(\'{thisID}\').cancelButton.onclick.apply(Dialog.getInstance(\'{thisID}\').cancelButton,[]);" class="dialog__simple_closebtn" style=" ' + (ielt7 ? "margin-top: 3px;" : "") + (this.ShowCloseButton ? "" : "display:none;") + '"></div></div></td>\
    </tr>\
    <tr valign="top">\
      <td align="center"><div class="dialog_sample_middle"><table width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff">\
          <tr id="_MessageRow_{thisID}" style="' + (this.ShowMessageRow ? "" : "display:none") + '">\
            <td valign="top" height="50"><table width="100%" cellspacing="0" cellpadding="0" border="0" class="dialog_bg" id="_MessageTable_{thisID}">\
                <tr>\
                  <td width="50" height="50" align="center"><input type="button"  class="dialog_messageIcon"  id="_MessageIcon_{thisID}"/></td>\
                  <td align="left" style="line-height: 16px;"><div id="_MessageTitle_{thisID}" style="font-weight:bold">' + this.MessageTitle + '</div>\
                    <div id="_Message_{thisID}">' + this.Message + '</div></td>\
                </tr>\
              </table></td>\
          </tr>\
          <tr>\
            <td valign="top"><div id="_Container_{thisID}" style="text-align:left;position: relative; width: ' + this.Width + 'px; height: ' + this.Height + 'px;">\
                <div  style="position: absolute; height: 100%; width: 100%; display: none; background-color:#fff; opacity: 0.5;" id="_Covering_{thisID}">&nbsp;</div>\
	' + (function (obj) {
        if (obj.InnerHtml) return obj.InnerHtml;
        if (obj.URL) return '<iframe width="100%" height="100%" frameborder="0" style="background-color:#ffffff;border:none 0;" id="_DialogFrame_' + obj.ID + '" ' + (obj.InnerFrameName?'name="'+obj.InnerFrameName+'"':'')+' src="' + obj.displacePath() + '"></iframe>';
        return "";
    })(this) + '\
              </div></td>\
          </tr>\
          <tr id="_ButtonRow_{thisID}" style="' + (this.ShowButtonRow ? "" : "display:none") + '">\
            <td height="36"><div id="_DialogButtons_{thisID}" style="border-top: 1px solid #DADEE5; padding: 8px 20px; text-align: right; background-color:#f6f6f6;">\
                <input type="button" style="' + (this.ShowOkButton ? "" : "display:none") + '"  value="' + this.OkButtonText + '" id="_ButtonOK_{thisID}"/>\
                <input type="button" style="' + (this.ShowCancelButton ? "" : "display:none") + '"  value="' + this.CancelButtonText + '" onclick="Dialog.getInstance(\'{thisID}\').close();" id="_ButtonCancel_{thisID}"/>\
              </div></td>\
          </tr>\
        </table></div></td>\
    </tr>\
  </table>\
</div>\
';
	}
	else if(this.Style=="simpleTip"){
		html ='\
  <table id="_DialogTable_{thisID}" width="' + (this.Width + this.dialogWidthFix) + '" cellspacing="0" cellpadding="0" border="0" style="font-size:' + (this.defaultFontSize) + 'px; font-family:' + (this.defaultFontFamily) + ';line-height:1.4;border-collapse: collapse;">\
    <tr id="_Draghandle_{thisID}" onselectstart="return false;" style="-moz-user-select: -moz-none; ' + (this.Drag ? "cursor: move;" : "") + '">\
      <td ><div class="dialog_sample_top"><div style="padding: 9px 0 0 4px; float: left; "><span id="_Title_{thisID}">' + this.Title + '</span></div>\
        <div id="_ButtonClose_{thisID}" onclick="fixProgress();Dialog.getInstance(\'{thisID}\').cancelButton.onclick.apply(Dialog.getInstance(\'{thisID}\').cancelButton,[]);" class="dialog__simple_closebtn" style=" ' + (ielt7 ? "margin-top: 3px;" : "") + (this.ShowCloseButton ? "" : "display:none;") + '"></div></div></td>\
    </tr>\
    <tr valign="top">\
      <td align="center"><div class="dialog_tip_middle"><table width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff">\
          <tr id="_MessageRow_{thisID}" style="' + (this.ShowMessageRow ? "" : "display:none") + '">\
            <td valign="top" height="50"><table width="100%" cellspacing="0" cellpadding="0" border="0" class="dialog_bg" id="_MessageTable_{thisID}">\
                <tr>\
                  <td width="50" height="50" align="center"><input type="button"  class="dialog_messageIcon"  id="_MessageIcon_{thisID}"/></td>\
                  <td align="left" style="line-height: 16px;"><div id="_MessageTitle_{thisID}" style="font-weight:bold">' + this.MessageTitle + '</div>\
                    <div id="_Message_{thisID}">' + this.Message + '</div></td>\
                </tr>\
              </table></td>\
          </tr>\
          <tr>\
            <td valign="top"><div id="_Container_{thisID}" style="text-align:left;position: relative; width: ' + this.Width + 'px; height: ' + this.Height + 'px;">\
                <div  style="position: absolute; height: 100%; width: 100%; display: none; background-color:#fff; opacity: 0.5;" id="_Covering_{thisID}">&nbsp;</div>\
	' + (function (obj) {
        if (obj.InnerHtml) return obj.InnerHtml;
        if (obj.URL) return '<iframe width="100%" height="100%" frameborder="0" style="background-color:#ffffff;border:none 0;" id="_DialogFrame_' + obj.ID + '" ' + (obj.InnerFrameName?'name="'+obj.InnerFrameName+'"':'')+' src="' + obj.displacePath() + '"></iframe>';
        return "";
    })(this) + '\
              </div></td>\
          </tr>\
          <tr id="_ButtonRow_{thisID}" style="' + (this.ShowButtonRow ? "" : "display:none") + '">\
            <td height="36"><div id="_DialogButtons_{thisID}" style="border-top: 1px solid #DADEE5; padding: 8px 20px; text-align: right; background-color:#f6f6f6;">\
                <input type="button" style="' + (this.ShowOkButton ? "" : "display:none") + '"  value="' + this.OkButtonText + '" id="_ButtonOK_{thisID}"/>\
                <input type="button" style="' + (this.ShowCancelButton ? "" : "display:none") + '"  value="' + this.CancelButtonText + '" onclick="Dialog.getInstance(\'{thisID}\').close();" id="_ButtonCancel_{thisID}"/>\
              </div></td>\
          </tr>\
        </table></div></td>\
    </tr>\
    <tr>\
      <td><div class="dialog_tip_bottom"><div class="dialog_tip_bottomArr"></div></div></td>\
    </tr>\
  </table>\
</div>\
';
	}
	else if(this.Style=="shadowTip"){
		var heightValue=this.Height+95;
		html ='\
  <table><tr><td><div class="dialog_shadow_content"><table id="_DialogTable_{thisID}" width="' + (this.Width ) + '" cellspacing="0" cellpadding="0" border="0" style="font-size:' + (this.defaultFontSize) + 'px;font-family:' + (this.defaultFontFamily) + '; line-height:1.4;border-collapse: collapse;">\
    <tr id="_Draghandle_{thisID}" onselectstart="return false;" style="-moz-user-select: -moz-none; ' + (this.Drag ? "cursor: move;" : "") + '">\
      <td><div class="dialog_shadow_content_top"><div style="padding: 9px 0 0 4px; float: left; "><span id="_Title_{thisID}">' + this.Title + '</span></div>\
        <div id="_ButtonClose_{thisID}" onclick="fixProgress();Dialog.getInstance(\'{thisID}\').cancelButton.onclick.apply(Dialog.getInstance(\'{thisID}\').cancelButton,[]);" class="dialog__simple_closebtn" style=" ' + (ielt7 ? "margin-top: 3px;" : "") + (this.ShowCloseButton ? "" : "display:none;") + '"></div></div></td>\
    </tr>\
    <tr valign="top">\
      <td align="center"><table width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff">\
          <tr id="_MessageRow_{thisID}" style="' + (this.ShowMessageRow ? "" : "display:none") + '">\
            <td valign="top" height="50"><table width="100%" cellspacing="0" cellpadding="0" border="0" class="dialog_bg" id="_MessageTable_{thisID}">\
                <tr>\
                  <td width="50" height="50" align="center"><input type="button"  class="dialog_messageIcon"  id="_MessageIcon_{thisID}"/></td>\
                  <td align="left" style="line-height: 16px;"><div id="_MessageTitle_{thisID}" style="font-weight:bold">' + this.MessageTitle + '</div>\
                    <div id="_Message_{thisID}">' + this.Message + '</div></td>\
                </tr>\
              </table></td>\
          </tr>\
          <tr>\
            <td valign="top"><div id="_Container_{thisID}" style="text-align:left;position: relative; width: ' +( this.Width)+ 'px; height: ' + this.Height + 'px;">\
                <div  style="position: absolute; height: 100%; width: 100%; display: none; background-color:#fff; opacity: 0.5;" id="_Covering_{thisID}">&nbsp;</div>\
	' + (function (obj) {
        if (obj.InnerHtml) return obj.InnerHtml;
        if (obj.URL) return '<iframe width="100%" height="100%" frameborder="0" style="background-color:#ffffff;border:none 0;" id="_DialogFrame_' + obj.ID + '" ' + (obj.InnerFrameName?'name="'+obj.InnerFrameName+'"':'')+' src="' + obj.displacePath() + '"></iframe>';
        return "";
    })(this) + '\
              </div></td>\
          </tr>\
          <tr id="_ButtonRow_{thisID}" style="' + (this.ShowButtonRow ? "" : "display:none") + '">\
            <td height="36"><div id="_DialogButtons_{thisID}" style="border-top: 1px solid #DADEE5; padding: 8px 20px; text-align: right; background-color:#f6f6f6;">\
                <input type="button" style="' + (this.ShowOkButton ? "" : "display:none") + '"  value="' + this.OkButtonText + '" id="_ButtonOK_{thisID}"/>\
                <input type="button" style="' + (this.ShowCancelButton ? "" : "display:none") + '"  value="' + this.CancelButtonText + '" onclick="Dialog.getInstance(\'{thisID}\').close();" id="_ButtonCancel_{thisID}"/>\
              </div></td>\
          </tr>\
        </table></td>\
    </tr>\
  </table>\
  </div><div><table cellpadding="0" cellspacing="0" width="' + (this.Width + 120) + '"  height="' + heightValue + '"><tr><td class="dialog_shadow_lt">&nbsp;</td><td class="dialog_shadow_ct">&nbsp;</td><td class="dialog_shadow_rt">&nbsp;</td></tr>\
  <tr><td class="dialog_shadow_lm" height="' + (this.Height + 95-39-130) + '">&nbsp;</td><td class="dialog_shadow_cm">&nbsp;</td><td class="dialog_shadow_rm">&nbsp;</td></tr>\
  <tr><td class="dialog_shadow_lb">&nbsp;</td><td class="dialog_shadow_cb">&nbsp;</td><td class="dialog_shadow_rb">&nbsp;</td></tr></table>	</div></td></tr></table>\
</div>\
';
	}
	else if(this.Style=="custom"){
		html ='\
  <table id="_DialogTable_{thisID}" width="' + (this.Width + this.dialogWidthFix) + '" cellspacing="0" cellpadding="0" border="0" style="font-size:' + (this.defaultFontSize) + 'px; font-family:' + (this.defaultFontFamily) + ';line-height:1.4;border-collapse: collapse;">\
    <tr id="_Draghandle_{thisID}" style="display:none;" onselectstart="return false;" style="-moz-user-select: -moz-none; ' + (this.Drag ? "cursor: move;" : "") + '">\
    </tr>\
          <tr>\
            <td valign="top"><div id="_Container_{thisID}" style="text-align:left;position: relative; width: ' + this.Width + 'px; height: ' + this.Height + 'px;">\
                <div  style="position: absolute; height: 100%; width: 100%; display: none; background-color:#fff; opacity: 0.5;" id="_Covering_{thisID}">&nbsp;</div>\
	' + (function (obj) {
        if (obj.InnerHtml) return obj.InnerHtml;
        if (obj.URL) return '<iframe width="100%" height="100%" frameborder="0" style="border:none 0;" id="_DialogFrame_' + obj.ID + '" ' + (obj.InnerFrameName?'name="'+obj.InnerFrameName+'"':'')+' src="' + obj.displacePath() + '"></iframe>';
        return "";
    })(this) + '\
              </div></td>\
          </tr>\
          <tr id="_ButtonRow_{thisID}" style="display:none;" >\
            <td height="36"><div id="_DialogButtons_{thisID}" style="border-top: 1px solid #DADEE5; padding: 8px 20px; text-align: right; background-color:#f6f6f6;">\
                <input type="button" style="' + (this.ShowOkButton ? "" : "display:none") + '"  value="' + this.OkButtonText + '" id="_ButtonOK_{thisID}"/>\
                <input type="button" style="' + (this.ShowCancelButton ? "" : "display:none") + '"  value="' + this.CancelButtonText + '" onclick="Dialog.getInstance(\'{thisID}\').close();" id="_ButtonCancel_{thisID}"/>\
              </div></td>\
          </tr>\
        </table></div></td>\
    </tr>\
  </table>\
</div>\
';
	}
	
	html=html.replace(/\{IMAGESPATH\}/gm,IMAGESPATH).replace(/\{thisID\}/gm,this.ID)
    var div = topWin.$id("_DialogDiv_" + this.ID);
    if (!div) {
        div = topDoc.createElement("div");
        div.id = "_DialogDiv_" + this.ID;
        topDoc.getElementsByTagName("BODY")[0].appendChild(div);
    }
	
    if(isIE&&topDoc.compatMode == "BackCompat"||ielt7){
    	div.style.position ="absolute";
    	this.fixedPosition = false;
    }else{
    	div.style.position ="fixed";
    	this.fixedPosition = true;
    }
    div.style.left = "-9999px";
    div.style.top = "-9999px";
    div.innerHTML = html;
	if(this.AllowChangeIndex){
	}
	else{
		if(this.MinToTask==true){
			this.AllowChangeIndex=true;
		}
		else{
			this.AllowChangeIndex=false;
		}
	}
	$(div).attr("AllowChangeIndex",this.AllowChangeIndex)
	$(div).attr("MinToTask",this.MinToTask);
	if(this.Style=="normal"){
		$(div).addClass("dialog_main");
	}
	$(div).attr("taskId","task_"+this.ID)
	//点击切换层级
	$(div).bind("click",function(){
		if($(this).attr("AllowChangeIndex")==true||$(this).attr("AllowChangeIndex")=="true"){
			maxIndex=maxIndex+topWin.Dialog._dialogArray.length+2;
			$(this)[0].style.zIndex=maxIndex;
			if($(this).attr("MinToTask")==true||$(this).attr("MinToTask")=="true"){
				var taskArray=topWin.Dialog._taskArray;
				var idx=getArrayPosition($(this).attr("taskId"),taskArray);
				//将当前taskId放在数组最后
				if(idx!=-1){
					taskArray.splice(idx,1);
					taskArray.push($(this).attr("taskId"));
				}
				//让当前窗口的任务项高亮
				var taskTarget=getTaskTarget();
				if(taskTarget!=""){
					var $taskTarget=$("#"+taskTarget);
					setTaskCurrent($taskTarget,taskArray);
				}
			}
		}
	})
	
	
    if (this.InvokeElementId) {
        var element = $id(this.InvokeElementId);
        element.style.position = "";
        element.style.display = "";
        if (isIE) {
            var fragment = topDoc.createElement("div");
            fragment.innerHTML = element.outerHTML;
            element.outerHTML = "";
            topWin.$id("_Covering_" + this.ID).parentNode.appendChild(fragment)
        } else {
            topWin.$id("_Covering_" + this.ID).parentNode.appendChild(element)
        }
    }
    this.openerWindow = window;
    if(window.ownerDialog)
        this.openerDialog = window.ownerDialog;
    if (this.URL) {
        if (topWin.$id("_DialogFrame_" + this.ID)) {
            this.innerFrame = topWin.$id("_DialogFrame_" + this.ID);
        };
        var self = this;
        this.innerFrameOnload = function () {
				self.innerWin = self.innerFrame.contentWindow;
            try {
				self.innerWin.ownerDialog = self;
                self.innerDoc = self.innerWin.document;
                if (self.Title=='　' && self.innerDoc && self.innerDoc.title) {
                    if (self.innerDoc.title) topWin.$id("_Title_" + self.ID).innerHTML = self.innerDoc.title;
                };
            } catch(e) {
                if (window.console && window.console.log) console.log(this.errorMessage2);
                self.unauthorized=true;
            }
            if (typeof(self.OnLoad)== "function")self.OnLoad();
        };
        if (!isGecko) {
            this.innerFrame.attachEvent("onreadystatechange", function(){//在ie下可以给iframe绑定onreadystatechange事件
				if((/loaded|complete/).test(self.innerFrame.readyState)){
					self.innerFrameOnload();
				}
			});
            //this.innerFrame.attachEvent("onload", self.innerFrameOnload);
        } else {
			//this.innerFrame.contentWindow.addEventListener("load", function(){self.innerFrameOnload()}, false);//在firefox下iframe仅能够绑定onload事件
            this.innerFrame.onload = self.innerFrameOnload;
        };
    };
    topWin.$id("_DialogDiv_" + this.ID).dialogId = this.ID;
    topWin.$id("_DialogDiv_" + this.ID).dialogInstance = this;
    this.attachBehaviors();
    this.okButton = topWin.$id("_ButtonOK_" + this.ID);
    this.cancelButton = topWin.$id("_ButtonCancel_" + this.ID);
    this.maxButton = topWin.$id("_ButtonMax_" + this.ID);
    this.minButton = topWin.$id("_ButtonMin_" + this.ID);
	
	$(div).find("input[type='button']").each(function(){
		if(!$(this).attr("class")){
			$(this).addClass("button");
			$(this).hover(
				function() {
					
						$(this).addClass("button_hover");
					
					},
				function(){
						$(this).removeClass("button_hover");
					}
			);
		}
	})
	
	if($(div).find(".progressBar").length==0){
		if($(div).find(".button").parents("tr")[0].style.display=="none"){
			$(div).find(".icon_dialog").eq(0).focus();
		}
		else{
			$(div).find(".button").eq(0).focus();
		}
	}
	div=null;
	
};
Dialog.prototype.setSize = function (w, h) {
    if (w && +w > 20) {
        this.Width = +w;
        topWin.$id("_DialogTable_" + this.ID).width = this.Width + this.dialogWidthFix;
        topWin.$id("_Container_" + this.ID).style.width = this.Width + "px";
    }
    if (h && +h > 10) {
        this.Height = +h;
        topWin.$id("_Container_" + this.ID).style.height = this.Height + "px";
    }
    this.setPosition();
};
Dialog.prototype.max = function () {
   var $mainDiv=$("#_DialogDiv_" + this.ID);
   var tr=$("#_DialogTable_" + this.ID).find(">tbody").find(">tr").eq(1);
   //如果是最小化，先还原
   if(tr[0].style.display=="none"){
   	 tr.show();
	 $("#_Draghandle_"+ this.ID).find(".dialog_minbtn").removeClass("dialog_decreasebtn");
	 $("#_Draghandle_"+ this.ID).find(".dialog_minbtn").attr("title",this.minButtonTitle);
   }
  //如果已经最大化，则还原
   if(this.maxFlag==true){
		topWin.$id("_DialogTable_" + this.ID).style.width = this.Width + this.dialogWidthFix;
        topWin.$id("_Container_" + this.ID).style.width = this.Width + "px";
		topWin.$id("_Container_" + this.ID).style.height = this.Height + "px";
		$("#_Draghandle_"+ this.ID).find(".dialog_maxbtn").removeClass("dialog_decreasebtn");
		$("#_Draghandle_"+ this.ID).find(".dialog_maxbtn").attr("title",this.maxButtonTitle);
		this.maxFlag=false;
		if(this.DecreaseResetPosition){
			this.setPosition();
		}
		else{
			$mainDiv[0].style.left=$mainDiv.attr("oldleft");
			$mainDiv[0].style.top=$mainDiv.attr("oldtop");
		}
	}
	//最大化
	else{
		//记住最大化之前的位置
		$mainDiv.attr("oldleft",$mainDiv[0].style.left);
   		$mainDiv.attr("oldtop",$mainDiv[0].style.top);
		
		//var bgDivWidth=$("#_DialogBGDiv").width();
		//var bgDivHeight=$("#_DialogBGDiv").height();
		var bgDivHeight=window.document.documentElement.clientHeight;
		var bgDivWidth=window.document.documentElement.clientWidth;
		topWin.$id("_DialogTable_" + this.ID).style.width = bgDivWidth;
        topWin.$id("_Container_" + this.ID).style.width =  bgDivWidth-this.dialogWidthFix + "px";
		if($("#_ButtonRow_"+ this.ID)[0].style.display=="none"){//不显示按钮栏时
			if(this.MinToTask){
				topWin.$id("_Container_" + this.ID).style.height = bgDivHeight-46-$(".dialogTaskBg").height() + "px";
			}
			else{
				topWin.$id("_Container_" + this.ID).style.height = bgDivHeight-46 + "px";
			}
			
			
		}
		else{//显示按钮栏时
			if(this.MinToTask){
				topWin.$id("_Container_" + this.ID).style.height = bgDivHeight-46-$("#_ButtonRow_"+ this.ID).height()-$(".dialogTaskBg").height() + "px";
			}
			else{
				topWin.$id("_Container_" + this.ID).style.height = bgDivHeight-46-$("#_ButtonRow_"+ this.ID).height() + "px";
			}
			
		}
		
		$("#_Draghandle_"+ this.ID).find(".dialog_maxbtn").addClass("dialog_decreasebtn");
		$("#_Draghandle_"+ this.ID).find(".dialog_maxbtn").attr("title",this.decreaseButtonTitle);
		if(this.MinToTask==true||this.MinToTask=="true"){
			this.Left=0;
			this.Top=0;
		}
		this.maxFlag=true;
		this.setPosition();
	}
	
};
Dialog.prototype.minHandler= function (){
	if(this.MinToTask==true||this.MinToTask=="true"){
		this.minToTask();
	}
	else{
		this.min();
	}
}
Dialog.prototype.min = function () {
   var tr=$("#_DialogTable_" + this.ID).find(">tbody").find(">tr").eq(1);
    //如果是最小化，还原
   if(tr[0].style.display=="none"){
   	 topWin.$id("_DialogTable_" + this.ID).width = this.Width + this.dialogWidthFix;
     topWin.$id("_Container_" + this.ID).style.width = this.Width + "px";
	 topWin.$id("_Container_" + this.ID).style.height = this.Height + "px";
	 $("#_Draghandle_"+ this.ID).find(".dialog_minbtn").removeClass("dialog_decreasebtn");
	$("#_Draghandle_"+ this.ID).find(".dialog_minbtn").attr("title",this.minButtonTitle);
	 tr.show();
	 if(this.DecreaseResetPosition){
	 	 this.setPosition();
	 }
	 this.minFlag=false;
   }
   //最小化
   else{
   	topWin.$id("_DialogTable_" + this.ID).style.width = 240 + this.dialogWidthFix+ "px";
    topWin.$id("_Container_" + this.ID).style.width = 240 + "px";
	$("#_Draghandle_"+ this.ID).find(".dialog_minbtn").addClass("dialog_decreasebtn");
	$("#_Draghandle_"+ this.ID).find(".dialog_minbtn").attr("title",this.decreaseButtonTitle);
	tr.hide();
	this.minFlag=true;
   }
   this.maxFlag=false;
};
Dialog.prototype.minToTask = function () {
   var dialogTaskBottom=0;
   if($("#skin").attr("splitMode")==true||$("#skin").attr("splitMode")=="true"){
		dialogTaskTop=window.document.documentElement.clientHeight-dialogTaskBottom+"px";
	}
	else{
		var $parentThemeDom=$(window.top.document.getElementById("theme"));
		if($parentThemeDom.attr("dialogTaskBottom")!=null){
			dialogTaskBottom=Number($parentThemeDom.attr("dialogTaskBottom"));
		}
		dialogTaskTop=top.window.document.documentElement.clientHeight-dialogTaskBottom+"px";
	}
   //最小化到任务栏
   var $winMain=$("#_DialogDiv_" + this.ID);
   var taskTarget=getTaskTarget();
   var currentWinId=this.ID;
	if(taskTarget!=""){
	   var $taskTarget=$("#"+taskTarget);
	   var effLeft=$winMain[0].style.left;
	   var effTop=$winMain[0].style.top;
	   var effWidth=$winMain.width();
	   var effHeight=$winMain.height();
	   var $hi = $('<div class="dialogMinEffect"></div>');
	   $hi.css({
	   	"width":effWidth,
		"height":effHeight,
		"left":effLeft,
		"top":effTop
	   }).animate({
	   	width:0,
		height:0,
		left:$taskTarget.find("#task_" + this.ID).offset().left+"px",
		top:dialogTaskTop,
		opacity:0
	   },200,function(){
	   	$hi.remove(); 
		
		//移除该taskId
		var taskArray=topWin.Dialog._taskArray;
		var idx=getArrayPosition("task_" + currentWinId,taskArray);
		//alert(this.ID)
		if(idx!=-1){
			taskArray.splice(idx,1);
		}
		//并取消当前的高亮，让前一个高亮
		setTaskCurrent($taskTarget,taskArray);
	   })
	}
	$winMain.hide();
   $("body").append($hi);
   	
	
};
Dialog.prototype.show = function () {
    var dialogTaskBottom=0;
   if($("#skin").attr("splitMode")==true||$("#skin").attr("splitMode")=="true"){
		dialogTaskTop=window.document.documentElement.clientHeight-dialogTaskBottom+"px";
	}
	else{
		var $parentThemeDom=$(window.top.document.getElementById("theme"));
		if($parentThemeDom.attr("dialogTaskBottom")!=null){
			dialogTaskBottom=Number($parentThemeDom.attr("dialogTaskBottom"));
		}
		dialogTaskTop=top.window.document.documentElement.clientHeight-dialogTaskBottom+"px";
	}
	 var div = topWin.$id("_DialogDiv_" + this.ID);
	 //打开唯一实例
	 if(div){
		
		maxIndex=maxIndex+topWin.Dialog._dialogArray.length+2;
		$(div)[0].style.zIndex=maxIndex;
		if(this.MinToTask==true||this.MinToTask=="true"){
			var taskArrayR=topWin.Dialog._taskArray;
			var effLeftR=$(div)[0].style.left;
			var effTopR=$(div)[0].style.top;
			var effWidthR=$(div).width();
			var effHeightR=$(div).height();
			var $hiR = $('<div class="dialogMinEffect"/>');
			
			var idxR=getArrayPosition("task_" + this.ID,taskArrayR);
			//将当前taskId放在数组最后
			if(idxR!=-1){
				taskArrayR.splice(idxR,1);
				taskArrayR.push("task_" + this.ID);
			}
			else{
				taskArrayR.push("task_"+this.ID);
			}
			var taskTargetR=getTaskTarget();
			var $taskTargetR;
			if(taskTargetR!=""){
			    $taskTargetR=$("#"+taskTargetR);
				setTaskCurrent($taskTargetR,taskArrayR)
			}
			
			//如果已经隐藏，则显示，并且将窗口层级置于最上方，并所属任务项高亮
			if($(div)[0].style.display=="none"){
				$hiR.css({
				   	"width":0,
					"height":0,
					"left":$taskTargetR.find("#task_" + this.ID).offset().left+"px",
					"top":dialogTaskTop
				   }).animate({
				   	width:effWidthR,
					height:effHeightR,
					left:effLeftR,
					top:effTopR
				   },200,function(){
				   	$(div).show();
				   	$hiR.remove(); 
				   })
				    $("body").append($hiR);
			}
			//如果未隐藏，但不处于当前，则将窗口层级置于最上方，并所属任务项高亮
			else if(this.ID!=taskArrayR[taskArrayR.length-1]){
			}
		}
	 	return;
	 }
	this.create();
    var bgdiv = this.getBgdiv(),
		thisdialogDiv=this.getDialogDiv();
    thisdialogDiv.style.zIndex = this.zindex = parseInt(Dialog.bgDiv.style.zIndex) + 1;
    if (topWin.Dialog._dialogArray.length > 0) {
       // thisdialogDiv.style.zIndex = this.zindex = topWin.Dialog._dialogArray[topWin.Dialog._dialogArray.length - 1].zindex + 2;
       maxIndex=maxIndex+topWin.Dialog._dialogArray.length+2;
	   thisdialogDiv.style.zIndex = maxIndex;
    } else {
        bgdiv.style.display = "none";
    	if(HideScrollbar){
	        var topWinBody = topDoc.getElementsByTagName(topDoc.compatMode == "BackCompat" ? "BODY" : "HTML")[0];
	        topWinBody.styleOverflow = topWinBody.style.overflow;
    		if(window.navigator.userAgent.indexOf("Firefox/3.6") != -1){//在firefox3.6下改变overflow属性会导致scrollTop=0
    			var topWinBodyScrollTop=topWinBody.scrollTop;
				if(this.ShowHideScroller==true){
					topWinBody.style.overflow = "hidden";
    				topWinBody.scrollTop=topWinBodyScrollTop;
				}
    		}else{
	        	if(this.ShowHideScroller==true){
					topWinBody.style.overflow = "hidden";
				}
	        }
        }
    }
    topWin.Dialog._dialogArray.push(this);
	Dialog._childDialogArray.push(this);
	if(Dialog._childDialogArray.length==1){
		if(window.ownerDialog){
			ownerDialog.hiddenCloseButton();
		}
	}
    
    //bgdiv.style.zIndex = topWin.Dialog._dialogArray[topWin.Dialog._dialogArray.length - 1].zindex - 1;
   
	//if(bgdiv.style.display == "none"){
		//if(this.Animator){
			//var bgMask=topWin.$id("_DialogBGMask");
    		//bgdiv.style.display = "";
			//if(isIE){
				//bgMask.style.opacity = 0;
				//bgMask.style.filter = "alpha(opacity=0)";
				//fadeEffect(bgMask,0,40,ielt7?20:10);
			//}
			//else{
				//bgMask.style.opacity = 0;
				//bgMask.style.filter = "alpha(opacity=0)";
				//fadeEffect(bgMask,0,40,ielt7?20:10);
			//}
			//bgMask=null;
		//}else{
    		//bgdiv.style.display = "";
		//}
	//}
	//bgdiv.style.display = "none"
	
	
    if (this.CancelEvent) {
        this.cancelButton.onclick = this.CancelEvent;
        //if(this.ShowButtonRow)this.cancelButton.focus();
    }
	var instance=this;
    if (this.OKEvent) {
        this.okButton.onclick = this.OKEvent;
       // if(this.ShowButtonRow)this.okButton.focus();
    }
	if(this.maxButton){
		this.maxButton.onclick=function(){
			//如果当前处于最大化
			if(instance.maxFlag){
				//触发还原事件
				if(instance.DecreaseEvent){
					$(instance.DecreaseEvent);
				}
			}
			else{
				//触发最大化事件
				if(instance.MaxEvent){
					$(instance.MaxEvent);
				}
			}
			instance.max();
		}
	}
	if(this.minButton){
		this.minButton.onclick=function(){
			//如果当前处于最小化
			if(instance.minFlag){
				//触发还原事件
				if(instance.DecreaseEvent){
					$(instance.DecreaseEvent);
				}
			}
			else{
				//触发最小化事件
				if(instance.MinEvent){
					$(instance.MinEvent);
				}
			}
			instance.minHandler();
		}
	}
	
	 
    if (this.AutoClose && this.AutoClose > 0) this.autoClose();
    this.opened = true;
	
	 this.setPosition();
	if(this.MinToTask==true||this.MinToTask=="true"){
		this.Modal=false;
		this.ResizeResetPosition=false;
		this.DecreaseResetPosition=false;
		this.AllowChangeIndex=true;
		var $winMain=$("#_DialogDiv_" + this.ID);
	   var taskTarget=getTaskTarget();
		if(taskTarget!=""){
			var $taskTarget=$("#"+taskTarget);
			if($taskTarget[0]){
				if($taskTarget[0].style.display=="none"){
					$taskTarget.fadeIn(500);
					$("body").trigger("dialogTaskShow");
				}
			}
			var $task=$('<a class="dialogTaskItem"><span keepDefaultStyle="true" class="dialogTaskItemRight"><span class="dialogTaskItemIcon"></span></span></a>');
			$task.attr("id","task_"+this.ID);
			var $titleIcon=$task.find(".dialogTaskItemIcon");
			$titleIcon.text(this.Title);
			$titleIcon.attr("title",this.Title);
			if(this.IconSrc!=""){
				$titleIcon.css({
					"paddingLeft":"18px",
					"backgroundPositon":"0 40%",
					"backgroundRepeat":"no-repeat",
					"backgroundImage":"url("+this.IconSrc+")"
				})
			}
			else if(this.IconClass!=""){
				$titleIcon.addClass(this.IconClass);
			}
			//添加任务项
			$taskTarget.find(".taskItemContainer").append($task);
			itemTotalWidth=itemTotalWidth+$task.width()+8;
			resetDialogTask();
			//新开窗口时添加taskId到数组中
			var taskArray=topWin.Dialog._taskArray;
			if(getArrayPosition("task_"+this.ID,taskArray)==-1){
				taskArray.push("task_"+this.ID);
			}
			//每次打开新窗口位置偏移
			this.Left=$winMain.offset().left+taskArray.length*20;
			this.Top=$winMain.offset().top+taskArray.length*20;
			
			//当前窗口所属任务项高亮
			setTaskCurrent($taskTarget,taskArray);
			$task.bind("click",function(){
				var myTaskArray=topWin.Dialog._taskArray;
				var idx=getArrayPosition($(this).attr("id"),myTaskArray);
				
				var effLeft=$winMain[0].style.left;
			   var effTop=$winMain[0].style.top;
			   var effWidth=$winMain.width();
			   var effHeight=$winMain.height();
			   var $hi = $('<div class="dialogMinEffect"/>');
				   
				//如果已经隐藏，则显示，并且将窗口层级置于最上方，并所属任务项高亮
				if($winMain[0].style.display=="none"){
					
					maxIndex=maxIndex+topWin.Dialog._dialogArray.length+2;
					$winMain[0].style.zIndex=maxIndex;
					//将当前taskId放在数组最后
					if(idx==-1){
						myTaskArray.push($(this).attr("id"));
					}
					else{
						myTaskArray.splice(idx,1);
						myTaskArray.push($(this).attr("id"));
					}
					$hi.css({
				   	"width":0,
					"height":0,
					"left":$(this).offset().left+"px",
					"top":dialogTaskTop
				   }).animate({
				   	width:effWidth,
					height:effHeight,
					left:effLeft,
					top:effTop
				   },200,function(){
				   	$winMain.show();
				   	$hi.remove(); 
				   })
				    $("body").append($hi);
					setTaskCurrent($taskTarget,myTaskArray);
				}
				//如果未隐藏，但不处于当前，则将窗口层级置于最上方，并所属任务项高亮
				else if($(this).attr("id")!=myTaskArray[myTaskArray.length-1]){
					maxIndex=maxIndex+topWin.Dialog._dialogArray.length+2;
					$winMain[0].style.zIndex=maxIndex;
					//将当前taskId放在数组最后
					if(idx==-1){
						myTaskArray.push($(this).attr("id"));
					}
					else{
						myTaskArray.splice(idx,1);
						myTaskArray.push($(this).attr("id"));
					}
					setTaskCurrent($taskTarget,myTaskArray);
				}
				//如果未隐藏，并且处于当前，则隐藏，并取消当前的高亮，让前一个高亮
				else{
					
				   $hi.css({
				   	"width":effWidth,
					"height":effHeight,
					"left":effLeft,
					"top":effTop
				   }).animate({
				   	width:0,
					height:0,
					left:$(this).offset().left+"px",
					top:dialogTaskTop,
					opacity:0
				   },200,function(){
				   	$hi.remove(); 
					setTaskCurrent($taskTarget,myTaskArray);
				   })
				    $("body").append($hi);
					$winMain.hide();
					//移除该taskId
					myTaskArray.pop($(this).attr("id"));
				}
				
			})
		}
		 this.setPosition();
	}
	
	if (this.Modal) {
		bgdiv.style.zIndex=thisdialogDiv.style.zIndex-1;
		 Dialog.setBgDivSize();
		bgdiv.style.display = "";
    }
   bgdiv=null;
};
Dialog.prototype.close = function () {
    if(this.unauthorized==false){
    	if(this.innerWin&&this.innerWin.Dialog&&this.innerWin.Dialog._childDialogArray.length>0){
    		return;
    	}
    }
	var thisdialogDiv=this.getDialogDiv();
    if (this == topWin.Dialog._dialogArray[topWin.Dialog._dialogArray.length - 1]) {
        var isTopDialog = topWin.Dialog._dialogArray.pop();
    } else {
        //topWin.Dialog._dialogArray.remove(this);
		removeWinArray(topWin.Dialog._dialogArray,this);
    }
	//Dialog._childDialogArray.remove(this);
	removeWinArray(Dialog._childDialogArray,this);
	if(Dialog._childDialogArray.length==0){
		if(window.ownerDialog){
			ownerDialog.showCloseButton();
		}
	}

    if (this.InvokeElementId) {
        var innerElement = topWin.$id(this.InvokeElementId);
        innerElement.style.display = "none";
        if (isIE) {
            //ie下不能跨窗口拷贝元素，只能跨窗口拷贝html代码
            var fragment = document.createElement("div");
            fragment.innerHTML = innerElement.outerHTML;
            innerElement.outerHTML = "";
            document.getElementsByTagName("BODY")[0].appendChild(fragment)
        } else {
            document.getElementsByTagName("BODY")[0].appendChild(innerElement)
        }

    }
    if (topWin.Dialog._dialogArray.length > 0) {
        
if (this.Modal && isTopDialog){
        	var index=topWin.Dialog._dialogArray.length;
        	//var index= maxIndex;
        	var hiddenBgDiv=true;
        	while(index){
        		--index;
        		if(topWin.Dialog._dialogArray[index].Modal){
		        	Dialog.bgDiv.style.zIndex = topWin.Dialog._dialogArray[index].zindex - 1;
		        	hiddenBgDiv=false;
		        	break;
		        }
        	}
        	if(hiddenBgDiv){
		        Dialog.bgDiv.style.display = "none";
        	}
        }

	/*if (this.Modal){
		Dialog.bgDiv.style.display = "none";
	}*/
		//alert(hiddenBgDiv)
    } else {
        Dialog.bgDiv.style.zIndex = "900";
        Dialog.bgDiv.style.display = "none";
        if(HideScrollbar){
	        var topWinBody = topDoc.getElementsByTagName(topDoc.compatMode == "BackCompat" ? "BODY" : "HTML")[0];
	        if(topWinBody.styleOverflow != undefined)
				if(window.navigator.userAgent.indexOf("Firefox/3.6") != -1){//在firefox3.6下改变overflow属性会导致scrollTop=0
	    			var topWinBodyScrollTop=topWinBody.scrollTop;
			        if(this.CloseHideScroller){
						topWinBody.style.overflow ="hidden";
					}
					else{
						topWinBody.style.overflow = topWinBody.styleOverflow;
					}
	    			topWinBody.scrollTop=topWinBodyScrollTop;
	    		}else{
					if(this.CloseHideScroller){
						topWinBody.style.overflow ="hidden";
					}
					else{
						topWinBody.style.overflow = topWinBody.styleOverflow;
					}
		        }
        }
    }
    this.openerWindow.focus();
	/*****释放引用，以便浏览器回收内存**/
    if (isIE&&!isIE8) {
		thisdialogDiv.dialogInstance=null;
		if (this.CancelEvent){this.cancelButton.onclick = null;};
		if (this.OKEvent){this.okButton.onclick = null;};
		topWin.$id("_DialogDiv_" + this.ID).onDragStart=null;
		topWin.$id("_DialogDiv_" + this.ID).onDragEnd=null;
		topWin.$id("_Draghandle_" + this.ID).onmousedown=null;
		topWin.$id("_Draghandle_" + this.ID).root=null;
        thisdialogDiv.outerHTML = "";
		CollectGarbage();
    } else {
        var RycDiv = topWin.$id("_RycDiv");
        if (!RycDiv) {
            RycDiv = topDoc.createElement("div");
            RycDiv.id = "_RycDiv";
        }
        RycDiv.appendChild(thisdialogDiv);
        RycDiv.innerHTML = "";
		RycDiv=null;
    }
	this.innerFrame=null;
	this.bgDiv=null;
	thisdialogDiv=null;
    this.closed = true;
	if(this.MinToTask==true||this.MinToTask=="true"){
		//移除该taskId
		var taskArray=topWin.Dialog._taskArray;
		var idx=getArrayPosition("task_" + this.ID,taskArray);
		if(idx!=-1){
			taskArray.splice(idx,1);
		}
		//移除任务项
		var taskTarget=getTaskTarget();
		if(taskTarget!=""){
			var $taskTarget=$("#"+taskTarget);
			var $task=$taskTarget.find("#task_" + this.ID);
			itemTotalWidth=itemTotalWidth-$task.width()-8;
			resetDialogTask();
			$task.remove();
			//让前一个任务项高亮
			setTaskCurrent($taskTarget,taskArray);
			
			if($taskTarget.find(".taskItemContainer").html()==""){
				$taskTarget.fadeOut(500);
				$("body").trigger("dialogTaskHide");
			}
		}
		
	}
};
Dialog.prototype.autoClose = function () {
    if (this.closed) {
        clearTimeout(this._closeTimeoutId);
        return;
    }
    this.AutoClose -= 1;
    topWin.$id("_Title_" + this.ID).innerHTML = this.AutoClose  + this.autoCloseMessage;;
    if (this.AutoClose <= 0) {
        this.close();
    } else {
        var self = this;
        this._closeTimeoutId = setTimeout(function () {
            self.autoClose();
        },
        1000);
    }
};
Dialog.getInstance = function (id) {
    var dialogDiv = topWin.$id("_DialogDiv_" + id);
    if (!dialogDiv) alert(this.errorMessage);
	try{
    	return dialogDiv.dialogInstance;
	}finally{
		dialogDiv = null;
	}
};
Dialog.prototype.addButton = function (id, txt, func) {
    topWin.$id("_ButtonRow_" + this.ID).style.display = "";
    this.ShowButtonRow = true;
    var button = topDoc.createElement("input");
    button.id = "_Button_" + this.ID + "_" + id;
    button.type = "button";
    button.style.cssText = "margin-right:5px";
    button.value = txt;
    button.onclick = func;
    var input0 = topWin.$id("_DialogButtons_" + this.ID).getElementsByTagName("INPUT")[0];
    input0.parentNode.insertBefore(button, input0);
	$(button).each(function(){
		$(this).addClass("button");
		$(this).hover(
			function() {
				
					$(this).addClass("button_hover");
				
				},
			function(){
					$(this).removeClass("button_hover");
				}
		);
		
	})
    return button;
};
Dialog.prototype.removeButton = function (btn) {
    var input0 = topWin.$id("_DialogButtons_" + this.ID).getElementsByTagName("INPUT")[0];
    input0.parentNode.removeChild(btn);
};
Dialog.prototype.hiddenCloseButton = function (btn) {
    var closebtn = topWin.$id("_ButtonClose_" + this.ID);
	if(closebtn)
		closebtn.style.display='none';
};
Dialog.prototype.showCloseButton = function (btn) {
    var closebtn = topWin.$id("_ButtonClose_" + this.ID);
	if(closebtn)
		closebtn.style.display='';
};
Dialog.prototype.getBgdiv = function () {
    var opactty1=this.Alpha;
   var opactty2=String(this.Alpha/100);
	if (Dialog.bgDiv){
		if (this.Modal){
			document.getElementById("_DialogBGMask").style.opacity =opactty2;
			document.getElementById("_DialogBGMask").style.filter="alpha(opacity="+opactty1+")";
			document.getElementById("_DialogBGMask").style.backgroundColor=this.Bgcolor;
		}
		return Dialog.bgDiv;
	} 
    var bgdiv = topWin.$id("_DialogBGDiv");
    if (!bgdiv) {
        bgdiv = topDoc.createElement("div");
        bgdiv.id = "_DialogBGDiv";
        bgdiv.style.cssText = "position:absolute;left:0px;top:0px;width:100%;height:100%;z-index:900";
        var bgIframeBox = '<div style="position:relative;width:100%;height:100%;">';
		var bgIframeMask = '<div id="_DialogBGMask" style="position:absolute;width:100%;height:100%;"></div>';
		var bgIframe = ielt7?'<iframe src="about:blank" style="filter:alpha(opacity=0);" width="100%" height="100%"></iframe>':'';
		bgdiv.innerHTML=bgIframeBox+bgIframeMask+bgIframe+'</div>';
        topDoc.getElementsByTagName("BODY")[0].appendChild(bgdiv);
		document.getElementById("_DialogBGMask").style.opacity =opactty2;
		document.getElementById("_DialogBGMask").style.filter="alpha(opacity="+opactty1+")";
		document.getElementById("_DialogBGMask").style.backgroundColor=this.Bgcolor;
        if (ielt7) {
            var bgIframeDoc = bgdiv.getElementsByTagName("IFRAME")[0].contentWindow.document;
            bgIframeDoc.open();
            bgIframeDoc.write("<body style='background-color:#333' oncontextmenu='return false;'></body>");
            bgIframeDoc.close();
			bgIframeDoc=null;
        }
    }
    Dialog.bgDiv = bgdiv;
	bgdiv=null;
    return Dialog.bgDiv;
};
Dialog.prototype.getDialogDiv = function () {
	var dialogDiv=topWin.$id("_DialogDiv_" + this.ID)
	//if(!dialogDiv)alert("获取弹出层页面对象出错！");
	try{
		return dialogDiv;
	}finally{
		dialogDiv = null;
	}
};
Dialog.onKeyDown = function (evt) {
	var evt=window.event||evt;
    if ((evt.shiftKey && evt.keyCode == 9)
		 ||evt.keyCode == 8) { //shift键及tab键,或backspace键
        if (topWin.Dialog._dialogArray.length > 0) {
			var target = evt.srcElement||evt.target;
			if(target.tagName!='INPUT'&&target.tagName!='TEXTAREA'){//如果在不在输入状态中
				stopEvent(evt);
				return false;
			}
        }
    }
    if (evt.keyCode == 27) { //ESC键
    	var diag = topWin.Dialog._dialogArray[topWin.Dialog._dialogArray.length - 1];
		if(diag.ShowCloseButton){
			Dialog.close();
		}
    }
};
Dialog.close = function (id) {
    if (topWin.Dialog._dialogArray.length > 0) {
        var diag = topWin.Dialog._dialogArray[topWin.Dialog._dialogArray.length - 1];
        if(diag.MsgForESC){
			Dialog.confirm(diag.MsgForESC,function(){diag.cancelButton.onclick.apply(diag.cancelButton, []);})
        }else{
        	diag.cancelButton.onclick.apply(diag.cancelButton, []);
        }
    }
};
Dialog.alert = function (msg, func, w, h,autoClose) {
	var w = w || 300,
        h = h || 110;
    var diag = new Dialog({
        Width: w,
        Height: h
    });
    diag.ShowButtonRow = true;
   
    diag.CancelEvent = function () {
        diag.close();
        if (func) func();
    };
	if(msg){
		var msgArray=msg.split("|");
		if(msgArray.length>1){
			 diag.Title =msgArray[1];
		}
		else{
			 diag.Title = diag.alertTitleMessage;
		}
		 diag.InnerHtml = '<table height="100%" border="0" align="center" cellpadding="10" cellspacing="0">\
			<tr><td align="right"><input type="button" id="Icon_' + this.ID + '" class="icon_alert" align="absmiddle"></td>\
				<td align="left" id="Message_' + this.ID + '" style="font-size:' + (diag.defaultFontSize) + 'px;font-family:' + (diag.defaultFontFamily) + '">' + msgArray[0] + '</td></tr>\
		</table>';
	}
   else{
   		diag.Title = diag.alertTitleMessage;
		 diag.InnerHtml = '<table height="100%" border="0" align="center" cellpadding="10" cellspacing="0">\
			<tr><td align="right"><input type="button" id="Icon_' + this.ID + '" class="icon_alert" align="absmiddle"></td>\
				<td align="left" id="Message_' + this.ID + '" style="font-size:' + (diag.defaultFontSize) + 'px;font-family:' + (diag.defaultFontFamily) + '"></td></tr>\
		</table>';
   }
    diag.show();
	if(diag.okButton){
		diag.okButton.parentNode.style.textAlign = "center";
    	diag.okButton.style.display = "none";
	}
    if(diag.cancelButton){
		 diag.cancelButton.value = diag.OkButtonText;
		setTimeout(function(){diag.cancelButton.focus();},200)
	}
	
	if (autoClose && autoClose > 0) {
		/*
topWin.$id("_Title_" + diag.ID).innerHTML=autoClose+"秒后自动关闭"
		setTimeout(function(){
			diag.close();
		},autoClose*1000)
*/
		 if (this.closed) {
	        clearTimeout(this._closeTimeoutId);
	        return;
	    }
	    this.AutoClose -= 1;
	    topWin.$id("_Title_" + diag.ID).innerHTML=autoClose+diag.autoCloseMessage;
        this._closeTimeoutId = setTimeout(function () {
            diag.autoClose();
        },
        autoClose*1000);
	}
    
};
Dialog.confirm = function (msg, funcOK, funcCal, w, h) {
    var w = w || 300,
        h = h || 110;
    var diag = new Dialog({
        Width: w,
        Height: h
    });
    diag.ShowButtonRow = true;
    var msgArray = msg.split("|");
    if (msgArray.length == 3 && msgArray[2]=="是否") {//把确定改为是或否
        diag.CancelButtonText = "否";
        diag.OkButtonText = "是";
    }
    if (msgArray.length > 1) {
        diag.Title = msgArray[1];
    }
    else {
        diag.Title = diag.confirmTitleMessage;
    }
    diag.CancelEvent = function () {
        diag.close();
        if (funcCal) funcCal();
    };
    diag.OKEvent = function () {
        diag.close();
        if (funcOK) funcOK();
    };
    diag.InnerHtml = '<table height="100%" border="0" align="center" cellpadding="10" cellspacing="0">\
		<tr><td align="right"><input type="button" id="Icon_' + this.ID + '" class="icon_query" align="absmiddle"></td>\
			<td align="left" id="Message_' + this.ID + '" style="font-size:' + (diag.defaultFontSize) + 'px;font-family:' + (diag.defaultFontFamily) + '">' + msgArray[0] + '</td></tr>\
	</table>';
    diag.show();
    diag.okButton.parentNode.style.textAlign = "center";
    setTimeout(function () { diag.okButton.focus(); }, 200)

};
Dialog.open = function (arg) {
    var diag = new Dialog(arg);
    diag.show();
    return diag;
};
window.attachEvent("onload", Dialog.attachBehaviors);

function fixProgress(){
	try {
		if(top.progressFlag==1){
			top.progressFlag=0;
		}
	}
	catch(e){}
}
function getArrayPosition(value,array){//获得数组值的索引
		var idx=-1;
		for(var i=0;i<array.length;i++){
			if(value==array[i]){
				idx=i;
				break;
			}
		}
		return idx;
	}
function getTaskTarget(){
	var taskTarget="dialogTask";
	if($("#skin").attr("splitMode")==true||$("#skin").attr("splitMode")=="true"){
	}
	else{
		var $parentThemeDom=$(window.top.document.getElementById("theme"));
		if($parentThemeDom.attr("taskTarget")!=null){
			taskTarget=$parentThemeDom.attr("taskTarget");
		}
	}
	return taskTarget;
}
function setTaskCurrent($taskTarget,taskArray){
	$taskTarget.find("a").removeClass("dialogTaskItemCurrent");
	if(taskArray.length!=0){
		$taskTarget.find("#"+taskArray[taskArray.length-1]).addClass("dialogTaskItemCurrent");
	}
}
var timer;
var itemContainerWidth=0;
var currentItemTotalWidth=0;
var itemTotalWidth=0;
var dialogTaskWidthModify=0;
var dialogTaskStart=18;
$(function(){
	if($("#skin").attr("splitMode")==true||$("#skin").attr("splitMode")=="true"){
	}
	else{
		var $parentThemeDom=$(window.top.document.getElementById("theme"));
		if($parentThemeDom.attr("dialogTaskWidthModify")!=null){
			dialogTaskWidthModify=Number($parentThemeDom.attr("dialogTaskWidthModify"));
		}
		if($parentThemeDom.attr("dialogTaskStart")!=null){
			dialogTaskStart=Number($parentThemeDom.attr("dialogTaskStart"));
		}
	}
	itemContainerWidth=window.document.documentElement.clientWidth-dialogTaskWidthModify;
	//alert(itemContainerWidth)
	$(window).resize(function(){
		resetDialogTask();
	})
	var taskTarget=getTaskTarget();
	if (taskTarget != "") {
		var $taskTarget = $("#" + taskTarget);
		var pos=2;
		
		var $ul=$('<div class="taskItemContainer"></div>');
		var $ulCon=$('<div class="taskItemContainerParent"></div>');
		$taskTarget.append($ulCon);
		$ulCon.append($ul);
		var $btnLeft=$('<div class="taskItemButtonLeft" style="display:none;" ></div>');
		var $btnRight=$('<div class="taskItemButtonRight" style="display:none;" ></div>');
		$taskTarget.append($btnLeft);
		$taskTarget.append($btnRight);
		
		$btnLeft.bind("mousedown",function(){
			timer=setInterval(function(){
				if(pos>dialogTaskStart-1){
					pos=dialogTaskStart;
					$ul.css("left",pos);
					clearInterval(timer);
					return;
				}
				pos=pos+8;
				$ul.css("left",pos);
			},30)
		})
		$btnLeft.bind("mouseup",function(){
			clearInterval(timer);
		})
		
		$btnRight.bind("mousedown",function(){
			var $obj=$(this).next("ul");
			timer=setInterval(function(){
				if(pos>dialogTaskStart){
					pos=dialogTaskStart-1;
					clearInterval(timer);
					return;
				}
				else if(pos<itemContainerWidth-itemTotalWidth){
					pos=itemContainerWidth-itemTotalWidth;
					clearInterval(timer);
					return;
				}
				pos=pos-8;
				$ul.css("left",pos);
			},30)
		})
		$btnRight.bind("mouseup",function(){
			clearInterval(timer);
		})
	}
})
function resetDialogTask(){
	var dialogTaskBottom=0;
	if($("#skin").attr("splitMode")==true||$("#skin").attr("splitMode")=="true"){
		itemContainerWidth=window.document.documentElement.clientWidth-dialogTaskWidthModify;
		dialogTaskTop=window.document.documentElement.clientHeight-dialogTaskBottom+"px";
	}
	else{
		itemContainerWidth=top.window.document.documentElement.clientWidth-dialogTaskWidthModify;
		var $parentThemeDom=$(window.top.document.getElementById("theme"));
		if($parentThemeDom.attr("dialogTaskBottom")!=null){
			dialogTaskBottom=Number($parentThemeDom.attr("dialogTaskBottom"));
		}
		dialogTaskTop=top.window.document.documentElement.clientHeight-dialogTaskBottom+"px";
	}
	var taskTarget=getTaskTarget();
	if (taskTarget != "") {
		var $taskTarget = $("#" + taskTarget);
		if($taskTarget[0]){
			if($taskTarget[0].style.display!="none"){
				if(itemTotalWidth>itemContainerWidth){
					$taskTarget.find(".taskItemButtonLeft").show();
					$taskTarget.find(".taskItemButtonRight").show();
				}
				else{
					$taskTarget.find(".taskItemButtonLeft").hide();
					$taskTarget.find(".taskItemButtonRight").hide();
					$taskTarget.find(".taskItemContainer").css("left",dialogTaskStart);
				}
			}
		}
		
	}
	
}
