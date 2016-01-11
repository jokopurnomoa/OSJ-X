/**
 * Created with JetBrains PhpStorm.
 * User: JOKO PURNOMO A
 * Date: 4/27/15
 * Time: 12:21 AM
 * To change this template use File | Settings | File Templates.
 */

function ComJpaFinder(){
    this.appsName = 'Finder';
    this.appsId = 'com.jpa.finder';
    this.icon = 'images/icon.png';
    this.appsversion = '1.0';
    this.dateCreated = '2015/04/26';
    this.creator = 'Joko Purnomo A';
    this.baseSelector = '#com-jpa-finder';
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

    this.leftItemId = -1;
    this.directoryHistory = ['~'];
    this.idDirectoryHistory = 0;
    this.Terminal = new ComJpaTerminal();

    this.create = function(){
        Application.loadStyle('system/bin/com.jpa.finder/finder.css');
        Application.generateContainer(this.appsId);
        Application.generateHeaderCustom(this.appsId, 60);
        Application.generateHeaderButton(this.appsId, [Application.CLOSE_BUTTON, Application.MAXIMIZE_BUTTON, Application.MINIMIZE_BUTTON]);
        Application.generateContent(this.appsId, '<div id="com-jpa-finder-content"><div id="com-jpa-finder-content-left"></div><div id="com-jpa-finder-content-right"><div id="finder-content-list"></div></div></div>');
        Application.setContainerSize(this.appsId, this.appsWidth, this.appsHeight);
        $('#com-jpa-finder-header').append('<div id="com-jpa-finder-btn-prev"><img src="system/bin/com.jpa.finder/images/arrow-left.png"></div>');
        $('#com-jpa-finder-header').append('<div id="com-jpa-finder-btn-next"><img src="system/bin/com.jpa.finder/images/arrow-right.png"></div>');
    };

    this.init = function(){
        var $this = this;
        $(document).ready(function(){
            $('#com-jpa-finder-content').mousedown(function(){
                AppManager.enqueue(AppManager.getAppsRunningById($this.appsId.replace(/\-/g, '.')), AppManager.FOCUS);
                System.setBaseFocus(true);
            });

            $this.makeEditable();
            $this.fixFinderContent();

            $('#com-jpa-finder-content').keydown(function(evt){

            });

            $('#com-jpa-finder-btn-prev').click(function(){

            });

            $('#com-jpa-finder-btn-next').click(function(){

            });

            $this.addLeftContentItemHeader('Favorites');
            $this.addLeftContentItem('All My Files', null, function(){
                $this.clearRightContentList();
                $this.Terminal.directory = '~';
                $this.Terminal.postCommand('ls', function(data){
                    $this.addListDirectory(data);
                });
            });
            $this.addLeftContentItem('AirDrop', null, function(){
                $this.clearRightContentList();
            });
            $this.addLeftContentItem('iCloud', null, function(){
                $this.clearRightContentList();
            });
            $this.addLeftContentItem('Applications', null, function(){
                $this.clearRightContentList();
                $this.Terminal.directory = '~/Applications';
                $this.Terminal.postCommand('ls', function(data){
                    $this.addListDirectory(data);
                });
            });
            $this.addLeftContentItem('Desktop', null, function(){
                $this.clearRightContentList();
                $this.Terminal.directory = '~/Desktop';
                $this.Terminal.postCommand('ls', function(data){
                    $this.addListDirectory(data);
                });
            });
            $this.addLeftContentItem('Documents', null, function(){
                $this.clearRightContentList();
                $this.Terminal.directory = '~/Documents';
                $this.Terminal.postCommand('ls', function(data){
                    $this.addListDirectory(data);
                });
            });
            $this.addLeftContentItem('Downloads', null, function(){
                $this.clearRightContentList();
                $this.Terminal.directory = '~/Downloads';
                $this.Terminal.postCommand('ls', function(data){
                    $this.addListDirectory(data);
                });
            });

            $this.addLeftContentItemHeader('Devices');
            $this.addLeftContentItemHeader('Shared');
            $this.addLeftContentItemHeader('Tags');
        });
    };
    this.open = function(){

    };
    this.focus = function(){
        $('#com-jpa-finder-url').focus();
    };
    this.unfocus = function(){};
    this.minimize = function(){};
    this.close = function(){

    };
    this.destroy = function(){};

    this.makeEditable = function(){
        var $this = this;
        $(document).ready(function(){
            $('#com-jpa-finder-content').bind('mousedown.ui-disableSelection selectstart.ui-disableSelection', function(e){
                e.stopImmediatePropagation();
            });
        });
    }

    this.fixFinderContent = function(){
        var $this = this;
        $(document).ready(function(){
            function update(){
                if($this.appsStatus == AppStatus.FOCUSED){
                    $this.repaintSpeed = 1;
                } else {
                    $this.repaintSpeed = 100;
                }

                var appsWidth = $('#com-jpa-finder').width();
                var appsHeight = $('#com-jpa-finder').height();
                var headerHeight = $('#com-jpa-finder-header').height();
                $('#com-jpa-finder-content').width(appsWidth).height(appsHeight - (headerHeight));

                var leftContentWidth = $('#com-jpa-finder-content-left').width();
                $('#com-jpa-finder-content-right').width(appsWidth - (leftContentWidth + 2));

                setTimeout(function(){
                    update();
                },$this.repaintSpeed);
            }
            update();

            $('#com-jpa-finder-iframe-protector').hide();

            $('#com-jpa-finder').on( "resizestart", function( event, ui ) {
                $('#com-jpa-finder-iframe-protector').show();
            } );

            $('#com-jpa-finder').on( "resizestop", function( event, ui ) {
                $('#com-jpa-finder-iframe-protector').hide();
            } );

            $('#com-jpa-finder').on( "dragstart", function( event, ui ) {
                $('#com-jpa-finder-iframe-protector').show();
            } );

            $('#com-jpa-finder').on( "dragstop", function( event, ui ) {
                $('#com-jpa-finder-iframe-protector').hide();
            } );
        });
    }

    this.addListDirectory = function(data){
        if(data != '' && data.indexOf('xdebug-error') == -1){
            var data = $.parseJSON(data);
            if(typeof data === 'object'){
                for(var i=0;i<data.length;i++){
                    if(data[i].name != '.' && data[i].name != '..'){
                        this.addRightContentList(data[i].name, null, (i % 2 == 0 ? true : false));
                    }
                }
            }
        }
    }

    this.addLeftContentItemHeader = function(val){
        var item = '<div class="finder-left-item-header">' + val + '</div>';
        $('#com-jpa-finder-content-left').append(item);
    }

    this.addLeftContentItem = function(val, icon, callback){

        var item = '<div class="finder-left-item" id="finder-left-item-' + (++this.leftItemId) + '"><div class="finder-left-item-icon"></div>' + val + '</div>';
        $('#com-jpa-finder-content-left').append(item);

        $('#finder-left-item-' + this.leftItemId).mousedown(function(e){
            if(typeof callback === 'function'){
                callback();
            }
        });

    }

    this.addRightContentList = function(val, icon, odd){
        if(typeof icon === 'undefined' || icon == null){
            icon = '';
        }
        if(odd){
            var item = '<div class="finder-content-list-item-odd" data-src="' + val + '">' + icon + ' ' + val + '</div>';
        } else {
            var item = '<div class="finder-content-list-item-even" data-src="' + val + '">' + icon + ' ' + val + '</div>';
        }

        $('#finder-content-list').append(item);
    }

    this.clearRightContentList = function(){
        $('#finder-content-list').html('');
    }

}