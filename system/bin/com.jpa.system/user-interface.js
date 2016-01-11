/**
 * Created with JetBrains PhpStorm.
 * User: JOKO PURNOMO A
 * Date: 4/26/15
 * Time: 10:54 AM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

function UserInterface(){

    this.backgroundDirectory = 'system/var/images/background/';
    this.backgroundImage = 'bg.jpg';
    this.backgroundWidth = 0;
    this.backgroundHeight = 0;

    this.run = function(){
        this.initUI();
    };

    this.initUI = function(){
        $('head').append('<link rel="stylesheet" type="text/css" href="system/bin/com.jpa.system/user-interface.css">');
        this.setBackground();
        this.responsiveBackground();
    };

    this.setBackground = function(){
        $('#base-container').prepend('<div id="com-jpa-system-desktop-input" contenteditable="true"></div>');
        $('#base-container').prepend('<div id="com-jpa-system-background-protector"></div>');
        $('#base-container').prepend('<div id="com-jpa-system-icon-loader"></div>');
        $('#com-jpa-system-icon-loader').append('<img src="system/bin/com.jpa.system/img/close-btn-hover.png">');
        $('#com-jpa-system-icon-loader').append('<img src="system/bin/com.jpa.system/img/maximize-btn-hover.png">');
        $('#com-jpa-system-icon-loader').append('<img src="system/bin/com.jpa.system/img/minimize-btn-hover.png">');
        $('#base-container').prepend('<img src="'+this.backgroundDirectory+''+this.backgroundImage+'" id="com-jpa-system-background">');

        var $this = this;

        setTimeout(function(){
            var screenWidth = $(document).width();
            var screenHeight = $(document).height();
            var bgWidth = $('#com-jpa-system-background').width();
            var bgHeight = $('#com-jpa-system-background').height();

            $this.backgroundWidth = bgWidth;
            $this.backgroundHeight = bgHeight;

            var scale = screenWidth / bgWidth;
            var scaleWidth = screenWidth;
            var scaleHeight = bgHeight * scale;

            if(scaleHeight >= screenHeight){
                $('#com-jpa-system-background').css({width : screenWidth + 'px', height : 'auto'});
            } else {
                $('#com-jpa-system-background').css({width : 'auto', height : screenHeight + 'px'});
            }

            $('#top-container').show();
            var loadingTime = 1000;
            setTimeout(function(){
                $('#login-container').hide();
            }, loadingTime);

        }, 100);

        $('#com-jpa-system-background-protector').mousedown(function(){
            $('#com-jpa-system-desktop-input').focus();
            AppManager.enqueue(null, AppManager.UNFOCUS_ALL);
            System.setBaseFocus(true);
        });
    };

    this.responsiveBackground = function(){
        var $this = this;

        setInterval(function(){
            var screenWidth = $(document).width();
            var screenHeight = $(document).height();

            var scale = screenWidth / $this.backgroundWidth;
            //var scaleWidth = screenWidth;
            var scaleHeight = $this.backgroundHeight * scale;

            if(scaleHeight >= screenHeight){
                $('#com-jpa-system-background').css({width : screenWidth + 'px', height : 'auto'});
            } else {
                $('#com-jpa-system-background').css({width : 'auto', height : screenHeight + 'px'});
            }
        },500);
    };

    this.makeDraggable = function(selector){
        $(document).ready(function(){
            setTimeout(function(){
                $( selector ).draggable({

                    stop: function( event, ui ) {
                        if($(this).position().top > ($(document).height() - 50)){
                            $(this).css({top : ($(document).height() - 90)+'px'});
                        }
                        if($(this).position().top < 0){
                            $(this).css({top : (25)+'px'});
                        }
                        if(($(this).position().left + $(this).width()) < 30){
                            $(this).css({left : (30 - $(this).width())+'px'});
                        }
                        if(($(this).position().left) > ($(document).width() - 30)){
                            $(this).css({left : ($(document).width() - 30)+'px'});
                        }

                        var apps = AppManager.getAppsRunningById(selector.substr(1, selector.length-1).replace(/\-/g, '.'));
                        if(typeof apps.posX === 'number' && typeof apps.posY === 'number'){
                            apps.posX = $(this).position().left;
                            apps.posY = $(this).position().top;
                        }
                    }
                });
            }, 100);
        });
    };

    this.makeResizable = function(selector){
        $(document).ready(function(){
            setTimeout(function(){
                var apps = AppManager.getAppsRunningById(selector.substr(1, selector.length-1).replace(/\-/g, '.'));
                var minWidth = 100;
                var minHeight = 100;
                if(typeof apps.minWidth === 'number' && typeof apps.minHeight === 'number'){
                    minWidth = apps.minWidth;
                    minHeight = apps.minHeight;
                }
                $( selector ).resizable({
                    minWidth : minWidth,
                    minHeight : minHeight,
                    handles: "n, e, s, w",

                    start : function(){
                        $( selector ).resizable({
                            maxWidth: $(document).width(),
                            maxHeight: $(document).height() - 85
                        });


                    },

                    stop : function(){
                        var apps = AppManager.getAppsRunningById(selector.substr(1, selector.length-1).replace(/\-/g, '.'));
                        if(typeof apps.appsWidth === 'number' && typeof apps.appsHeight === 'number'){
                            apps.appsWidth = $( selector ).width();
                            apps.appsHeight = $( selector ).height();
                        }

                        if(typeof apps.posX === 'number' && typeof apps.posY === 'number'){
                            apps.posX = $(selector).position().left;
                            apps.posY = $(selector).position().top;
                        }
                    }
                });


            }, 100);
        });
    };

    this.preventDoubleClick = function(sel) {
        $(sel).on('click', function(e){
            var $el = $(this);
            if($el.data('clicked')){
                // Previously clicked, stop actions
                e.preventDefault();
                e.stopPropagation();
            }else{
                // Mark to ignore next click
                $el.data('clicked', true);
                // Unmark after 1 second
                window.setTimeout(function(){
                    $el.removeData('clicked');
                }, 1000)
            }
        });
        return this;
    };


}
