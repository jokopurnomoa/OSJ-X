/**
 * Created with JetBrains PhpStorm.
 * User: JOKO PURNOMO A
 * Date: 4/26/15
 * Time: 3:37 PM
 * To change this template use File | Settings | File Templates.
 */


'use strict';

/*
// application base
function ApplicationName(){

    this.appsId = 'com.jpa.terminal';
    this.icon = 'images/icon.png';
    this.appsversion = '1.0';
    this.dateCreated = '2015/04/26';
    this.creator = 'Joko Purnomo A';
    this.baseSelector = '#com-jpa-terminal';
    this.isService = false;
    this.appsWidth = 600;
    this.appsHeight = 400;
    this.appsStatus = AppStatus.DESTROYED;
    this.PID = -1;

    this.create = function(){};
    this.init = function(){};
    this.open = function(){};
    this.focus = function(){};
    this.unfocus = function(){};
    this.minimize = function(){};
    this.close = function(){};
    this.destroy = function(){};
}
*/

function ApplicationBase(){

    this.CLOSE_BUTTON = 1;
    this.MAXIMIZE_BUTTON = 2;
    this.MINIMIZE_BUTTON = 3;

    this.loadStyle = function(stylePath){
        $('head').append('<link rel="stylesheet" type="text/css" href="' + stylePath + '">');
    };

    this.generateContainer = function(appsId){
        appsId = appsId.replace(/\./g, '-');
        $('#apps-container').append('<div id="' + appsId + '" class="com-jpa-system-apps"></div>');
        $('#' + appsId).mousedown(function(){
            AppManager.enqueue(AppManager.getAppsRunningById(appsId.replace(/\-/g, '.')), AppManager.FOCUS);
        });

    };

    this.generateHeader = function(appsId){
        appsId = appsId.replace(/\./g, '-');
        $('#' + appsId).append('<div class="com-jpa-system-apps-header" id="' + appsId + '-header"></div>');
    };

    this.generateHeaderCustom = function(appsId, height){
        appsId = appsId.replace(/\./g, '-');
        $('#' + appsId).append('<div class="com-jpa-system-apps-header-custom" id="' + appsId + '-header"></div>');
        $('#' + appsId + '-header').css({height : height + 'px'});
    };

    this.generateHeaderButton = function(appsId, button){
        if(typeof button === 'object'){
            appsId = appsId.replace(/\./g, '-');
            $('#' + appsId + '-header').append('<div class="com-jpa-system-apps-group-btn" id="' + appsId + '-group-btn"></div>');
            button = button.sort();
            for(var i=0; i < button.length; i++){
                if(button[i] == this.CLOSE_BUTTON){
                    this.addCloseButton(appsId);
                } else if(button[i] == this.MAXIMIZE_BUTTON){
                    this.addMaximizeButton(appsId);
                } else if(button[i] == this.MINIMIZE_BUTTON){
                    this.addMinimizeButton(appsId);
                }
            }
        }
    };

    this.addCloseButton = function(appsId){
        appsId = appsId.replace(/\./g, '-');
        $('#' + appsId + '-group-btn').append('<div class="com-jpa-system-apps-close-btn" id="' + appsId + '-close-btn"></div>');
        $('#' + appsId + '-close-btn').click(function(){
            var apps = AppManager.getAppsRunningById(appsId.replace(/\-/g, '.'));
            if(apps != null){
                AppManager.enqueue(apps, AppManager.CLOSE);
            }
        });
    };

    this.addMaximizeButton = function(appsId){
        appsId = appsId.replace(/\./g, '-');
        $('#' + appsId + '-group-btn').append('<div class="com-jpa-system-apps-maximize-btn" id="' + appsId + '-maximize-btn"></div>');
        $('#' + appsId + '-maximize-btn').click(function(){
            var apps = AppManager.getAppsRunningById(appsId.replace(/\-/g, '.'));
            if(apps != null){
                AppManager.enqueue(apps, AppManager.MAXIMIZE);
            }
        });
    };

    this.addMinimizeButton = function(appsId){
        appsId = appsId.replace(/\./g, '-');
        $('#' + appsId + '-group-btn').append('<div class="com-jpa-system-apps-minimize-btn" id="' + appsId + '-minimize-btn"></div>');
        $('#' + appsId + '-minimize-btn').click(function(){
            var apps = AppManager.getAppsRunningById(appsId.replace(/\-/g, '.'));
            if(apps != null){
                AppManager.enqueue(apps, AppManager.MINIMIZE);
            }
        });
    };

    this.generateContent = function(appsId, content){
        appsId = appsId.replace(/\./g, '-');
        $('#' + appsId).append(content);
    };

    this.setContainerSize = function(appsId, width, height){
        appsId = appsId.replace(/\./g, '-');
        $('#' + appsId).css({width : width+'px', height : height + 'px'});
    };

    this.setFocusHeaderButton = function(appsId){
        appsId = appsId.replace(/\./g, '-');
        $('#' + appsId + '-close-btn').attr('class', 'com-jpa-system-apps-close-btn');
        $('#' + appsId + '-maximize-btn').attr('class', 'com-jpa-system-apps-maximize-btn');
        $('#' + appsId + '-minimize-btn').attr('class', 'com-jpa-system-apps-minimize-btn');
    };

    this.setUnfocusHeaderButton = function(appsId){
        appsId = appsId.replace(/\./g, '-');
        $('#' + appsId + '-close-btn').attr('class', 'com-jpa-system-apps-close-unfocus-btn');
        $('#' + appsId + '-maximize-btn').attr('class', 'com-jpa-system-apps-maximize-unfocus-btn');
        $('#' + appsId + '-minimize-btn').attr('class', 'com-jpa-system-apps-minimize-unfocus-btn');
    };

    this.addMenuGroup = function(menuId){
        var menuGroup = '<div class="apps-menu-group"></div>';
        $('#apps-menu-item-' + menuId).append(menuGroup);
    };

    this.generateMenuItem = function(lastId, value){
        lastId++;
        var menuItem = '<div class="apps-menu-item" id="apps-menu-item-' + lastId + '"><div class="apps-menu-name" id="apps-menu-name-' + lastId + '">' + value + '</div></div>';
        return [menuItem, lastId];
    };

    this.generateSubmenuItem = function(lastId, value, icon){
        var menuItem = '<div class="apps-submenu-item" id="apps-submenu-item-' + lastId + '">' + value + '</div>';
        return menuItem;
    };

    this.createMainMenu = function(appsName, mainMenu){
        $('#apps-name-container .apps-menu-name').html(appsName);

        // add listener
        $('#apps-name-container .apps-menu-name').unbind( "mousedown" );
        $('#apps-name-container').mousedown(function(){
            Application.resetMenu();
            $('#apps-name-container .apps-menu-name').attr('class', 'apps-menu-name-active');
            $('#apps-name-container .apps-menu-group').show();
        });

        var mainMenuAll = mainMenu;
        if(mainMenuAll != null){
            this.addMenuGroup('main');
            var lastSubmenuId = 0;
            for(var j=0;j<mainMenuAll.length;j++){
                var submenuItem = mainMenuAll[j];
                var submenuItemVal = mainMenuAll[j][0].replace('apps-submenu-item-main', 'apps-submenu-item-main-' + j)
                $('#apps-name-container .apps-menu-group').append(submenuItemVal);
                if(submenuItem[1] != null && submenuItem[1] != undefined){
                    $('#apps-submenu-item-main-' + j).mousedown(function(){
                        var id = $(this).attr('id').replace('apps-submenu-item-main-', '');

                        if(mainMenuAll[id].length > 1){
                            var callback = mainMenuAll[id][1];

                            if(typeof callback === 'function'){
                                callback();
                            }
                        }
                    });
                }
                lastSubmenuId = j;
            }

            $('#apps-submenu-item-main-' + lastSubmenuId).attr('class', 'apps-submenu-item-last');
        }
    };

    this.createMenu = function(menu){
        if(menu == null || menu == undefined){
            return;
        }
        var menuAll = menu;
        if(menu.length > 0){
            for(var i=0;i<menu.length;i++){
                var menuItem = menu[i];
                $('#menu-container').append(menuItem[0]);

                // add listener
                $('#apps-menu-item-' + i + ' .apps-menu-name').unbind( "mousedown" );
                $('#apps-menu-item-' + i + ' .apps-menu-name').mousedown(function(){
                    Application.resetMenu();
                    $(this).attr('class', 'apps-menu-name-active');
                    var id = $(this).attr('id').replace('apps-menu-name-', '');

                    $('#apps-menu-item-' + id + ' .apps-menu-group').show();

                    if(menuAll[id].length > 1){
                        var callback = menuAll[id][1];

                        if(typeof callback === 'function'){
                            callback();
                        }
                    }
                });

                // add submenu
                var submenu = menu[i][2];
                if(submenu != null){
                    this.addMenuGroup(i);
                    var lastSubmenuId = 0;
                    for(var j=0;j<submenu.length;j++){
                        var submenuItem = submenu[j];
                        var submenuItemVal = submenu[j][0].replace('apps-submenu-item-' + i, 'apps-submenu-item-' + i + '-' + j);
                        $('#apps-menu-item-' + i + ' .apps-menu-group').append(submenuItemVal);
                        if(submenuItem[1] != null && submenuItem[1] != undefined){
                            $('#apps-submenu-item-' + i + '-' + j).mousedown(function(){
                                var arrId = $(this).attr('id').replace('apps-submenu-item-', '').split('-');

                                if(menuAll[arrId[0]][2][arrId[1]].length > 1){
                                    var callback = menuAll[arrId[0]][2][arrId[1]][1];

                                    if(typeof callback === 'function'){
                                        callback();
                                    }
                                }
                            });
                        }
                        lastSubmenuId = j;
                    }

                    $('#apps-submenu-item-' + i + '-' + lastSubmenuId).attr('class', 'apps-submenu-item-last');
                }
            }
        }
    };

    this.resetMenu = function(){
        $('.apps-menu-group').hide();
        $('#apps-name-container .apps-menu-name-active').attr('class', 'apps-menu-name');
        $('#menu-container .apps-menu-name-active').attr('class', 'apps-menu-name');
    };

    this.destroyMenu = function(){
        this.resetMenu();
        $('#apps-name-container .apps-menu-name').html(AppManager.defaultAppsName);
        $('#apps-name-container .apps-menu-group').html('');
        $('#menu-container').html('');
    };

    this.getCenterPosition = function(appsWidth, appsHeight){
        var screenWidth = $(document).width();
        var screenHeight = $(document).height();
        var leftPos = (screenWidth - appsWidth) / 2;
        var topPos = (screenHeight - appsHeight) / 2;
        return [leftPos, topPos];
    }

}

var Application = new ApplicationBase();