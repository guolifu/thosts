<?php
/**
 * @author carl
 */
include './lib/hosts.class.php';
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
    default :
        {
            Header('Location:./index.html');
        }
}
