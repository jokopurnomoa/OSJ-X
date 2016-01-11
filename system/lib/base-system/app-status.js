/**
 * Created with JetBrains PhpStorm.
 * User: JOKO PURNOMO A
 * Date: 4/26/15
 * Time: 3:37 PM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

function ApplicationStatus(){

    this.CREATED     = 100;
    this.INITIALIZED = 110;
    this.OPENED      = 120;
    this.UNFOCUSED   = 130;
    this.FOCUSED     = 140;
    this.MINIMIZED   = 150;
    this.CLOSED      = 160;
    this.DESTROYED   = 170;

}

var AppStatus = new ApplicationStatus();
