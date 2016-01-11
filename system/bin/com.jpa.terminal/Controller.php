<?php
/**
 * Created by JetBrains PhpStorm.
 * User: JOKO PURNOMO A
 * Date: 4/24/15
 * Time: 6:01 PM
 * To change this template use File | Settings | File Templates.
 */

require_once("DefaultIO.php");
require_once("FilesDirectory.php");
require_once("Security.php");

class Controller {

    public function __construct(){

    }

    public function cleanCommand($command){
        $res = array();
        if(count($command) > 0){
            foreach($command as $c){
                $res[] = str_replace('"', '', $c);
            }
        }
        return $res;
    }

    public function runCommand($command, $usertype, $username, $directory){
        $command = $this->cleanCommand($command);
        if($command[0] != ''){

            $filesDirectory = new FilesDirectory();
            $security = new Security();

            switch($command[0]){
                case 'authenticate' : {
                    $security->authenticate($username, $directory);
                }break;
                case 'exit' : {
                    $security->logout();
                }break;
                case 'ls' : {
                    $filesDirectory->ls($usertype, $username, str_replace('..', '', $directory));
                }break;
                case 'mkdir' : {
                    if($command[1] != ''){
                        $filesDirectory->mkdir($usertype, $username, str_replace('..', '', $directory), $command[1]);
                    } else {
                        echo 'directory empty.';
                    }
                }break;
                case 'chkdir' : {
                    if($command[1] != ''){
                        $filesDirectory->chkdir($username, str_replace('..', '', $directory), str_replace('..', '', $command[1]));
                    } else {
                        echo 'directory empty.';
                    }
                }break;
                case 'chkfile' : {
                    if($command[1] != ''){
                        $filesDirectory->chkfile($username, str_replace('..', '', $directory), str_replace('..', '', $command[1]));
                    } else {
                        echo 'file not found.';
                    }
                }break;
                case 'rm' : {
                    if($command[1] != ''){
                        $filesDirectory->rm($usertype, $username, str_replace('..', '', $directory), str_replace('..', '', $command[1]));
                    } else {
                        echo 'file not found.';
                    }
                }break;
                case 'rmdir' : {
                    if($command[1] != ''){
                        if(strtoupper($command[2]) == '-R'){
                            $filesDirectory->rmdir($usertype, $username, str_replace('..', '', $directory), str_replace('..', '', $command[1]), true);
                        } else {
                            $filesDirectory->rmdir($usertype, $username, str_replace('..', '', $directory), str_replace('..', '', $command[1]));
                        }
                    } else {
                        echo 'directory empty.';
                    }
                }break;
                case 'cp' : {
                    if($command[1] != ''){
                        $opt = strtoupper($command[3]);
                        if($opt == '-IR' || $opt == '-RI'){
                            echo $filesDirectory->cp($usertype, $username, $command[1], $command[2], true, true);
                        } else if($opt == '-I'){
                            echo $filesDirectory->cp($usertype, $username, $command[1], $command[2], true);
                        } else if($opt == '-R'){
                            echo $filesDirectory->cp($usertype, $username, $command[1], $command[2], false, true);
                        } else {
                            echo $filesDirectory->cp($usertype, $username, $command[1], $command[2]);
                        }
                    } else {
                        echo 'directory empty.';
                    }
                }break;
                case 'mv' : {
                    if($command[1] != ''){
                        $opt = strtoupper($command[3]);
                        if($opt == '-IR' || $opt == '-RI'){
                            echo $filesDirectory->mv($usertype, $username, $command[1], $command[2], true, true);
                        } else if($opt == '-I'){
                            echo $filesDirectory->mv($usertype, $username, $command[1], $command[2], true);
                        } else if($opt == '-R'){
                            echo $filesDirectory->mv($usertype, $username, $command[1], $command[2], false, true);
                        } else {
                            echo $filesDirectory->mv($usertype, $username, $command[1], $command[2]);
                        }
                    } else {
                        echo 'directory empty.';
                    }
                }break;
                default : {
                    echo 'command not found.';
                }
            }
        }
    }

}