<?php

/**
 * @author carl
 */
class Hosts
{
    public $hosts_path = '/etc/hosts';

    public function __construct()
    {

    }

    public function getHosts()
    {
        $hosts = file_get_contents($this->hosts_path);
        $pattern = '/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/';
        $hosts = preg_replace($pattern, '<input class="checkbox" type="checkbox"><span class="ip">' . '${0}' . '</span><span class="domain">', $hosts);
        $hosts = str_replace(PHP_EOL, '</span><br>', $hosts);
        $pattern = '/#|;/';
        $hosts = preg_replace($pattern, '<b>' . '${0}' . '</b>', $hosts);
        $resData = array('data' => $hosts);
        $this->success($resData, 'success');
    }

    public function getTextareaHosts()
    {
        $hosts = file_get_contents($this->hosts_path);
        $resData = array('data' => '<textarea>' . $hosts . '</textarea>');
        $this->success($resData, 'success');

    }

    public function saveHosts()
    {
        $hosts = str_replace('<br>', PHP_EOL, $_POST['content']);
        $res = file_put_contents($this->hosts_path, strip_tags($hosts));
        if ($res) {
            $this->success($res, 'success');

        } else {
            $this->error($res, 'error');
        }
    }

    public function success($data, $msg)
    {
        header("Content-type: application/json");
        echo json_encode(array(
            'code' => 200,
            'msg' => $msg,
            'data' => $data
        ));
        die;
    }

    public function error($data, $msg)
    {
        header("Content-type: application/json");
        echo json_encode(array(
            'code' => 500,
            'msg' => $msg,
            'data' => $data
        ));
        die;
    }


}