;
(function($, window, document, undefined) {
    var AppQrCode= function(els,option) {
        this.$element = els;
        this.defaultCss = {
            'top': '25%', 
            'left': '35%',
            'width': '400px',
            'height': '380px',
            'backgroundColor': '#FFFFFF',
            'zIndex': '99999'
        };
        this.defaultHmtl = " <div class=\"content_comment_head\"><table><tr><td class=\"info\">APP二维码</td><td class=\"close\"><img style=\"cursor: pointer;\" onclick=\" $('"+this.$element.selector+"').hide();\" alt=\"点击关闭二维码扫描\" src=\"/Assets/img/content/content_comment_close.png\" /></td></tr></table></div><div class=\"content_comment_body\"><div id=\"tdcApp\" style=\"height: 200px; width: 200px; margin: 20px 50px; text-align: center;\"><img src=\"/MobilePage/images/cpwswApp.png\" width=\"300px\" heigth=\"300px\"/></div></div>";
        this.options = $.extend({}, this.defaultHmtl,this.defaultCss, option);
    }
    AppQrCode.prototype= {
        init: function() {
           this.$element.append(this.defaultHmtl);
            return this.$element.css({
                'top': this.options.top,
                'left': this.options.left,
                'width': this.options.width,
                'height': this.options.height,
                'background-color': this.options.backgroundColor,
                'z-index': this.options.zIndex
            });
        },
        QrCodeReader: function() {
           // var url = "http://" + window.location.host + "Html_Pages/MobilePage/mobile.html";
           // var qrcode = new QRCode(document.getElementById("tdcApp"), {
           //     width: 240, //设置宽高
           //     height: 240
           // });
           // qrcode.makeCode(url);
        }
    }
    $.fn.MobileAppQrCode= function(options) {
        var qrCode = new AppQrCode(this, options);
        qrCode.init();
        qrCode.QrCodeReader();
    }
})(jQuery, window, document);