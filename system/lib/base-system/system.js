/**
 * Created with JetBrains PhpStorm.
 * User: JOKO PURNOMO A
 * Date: 4/26/15
 * Time: 10:05 AM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

function tryExec(func){
    try {
        func();
        return true;
    } catch(err) {
        console.log(err);
        return err;
    }
}

function BaseSystem(){

    this.name = 'system';
    this.user = 'jokopurnomoa';
    this.type = '$';
    this.baseFocus = true;

    this.runBackgroundProcess = function(callback){
        if(typeof callback === 'function'){
            callback();
        }
    };

    this.preventDefaultButton = function(){
        var parent = this;
        $(document).keydown(function(event){
            if(parent.baseFocus){
                return false;
            }
        });
    };

    this.setBaseFocus = function(opt){
        this.baseFocus = opt;
    }

}

var System = new BaseSystem();

$(document).ready(function(){
    System.runBackgroundProcess(new UserInterface().run());
    System.preventDefaultButton();
});


