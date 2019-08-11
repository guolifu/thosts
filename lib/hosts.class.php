<?php

/**
 * @author carl
 */
class Hosts
{
    /**
     * @var string
     */
    public $base_hosts_path = '/etc/hosts';

    /**
     * @var string
     */
    public $tmp_path = SOURCE . '/hosts.tmp';

    /**
     * @var string
     */
    public $defaultHostFile = HOSTS_PATH . '/hosts_default';

    /**
     * @var mixed
     */
    public $config;

    /**
     * @var bool
     */
    public $preEnv = true;

    /**
     * Hosts constructor.
     */
    public function __construct()
    {
        $this->config = include CONFIG_PATH;
        $this->base_hosts_path = $this->isWin() ? 'C:\Windows\System32\drivers\etc\hosts' : '/etc/hosts';
        $this->init();
    }

    /**
     * 初始化配置
     */
    private function init()
    {
        $has_default_hosts_file = file_exists($this->defaultHostFile);
        if (!$has_default_hosts_file) {
            $this->cHost('default', $this->base_hosts_path, true);
            // 备份本机原有hosts
            copy($this->base_hosts_path, SOURCE . '/copy.hosts');
        }
    }

    /**
     * 获取
     */
    public function getHosts()
    {
        $env = array_search(true, $this->config);
        if ($env) {
            $readPath = $this->getEnvFilePath($env);
        } else {
            $readPath = $this->base_hosts_path;
        }
        $hosts = file_get_contents($readPath);
        $pattern = '/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/';
        $hosts = preg_replace($pattern, '<input class="checkbox" type="checkbox"><span class="ip">' . '${0}' . '</span><span class="domain">', $hosts);
        $hosts = str_replace(PHP_EOL, '</span><br>', $hosts);
        $pattern = '/#|;/';
        $hosts = preg_replace($pattern, '<b>' . '${0}' . '</b>', $hosts);
        $resData = array('data' => $hosts);
        $this->success($resData, 'success');
    }

    /**
     * 获取
     */
    public function getTextareaHosts()
    {
        $env = array_search(true, $this->config);
        if ($env) {
            $readPath = $this->getEnvFilePath($env);
        } else {
            $readPath = $this->base_hosts_path;
        }
        $hosts = file_get_contents($readPath);
        $resData = array('data' => '<textarea>' . $hosts . '</textarea>');
        $this->success($resData, 'success');
    }

    /**
     * 保存
     */
    public function saveHosts()
    {
        $hosts = str_replace("\r\n", '{PHP_EOL}', $_POST['content']);
        $hosts = str_replace("\n", '{PHP_EOL}', $hosts);
        $hosts = str_replace("{PHP_EOL}", PHP_EOL, $hosts);
        $hosts = strip_tags(str_replace('<br>', PHP_EOL, $hosts));
        $res = file_put_contents($this->base_hosts_path, $hosts);
        $env = array_search(true, $this->config);
        $res_cache = file_put_contents($this->getEnvFilePath($env), $hosts);
        if ($res && $res_cache) {
            $this->success($hosts, 'success');
        } else {
            $this->error($hosts, 'error');
        }
    }

    /**
     * 配置列表
     */
    public function getHostsConfListApi()
    {
        $list = include CONFIG_PATH;
        $this->success($list, 'success');
    }

    /**
     * 切换env
     */
    public function envChangeApi()
    {
        $env = $_POST['env'];
        $res = $this->changeEnv($env);
        if ($res) {
            $this->success($res, 'change success');
        } else {
            $this->error($res, 'change error');
        }
    }

    /**
     * 删除env
     */
    public function envDelApi()
    {
        $env = $_POST['env'];
        if ($env == 'default') $this->error('', 'error');
        $res = unlink($this->getEnvFilePath($env));
        // 删除配置项
        unset($this->config[$env]);
        $this->openEnv('default');
        if ($res) {
            $this->success($res, 'delete success');
        } else {
            $this->error($res, 'delete error');
        }
    }

    private function changeEnv($env)
    {
        $envData = file_get_contents($this->getEnvFilePath($env));
        $res = file_put_contents($this->base_hosts_path, $envData);
        // 开启环境
        $this->openEnv($env);
        return $res;
    }

    /**
     * 开启环境
     * @param $env
     */
    private function openEnv($env)
    {
        foreach ($this->config as $k => &$item) {
            if ($item) $item = !$item;
            if ($k == $env) $item = true;
        }
        $this->saveConf();
    }

    /**
     * 创建新hosts
     */
    public function createHostsApi()
    {
        $env = $_POST['env'];
        if (array_key_exists($env, $this->config)) $this->error('', "env exist!");
        $flag = $_POST['flag'];
        $this->cHost($env, $this->tmp_path, (bool)$flag, $preEnv = $this->preEnv);
        $this->success('', 'create success');
    }


    /**
     * 创建
     * @param $env
     * @param $path
     * @param $flag
     * @param bool $preEnv
     */
    private function cHost($env, $path, $flag, $preEnv = false)
    {
        // 执行创建
        copy($path, $this->getEnvFilePath($env));
        $this->config = array_merge($this->config, array($env => $flag));
        if ($flag) {
            // 执行迁移并修改配置文件
            $this->changeEnv($env);
        } else {
            $this->saveConf();
        }

        if ($preEnv) {
            $this->addPreStr($env);
        }
    }

    /**
     * 添加备注信息
     * @param $env
     */
    private function addPreStr($env)
    {
        $tmpData = file_get_contents($this->getEnvFilePath($env));
        $preStr = '### Created by Thosts ###' . PHP_EOL . '### env:' . $env . ' ###' . PHP_EOL;
        file_put_contents($this->getEnvFilePath($env), $preStr . $tmpData);
    }

    private function getEnvFilePath($env)
    {
        return HOSTS_PATH . '/hosts_' . $env;
    }

    /**
     * 保存配置
     */
    private function saveConf()
    {
        $before = '<?php' . PHP_EOL . PHP_EOL . 'return ';
        $after = ';';
        file_put_contents(CONFIG_PATH, $before . var_export($this->config, true) . $after);
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

    public function isWin()
    {
        return strtoupper(substr(PHP_OS, 0, 3)) === 'WIN' ? true : false;
    }


}