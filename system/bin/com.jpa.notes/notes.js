/**
 * Created with JetBrains PhpStorm.
 * User: JOKO PURNOMO A
 * Date: 4/27/15
 * Time: 12:21 AM
 * To change this template use File | Settings | File Templates.
 */

function ComJpaNotes(){
    this.appsName = 'Notes';
    this.appsId = 'com.jpa.notes';
    this.icon = 'images/icon.png';
    this.appsversion = '1.0';
    this.dateCreated = '2015/04/26';
    this.creator = 'Joko Purnomo A';
    this.baseSelector = '#com-jpa-notes';
    this.isService = false;
    this.appsWidth = 350;
    this.appsHeight = 400;
    this.posX = Application.getCenterPosition(this.appsWidth, this.appsHeight)[0];
    this.posY = Application.getCenterPosition(this.appsWidth, this.appsHeight)[1];
    this.appsStatus = AppStatus.DESTROYED;
    this.PID = -1;
    this.repaintSpeed = 500;

    this.mainMenu = [];
    this.menu = [];
    this.lastMenuId = -1;

    this.create = function(){
        Application.loadStyle('system/bin/com.jpa.notes/notes.css');
        Application.generateContainer(this.appsId);
        Application.generateHeader(this.appsId);
        Application.generateHeaderButton(this.appsId, [Application.CLOSE_BUTTON, Application.MAXIMIZE_BUTTON, Application.MINIMIZE_BUTTON]);
        Application.generateContent(this.appsId, '<div id="com-jpa-notes-content" contenteditable="true" spellcheck="false"></div>');
        Application.setContainerSize(this.appsId, this.appsWidth, this.appsHeight);

        this.addMenuItem('File');
        this.addSubmenuItem(this.lastMenuId, 'Open', null, function(){
            alert('Open');
        });
        this.addSubmenuItem(this.lastMenuId, 'Save', null, function(){
            alert('Save');
        });
        this.addSubmenuItem(this.lastMenuId, 'Save As', null, function(){
            alert('Save As');
        });

        this.addMenuItem('Help');
    };

    this.addMainMenuItem = function(value, icon, callback){
        if(this.mainMenu == null){
            this.mainMenu = [];
            this.mainMenu[0] = [Application.generateSubmenuItem(menuId, value, icon), callback];
        } else {
            this.mainMenu[this.mainMenu.length] = [Application.generateSubmenuItem('main', value, icon), callback];
        }
    }

    this.addMenuItem = function(value, callback){
        var menuItem = Application.generateMenuItem(this.lastMenuId, value);
        this.lastMenuId = menuItem[1];
        this.menu[this.lastMenuId] = [menuItem[0], callback, null];
    }

    this.addSubmenuItem = function(menuId, value, icon, callback){
        if(this.menu[menuId][2] == null){
            this.menu[menuId][2] = [];
            this.menu[menuId][2][0] = [Application.generateSubmenuItem(menuId, value, icon), callback];
        } else {
            this.menu[menuId][2][this.menu[menuId][2].length] = [Application.generateSubmenuItem(menuId, value, icon), callback];
        }
    }

    this.init = function(){
        var $this = this;
        $(document).ready(function(){
            $('#com-jpa-notes-content').mousedown(function(){
                AppManager.enqueue(AppManager.getAppsRunningById($this.appsId.replace(/\-/g, '.')), AppManager.FOCUS);
            });

            $('#com-jpa-notes-content').keydown(function(evt){
                switch(evt.keyCode){
                    case 9 : {
                        // TAB
                        evt.preventDefault();
                        alert($this.getContent());
                    }break;
                }
            });

            $this.makeEditable();
            $this.fixTerminalContent();
        });
    };
    this.open = function(){};
    this.focus = function(){
        $('#com-jpa-notes-content').focus();
    };
    this.unfocus = function(){};
    this.minimize = function(){};
    this.close = function(){};
    this.destroy = function(){};

    this.makeEditable = function(){
        var $this = this;
        $(document).ready(function(){
            $('#com-jpa-notes-content').bind('mousedown.ui-disableSelection selectstart.ui-disableSelection', function(e){
                e.stopImmediatePropagation();
            });
        });
    }

    this.fixTerminalContent = function(){
        var $this = this;
        $(document).ready(function(){
            function update(){
                if($this.appsStatus == AppStatus.FOCUSED){
                    $this.repaintSpeed = 5;
                } else {
                    $this.repaintSpeed = 5;
                }

                var appsWidth = $('#com-jpa-notes').width();
                var appsHeight = $('#com-jpa-notes').height();
                var headerHeight = $('#com-jpa-notes-header').height();
                $('#com-jpa-notes-content').width(appsWidth - 20).height(appsHeight - (headerHeight + 10));
                setTimeout(function(){
                    update();
                },$this.repaintSpeed);
            }
            update();
        });
    }

    this.placeCaretAt = function(pos, elmt) {
        if(elmt == undefined){
            elmt = this.baseSelector+'-content';
        }
        var el = document.getElementById(elmt.replace('#',''));
        if (document.selection) {
            sel = document.selection.createRange();
            sel.moveStart('character', pos);
            sel.select();
        }
        else {
            sel = window.getSelection();
            sel.collapse(el.lastChild, pos);
        }
    }

    this.placeCaretAtEnd = function(elmt) {
        if(elmt == undefined){
            elmt = this.baseSelector+'-content';
        }
        var el = document.getElementById(elmt.replace('#',''));
        el.focus();
        if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }

    this.getCaretPosition = function(elmt) {
        if(elmt == undefined){
            elmt = this.baseSelector+'-content';
        }
        var editableDiv = document.getElementById(elmt.replace('#',''));

        var caretPos = 0,
            sel, range;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(0);
                if (range.commonAncestorContainer.parentNode == editableDiv) {
                    caretPos = range.endOffset;
                }
            }
        } else if (document.selection && document.selection.createRange) {
            range = document.selection.createRange();
            if (range.parentElement() == editableDiv) {
                var tempEl = document.createElement("span");
                editableDiv.insertBefore(tempEl, editableDiv.firstChild);
                var tempRange = range.duplicate();
                tempRange.moveToElementText(tempEl);
                tempRange.setEndPoint("EndToEnd", range);
                caretPos = tempRange.text.length;
            }
        }
        return caretPos;
    }

    this.getContent = function(){
        var content = $(this.baseSelector+'-content').html().replace(/<br>/gi, '\n');
        content = this.strip_tags(content);
        return content;
    }

    this.reverse = function(s){
        return s.split("").reverse().join("");
    }

    this.strip_tags = function(input, allowed) {
        //  discuss at: http://phpjs.org/functions/strip_tags/
        // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // improved by: Luke Godfrey
        // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        //    input by: Pul
        //    input by: Alex
        //    input by: Marc Palau
        //    input by: Brett Zamir (http://brett-zamir.me)
        //    input by: Bobby Drake
        //    input by: Evertjan Garretsen
        // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // bugfixed by: Onno Marsman
        // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // bugfixed by: Eric Nagel
        // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // bugfixed by: Tomasz Wesolowski
        //  revised by: Rafał Kukawski (http://blog.kukawski.pl/)
        //   example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>');
        //   returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
        //   example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>');
        //   returns 2: '<p>Kevin van Zonneveld</p>'
        //   example 3: strip_tags("<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>", "<a>");
        //   returns 3: "<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>"
        //   example 4: strip_tags('1 < 5 5 > 1');
        //   returns 4: '1 < 5 5 > 1'
        //   example 5: strip_tags('1 <br/> 1');
        //   returns 5: '1  1'
        //   example 6: strip_tags('1 <br/> 1', '<br>');
        //   returns 6: '1 <br/> 1'
        //   example 7: strip_tags('1 <br/> 1', '<br><br/>');
        //   returns 7: '1 <br/> 1'

        allowed = (((allowed || '') + '')
            .toLowerCase()
            .match(/<[a-z][a-z0-9]*>/g) || [])
            .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
            commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
        return input.replace(commentsAndPhpTags, '')
            .replace(tags, function($0, $1) {
                return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
            });
    }
}