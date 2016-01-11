<?php
/**
 * Created by JetBrains PhpStorm.
 * User: JOKO PURNOMO A
 * Date: 4/25/15
 * Time: 10:24 AM
 * To change this template use File | Settings | File Templates.
 */

class FilesDirectory {

    private $protectedDir = array('/', '/bin/', '/dev/', '/etc/', '/lib/', '/sbin/', '/usr/', '/var/');

    private function getSysDir(){
        $sysdir = __DIR__;
        $sysdir = str_replace('\\','/',strrev($sysdir));

        $offset = strlen('bin/com.jpa.terminal');

        $sep = strpos($sysdir, '/', $offset);
        $sysdir = substr($sysdir, $sep, strlen($sysdir));

        return substr(strrev($sysdir), 0, strlen($sysdir)-1);
    }

    private function fixDirectorySeparator($dir){
        $dir = str_replace('"', '', $dir);
        $dir = str_replace('//', '/', $dir);
        $dir = str_replace('//', '/', $dir);
        $dir = str_replace('\\\\', '\\', $dir);
        $dir = str_replace('\\\\', '\\', $dir);
        if(PHP_OS === 'WINNT'){
            return str_replace('\\', '//', $dir);
        } else {
            return str_replace('\\', '/', $dir);
        }
    }

    private function containsProtectedDir($dir){
        foreach($this->protectedDir as $d){
            if(strpos($dir, $d) !== false && $d != '/usr/'){
                return true;
            }
        }
        return false;
    }

    public function ls($usertype, $username, $directory){
        $directory = str_replace('~', '/usr/'.$username, $directory);
        if(substr($directory, strlen($directory)-1, 1) != '/'){
            $directory .= '/';
        }
        $dir = $this->fixDirectorySeparator($this->getSysDir().$directory);
        if($dir != ''){
            $list = scandir($dir);
            if($list != null){
                $res = array();
                foreach($list as $l){
                    $res[] = array(
                        'name' => $l,
                        'isDir' => (is_file($dir.$l) ? '0' : '1')
                    );
                }
                echo json_encode($res);
            }
        }
    }

    private function isProtectedDir($dir){
        if(substr(strrev($dir),0,1) != '/'){
            $dir = $dir.'/';
        }
        $dir = str_replace('//', '/', $dir);
        foreach($this->protectedDir as $d){
            if($dir == $d){
                return true;
            }
        }
        return false;
    }

    private function isProtectedPath($dir){
        $pos = strpos($dir, '/', 1);
        $dir = substr($dir, 0, $pos).'/';
        foreach($this->protectedDir as $d){
            if($dir == $d && $dir != '/usr/'){
                return true;
            }
        }
        return false;
    }

    public function mkdir($usertype, $username, $directory, $new_dir){
        $directory = str_replace('~', '/usr/'.$username, $directory);
        if(substr($directory, strlen($directory)-1, 1) != '/'){
            $directory .= '/';
        }

        $dir = $this->fixDirectorySeparator($this->getSysDir().$directory);

        if($usertype == '$'){
            if(!$this->isProtectedDir($directory)){
                if(!file_exists($dir.$new_dir)){
                    if($this->recurse_mkdir($dir.$new_dir)){
                        echo 'directory '.$new_dir.' created.';
                    } else {
                        echo 'failed create directory '.$new_dir.'.';
                    }
                } else {
                    echo 'directory '.$new_dir.' is exists.';
                }
            } else {
                echo 'user not authorized.';
            }
        } else {
            if(getSession('su') == 'true'){
                if(!file_exists($dir.$new_dir)){
                    if($this->recurse_mkdir($dir.$new_dir)){
                        echo 'directory '.$new_dir.' created.';
                    } else {
                        echo 'failed create directory '.$new_dir.'.';
                    }
                } else {
                    echo 'directory '.$new_dir.' is exists.';
                }
            } else {
                echo 'user not authorized.';
            }
        }
    }

    public function recurse_mkdir($dir){
        $dir = str_replace('\\', '/', $dir);
        $arr_dir = explode('/', $dir);
        $new_dir = '';
        $res = true;
        if($arr_dir != null){
            foreach($arr_dir as $d){
                $new_dir .= $d.'/';
                if(!file_exists($new_dir)){
                    if(strpos($d, '.') === false){
                        if(!mkdir($new_dir)){
                            $res = false;
                        }
                    }
                }
            }
        }
        return $res;
    }

    public function getWorkDir($username, $base_directory, $directory){
        $base_directory = str_replace('~', '/usr/'.$username, $base_directory);
        if(substr($base_directory, strlen($base_directory)-1, 1) != '/'){
            $base_directory .= '/';
        }

        $directory = str_replace('~', '/usr/'.$username, $directory);
        if(substr($directory, strlen($directory)-1, 1) != '/'){
            $directory .= '/';
        }

        $dir = $this->getSysDir();
        if(substr($directory, 0, 1) == '/'){
            $dir .= $directory;
        } else {
            $dir .= $base_directory.$directory;
        }

        return str_replace('"', '', $dir);
    }

    public function chkdir($username, $base_directory, $directory){
        $dir = $this->fixDirectorySeparator($this->getWorkDir($username, $base_directory, $directory));

        if(file_exists($dir)){
            if(is_file($dir)){
                echo '0';
            } else {
                echo '1';
            }
        } else {
            echo '0';
        }
    }

    public function chkfile($username, $base_directory, $file){
        $dir = $this->fixDirectorySeparator($this->getWorkDir($username, $base_directory, $file));
        $dir = substr($dir, 0, strlen($dir)-1);

        if(file_exists($dir)){
            if(is_file($dir)){
                echo '1';
            } else {
                echo '0';
            }
        } else {
            echo '0';
        }
    }

    public function rm($usertype, $username, $directory, $file){
        $dir = $this->getWorkDir($username, $directory, $file);
        $dir = substr($dir, 0, strlen($dir)-1);

        if($usertype == '$'){
            if(!$this->isProtectedPath($dir)){
                if(file_exists($dir)){
                    if(unlink($dir)){
                        echo 'file '.$file.' removed.';
                    } else {
                        echo 'failed remove file '.$file.'.';
                    }
                } else {
                    echo 'file '.$file.' not found.';
                }
            } else {
                echo 'user not authorized.';
            }
        } else {
            if(getSession('su') == 'true'){
                if(!$this->isProtectedPath($dir)){
                    if(file_exists($dir)){
                        if(unlink($dir)){
                            echo 'directory '.$file.' removed.';
                        } else {
                            echo 'failed remove file '.$file.'.';
                        }
                    } else {
                        echo 'file '.$file.' not found.';
                    }
                } else {
                    echo 'failed remove file '.$file.'.';
                }
            } else {
                echo 'user not authorized.';
            }
        }
    }

    public function rmdir($usertype, $username, $base_directory, $directory, $ignore_content = false){
        $dir = $this->getWorkDir($username, $base_directory, $directory);

        $list = scandir($dir);
        if(count($list) > 2 && !$ignore_content){
            echo 'failed remove directory '.$directory.'.';
            return;
        }
        if($usertype == '$'){
            if(!$this->isProtectedDir($dir)){
                if(file_exists($dir)){
                    if($ignore_content){
                        if($this->rrmdir($dir)){
                            echo 'directory '.$directory.' removed.';
                        } else {
                            echo 'failed remove directory '.$directory.'.';
                        }
                    }
                    else if(rmdir($dir)){
                        echo 'directory '.$directory.' removed.';
                    } else {
                        echo 'failed remove directory '.$directory.'.';
                    }
                } else {
                    echo 'directory '.$directory.' not found.';
                }
            } else {
                echo 'user not authorized.';
            }
        } else {
            if(getSession('su') == 'true'){
                if(!$this->isProtectedDir($dir)){
                    if(file_exists($dir)){
                        if($ignore_content){
                            if($this->rrmdir($dir)){
                                echo 'directory '.$directory.' removed.';
                            } else {
                                echo 'failed remove directory '.$directory.'.';
                            }
                        }
                        else if(rmdir($dir)){
                            echo 'directory '.$directory.' removed.';
                        } else {
                            echo 'failed remove directory '.$directory.'.';
                        }
                    } else {
                        echo 'directory '.$directory.' not found.';
                    }
                } else {
                    echo 'failed remove directory '.$directory.'.';
                }
            } else {
                echo 'user not authorized.';
            }
        }
    }

    public function rrmdir($dir) {
        if (is_dir($dir)) {
            $objects = scandir($dir);
            foreach ($objects as $object) {
                if ($object != "." && $object != "..") {
                    if (filetype($dir."/".$object) == "dir"){
                        $this->rrmdir($dir."/".$object);
                    }else{
                        unlink($dir."/".$object);
                    }
                }
            }
            reset($objects);
            return rmdir($dir);
        }
    }

    public function cp($usertype, $username, $src, $dst, $overwrite = false, $recursive = false){
        $directory = str_replace('~', '/usr/'.$username, $src);
        if(substr($directory, strlen($directory)-1, 1) != '/'){
            $directory .= '/';
        }
        $dir_src = $this->getSysDir().$directory;
        $dir_src = substr($dir_src, 0, strlen($dir_src)-1);
        $last_dir = str_replace('/', '', strrev(substr(strrev($dir_src), 0, strpos(strrev($dir_src), '/'))));

        $directory = str_replace('~', '/usr/'.$username, $dst);
        if(substr($directory, strlen($directory)-1, 1) != '/' && strpos($last_dir, '.') === false){
            $directory .= '/';
        }
        $last_dir_dest = str_replace('/', '', strrev(substr(strrev($dst), 0, strpos(strrev($dst), '/'))));

        $dir_src = $this->fixDirectorySeparator($dir_src);
        if(file_exists($dir_src)){
            $this->recurse_mkdir($this->getSysDir().$directory.$last_dir);

            if(is_dir($this->getSysDir().$directory.'/')){
                $dir_dst = $this->getSysDir().$directory.$last_dir;
            } else {
                $len = strlen($this->getSysDir().$directory);
                if(strpos(strrev($this->getSysDir().$directory), 0, 1) == '/'){
                    $dir_dst = substr($this->getSysDir().$directory, 0, $len-1);
                } else {
                    $dir_dst = $this->getSysDir().$directory;
                }
                if(strpos($last_dir_dest, '.') === false){
                    $dir_dst .= '/';
                }
            }
            $dir_dst = $this->fixDirectorySeparator($dir_dst);

            if(!file_exists($dir_dst) || $recursive){
                if($this->containsProtectedDir($dir_src)){
                    if($usertype != '#'){
                        return '0';
                    }
                    if(getSession('su') != 'true'){
                        return '0';
                    }
                }
                if($this->recurse_copy($dir_src, $dir_dst, $overwrite, $recursive)){
                    return '1';
                }
            }
        }
        return '0';
    }

    public function mv($usertype, $username, $src, $dst, $overwrite = false, $recursive = false){
        $directory = str_replace('~', '/usr/'.$username, $src);
        if(substr($directory, strlen($directory)-1, 1) != '/'){
            $directory .= '/';
        }
        $dir_src = $this->getSysDir().$directory;
        $dir_src = substr($dir_src, 0, strlen($dir_src)-1);
        $last_dir = str_replace('/', '', strrev(substr(strrev($dir_src), 0, strpos(strrev($dir_src), '/'))));

        $directory = str_replace('~', '/usr/'.$username, $dst);
        if(substr($directory, strlen($directory)-1, 1) != '/' && strpos($last_dir, '.') === false){
            $directory .= '/';
        }
        $last_dir_dest = str_replace('/', '', strrev(substr(strrev($dst), 0, strpos(strrev($dst), '/'))));

        $dir_src = $this->fixDirectorySeparator($dir_src);
        if(file_exists($dir_src)){
            $this->recurse_mkdir($this->getSysDir().$directory.$last_dir);

            if(is_dir($this->getSysDir().$directory.'/')){
                $dir_dst = $this->getSysDir().$directory.$last_dir;
            } else {
                $len = strlen($this->getSysDir().$directory);
                if(strpos(strrev($this->getSysDir().$directory), 0, 1) == '/'){
                    $dir_dst = substr($this->getSysDir().$directory, 0, $len-1);
                } else {
                    $dir_dst = $this->getSysDir().$directory;
                }
                if(strpos($last_dir_dest, '.') === false){
                    $dir_dst .= '/';
                }
            }
            $dir_dst = $this->fixDirectorySeparator($dir_dst);

            if(!file_exists($dir_dst) || $recursive){
                if($this->containsProtectedDir($dir_src)){
                    if($usertype != '#'){
                        return '0';
                    }
                    if(getSession('su') != 'true'){
                        return '0';
                    }
                }
                if($this->recurse_copy($dir_src, $dir_dst, $overwrite, $recursive)){
                    $this->rrmdir($dir_src);
                    return '1';
                }
            }
        }
        return '0';
    }

    public function recurse_copy($source, $dest, $overwrite, $recursive){
        $res = true;
        if(is_dir($source)) {
            if($recursive){
                $dir_handle=opendir($source);
                while($file=readdir($dir_handle)){
                    if($file!="." && $file!=".."){
                        if(is_dir($source."/".$file)){
                            if(!is_dir($dest."/".$file)){
                                mkdir($dest."/".$file);
                            }
                            $this->recurse_copy($source."/".$file, $dest."/".$file, $overwrite, $recursive);
                        } else {
                            if(!file_exists($dest."/".$file)){
                                if(!copy($source."/".$file, $dest."/".$file)){
                                    $res = false;
                                }
                            } else {
                                // overwrite
                                if($overwrite){
                                    unlink($dest."/".$file);
                                    if(!copy($source."/".$file, $dest."/".$file)){
                                        $res = false;
                                    }
                                }
                            }
                        }
                    }
                }
                closedir($dir_handle);
            } else {
                $res = false;
            }
        } else {
            if(!file_exists($dest)){
                $res = copy($source, $dest);
            } else {
                // overwrite
                if($overwrite){
                    unlink($dest);
                    $res = copy($source, $dest);
                }
            }
        }
        return $res;
    }
}