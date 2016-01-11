<?php
/**
 * Created by JetBrains PhpStorm.
 * User: JOKO PURNOMO A
 * Date: 4/27/15
 * Time: 8:44 PM
 * To change this template use File | Settings | File Templates.
 */

// connect via SSL, but don't check cert

//$url = 'https://www.google.com/';
$url = 'https://jquery.com';
if(isset($_GET['url'])){
    $url = $_GET['url'];
}

function get_content($url){
    $handle=curl_init($url);
    curl_setopt($handle, CURLOPT_VERBOSE, true);
    curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($handle, CURLOPT_SSL_VERIFYPEER, false);
    return curl_exec($handle);
}

$content = get_content($url);

$endpos = strpos($url, '/', 9);
if($endpos === false){
    $endpos = strlen($url);
}

$base_url = substr($url, 0, $endpos);
$this_url = 'http://' . $_SERVER['REMOTE_ADDR'];

if(strpos($content, '302 Moved') !== false){
    $http_pos = strpos($content, '="http');
    $end_http_pos = strpos($content, '"', $http_pos + 6);
    $new_url = substr($content, $http_pos + 2, $end_http_pos - ($http_pos + 2));

    $content = get_content($new_url);
}

$content = str_replace('url(//', 'url(http://', $content);
$content = str_replace('src="//', 'src="http://', $content);
$content = str_replace('src="/', 'src="'.$base_url.'/', $content);
$content = str_replace('action="/', 'action="'.$base_url.'/', $content);
$content = str_replace('url(/', 'url('.$base_url.'/', $content);
$content = str_replace('dljp(\'/', 'dljp(\''.$base_url.'/', $content);

$content = str_replace($this_url, $base_url, $content);
//str_replace($this_url, $base_url, $content);

echo $content;
