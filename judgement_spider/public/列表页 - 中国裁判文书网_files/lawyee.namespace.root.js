'use strict';
/**
* ---------------------------------------------------
* 北京法意科技有限公司
* 统一命名空间引用
* JavaScript文件根目录
* 所有JS扩展文件或JS扩展插件必须继承
* @version 1.0.1
* @author 宋杰军（roach888@126.com）
* @date 2015-01-13
* @modify 2015-01-19 宋杰军
*    增加[Lawyee.Storage]本地存储引擎
* @modify 2015-01-20 宋杰军
*    1、对[Lawyee]根下面的类添加注释
*    2、增加[Lawyee.Tools.QueryString]页面参数
*    3、增加[Lawyee.Tools.Goto]链接跳转
*    4、增加[Lawyee.Tips]提示信息
*    5、增加[Lawyee.Tools.Clock]电子时钟
* @modify 2015-01-21 宋杰军
*    增加JSON转换处理类
* ---------------------------------------------------
*/
var Lawyee = {
	/**
	* 版本号
	* @return {String} 版本号
	*/
	version: '1.0.1',
	/**
	* 通用交互处理器
	* @return {Void}
	*/
	AJAX: {},
	/**
	* 通用验证器
	* @return {Void}
	*/
	Vaild: {},
	/**
	* 通用工具箱
	* @return {Void}
	*/
	Tools: { version: '2.0.0' },
	/**
	* 通用转换器
	* @return {Void}
	*/
	Convert: {},
	/**
	* 本地存储器
	* @return {Void}
	*/
	Storage: {},
	/**
	* 通用消息器
	* @return {Void}
	*/
	Tips: {},
	/**
	* 通用盒子UI处理器
	* @return {Void}
	*/
	UIBox: { version: '2.1.0' },
	/**
	* 通用列表UI处理器
	* @return {Void}
	*/
	UIList: { version: '2.1.0' },
	/**
	* 通用导航UI处理器
	* @return {Void}
	*/
	UINav: { version: '1.1.0' },
	/**
	* 通用图表UI处理器
	* @return {Void}
	*/
	UIChart: { version: '2.0.0' },
	/**
	* 通用表格UI处理器
	* @return {Void}
	*/
	UITable: { version: '1.0.0' },
	/**
	* 通用选项卡UI处理器
	* @return {Void}
	*/
	UITab: { version: '1.0.0' },
	/**
	* 通用文件上传UI处理器
	* @return {Void}
	*/
	UIFileload: { version: '1.0.0' },
	/**
	* 通用WEB打印UI处理器
	* @return {Void}
	*/
	UIPrintf: { version: '1.0.0' },
	/**
	* 全局初始化
	* @return {Void}
	*/
	Init: function () {
		//解决IE6-IE7对localStorage本地存储引擎的支持
		if (!window.localStorage && /MSIE/.test(navigator.userAgent)) {
			if (!window.UserData) {
				window.UserData = function (file_name) {
					if (!file_name) file_name = 'user_data_default';
					var dom = document.createElement('input');
					dom.type = 'hidden';
					dom.addBehavior('#default#userData');
					document.body.appendChild(dom);
					dom.save(file_name);
					this.file_name = file_name;
					this.dom = dom;
					return this;
				};
				window.UserData.prototype = {
					setItem: function (k, v) {
						this.dom.setAttribute(k, v);
						this.dom.save(this.file_name);
					},
					getItem: function (k) {
						this.dom.load(this.file_name);
						return this.dom.getAttribute(k);
					},
					removeItem: function (k) {
						this.dom.removeAttribute(k);
						this.dom.save(this.file_name);
					},
					clear: function () {
						this.dom.load(this.file_name);
						var now = new Date();
						now = new Date(now.getTime() - 1);
						this.dom.expires = now.toUTCString();
						this.dom.save(this.file_name);
					}
				};
			}
			window.localStorage = new window.UserData('local_storage');
		}
	}
};
/**
* -----------------------------------------
* 北京法意科技有限公司
* 通用交互处理器
* @version 1.0.0
* @author 宋杰军（roach888@126.com）
* @date 2015-03-11
* -----------------------------------------
*/
Lawyee.AJAX = {
	/**
	* 版本号
	* @return {String} 版本号
	*/
	version: '1.0.0',
	/**
	* 通用交互处理器
	* @param {Object} options 参数选项
	*    @param {PlainObject} accepts 发送的内容类型的请求头告诉服务器什么样的响应将接受的回报，取决于数据类型
	* @return {Object} 调用结果
	*/
	Call: function (options) {
		var defaults = {
			url: null
		};
		if (!Lawyee.Vaild.IsObject(options)) return;
		var settings = $.extend({}, defaults, options);
		$.ajax(settings);
	}
};
/**
* -----------------------------------------
* 北京法意科技有限公司
* 通用验证器
* @version 1.1.0
* @author 宋杰军（roach888@126.com）
* @date 2015-01-13
* -----------------------------------------
*/
Lawyee.Vaild = {
	/**
	* 版本号
	* @return {String} 版本号
	*/
	version: '1.1.0',
	/**
	* 判断是否为URL链接地址
	* @param {String} url URL链接地址
	* @return {Boolean} True/False，是/否
	*/
	IsUrl: function (url) {
		if (typeof url == 'undefined' || null == url || String(url).length <= 0) return false;
		var reg = new RegExp(/^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/);
		url = String(url);
		if (url.indexOf('localhost')) {
			url = url.replace('localhost', '127.0.0.1');
		}
		return reg.test(url);
	},
	/**
	* 判断对象是否为数组
	* @param {Object} obj 检测对象
	* @return {Boolean} True/False，是/否
	*/
	IsArray: function (obj) {
		if (typeof obj != 'undefined' && null != obj && $.isArray(obj) && obj.length > 0) {
			return Object.prototype.toString.call(obj) === '[object Array]';
		}
		return false;
	},
	/**
	* 判断对象是否为为空
	* @param {String} url 检测对象
	* @return {Boolean} True/False，是/否
	*/
	IsNull: function (obj) {
		if (typeof obj == 'undefined' || null == obj || String(obj).length <= 0) {
			return true;
		}
		return false;
	},
	/**
	* 判断对象是否为整型
	* @param {Object} obj 检测对象
	* @return {Boolean} True/False，是/否
	*/
	IsInt: function (obj) {
		obj = parseInt(obj);
		return $.isNumeric(obj);
	},
	/**
	* 判断对象是否为JSON对象
	* @param {Object} obj 检测对象
	* @return {Boolean} True/False，是/否
	*/
	IsObject: function (obj) {
		if (typeof obj == 'undefined' || null == obj || $.isEmptyObject(obj)) return false;
		return true;
	}
};
/**
* -----------------------------------------
* 北京法意科技有限公司
* 通用工具箱
* @version 2.0.0
* @author 宋杰军（roach888@126.com）
* @date 2015-01-13
* -----------------------------------------
*/
/**
* StringBuilder
* 字符串拼装处理器
* @param {Object} arguments 所有输入参数必须为字符串
*    1、当参数长度为1时，参数值将是字符串之间连接的分隔符
*    2、当参数长度大于1时，最后一位将是字符串之间的分隔符，其余的参数将是字符串值
*    3、当不指定参数时，保险箱默认为空白
*    4、可以不指定参数，而在ToString中显式指定分隔符
*    5、调用1：var sb=new Lawyee.Tools.StringBuilder(','); //在ToString时，将使用“,”作为分隔符
*    6、调用2：var sb=new Lawyee.Tools.StringBuilder('a','b','c',','); //在ToString时，将输出：'a,b,c'
* @return {Void}
*/
Lawyee.Tools.StringBuilder = function () {
	this.buffers = [];
	this.length = 0;
	this.splitChar = arguments.length > 0 ? arguments[arguments.length - 1] : '';
	if (arguments.length > 0) {
		for (var i = 0, iLen = arguments.length - 1; i < iLen; i++) {
			this.Append(arguments[i]);
		}
	}
};
Lawyee.Tools.StringBuilder.prototype = {
	/**
	* 向对象中添加字符串
	* @param {String} strValue 需要添加的字符串
	* @return {Void}
	*/
	Append: function (strValue) {
		if (typeof strValue != 'undefined' && null != strValue && String(strValue).length > 0) {
			this.length += strValue.length;
			this.buffers[this.buffers.length] = strValue;
		}
	},
	/**
	* 向对象中添加格式化的字符串
	* @param {Object} formatTag 格式化标记，如：'{0}{1}{2}'
	* @param {Object} arguments 格式化数据
	* @return {Void}
	*/
	AppendFormat: function () {
		if (arguments.length > 1) {
			var TString = arguments[0];
			if (arguments[1] instanceof Array) {
				for (var i = 0, iLen = arguments[1].length; i < iLen; i++) {
					var jIndex = i;
					var re = eval('/\\{' + jIndex + '\\}/g;');
					TString = TString.replace(re, arguments[1][i]);
				}
			}
			else {
				for (var i = 1, iLen = arguments.length; i < iLen; i++) {
					var jIndex = i - 1;
					var re = eval('/\\{' + jIndex + '\\}/g;');
					TString = TString.replace(re, arguments[i]);
				}
			}
			this.Append(TString);
		}
		else if (arguments.length == 1) {
			this.Append(arguments[0]);
		}
	},
	/**
	* 字符串长度
	* @return {Int} 返回当前拼装的字符串长度
	*/
	Length: function () {
		if (!this.IsEmpty()) {
			return this.length + (this.splitChar.length * (this.buffers.length - 1));
		}
		else {
			return this.length;
		}
	},
	/**
	* 字符串是否为空
	* @return {Boolean} 返回 True为空 / False不为空
	*/
	IsEmpty: function () {
		return this.buffers.length <= 0;
	},
	/**
	* 清空字符串
	* @return {Void}
	*/
	Clear: function () {
		this.buffers = [];
		this.length = 0;
	},
	/**
	* 输出字符串
	* @param {String} 可选参数，作为字符串拼装分隔符使用
	* @return {String} 返回字符串拼装结果
	*/
	ToString: function () {
		if (arguments.length == 1) {
			return this.buffers.join(arguments[1]);
		}
		else {
			return this.buffers.join(this.splitChar);
		}
	}
};
/**
* 电子时钟
* @example
*    var clock = new Lawyee.Tools.Clock();
*    clock.Display(docement.getElementById('clock'));
* @return {Void}
*/
Lawyee.Tools.Clock = function () {
	var date = new Date();
	this.year = date.getFullYear();
	this.month = date.getMonth() + 1;
	this.date = date.getDate();
	this.month = this.month < 10 ? '0' + this.month : this.month;
	this.day = new Array('星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六')[date.getDay()];
	this.hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
	this.minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
	this.second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
};
Lawyee.Tools.Clock.prototype = {
	/**
	* 输出全部时间格式字符串
	* @return {String} 时间字符串
	*/
	ToString: function () {
		//var result = '日期：';
		var result = null;
		result += this.year;
		result += '年';
		result += this.month;
		result += '月';
		result += this.date;
		result += '日';
		result += ' ';
		result += this.hour;
		result += ':';
		result += this.minute;
		result += ':';
		result += this.second;
		result += ' ';
		result += this.day;
		return result;
	},
	/**
	* 输出简易时间格式字符串
	* @return {String} 时间字符串
	*/
	ToSimpleDate: function () {
		return this.year + '-' + this.month + '-' + this.date;
	},
	/**
	* 输出详细时间格式字符串
	* @return {String} 时间字符串
	*/
	ToDetailDate: function () {
		return this.year + '-' + this.month + '-' + this.date + ' ' + this.hour + ':' + this.minute + ':' + this.second;
	},
	/**
	* 显示时钟
	* 非jQuery元素对象
	* @param {Object} ele DOM元素对象
	* @return {Void}
	*/
	Display: function (ele) {
		var clock = new Lawyee.Tools.Clock();
		ele.innerHTML = clock.ToString();
		window.setTimeout(function () { clock.Display(ele); }, 1000);
	}
};
/**
* 获取QueryString参数
* URL传参，GET模式
* @param {String} param 参数名称
* @return {String} 参数值
*/
Lawyee.Tools.QueryString = function (param) {
	var reg = new RegExp('(^|&)' + param + '=([^&]*)(&|$)');
	var r = window.location.search.substring(1).match(reg);
	if (null != r) return unescape(r[2]);
	return null;
	//以下为保留待扩展使用方式
	var data = {};
	/**
	* 初始化
	* @return {Void}
	*/
	var Init = function () {
		var aPairs, aTmp;
		var queryString = new String(window.location.search);
		queryString = queryString.substring(1, queryString.length);
		aPairs = queryString.split('&');
		for (var i = 0; i < aPairs.length; i++) {
			aTmp = aPairs[i].split('=');
			data[aTmp[0]] = aTmp[1];
		}
	};
	/**
	* 获得参数值
	* @param {String} param 参数名称
	* @return {String} 指定参数值
	*/
	var GetValue = function (param) {
		return data[param];
	};
	return GetValue(param);
};
/**
* 跳转至指定URL链接地址
* @param {String} url URL地址
* @return {Void}
*/
Lawyee.Tools.Goto = function (url) {
	if (Lawyee.Vaild.IsUrl(url)) {
		window.location.href = url;
	}
};

/**
* 合并数组并去除重复项
* @param {String} {arr1:[],arr2:[],compare:function(i,j){比较逻辑}}
* @return {Void}
*/
Lawyee.Tools.MergeArray = function (params) {
    var initParam = $.extend({
        arr1: [],
        arr2: [],
        compare: function (i, j) {
            return this.arr1[i] == this.arr2[j];
        }
    }, params);
    for (var i = 0; i < initParam.arr1.length; i++) {
        for (var j = 0; j < initParam.arr2.length; j++) {
            if (initParam.arr1.length > 0 && initParam.compare(i, j)) {
                initParam.arr1.splice(i, 1);
            }
        }
    }

    for (var i = 0; i < initParam.arr2.length; i++) {
        initParam.arr1.push(initParam.arr2[i])
    }
    return initParam.arr1;

};
/**
* 显示提示信息
* @param {String} msg
* @return 
*/
Lawyee.Tools.ShowMessage = function (msg) {
    alert(msg);
};


/**
* 页面全屏显示
* @return {Void}
*/
Lawyee.Tools.FullScreen = function () {
	var _width = screen.availWidth;
	var _height = screen.availHeight;
	window.moveTo(0, 0);
	window.resizeTo(_width, _height);
};
/**
* 创建动态Form表单并提交
* @param {Object} options 选项参数
*    @param {String} action 表单提交地址，默认window.location.href
*    @param {String} method 表单提交模式，默认POST
*    @param {String} target 表单提交方式，默认_self
*    @param {Array} data 表单提交数据
*       @param {String} name 数据名称
*       @param {String} value 数据值
*    @param {Function} onSubmit 表单提交事件
* @return {Void}
*/
Lawyee.Tools.Form = function (options) {
	'use strict';
	var url = window.location.href;
	var defaults = {
		action: url,
		method: 'POST',
		target: '_self',
		data: null,
		onSubmit: null
	};
	var settings = $.extend({}, defaults, options);
	/**
	* 初始化
	* @return {Void}
	*/
	var Init = function () {
		'use strict';
		if (!Lawyee.Vaild.IsUrl(settings.action)) {
			settings.action = window.location.href;
		}
		if (Lawyee.Vaild.IsNull(settings.method) || (settings.method != 'POST' || settings.method != 'GET')) {
			settings.method = 'POST';
		}
		if (Lawyee.Vaild.IsNull(settings.target)) {
			settings.target = '_self';
		}
		if (!Lawyee.Vaild.IsArray(settings.data)) {
			settings.data = null;
		}
		if (!$.isFunction(settings.onSubmit)) {
			settings.onSubmit = null;
		}
	};
	/**
	* 创建Form表单对象
	* @return {Object} jQuery元素对象
	*/
	var Create = function () {
		var $form = $('<form></form>');
		if (Lawyee.Vaild.IsArray(settings.data)) {
			$form.prop('action', settings.action);
			$form.prop('method', settings.method);
			$form.prop('target', settings.target);
			for (var i in settings.data) {
				var item = settings.data[i];
				if (!Lawyee.Vaild.IsNull(item.name) && !Lawyee.Vaild.IsNull(item.value)) {
					var $input = $('<input type="text" />')
								  .attr('name', item.name)
								  .attr('value', item.value)
					$form.append($input);
				}
			}
		}
		return $form;
	};
	Init(); //初始化
	var $form = Create();
	$form.ajaxSubmit({
		success: function (data) {
			alert(data);
		}
	});
};
/**
* 页面全屏显示
* @return {Void}
*/
Lawyee.Tools.InsertString = function (strSrc, iLen, strVal) {
	var result = '';
	if (strSrc.length < iLen) {
		result = strSrc + strVal;
	}
	else {
		var s1 = strSrc.substring(0, iLen);
		var s2 = strSrc.substring(iLen, strSrc.length);
		result = s1 + strVal + s2;
	}
	return result;
};
/**
* -----------------------------------------
* 北京法意科技有限公司
* 通用转换器
* @version 2.0.0
* @author 宋杰军（roach888@126.com）
* @date 2015-01-13
* -----------------------------------------
*/
Lawyee.Convert = {
	version: '2.0.0',
	/**
	* 日期格式化处理器
	* @param {Datetime} date 日期时间，默认当前时间
	* @param {String} format 格式化字符串[中文：星期，英文：week]，默认：YYYY-MM-DD
	*    例：YYYY年MM月DD日 hh时mm分ss秒 星期
	*        YYYY/MM/DD hh:mm:ss week
	* @return {String} 返回格式化的字符串
	*
	* 调用例子：
	*    FormatDate(new Date('january 12,2015'));
	*    FormatDate(new Date());
	*    FormatDate('YYYY年MM月DD日 hh时mm分ss秒 星期 YYYY-MM-DD week');
	*    FormatDate(new Date('january 12,2015'),'YYYY年MM月DD日 hh时mm分ss秒 星期 YYYY/MM/DD week');
	*
	* 格式说明：
	*    YYYY：4位年份，如：2015
	*    YY：2位年份，如：15
	*    MM：月份
	*    DD：日期
	*    hh：小时
	*    mm：分钟
	*    ss：秒钟
	*    星期：中文星期全称，如：星期一
	*    周：中文星期简称，如：周一
	*    week：英文星期全称，如：Saturday
	*    www：英文星期简称，如：Sat
	*/
	FormatDate: function (date, format) {
		if (arguments.length < 2 && (!date || !date.getTime)) {
			format = date;
			date = new Date();
		}
		typeof format != 'string' && (format = 'YYYY年MM月DD日 hh时mm分ss秒');
		var week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', '日', '一', '二', '三', '四', '五', '六'];
		return format.replace(/YYYY|YY|MM|DD|hh|mm|ss|星期|周|www|week/g, function (options) {
			switch (options) {
				case 'YYYY': return date.getFullYear();
				case 'YY': return (date.getFullYear() + '').slice(2);
				case 'MM': return date.getMonth() + 1 < 10 ? ('0' + String(date.getMonth() + 1)) : date.getMonth() + 1;
				case 'DD': return date.getDate() < 10 ? ('0' + String(date.getDate())) : date.getDate();
				case 'hh': return date.getHours();
				case 'mm': return date.getMinutes();
				case 'ss': return date.getSeconds();
				case '星期': return '星期' + week[date.getDay() + 7];
				case '周': return '周' + week[date.getDay() + 7];
				case 'week': return week[date.getDay()];
				case 'www': return week[date.getDay().slice(0, 3)];
			}
		});
	},
	/**
	* Base64编码字符串定义
	* @return {String} 字符串
	*/
	base64EncodeChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567899+/',
	/**
	* Base64解码字符串定义
	* @return {Array} 数组
	*/
	base64DecodeChars: new Array(
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
		52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
		-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
		15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
		-1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
		41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1),
	/**
	* Base64编码
	* @param {String} str 需要编码的字符串
	* @return {String} 字符串
	*/
	Base64Encode: function (str) {
		var out, i, len;
		var c1, c2, c3;
		len = str.length;
		i = 0;
		out = '';
		while (i < len) {
			c1 = str.charCodeAt(i++) & 0xff;
			if (i == len) {
				out += this.base64EncodeChars.charAt(c1 >> 2);
				out += this.base64EncodeChars.charAt((c1 & 0x3) << 4);
				out += '==';
				break;
			}
			c2 = str.charCodeAt(i++);
			if (i == len) {
				out += this.base64EncodeChars.charAt(c1 >> 2);
				out += this.base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
				out += this.base64EncodeChars.charAt((c2 & 0xF) << 2);
				out += '=';
				break;
			}
			c3 = str.charCodeAt(i++);
			out += this.base64EncodeChars.charAt(c1 >> 2);
			out += this.base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
			out += this.base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
			out += this.base64EncodeChars.charAt(c3 & 0x3F);
		}
		return out;
	},
	/**
	* Base64解码
	* @param {String} str 需要解码的字符串
	* @return {String} 字符串
	*/
	Base64Decode: function (str) {
		var c1, c2, c3, c4;
		var i, len, out;
		len = str.length;
		i = 0;
		out = '';
		while (i < len) {
			/* c1 */
			do {
				c1 = this.base64DecodeChars[str.charCodeAt(i++) & 0xff];
			} while (i < len && c1 == -1);
			if (c1 == -1) break;
			/* c2 */
			do {
				c2 = this.base64DecodeChars[str.charCodeAt(i++) & 0xff];
			} while (i < len && c2 == -1);
			if (c2 == -1) break;
			out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
			/* c3 */
			do {
				c3 = str.charCodeAt(i++) & 0xff;
				if (c3 == 61) return out;
				c3 = this.base64DecodeChars[c3];
			} while (i < len && c3 == -1);
			if (c3 == -1) break;
			out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
			/* c4 */
			do {
				c4 = str.charCodeAt(i++) & 0xff;
				if (c4 == 61) return out;
				c4 = this.base64DecodeChars[c4];
			} while (i < len && c4 == -1);
			if (c4 == -1) break;
			out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
		}
		return out;
	},
	/**
	* UTF16字符转换为UTF8字符
	* @param {String} str 需要转换的字符串
	* @return {String} 字符串
	*/
	UTF16ToUTF8: function (str) {
		var out, i, len, c;
		out = '';
		len = str.length;
		for (i = 0; i < len; i++) {
			c = str.charCodeAt(i);
			if ((c >= 0x0001) && (c <= 0x007F)) {
				out += str.charAt(i);
			}
			else if (c > 0x07FF) {
				out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
				out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
				out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
			}
			else {
				out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
				out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
			}
		}
		return out;
	},
	/**
	* UTF8字符转换为UTF16字符
	* @param {String} str 需要转换的字符串
	* @return {String} 字符串
	*/
	UTF8ToUTF16: function (str) {
		var out, i, len, c;
		var char2, char3;
		out = '';
		len = str.length;
		i = 0;
		while (i < len) {
			c = str.charCodeAt(i++);
			switch (c >> 4) {
				case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
					// 0xxxxxxx
					out += str.charAt(i - 1);
					break;
				case 12: case 13:
					// 110x xxxx    10xx xxxx
					char2 = str.charCodeAt(i++);
					out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
					break;
				case 14:
					// 1110 xxxx    10xx xxxx    10xx xxxx
					char2 = str.charCodeAt(i++);
					char3 = str.charCodeAt(i++);
					out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
					break;
			}
		}
		return out;
	},
	/**
	* 将字符转换为十六进制
	* @param {String} str 需要转换的字符串
	* @return {String} 字符串
	*/
	CharToHex: function (str) {
		var out, i, len, c, h;
		out = '';
		len = str.length;
		i = 0;
		while (i < len) {
			c = str.charCodeAt(i++);
			h = c.toString(16);
			if (h.length < 2) h = '0' + h;
			out += '\\x' + h + ' ';
			if (i > 0 && i % 8 == 0) out += '\r\n';
		}
		return out;
	},
	/**
	* 字符串编码或加密
	* @param {String} str 需要处理的字符串
	* @return {String} 字符串
	*/
	ToEncode: function (src) {
		return this.Base64Encode(this.UTF16ToUTF8(src));
	},
	/**
	* 字符串解码或解密
	* @param {String} arguments[0] 需要处理的字符串
	* @param {Boolean} arguments[1] 是否转换为十六进制格式
	* @return {String} 字符串
	*/
	ToDecode: function () {
		if (arguments.length == 2) {
			return this.CharToHex(this.Base64Decode(arguments[0]));
		}
		else {
			return this.UTF8ToUTF16(this.Base64Decode(arguments[0]));
		}
	},
	/**
	* 将对象转换为JSON对象
	* @param {Object} obj 需要转换的对象
	* @return {Object} JSON对象
	*/
	ToJson: function (obj) {
		if (obj) {
			var result = '(';
			result += obj;
			result += ')';
			return eval(result);
		}
	},
	/**
	* 将对象转换为数组对象
	* @param {Object} obj 需要转换的对象
	* @return {Array} 数组对象
	*/
	ToArray: function (obj) {
		if (!obj) return;
		obj = String(obj);
		var result = '';
		if (obj.substring(0, 1) != '[' || obj.substring(obj.length - 1, 1) != ']') {
			result = '[';
			result += obj;
			result += ']';
		}
		return eval(result);
	}
};
/**
* -----------------------------------------
* 北京法意科技有限公司
* 本地存储器
* IE6-IE7采用UserData实现
* @version 1.0.0
* @author 宋杰军（roach888@126.com）
* @date 2015-01-19
* -----------------------------------------
*/
Lawyee.Storage = {
	version: '1.0.0',
	/**
	* 添加
	* @param {String) k 键
	* @param {Object) v 值
	* @return {Void}
	*/
	set: function (k, v) {
		var result = Lawyee.Convert.ToEncode(v);
		Lawyee.Storage.remove(k);
		window.localStorage.setItem(k, result);
	},
	/**
	* 获取
	* @param {String) k 键
	* @return {Object} 值
	*/
	get: function (k) {
		var result = window.localStorage.getItem(k);
		result = Lawyee.Convert.ToDecode(result);
		return result;
	},
	/**
	* 移除
	* @param {String) k 键
	* @return {Void}
	*/
	remove: function (k) {
		window.localStorage.removeItem(k);
	},
	/**
	* 清空
	* @return {Void}
	*/
	clear: function () {
		window.localStorage.clear();
	}
};
/**
* -----------------------------------------
* 北京法意科技有限公司
* 通用消息器
* @version 1.0.0
* @author 宋杰军（roach888@126.com）
* @date 2015-01-20
* -----------------------------------------
*/
Lawyee.Tips = {
	version: '1.0.0',
	/**
	* 成功的
	* @return {String} 提示信息
	*/
	SucChs: '操作成功！',
	SucEng: 'success',
	/**
	* 失败的
	* @return {String} 提示信息
	*/
	FaiChs: '操作失败！请重试！',
	FaiEng: 'failing',
	/**
	* 错误的
	* @return {String} 提示信息
	*/
	ErrChs: '出错啦！请重试或联系管理员！',
	ErrEng: 'error',
	/**
	* 取消的
	* @return {String} 提示信息
	*/
	CanChs: '您取消了本次操作！',
	CanEng: 'cancel',
	/**
	* 相同的
	* @return {String} 提示信息
	*/
	AddChs: '已存在相同数据！',
	AddEng: 'added',
	/**
	* 无效的
	* @return {String} 提示信息
	*/
	IllChs: '您的操作有误，请重试！',
	IllEng: 'illegal',
	/**
	* 验证码
	* @return {String} 提示信息
	*/
	CodeChs: '您输入的验证码不正确！',
	CodeEng: 'The verification code you entered is not correct!',
	/**
	* Nothing
	* @return {String} 提示信息
	*/
	NothChs: '我是北京法意科技有限公司，我为自己代言。',
	NothEng: 'nothing'
};
/**
* 全局初始化
* @return {Void}
*/
Lawyee.Init();
/**
* jQuery对象集成扩展处理
* @return {Void}
*/
; (function ($, window, document, undefined) {
	$.extend({
		lyIsUrl: Lawyee.Vaild.IsUrl,
		lyIsArray: Lawyee.Vaild.IsArray,
		lyIsNull: Lawyee.Vaild.IsNull,
		lyIsInt: Lawyee.Vaild.IsInt,
		lyIsObject: Lawyee.Vaild.IsObject,
		lyEvalJson: Lawyee.Convert.ToJson,
		lyEvalArray: Lawyee.Convert.ToArray,
		lyTips : Lawyee.Tips,
		lyInsertString : Lawyee.Tools.InsertString,
		lyBase64Encode : Lawyee.Convert.Base64Encode,
		lyBase64Decode : Lawyee.Convert.Base64Decode
	});
})(jQuery, window, document);
