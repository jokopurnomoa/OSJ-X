<?php
/**
 * Created by JetBrains PhpStorm.
 * User: JOKO PURNOMO A
 * Date: 4/25/15
 * Time: 12:45 PM
 * To change this template use File | Settings | File Templates.
 */

class Security {

    private function getSysDir(){
        $sysdir = __DIR__;
        $sysdir = str_replace('\\','/',strrev($sysdir));

        $offset = strlen('bin/com.jpa.terminal');

        $sep = strpos($sysdir, '/', $offset);
        $sysdir = substr($sysdir, $sep, strlen($sysdir));

        return substr(strrev($sysdir), 0, strlen($sysdir)-1);
    }

    public function authenticate($username, $password){
        $dir = $this->getSysDir();
        $handle = fopen($dir.'/etc/userlst', 'rt');
        $data = fread($handle, 1000);
        fclose($handle);
        $users = json_decode($data);
        if($users != null){
            foreach($users as $user){
                if($user->username == $username && $user->password == $password){
                    setSession('su', 'true');
                    echo '1';
                    return;
                }
            }
        }
        echo '0';
    }

    public function logout(){
        setSession('su', 'false');
    }

}