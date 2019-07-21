<?php
/**
 * @author carl
 */
define('THOSTS',__DIR__);
define('LIB',THOSTS.'/lib');
define('SOURCE',THOSTS.'/source');
define('CONFIG_PATH',THOSTS.'/source/config.php');
include LIB.'/hosts.class.php';
$hostsObj = new Hosts;
switch ($_GET['act']) {
    case 'get':
        {
            $hostsObj->getHosts();
            break;
        }
    case 'getarea':
        {
            $hostsObj->getTextareaHosts();
            break;
        }

    case 'save':
        {
            $hostsObj->saveHosts();
            break;
        }
        case 'create':
        {
            $hostsObj->createHosts();
            break;
        }
    default :
        {
            Header('Location:./index.html');
        }
}
