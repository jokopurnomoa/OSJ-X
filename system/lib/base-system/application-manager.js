/**
 * Created with JetBrains PhpStorm.
 * User: JOKO PURNOMO A
 * Date: 4/26/15
 * Time: 3:37 PM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

function ApplicationManager(){

    this.CREATE     = 101;
    this.INITIALIZE = 111;
    this.OPEN      = 121;
    this.UNFOCUS   = 131;
    this.FOCUS     = 141;
    this.MINIMIZE   = 151;
    this.MAXIMIZE   = 161;
    this.CLOSE      = 171;
    this.DESTROY   = 181;
    this.UNFOCUS_ALL   = 191;

    this.appsQueue = [];
    this.startQueue = -1;
    this.stopQueue = -1;
    this.PID = 0;
    this.isProcessing = false;
    this.appsRunning = [];
    this.maxZIndex = 9;

    this.defaultAppsName = 'Finder';

    this.enqueue = function(obj, opt){
        if(this.startQueue == -1 && this.stopQueue == -1){
            this.startQueue = 0;
            this.stopQueue = 0;
        } else {
            this.stopQueue++;
        }

        this.appsQueue[this.stopQueue] = [obj, opt];
    };

    this.dequeue = function(){
        if((this.startQueue >= -1 && this.stopQueue >= -1) && (this.startQueue <= this.stopQueue)){
            return this.appsQueue[this.startQueue++];
        }
        return null;
    };

    this.printQueue = function(){
        alert(JSON.stringify(this.appsQueue));
    };

    this.getAppsRunningById = function(appsId){
        for(var i=0;i<this.appsRunning.length;i++){
            if(this.appsRunning[i] != null){
                if(this.appsRunning[i].appsId == appsId){
                    return this.appsRunning[i];
                }
            }
        }
        return null;
    };

    this.startManager = function(){
        var $this = this;
        $('#apps-name-container .apps-menu-name').html(this.defaultAppsName).show();
        var intProcess = setInterval(function(){
            if(!$this.isProcessing){
                var cmd = $this.dequeue();
                if(cmd != null){
                    var apps = cmd[0];
                    var opt = cmd[1];

                    if(opt == $this.OPEN){
                        var appsMem = $this.getAppsRunningById(apps.appsId);
                        if(appsMem == null){
                            $this.isProcessing = true;
                            setTimeout(function(){
                                $this.create(apps);
                                $this.init(apps);
                            }, 1);
                            setTimeout(function(){
                                $this.open(apps);
                            }, 50);
                        } else {
                            if(appsMem.appsStatus == AppStatus.UNFOCUSED){
                                $this.focus(appsMem);
                            } else if(appsMem.appsStatus == AppStatus.MINIMIZED){
                                $this.openMinimize(appsMem);
                            }
                        }
                    } else if(opt == $this.MINIMIZE){
                        $this.minimize(apps);
                    } else if(opt == $this.CLOSE){
                        $this.close(apps);
                    } else if(opt == $this.FOCUS){
                        $this.focus(apps);
                    } else if(opt == $this.UNFOCUS){
                        $this.unfocus(apps);
                    } else if(opt == $this.UNFOCUS_ALL){
                        $this.unfocusAll();
                    }
                }
            }
        }, 10);
    };

    this.addMainMenuItem = function(apps, value, icon, callback){
        if(apps.mainMenu == null){
            apps.mainMenu = [];
            apps.mainMenu[0] = [Application.generateSubmenuItem('main', value, icon), callback];
        } else {
            apps.mainMenu[apps.mainMenu.length] = [Application.generateSubmenuItem('main', value, icon), callback];
        }
    };

    this.create = function(apps){
        this.isProcessing = true;
        apps.PID = this.PID++;
        this.appsRunning[apps.PID] = apps;
        if(typeof apps.create === 'function'){
            apps.create();
            console.log('create apps.');
        }
        apps.appsStatus = AppStatus.CREATED;
        this.isProcessing = false;
    };

    this.init = function(apps){
        this.isProcessing = true;
        var $this = this;
        this.addMainMenuItem(apps, 'Quit', null, function(){
            $this.close(apps);
        });

        Application.destroyMenu();
        Application.createMainMenu(apps.appsName, apps.mainMenu);
        Application.createMenu(apps.menu);

        this.focus(apps);

        $('#apps-name-container .apps-menu-name').html(apps.appsName);
        if(typeof apps.init === 'function'){
            apps.init();
            var sel = '#' + apps.appsId.replace(/\./g, '-');

            var UI = new UserInterface();
            UI.makeDraggable(sel);
            UI.makeResizable(sel);
            this.destroyObject(UI);

            console.log('init apps.');
        }
        apps.appsStatus = AppStatus.INITIALIZED;
        this.isProcessing = false;
    };

    this.open = function(apps){
        this.isProcessing = true;
        var $this = this;
        var sel = '#' + apps.appsId.replace(/\./g, '-');
        var screenWidth = $(document).width();
        var screenHeight = $(document).height();
        var appsWidth = $(sel).width();
        var appsHeight = $(sel).height();
        var leftPos = (screenWidth - appsWidth) / 2;
        var topPos = (screenHeight - appsHeight) / 2;
        $(sel).css({left : leftPos + 'px', top : -appsHeight});
        var animSpeed = 400;
        $(sel).animate({top : topPos + 'px'}, animSpeed);
        setTimeout(function(){
            if(typeof apps.open === 'function'){
                apps.open();
            }
            apps.appsStatus = AppStatus.OPENED;
            $this.isProcessing = false;
            $this.focus(apps);
        }, animSpeed);
    };

    this.focus = function(apps){
        this.isProcessing = true;
        this.unfocusAll();
        System.setBaseFocus(false);
        Application.setFocusHeaderButton(apps.appsId);

        if(this.maxZIndex > 20){
            this.maxZIndex = 9;
            $('.com-jpa-system-apps').css({'z-index' : this.maxZIndex++})
        }

        Application.destroyMenu();
        Application.createMainMenu(apps.appsName, apps.mainMenu);
        Application.createMenu(apps.menu);

        $('#'+apps.appsId.replace(/\./g, '-')).css({'z-index' : this.maxZIndex++});
        apps.appsStatus = AppStatus.FOCUSED;
        if(typeof apps.focus === 'function'){
            apps.focus();
        }
        this.isProcessing = false;
    };

    this.unfocus = function(apps){
        this.isProcessing = true;
        apps.appsStatus = AppStatus.UNFOCUSED;
        if(typeof apps.unfocus === 'function'){
            apps.unfocus();
        }
        this.isProcessing = false;
    };

    this.minimize = function(apps){
        this.isProcessing = true;
        var $this = this;
        var sel = '#' + apps.appsId.replace(/\./g, '-');
        var screenWidth = $(document).width();
        var screenHeight = $(document).height();
        var appsWidth = $(sel).width();
        var appsHeight = $(sel).height();
        var leftPos = (screenWidth - appsWidth) / 2;
        var topPos = (screenHeight - appsHeight) / 2;
        var animSpeed = 400;
        $(sel).animate({width : '0px', height : '0px', opacity : '0', top : (screenHeight-55) + 'px', left:(leftPos+(appsWidth/2)) + 'px'}, animSpeed);
        setTimeout(function(){
            apps.appsStatus = AppStatus.MINIMIZED;
            if(typeof apps.minimize === 'function'){
                apps.minimize();
            }
            $(sel).hide();
            Application.destroyMenu();
            $('#apps-name-container .apps-menu-name').html($this.defaultAppsName);
            $this.isProcessing = false;
        }, animSpeed);
    };

    this.openMinimize = function(apps){
        this.isProcessing = true;
        apps.appsStatus = AppStatus.FOCUSED;
        var $this = this;
        var sel = '#' + apps.appsId.replace(/\./g, '-');
        var screenWidth = $(document).width();
        var screenHeight = $(document).height();
        var leftPos = (screenWidth - apps.appsWidth) / 2;
        var topPos = (screenHeight - apps.appsHeight) / 2;
        var animSpeed = 400;
        var appsWidth = 600;
        var appsHeight = 400;
        if(typeof apps.appsWidth === 'number' && typeof apps.appsHeight === 'number'){
            appsWidth = apps.appsWidth;
            appsHeight = apps.appsHeight;
        }
        if(typeof apps.posX === 'number' && typeof apps.posY === 'number'){
            topPos = apps.posY;
            leftPos = apps.posX;
        }
        $(sel).show();
        $(sel).animate({width : appsWidth + 'px', height : appsHeight + 'px', opacity : '1', top : topPos + 'px', left : leftPos + 'px'}, animSpeed);

        Application.destroyMenu();
        Application.createMainMenu(apps.appsName, apps.mainMenu);
        Application.createMenu(apps.menu);

        setTimeout(function(){
            apps.appsStatus = AppStatus.OPENED;
            $this.focus(apps);
            if(typeof apps.maximize === 'function'){
                apps.maximize();
            }
            $this.isProcessing = false;
        }, animSpeed);
    };

    this.close = function(apps){
        this.isProcessing = true;
        var $this = this;
        var sel = '#' + apps.appsId.replace(/\./g, '-');
        var appsHeight = $(sel).height() + 20;
        var animSpeed = 400;
        $(sel).animate({top : -appsHeight + 'px'}, animSpeed);
        setTimeout(function(){
            if(typeof apps.close === 'function'){
                apps.close();
            }
            apps.appsStatus = AppStatus.CLOSED;
            $this.destroy(apps);
            $this.isProcessing = false;
        }, animSpeed);

    };

    this.destroy = function(apps){
        this.isProcessing = true;
        $('#apps-name-container .apps-menu-name').html(this.defaultAppsName);
        if(typeof this.appsRunning[apps.PID] === 'object'){
            this.appsRunning[apps.PID] = null;
            var appsId = apps.appsId.replace(/\./g, '-');
            $('#' + appsId).remove();
            apps.appsStatus = AppStatus.DESTROYED;
            Application.destroyMenu();
        }
        if(typeof apps.destroy === 'function'){
            apps.destroy();
        }
        this.isProcessing = false;
    };

    this.unfocusAll = function(){
        System.setBaseFocus(true);
        Application.resetMenu();
        for(var i=0; i<this.appsRunning.length; i++){
            if(this.appsRunning[i] != null){
                if(this.appsRunning[i].appsStatus == AppStatus.OPENED || this.appsRunning[i].appsStatus == AppStatus.FOCUSED){
                    AppManager.enqueue(this.appsRunning[i], AppManager.UNFOCUS);
                    Application.setUnfocusHeaderButton(this.appsRunning[i].appsId);
                }
            }
        }
    };

    this.destroyObject = function(obj){
        obj = null;
    }
}

var AppManager = new ApplicationManager();

$(document).ready(function(){
    setTimeout(function(){
        AppManager.startManager();
    }, 1000);
});
