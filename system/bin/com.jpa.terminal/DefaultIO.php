<?php
/**
 * Created by JetBrains PhpStorm.
 * User: JOKO PURNOMO A
 * Date: 4/25/15
 * Time: 2:52 PM
 * To change this template use File | Settings | File Templates.
 */

function getInput($param){
    if(isset($_GET[$param]))
        return $_GET[$param];
    return null;
}

function postInput($param){
    if(isset($_POST[$param]))
        return $_POST[$param];
    return null;
}

function getSysDir(){
    $sysdir = __DIR__;
    $sysdir = str_replace('\\','/',strrev($sysdir));

    $offset = strlen('bin/com.jpa.terminal');

    $sep = strpos($sysdir, '/', $offset);
    $sysdir = substr($sysdir, $sep, strlen($sysdir));

    return substr(strrev($sysdir), 0, strlen($sysdir)-1);
}

function getClientIP() {
    $ipaddress = '';
    if($_SERVER['REMOTE_ADDR'])
        $ipaddress = $_SERVER['REMOTE_ADDR'];
    else
        $ipaddress = 'UNKNOWN';
    return $ipaddress;
}

function getSessionFile(){
    $dir = getSysDir();
    if(file_exists($dir.'/etc/session/sess'.md5(getClientIP()))){
        $handle = fopen($dir.'/etc/session/sess'.md5(getClientIP()), 'rt');
        $data = fread($handle, 1000);
        fclose($handle);
        return json_decode($data);
    }
    return null;
}

function setSessionFile($data){
    $dir = getSysDir();
    $handle = fopen($dir.'/etc/session/sess'.md5(getClientIP()), 'wt');
    $res = fwrite($handle, $data);
    fclose($handle);
    return $res;
}

function setSession($param, $value){
    $session = getSessionFile();
    $duplicate = false;
    $i = 0;
    if($session != null){
        foreach($session as $sess){
            if($sess->key == $param){
                $duplicate = true;
                $session[$i]->value = $value;
            }
            $i++;
        }
    }
    if(!$duplicate)
        $session[] = array('key' => $param, 'value' => $value);
    setSessionFile(json_encode($session));
}

function getSession($param){
    $session = getSessionFile();
    if($session != null){
        foreach($session as $sess){
            if($sess->key == $param)
                return $sess->value;
        }
    }
}