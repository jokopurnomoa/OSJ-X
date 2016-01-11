/**
 * Created with JetBrains PhpStorm.
 * User: JOKO PURNOMO A
 * Date: 4/25/15
 * Time: 10:11 AM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

function ComJpaTerminal(){
    this.appsName = 'Terminal';
    this.appsId = 'com.jpa.terminal';
    this.icon = 'images/icon.png';
    this.appsversion = '1.0';
    this.dateCreated = '2015/04/26';
    this.creator = 'Joko Purnomo A';
    this.baseSelector = '#com-jpa-terminal';
    this.isService = false;
    this.appsWidth = 600;
    this.appsHeight = 400;
    this.posX = Application.getCenterPosition(this.appsWidth, this.appsHeight)[0];
    this.posY = Application.getCenterPosition(this.appsWidth, this.appsHeight)[1];
    this.appsStatus = AppStatus.DESTROYED;
    this.PID = -1;
    this.repaintSpeed = 500;

    this.systemName = System.name;
    this.systemUser = System.user;
    this.userType = System.type;
    this.terminalAttr = '@:';
    this.terminalElem = '#com-jpa-terminal-content';
    this.directory = '~';
    this.isPassword = false;
    this.password = '';
    this.listDirectory = [];
    this.listFile = [];
    this.commandHistory = [];
    this.posCommandHistory = -1;
    this.foundDirectory = [];
    this.posFoundDirectory = 0;
    this.isConfirm = false;
    this.moreSpace = 0;
    this.tempCommand = '';
    this.isAutoCompleteDir = false;
    this.tempDir = '';
    this.tempDirPos = 0;
    this.isLoading = false;
    this.tempContent = '';

    this.create = function(){
        Application.loadStyle('system/bin/com.jpa.terminal/terminal.css');
        Application.generateContainer(this.appsId);
        Application.generateHeader(this.appsId);
        Application.generateHeaderButton(this.appsId, [Application.CLOSE_BUTTON, Application.MAXIMIZE_BUTTON, Application.MINIMIZE_BUTTON]);
        Application.generateContent(this.appsId, '<div id="com-jpa-terminal-content" contenteditable="true" spellcheck="false"></div>');
    };

    this.init = function(){
        var $this = this;
        $(document).ready(function(){
            $($this.terminalElem).html($this.systemUser + '@' + $this.systemName + ':' + $this.directory + $this.userType + ' ');
            $this.runCommand('ls', false, false);

            $($this.terminalElem).mousedown(function(){
                AppManager.enqueue(AppManager.getAppsRunningById($this.appsId.replace(/\-/g, '.')), AppManager.FOCUS);
            });

            $($this.terminalElem).keydown(function(evt){
                //console.log(evt.keyCode);
                if($this.isLoading){
                    if(evt.ctrlKey){
                        if(evt.keyCode == 67){
                            $this.loadingStop();
                            setTimeout(function(){
                                $this.printCommandResult('aborted by user.<br>');
                            },200);
                        } else {
                            evt.preventDefault();
                        }
                    } else {
                        evt.preventDefault();
                    }
                }
                else if($this.isPassword){
                    if(evt.keyCode == 13){
                        $this.isPassword = false;
                        $this.authenticate($this.systemUser, $this.password);
                    }
                    else if(evt.keyCode < 32){
                        evt.preventDefault();
                    }
                } else {
                    var caretPos = $this.getCaretPosition(this);
                    var termCmdLen = $this.systemName.length + $this.systemUser.length + $this.directory.length + $this.userType.length + $this.terminalAttr.length;
                    if(caretPos < termCmdLen + 1){
                        $this.placeCaretAtEnd();
                    }
                    switch(evt.keyCode){
                        case 8 : {
                            // BACKSPACE
                            evt.preventDefault();

                            $this.isAutoCompleteDir = false;
                            $this.tempDirPos = 0;

                            var termCmdLen = $this.systemName.length + $this.systemUser.length + $this.directory.length + $this.userType.length + $this.terminalAttr.length + $this.moreSpace;
                            var endLineCont = $this.getEndLineCont();
                            var beforeCont = $this.getBeforeContent();

                            var caretPos = $this.getCaretPosition(this);
                            var beforeDel = endLineCont.substr(0,caretPos-1);
                            var afterDel = endLineCont.substr(caretPos,endLineCont.length-caretPos);

                            setTimeout(function(){
                                if(caretPos > termCmdLen + 1){
                                    $($this.terminalElem).html(beforeCont + beforeDel + afterDel);
                                    $this.placeCaretAt(caretPos-1)
                                }
                            },0);
                        }break;
                        case 9 : {
                            // TAB
                            evt.preventDefault();
                            $this.autoCompleteDirectory();
                        }break;
                        case 13 : {
                            // NEWLINE
                            evt.preventDefault();
                            var command = $this.getCommand();

                            $this.isAutoCompleteDir = false;
                            $this.tempDirPos = 0;

                            setTimeout(function(){
                                $this.runCommand(command);
                                if(command.trim() != '' && !$this.isConfirm){
                                    if($this.commandHistory.length > 0){
                                        if($this.commandHistory[$this.commandHistory.length-1] != command){
                                            $this.posCommandHistory = $this.commandHistory.length;
                                            $this.commandHistory[$this.commandHistory.length] = command;
                                        }
                                    } else {
                                        $this.posCommandHistory = $this.commandHistory.length;
                                        $this.commandHistory[$this.commandHistory.length] = command;
                                    }
                                }
                            },0);
                        }break;
                        case 36 : {
                            // HOME KEY
                            evt.preventDefault();
                            var termCmdLen = $this.systemName.length + $this.systemUser.length + $this.directory.length + $this.userType.length + $this.terminalAttr.length + $this.moreSpace;
                            var caretPos = $this.getCaretPosition(this);
                            setTimeout(function(){
                                $this.placeCaretAt(termCmdLen + 1);
                            },0);
                        }break;
                        case 37 : {
                            // ARROW LEFT
                            evt.preventDefault();
                            var termCmdLen = $this.systemName.length + $this.systemUser.length + $this.directory.length + $this.userType.length + $this.terminalAttr.length + $this.moreSpace;
                            var caretPos = $this.getCaretPosition(this);
                            setTimeout(function(){
                                if(caretPos > termCmdLen + 1){
                                    $this.placeCaretAt(caretPos-1);
                                }
                            },0);
                        }break;
                        case 38 : {
                            // ARROW UP
                            evt.preventDefault();
                            var termCmd = $this.systemUser + '@' + $this.systemName + ':' + $this.directory + $this.userType + ' ';
                            var termCmdLen = $this.systemName.length + $this.systemUser.length + $this.directory.length + $this.userType.length + $this.terminalAttr.length;
                            var beforeCont = $this.getBeforeContent();

                            if($this.posCommandHistory > -1){
                                $($this.terminalElem).html(beforeCont + termCmd + $this.commandHistory[$this.posCommandHistory]);
                                $this.placeCaretAt(termCmdLen + $this.commandHistory[$this.posCommandHistory].length + 1);
                                $this.posCommandHistory--;
                            }
                        }break;
                        case 40 : {
                            // ARROW DOWN
                            evt.preventDefault();
                            var termCmd = $this.systemUser + '@' + $this.systemName + ':' + $this.directory + $this.userType + ' ';
                            var termCmdLen = $this.systemName.length + $this.systemUser.length + $this.directory.length + $this.userType.length + $this.terminalAttr.length;
                            var content = $($this.terminalElem).html();
                            var contentLen = content.length;
                            var endLineCont = $this.getEndLineCont();
                            var beforeCont = content.substr(0,contentLen - endLineCont.length);

                            if($this.posCommandHistory < $this.commandHistory.length - 2){
                                $this.posCommandHistory+=2;
                                $($this.terminalElem).html(beforeCont + termCmd + $this.commandHistory[$this.posCommandHistory]);
                                $this.placeCaretAt(termCmdLen + $this.commandHistory[$this.posCommandHistory].length + 1);
                                $this.posCommandHistory--;
                            }
                        }break;
                    }
                }

            }).keypress(function(evt){
                    //console.log('cs:'+evt.which);
                    if($this.isPassword){
                        evt.preventDefault();
                        var termCmd = $this.systemUser + '@' + $this.systemName + ':' + $this.directory + $this.userType + ' ';
                        var termCmdLen = $this.systemName.length + $this.systemUser.length + $this.directory.length + $this.userType.length + $this.terminalAttr.length;
                        var content = $($this.terminalElem).html();

                        $this.password += String.fromCharCode(evt.which);
                        $($this.terminalElem).html(content + '*');
                        $this.placeCaretAtEnd();
                    }
                });


            $this.makeEditable();
            $this.fixTerminalContent();
        });
    };

    this.open = function(){};
    this.focus = function(){
        $(this.terminalElem).focus();
        this.placeCaretAtEnd();
    };
    this.unfocus = function(){};
    this.minimize = function(){};
    this.close = function(){};
    this.destroy = function(){};

    this.makeEditable = function(){
        var $this = this;
        $(document).ready(function(){
            $($this.terminalElem).bind('mousedown.ui-disableSelection selectstart.ui-disableSelection', function(e){
                e.stopImmediatePropagation();
            });
        });
    };

    this.fixTerminalContent = function(){
        var $this = this;
        $(document).ready(function(){
            function update(){
                if($this.appsStatus == AppStatus.FOCUSED){
                    $this.repaintSpeed = 5;
                } else {
                    $this.repaintSpeed = 100;
                }

                var appsWidth = $('#com-jpa-terminal').width();
                var appsHeight = $('#com-jpa-terminal').height();
                var headerHeight = $('#com-jpa-terminal-header').height();
                $('#com-jpa-terminal-content').width(appsWidth - 20).height(appsHeight - (headerHeight + 10));
                setTimeout(function(){
                    update();
                },$this.repaintSpeed);
            }
            update();
        });
    };

    this.runCommand = function(command, print, loading){
        var $this = this;
        $(document).ready(function(){
            var cmdResult = 'command not found.';

            var arrCommand = $this.commandExploder(command);

            if(command != ''){
                if($this.isConfirm){
                    if(command == 'y'){
                        $this.loadingStart();
                        $this.postCommand($this.tempCommand, function(data){
                            $this.loadingStop();
                            $this.printCommandResult(data + '<br>');
                        });
                    } else {
                        $this.printCommandResult();
                    }
                    $this.isConfirm = false;
                    $this.tempCommand = '';
                    $this.moreSpace = 0;
                }
                else if(command == 'clear' || command == 'cls' || command == 'clean'){
                    $this._cls();
                }
                else if(command == 'ls'){
                    $this._ls(command, print, loading);
                }
                else if(arrCommand[0].trim() == 'cd'){
                    $this._cd(command, print);
                }
                else if(arrCommand[0].trim() == 'su'){
                    $this._su(command, print);
                }
                else if(arrCommand[0].trim() == 'exit'){
                    $this._exit(command, print);
                }
                else if(arrCommand[0].trim() == 'mkdir'){
                    $this.loadingStart();
                    $this._mkdir(command, print);
                }
                else if(arrCommand[0].trim() == 'rmdir'){
                    $this.loadingStart();
                    $this._rmdir(command, print);
                }
                else if(arrCommand[0].trim() == 'rm'){
                    $this.loadingStart();
                    $this._rm(command, print);
                }
                else if(arrCommand[0].trim() == 'cp'){
                    $this.loadingStart();
                    $this._cp(command, print);
                }
                else if(arrCommand[0].trim() == 'mv'){
                    $this.loadingStart();
                    $this._mv(command, print);
                }
                else {
                    $this.loadingStart();
                    $this.postCommand(command, function(data){
                        $this.loadingStop();
                        $this.printCommandResult('command not found.<br>');
                    });
                }
            } else {
                $this.loadingStop();
            }
        });
    };

    this.placeCaretAt = function(pos, elmt) {
        if(elmt == undefined){
            elmt = this.terminalElem;
        }
        var el = document.getElementById(elmt.replace('#',''));
        if (document.selection) {
            var sel = document.selection.createRange();
            sel.moveStart('character', pos);
            sel.select();
        }
        else {
            sel = window.getSelection();
            sel.collapse(el.lastChild, pos);
        }
    };

    this.placeCaretAtEnd = function(elmt) {
        if(elmt == undefined){
            elmt = this.terminalElem;
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
    };

    this.getCaretPosition = function(editableDiv) {
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
    };

    this.reverse = function(s){
        return s.split("").reverse().join("");
    };

    this.fixTerminalScroll = function(){
        var $this = this;
        $(document).ready(function(){
            $($this.terminalElem).scrollTop($($this.terminalElem).height()*1000)
        });
    };

    this.getEndLineCont = function(){
        var content = $(this.terminalElem).html();
        if(content != ''){
            if(content.indexOf('<br>') == -1){
                return content;
            } else {
                var revCont = this.reverse(content);
                var endLineCont = this.reverse(revCont.substr(0,revCont.indexOf('>rb<')));
                return endLineCont;
            }
        }
    };

    this.getBeforeContent = function(){
        var content = $(this.terminalElem).html();
        var contentLen = content.length;
        var endLineCont = this.getEndLineCont();
        return content.substr(0,contentLen - endLineCont.length);
    };

    this.getCommand = function(){
        if(!this.isConfirm){
            var termCmd = this.systemUser + '@' + this.systemName + ':' + this.directory + this.userType + ' ';
            var endLineCont = this.getEndLineCont();
            return endLineCont.replace(termCmd, '').trim();
        } else {
            var endLineCont = this.getEndLineCont();
            return endLineCont.substr(endLineCont.length-1, endLineCont.length).trim();
        }
    };

    this.postCommand = function(command, callBackAction){
        var $this = this;
        $(document).ready(function(){
            var sendCommand;
            if(typeof command === 'string'){
                sendCommand = JSON.stringify($this.commandExploder(command));
            } else {
                sendCommand = command;
            }
            console.log(command.substr(0, 100) + (command.length > 100 ? '...' : ''));

            $.post('system/bin/com.jpa.terminal/terminal-gate.php', {'command' : sendCommand, 'usertype' : $this.userType, 'directory' : $this.directory, 'username' : $this.systemUser}).done(function(data){

                console.log(data.substr(0, 100) + (data.length > 100 ? '...' : ''));

                if(callBackAction != undefined){
                    callBackAction(data);
                } else {
                    $this.loadingStop();
                    $this.printCommandResult(data + '<br>');
                }
            });
        });
    };

    this.authenticate = function(username, password){
        var $this = this;
        $(document).ready(function(){
            var sendCommand = JSON.stringify($this.commandExploder('authenticate'));
            $.post('system/bin/com.jpa.terminal/terminal-gate.php', {'command' : sendCommand,'directory' : password, 'username' : username}).done(function(data){
                if(data == '1'){
                    $this.userType = '#';
                    var content = $($this.terminalElem).html();
                    content = content.substr(0,content.length-15);
                    $($this.terminalElem).html(content + '<br>' + $this.systemUser + '@' + $this.systemName + ":" + $this.directory + $this.userType + ' ');
                    $this.placeCaretAtEnd();
                    $this.fixTerminalScroll();
                } else {
                    var content = $($this.terminalElem).html();
                    $($this.terminalElem).html(content.substr(0,content.length-15));
                    $this.printCommandResult('authentication failed.<br>');
                }
            });
        });
    };

    this.printCommandResult = function(cmdResult){
        var $this = this;
        $(document).ready(function(){
            if(cmdResult == undefined){
                cmdResult = '';
            }
            var content = $($this.terminalElem).html();
            $($this.terminalElem).html(content + '<br>' + cmdResult + $this.systemUser + '@' + $this.systemName + ":" + $this.directory + $this.userType + ' ');
            $this.placeCaretAtEnd();
            $this.fixTerminalScroll();
        });
    };

    this.autoCompleteDirectory = function(){
        var termCmd = this.systemUser + '@' + this.systemName + ':' + this.directory + this.userType + ' ';
        var termCmdLen = this.systemName.length + this.systemUser.length + this.directory.length + this.userType.length + this.terminalAttr.length;
        var content = $(this.terminalElem).html();
        var contentLen = content.length;
        var endLineCont = this.getEndLineCont();
        var beforeCont = content.substr(0,contentLen - endLineCont.length);

        var command = this.getCommand();
        var arrCommand = this.commandExploder(command);

        if(arrCommand.length > 0){
            if(arrCommand[0].trim() == 'cd' || arrCommand[0].trim() == 'rm' || arrCommand[0].trim() == 'rmdir'){
                var firstCommand = arrCommand[0].trim();
                var dir = arrCommand[1];
                if(!this.isAutoCompleteDir){
                    this.tempDir = dir;
                    this.isAutoCompleteDir = true;
                } else {
                    this.tempDirPos++;
                }
                var pos = 0;
                if(this.listDirectory.length > 0){
                    this.foundDirectory = [];
                    if(firstCommand == 'cd' || firstCommand == 'rmdir'){
                        for(var i=0;i<this.listDirectory.length;i++){
                            if(this.tempDir == ''){
                                if(this.tempDirPos == pos){
                                    this.foundDirectory[this.foundDirectory.length] = this.listDirectory[i];
                                }
                                pos++;
                            }
                            else if(this.listDirectory[i].indexOf(this.tempDir) > -1){
                                if(this.tempDirPos == pos){
                                    this.foundDirectory[this.foundDirectory.length] = this.listDirectory[i];
                                }
                                pos++;
                            }
                        }
                    } else if(firstCommand == 'rm'){
                        for(var i=0;i<this.listFile.length;i++){
                            if(this.tempDir == ''){
                                if(this.tempDirPos == pos){
                                    this.foundDirectory[this.foundDirectory.length] = this.listFile[i];
                                }
                                pos++;
                            }
                            else if(this.listFile[i].indexOf(this.tempDir) > -1){
                                if(this.tempDirPos == pos){
                                    this.foundDirectory[this.foundDirectory.length] = this.listFile[i];
                                }
                                pos++;
                            }
                        }
                    }
                    if(this.tempDirPos == pos-1){
                        this.tempDirPos = -1;
                    }
                }

                if(this.foundDirectory.length > 0){
                    if(this.posFoundDirectory < this.foundDirectory.length){
                        $(this.terminalElem).html(beforeCont + termCmd + firstCommand + ' ' + this.foundDirectory[this.posFoundDirectory]);
                        this.placeCaretAt(termCmdLen + this.foundDirectory[this.posFoundDirectory].length + firstCommand.length + 2);
                    }
                }
            }
        }
        this.fixTerminalScroll();
    };

    this.commandGlueEncode = function(command){
        var glue = '$_$_$_$_$';
        var len = command.length;
        var i = 0;
        var q1 = -1;
        var q2 = -1;
        var str = [];
        while(i < len){
            var q1 = command.indexOf('"', i);
            var q2 = command.indexOf('"', q1 + 1);
            var t = command.substr(q1, (q2 - q1) + 1);
            if(t != ''){
                str[str.length] = t;
            }

            if(q2 > -1){
                i = q2;
            } else {
                i = len;
            }
        }

        var res = command;
        for(var j=0;j<str.length;j++){
            res = res.replace(str[j], str[j].replace(/ /g, glue));
        }
        return res;
    };

    this.commandGlueDecode = function(command){
        return command.replace(/\$\_\$\_\$\_\$\_\$/g, ' ');
    };

    this.commandExploder = function(command){
        command = command.replace(/  /g, ' ').replace(/  /g, ' ');
        command = this.commandGlueEncode(command);

        if(typeof command !== 'undefined' && command != ''){
            var arrCmd = command.split(' ');
            var param1 = arrCmd[0];
            var param2 = '';
            var param3 = '';
            var param4 = '';

            if(arrCmd.length == 2){
                param2 = this.commandGlueDecode(arrCmd[1]);
            } else if(arrCmd.length == 3){
                param2 = this.commandGlueDecode(arrCmd[1]);
                param3 = this.commandGlueDecode(arrCmd[2]);
            } else if(arrCmd.length == 4){
                param2 = this.commandGlueDecode(arrCmd[1]);
                param3 = this.commandGlueDecode(arrCmd[2]);
                param4 = this.commandGlueDecode(arrCmd[3]);
            }
        } else {
            param1 = '';
            param2 = '';
            param3 = '';
            param4 = '';
        }

        return [param1, param2, param3, param4];
    };

    this.runLoading = function(){
        var $this = this;
        var chl = 0;
        var a = false;
        var intv = setInterval(function(){
            var schl = '';
            switch (chl){
                case 0 : schl = ' |';break;
                case 1 : schl = ' /';break;
                case 2 : schl = ' -';break;
                case 3 : schl = ' \\';break;
            }
            if(chl < 3){
                chl++;
            } else {
                chl = 0;
            }

            if($this.isLoading){
                a = true;
                $($this.terminalElem).html($this.tempContent + schl);
                $this.placeCaretAtEnd();
                $this.fixTerminalScroll();
            } else {
                setTimeout(function(){
                    var t = $($this.terminalElem).html();
                    $($this.terminalElem).html($this.tempContent + t.substr($this.tempContent.length + (a ? 2 : 0), t.length));
                    $this.placeCaretAtEnd();
                    $this.fixTerminalScroll();
                }, 75);
                clearInterval(intv);
            }
        },75);
    };

    this.loadingStart = function(){
        this.isLoading = true;
        this.tempContent = $(this.terminalElem).html();
        this.runLoading();
    };

    this.loadingStop = function(){
        this.isLoading = false;
    };

    this._cls = function(){
        this.loadingStop();
        $(this.terminalElem).html(this.systemUser + '@' + this.systemName + ':' + this.directory + this.userType + ' ');
        this.placeCaretAtEnd();
    };

    this._ls = function(command, print, loading){
        var $this = this;
        var arrCommand = this.commandExploder(command);
        var isPrint = true;
        if(print != undefined){
            isPrint = print;
        }

        if(loading == undefined){
            this.loadingStart();
        }

        $this.postCommand(command, function(data){
            $this.loadingStop();
            if(data != '' && arrCommand[0] == 'ls'){
                var res = $.parseJSON(data);
                if(res.length > 0){
                    $this.listDirectory = [];
                    $this.listFile = [];
                    var cmdResult = '';
                    for(var i=0;i<res.length;i++){
                        cmdResult += res[i].name + '<br>';
                        if(res[i].isDir == '1'){
                            if(res[i].name.indexOf(' ') > -1){
                                $this.listDirectory[$this.listDirectory.length] = '"' + res[i].name + '"';
                            } else {
                                $this.listDirectory[$this.listDirectory.length] = res[i].name;
                            }
                        } else {
                            if(res[i].name.indexOf(' ') > -1){
                                $this.listFile[$this.listFile.length] = '"' + res[i].name + '"';
                            } else {
                                $this.listFile[$this.listFile.length] = res[i].name;
                            }
                        }
                    }
                }
            }

            if(isPrint)
                $this.printCommandResult(cmdResult + '<br>');
        });
    };

    this._cd = function(command, print){
        var $this = this;
        var arrCommand = $this.commandExploder(command);

        if(arrCommand.length > 1){
            var cdDir = arrCommand[1];
            if(cdDir == '../'){
                cdDir = '/';
            }
            if(cdDir == '\/'){
                $this.directory = '/';
                $this.printCommandResult();
            } else if(cdDir == '..'){
                if($this.directory != '/' && $this.directory != '~'){
                    var revDir = $this.reverse($this.directory);
                    var posStart = revDir.indexOf('/', 1);
                    $this.directory = $this.reverse(revDir.substr(posStart, revDir.length));
                    if($this.directory == '~/'){
                        $this.directory = '~';
                    }
                }
                $this.printCommandResult();
            } else if(cdDir == '.'){
                $this.directory = $this.directory.substr(0, 1);
                $this.printCommandResult();
            } else if(cdDir == '~'){
                $this.directory = '~';
                $this.printCommandResult();
            } else {
                $this.loadingStart();

                var arrCommand = $this.commandExploder(command);
                $this.postCommand('chkdir ' + arrCommand[1], function(data){
                    if(data == '1'){
                        if(arrCommand[1].charAt(0) == '~' || arrCommand[1].charAt(0) == '/'){
                            if(arrCommand[1].charAt(arrCommand[1].length-1) != '/'){
                                $this.directory = arrCommand[1] + '/';
                            } else {
                                $this.directory = arrCommand[1];
                            }
                        } else if($this.directory == '~'){
                            $this.directory += '/' + arrCommand[1] + '/';
                        } else {
                            $this.directory += arrCommand[1] + '/';
                        }
                        $this.directory = $this.directory.replace(/\/\//g, '/');
                        $this.printCommandResult();
                    } else {
                        $this.printCommandResult('directory not found.<br>');
                    }
                });
            }
            setTimeout(function(){
                $this.runCommand('ls', false, false);
            },10);
        } else {
            $this.printCommandResult('directory empty.<br>');
        }
    };

    this._su = function(command, print){
        var $this = this;
        $this.loadingStop();
        var arrCommand = $this.commandExploder(command);

        if(arrCommand.length > 1){
            if(arrCommand[0] == 'su'){
                $this.password = '';
                var content = $($this.terminalElem).html();
                $($this.terminalElem).html(content + '<br>pass: ');
                $this.placeCaretAtEnd();
                $this.isPassword = true;
                $this.fixTerminalScroll();
            } else {
                $this.printCommandResult(cmdResult + '<br>');
            }
        } else {
            $this.printCommandResult(cmdResult + '<br>');
        }
    };

    this._exit = function(command, print){
        var $this = this;
        $this.loadingStop();
        if($this.userType == '#'){
            $this.postCommand('exit', function(){
                $this.userType = '$';
                $this.printCommandResult();
            });

        } else {
            $this.printCommandResult();
        }
    };

    this._mkdir = function(command, print){
        var $this = this;
        var arrCommand = $this.commandExploder(command);

        var dir = arrCommand[1];
        $this.postCommand(command, function(data){
            $this.loadingStop();
            $this.printCommandResult(data+'<br>');
        });
    };

    this._rmdir = function(command, print){
        var $this = this;
        var arrCommand = $this.commandExploder(command);

        var dir = arrCommand[1];
        $this.postCommand('chkdir '+dir, function(data){
            $this.loadingStop();
            if(data == '1'){
                var content = $($this.terminalElem).html();
                $($this.terminalElem).html(content + '<br>are you sure remove this directory? ');
                $this.placeCaretAtEnd();
                $this.isConfirm = true;
                $this.moreSpace = 13;
                $this.fixTerminalScroll();
                $this.tempCommand = command;
            } else {
                $this.printCommandResult('directory not found.<br>');
            }
        });
    };

    this._rm = function(command, print){
        var $this = this;
        var arrCommand = $this.commandExploder(command);

        var dir = arrCommand[1];
        $this.postCommand('chkfile '+dir, function(data){
            $this.loadingStop();
            if(data == '1'){
                var content = $($this.terminalElem).html();
                $($this.terminalElem).html(content + '<br>are you sure remove this file? ');
                $this.placeCaretAtEnd();
                $this.isConfirm = true;
                $this.moreSpace = 8;
                $this.fixTerminalScroll();
                $this.tempCommand = command;
            } else {
                $this.printCommandResult('file not found.<br>');
            }
        });
    };

    this._cp = function(command, print){
        var $this = this;
        $this.postCommand(command, function(data){
            $this.loadingStop();
            if(data == '1'){
                $this.printCommandResult('success copy file.<br>');
            } else {
                $this.printCommandResult('failed copy file.<br>');
            }
        });
    };

    this._mv = function(command, print){
        var $this = this;
        $this.postCommand(command, function(data){
            $this.loadingStop();
            if(data == '1'){
                $this.printCommandResult('success move file.<br>');
            } else {
                $this.printCommandResult('failed move file.<br>');
            }
        });
    }
}

