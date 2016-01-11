/**
 * Created with JetBrains PhpStorm.
 * User: JOKO PURNOMO A
 * Date: 4/26/15
 * Time: 8:17 PM
 * To change this template use File | Settings | File Templates.
 */

function SystemDockMenu(){

    this.height = 55;
    this.width = 500;
    this.element = '#dock-container';
    this.dockItem = [];
    this.dockID = 0;
    this.itemSize = 45;
    this.isActiveEffect = [];
    this.isLoadingEffect = [];
    this.effectSpeed = 600;

    this.init = function(){
        var parent = this;
        var screenWidth = $(document).width();
        var posLeft = (screenWidth - this.width) / 2;
        $(this.element).css({height : this.height+'px', width : this.width+'px', left : posLeft+'px', bottom : '0px'})
        $(parent.element).fadeTo(300, 1);
    }

    this.addItem = function(icon, callback){
        var item = '<div class="dock-item" id="dock-item-' + this.dockID + '"><img src="' + icon + '"></div>';
        $(this.element).append(item);
        $('#dock-item-' + this.dockID).css({left : (this.dockID*55) + 'px'});
        this.addEffect('#dock-item-' + this.dockID, this.dockID);
        this.addListener('#dock-item-' + this.dockID, callback);
        this.isActiveEffect[this.dockID] = false;
        this.isLoadingEffect[this.dockID] = false;
        this.dockItem[this.dockID++] = item;
        this.fixDockWidth();

        $(this.element + " img").error(function () {
            $(this).unbind("error").attr("src", "system/var/images/applications/blank.png");
        });
    }

    this.addEffect = function(sel, id){
        var parent = this;
        $(sel).mouseover(function(){
            if(!parent.isActiveEffect[id]){
                parent.isActiveEffect[id] = true;
                $(sel + ' img').effect("bounce", { direction:'up', times:3 }, parent.effectSpeed);
                setTimeout(function(){
                    parent.isActiveEffect[id] = false;
                }, parent.effectSpeed);
            }

        });
    }

    this.addListener = function(sel, callback){
        $(sel).mousedown(function(){
            if(typeof callback === 'function'){
                callback();
            }
        });
    }

    this.fixDockWidth = function(){
        var parent = this;
        var screenWidth = $(document).width();
        var dockWidth = (this.dockItem.length * 55);
        var posLeft = (screenWidth - dockWidth) / 2;
        $(this.element).css({width : dockWidth +'px', left : posLeft+'px'})
    }

    this.dockLoading = function(){
        if(!parent.isActiveEffect[id]){
            parent.isActiveEffect[id] = true;
            $(sel + ' img').effect("bounce", { direction:'up', times:3 }, parent.effectSpeed);
            setTimeout(function(){
                parent.isActiveEffect[id] = false;
            }, parent.effectSpeed);
        }
    }

}

var DockMenu = new SystemDockMenu();

$(document).ready(function(){
    setTimeout(function(){
        DockMenu.init();
        DockMenu.addItem('system/var/images/applications/finder.png', function(){
            AppManager.enqueue(new ComJpaFinder(), AppManager.OPEN);
        });
        DockMenu.addItem('system/var/images/applications/launchpad.png', function(){

        });
        DockMenu.addItem('system/var/images/applications/safari.png', function(){
            AppManager.enqueue(new ComJpaBrowser(), AppManager.OPEN);
        });
        DockMenu.addItem('system/var/images/applications/contact.png');
        DockMenu.addItem('system/var/images/applications/calendar.png');
        DockMenu.addItem('system/var/images/applications/notes.png', function(){
            AppManager.enqueue(new ComJpaNotes(), AppManager.OPEN);
        });
        DockMenu.addItem('system/var/images/applications/terminal.png', function(){
            AppManager.enqueue(new ComJpaTerminal(), AppManager.OPEN);
        });
        DockMenu.addItem('system/var/images/applications/itunes.png');
        DockMenu.addItem('system/var/images/applications/appstore.png');
        DockMenu.addItem('system/var/images/applications/preference.png');
        DockMenu.addItem('system/var/images/applications/download.png');
    },100);

});
