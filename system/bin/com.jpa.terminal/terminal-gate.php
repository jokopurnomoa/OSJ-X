<?php
/**
 * Created by JetBrains PhpStorm.
 * User: JOKO PURNOMO A
 * Date: 4/25/15
 * Time: 10:16 AM
 * To change this template use File | Settings | File Templates.
 */

require_once("Controller.php");

$controller = new Controller();

$command = postInput('command');
$usertype = postInput('usertype');
$username = postInput('username');
$directory = str_replace('"', '', postInput('directory'));

if($command != ''){
    $command = json_decode($command);
    for($i=count($command); $i < 4;$i++){
        $command[] = '';
    }
} else {
    $command = array();
    for($i=0; $i < 4;$i++){
        $command[] = '';
    }
}

$controller->runCommand($command, $usertype, $username, $directory);