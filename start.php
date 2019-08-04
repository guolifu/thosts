<?php
/**
 * @author carl
 */
define('THOSTS', __DIR__);
define('LIB', THOSTS . '/lib');
define('SOURCE', THOSTS . '/source');
define('CONFIG_PATH', SOURCE . '/config.php');
define('HOSTS_PATH', SOURCE . '/hosts');
include LIB . '/hosts.class.php';
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
    case 'envCreate':
    {
        $hostsObj->createHostsApi();
        break;
    }
    case 'envList' :
    {
        $hostsObj->getHostsConfListApi();
        break;
    }
    case 'envChange' :
    {
        $hostsObj->envChangeApi();
        break;
    }
    case 'envDelete' :
    {
        $hostsObj->envDelApi();
        break;
    }
    default :
    {
        Header('Location:./index.html');
    }
}
