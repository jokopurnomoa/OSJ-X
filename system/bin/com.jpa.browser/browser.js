/**
 * Created with JetBrains PhpStorm.
 * User: JOKO PURNOMO A
 * Date: 4/27/15
 * Time: 12:21 AM
 * To change this template use File | Settings | File Templates.
 */

function ComJpaBrowser(){
    this.appsName = 'Browser';
    this.appsId = 'com.jpa.browser';
    this.icon = 'images/icon.png';
    this.appsversion = '1.0';
    this.dateCreated = '2015/04/26';
    this.creator = 'Joko Purnomo A';
    this.baseSelector = '#com-jpa-browser';
    this.isService = false;
    this.appsWidth = 800;
    this.appsHeight = 500;
    this.minWidth = 300;
    this.minHeight = 100;
    this.posX = Application.getCenterPosition(this.appsWidth, this.appsHeight)[0];
    this.posY = Application.getCenterPosition(this.appsWidth, this.appsHeight)[1];
    this.appsStatus = AppStatus.DESTROYED;
    this.PID = -1;
    this.repaintSpeed = 500;
    this.mouseDown = false;
    this.updateInterval = null;
    this.urlFocus = false;
    this.isSearching = false;

    this.urlHistory = ['system/bin/com.jpa.browser/blank.html'];
    this.idUrlHistory = 0;

    this.create = function(){
        Application.loadStyle('system/bin/com.jpa.browser/browser.css');
        Application.generateContainer(this.appsId);
        Application.generateHeaderCustom(this.appsId, 35);
        Application.generateHeaderButton(this.appsId, [Application.CLOSE_BUTTON, Application.MAXIMIZE_BUTTON, Application.MINIMIZE_BUTTON]);
        Application.generateContent(this.appsId, '<div id="com-jpa-browser-content"><iframe src="system/bin/com.jpa.browser/blank.html" id="com-jpa-browser-content-iframe" onload="new ComJpaBrowser().onLoadHandler();"></iframe></div>');
        Application.setContainerSize(this.appsId, this.appsWidth, this.appsHeight);
        $('#com-jpa-browser-header').append('<div id="com-jpa-browser-btn-prev"><img src="system/bin/com.jpa.browser/images/arrow-left.png"></div>');
        $('#com-jpa-browser-header').append('<div id="com-jpa-browser-btn-next"><img src="system/bin/com.jpa.browser/images/arrow-right.png"></div>');
        $('#com-jpa-browser-header').append('<input type="text" id="com-jpa-browser-url">');
        $('#com-jpa-browser-header').append('<img src="system/bin/com.jpa.browser/images/loading.gif" id="com-jpa-browser-loading">');
        $('#com-jpa-browser').append('<div id="com-jpa-browser-iframe-protector" style="display:block;background: rgba(0,0,0,0);position: absolute;top: 36px"></div>');
    };

    this.init = function(){
        var $this = this;
        $(document).ready(function(){
            $('#com-jpa-browser-content').mousedown(function(){
                AppManager.enqueue(AppManager.getAppsRunningById($this.appsId.replace(/\-/g, '.')), AppManager.FOCUS);
                System.setBaseFocus(true);
            });

            $('#com-jpa-browser-content').keydown(function(evt){
                switch(evt.keyCode){
                    case 9 : {
                        // TAB
                        evt.preventDefault();
                        alert($this.getContent());
                    }break;
                }
            });

            $('#com-jpa-browser-url').keydown(function(evt){
                switch(evt.keyCode){
                    case 13 : {
                        // NEWLINE
                        var url = $('#com-jpa-browser-url').val();
                        url = $this.cleanUrl(url);
                        var saveUrl = url;
                        console.log(url.substr(url.length-1, 1));
                        if(url.substr(url.length-1, 1) == '/'){
                            saveUrl = saveUrl.substr(0, saveUrl.length-1);
                        }

                        if(saveUrl != '' && $this.urlHistory[$this.idUrlHistory] != saveUrl){
                            $this.urlHistory[++$this.idUrlHistory] = saveUrl;
                        }

                        $this.search();
                    }break;
                }
            }).focus(function(){
                    $this.urlFocus = true;
                }).blur(function(){
                    $this.urlFocus = false;
                });


            $('#com-jpa-browser-btn-prev').click(function(){
                if($this.idUrlHistory > 0){
                    $this.setUrl($this.urlHistory[--$this.idUrlHistory]);
                    $this.search(false);
                }
            });

            $('#com-jpa-browser-btn-next').click(function(){
                if($this.idUrlHistory < $this.urlHistory.length-1){
                    $this.setUrl($this.urlHistory[++$this.idUrlHistory]);
                    var url = $('#com-jpa-browser-url').val();
                    url = $this.cleanUrl(url);
                    if(url != ''){
                        $this.urlHistory[$this.idUrlHistory] = url;
                    }
                    $this.search(true);
                }
            });

            $('#com-jpa-browser-loading').mouseover(function(){
                $(this).attr('src', 'system/bin/com.jpa.browser/images/stop.png');
            }).mouseout(function(){
                    $(this).attr('src', 'system/bin/com.jpa.browser/images/loading.gif');
                }).click(function(){
                    var iframe = document.getElementsByTagName('iframe')[0];
                    iframe.contentWindow.document.close();
                });


            $this.makeEditable();
            $this.fixBrowserContent();
        });
    };
    this.open = function(){
        this.updateUrl();
    };
    this.focus = function(){
        setTimeout(function(){
            $('#com-jpa-browser-url').focus();
            $('#com-jpa-browser-iframe-protector').hide();
        }, 100);
    };
    this.unfocus = function(){
        $('#com-jpa-browser-iframe-protector').show();
    };
    this.minimize = function(){};
    this.close = function(){
        clearInterval(this.updateInterval);
    };
    this.destroy = function(){};

    this.makeEditable = function(){
        var $this = this;
        $(document).ready(function(){
            $('#com-jpa-browser-content').bind('mousedown.ui-disableSelection selectstart.ui-disableSelection', function(e){
                e.stopImmediatePropagation();
            });
        });
    }

    this.fixBrowserContent = function(){
        var $this = this;
        $(document).ready(function(){
            function update(){
                if($this.appsStatus == AppStatus.FOCUSED){
                    $this.repaintSpeed = 1;
                } else {
                    $this.repaintSpeed = 100;
                }

                var appsWidth = $('#com-jpa-browser').width();
                var appsHeight = $('#com-jpa-browser').height();
                var headerHeight = $('#com-jpa-browser-header').height();
                $('#com-jpa-browser-content').width(appsWidth).height(appsHeight - (headerHeight));
                $('#com-jpa-browser-url').width(appsWidth - 340);

                $('#com-jpa-browser-iframe-protector').width(appsWidth).height(appsHeight - (headerHeight));

                setTimeout(function(){
                    update();
                },$this.repaintSpeed);
            }
            update();

            $('#com-jpa-browser-iframe-protector').hide();

            $('#com-jpa-browser').on( "resizestart", function( event, ui ) {
                $('#com-jpa-browser-iframe-protector').show();
            } );

            $('#com-jpa-browser').on( "resizestop", function( event, ui ) {
                $('#com-jpa-browser-iframe-protector').hide();
            } );

            $('#com-jpa-browser').on( "dragstart", function( event, ui ) {
                $('#com-jpa-browser-iframe-protector').show();
            } );

            $('#com-jpa-browser').on( "dragstop", function( event, ui ) {
                $('#com-jpa-browser-iframe-protector').hide();
            } );
        });
    }

    this.loadIFrame = function(url, content){
        var iframe = document.getElementsByTagName('iframe')[0];
        var html = '';
        iframe.src = url;
        if(content != ''){
            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(content);
            iframe.contentWindow.document.close();
        }

    }

    this.search = function(){
        var url = $('#com-jpa-browser-url').val();
        url = this.cleanUrl(url);

        $('#com-jpa-browser-loading').show();
        $('#com-jpa-browser-iframe-protector').hide();

        if(url.indexOf('http://') == -1){
            url = 'http://' + url;
        }
        var $this = this;
        $this.isSearching = true;
        if(url.indexOf('https:') > -1){
            $(document).ready(function(){
                $.post('system/bin/com.jpa.browser/get-content.php?url=' + url).done(function(data){
                    console.log(data);

                    $this.loadIFrame(url, data);
                });

            })
        } else {
            $this.loadIFrame(url, '');
        }

    }

    this.updateUrl = function(){
        var $this = this;
        $(document).ready(function(){
            var iframe = document.getElementsByTagName('iframe')[0];

            $this.updateInterval = setInterval(function(){
                if(!$this.urlFocus){
                    if($this.isSearching){
                        var url = iframe.contentWindow.location.href;
                        url = $this.cleanUrl(url);

                        var saveUrl = url;
                        if(url.substr(url.length-1, 1) == '/'){
                            saveUrl = saveUrl.substr(0, saveUrl.length-1);
                        }

                        if($this.urlHistory[$this.idUrlHistory] != saveUrl){
                            $this.urlHistory[++$this.idUrlHistory] = saveUrl;
                        }

                        $this.setUrl(url);
                    }
                }

                if($this.urlHistory.length > 1){
                    if($this.idUrlHistory > 0){
                        $('#com-jpa-browser-btn-prev img').fadeTo(0, 1);
                    } else {
                        $('#com-jpa-browser-btn-prev img').fadeTo(0, 0.3);
                    }

                    if($this.idUrlHistory <= $this.urlHistory.length-2){
                        $('#com-jpa-browser-btn-next img').fadeTo(0, 1);
                    } else {
                        $('#com-jpa-browser-btn-next img').fadeTo(0, 0.3);
                    }
                } else {
                    $('#com-jpa-browser-btn-prev img, #com-jpa-browser-btn-next img').fadeTo(0, 0.3);
                }
            }, 100);
        });
    }

    this.cleanUrl = function(url){
        if(url.indexOf('system/bin/com.jpa.browser/blank.html') == -1){
            url = url.replace('https://', '');
            url = url.replace('http://', '');
            url = url.replace('https:', '');
            url = url.replace('http:', '');
        } else {
            url = '';
        }
        return url;
    }

    this.setUrl = function(url){
        if(url.indexOf('system/bin/com.jpa.browser/blank.html') == -1){
            $('#com-jpa-browser-url').val(url);
        } else {
            $('#com-jpa-browser-url').val('');
        }
    }

    this.onLoadHandler = function(){
        $('#com-jpa-browser-loading').hide();
    }

}