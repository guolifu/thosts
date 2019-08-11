/**
 * @author carl
 */
var def = getCookie('type');
$(function () {
    init();
    // select事件
    $('.change').change(function () {
        var val = $('.change').val();
        setCookie('type', val, 1);
        def = val;
        switch (val) {
            case "content" : {
                $('.content').toggle();
                $('.textarea').toggle();
                $('.submit').toggle();
                init_default();
                break;
            }
            case "textarea": {
                $('.content').toggle();
                $('.textarea').toggle();
                $('.submit').toggle();
                init_textarea();
                break;
            }
        }
    });

    // 构建注释
    $('.content').on('click', 'input[type=checkbox]', function () {
        if ($(this).is(':checked')) {
            // 删除注释
            _del($(this))
        } else {
            $(this).before("<b>#</b>");
        }
        submit()
    });

    // 双击编辑事件
    $('.content').on('dblclick', '.ip,.domain', function () {
        var data = $(this).html();
        // alert($(this).html());
        $(this).hide();
        var _width = $(this).width() + 50 + 'px';
        $(this).after('<input style="width: ' + _width + '" type="text" value="' + data + '"/>');
        $(this).next().focus()
    });

    // input失焦事件
    $('.content').on('blur', 'input[type=text]', function () {
        var inputVal = $(this).val();
        var _val = $(this).prev().html();
        if (inputVal != _val) {
            $(this).prev().html(inputVal);
            submit()
        }
        $(this).prev().show();
        $(this).remove();
    });

    // 修改env事件
    $('#envlist').change(function () {
        var _this = $(this);
        var env = _this.val();
        envChangeApi(env)
    });


    $('.menu__inner').on('click', '.envlist', function () {
        envChangeApi($(this).text())
    });

    // 创建env事件
    $('.create-button').click(function () {
        var _val = $('.env-name').val();
        var flag = $(this).data('type');
        if (_val == "") {
            showTips('failed env name', 'error');
            return false
        }
        createEnvApi(_val, flag)
    });

    $('.delete').click(function () {
        var _val = $('#envlist').val();
        if (_val == 'default') {
            showTips('can not del default!', 'error');
            return false;
        }
        delApi(_val)

    });


    // 回车事件
    $('.content').on('keypress', 'input[type=text]', function (event) {
        if (event.keyCode == "13") {
            var inputVal = $(this).val();
            var _val = $(this).prev().html();
            if (inputVal != _val) {
                $(this).prev().html(inputVal);
                submit()
            }
            $(this).prev().show();
            $(this).remove();
        }
    });

    // 展示
    $('.menu__handle').click(function () {
        var bak = $(".allContent").offset().left;
        var move = bak + 150;
        if (move > 250) {
            $(".allContent").animate({"margin-left": bak - 150 + 'px'}, 600);
        } else {
            $(".allContent").animate({"margin-left": move + 'px'});
        }
    });
    // 提交
    $('.submit').click(function () {
        submit()
    });
});

/**
 * 初始化
 */
function init() {
    // select初始化
    init_select();
    // 获取hosts文件信息
    init_default();
    // 获取hosts内容
    init_textarea();
    // env获取
    init_env_list();
}

/**
 * select初始化
 */
function init_select() {
    $('.change').find("option[value='" + def + "']").attr("selected", true);
    switch (def) {
        case "content": {
            $('.content').show();
            $('.textarea').hide();
            $('.submit').hide();
            break;
        }
        case "textarea": {
            $('.content').hide();
            $('.textarea').show();
            $('.submit').show();
            break;
        }
        default : {
            $('.content').show();
            $('.textarea').hide();
            $('.submit').hide();
            break;
        }
    }
}

/**
 * 获取hosts文件信息
 */
function init_default() {
    $.ajax({
        'method': 'GET',
        'url': '/start.php?act=get',
        success: function (e) {
            $('.content').html(e.data.data);
            $("input[type=checkbox]").each(function () {
                if ($(this).prev().html() !== '#' && $(this).prev().html() !== ';') {
                    $(this).prop('checked', true)
                }
            });
        }
    });
}

/**
 * 获取hosts内容
 */
function init_textarea() {
    $.ajax({
        'method': 'GET',
        'url': '/start.php?act=getarea',
        success: function (e) {
            $('.textarea').html(e.data.data);
        }
    })
}

/**
 * 获取env信息
 */
function init_env_list() {
    $.ajax({
        'method': 'GET',
        'url': '/start.php?act=envList',
        success: function (e) {
            $('#envlist').children().remove();
            $('.menu__inner ul').children().remove();
            for (val in e.data) {
                var selected = e.data[val] ? 'selected' : '';
                var selectedList = e.data[val] ? 'style="color:#1bb111"' : '';
                var clickClass = !e.data[val] ? 'class="envlist"' : '';
                $('#envlist').append('<option ' + selected + '>' + val + '</option>');
                $('.menu__inner ul').append('<li ' + selected + '><a ' + selectedList + '><span ><p align=center ><font size=5 ' + clickClass + '>' + val + '</font></p></span></a></li>');
            }
        }
    })
}

/**
 * 获取提交数据
 * @returns {*|jQuery}
 */
function getContent() {
    var val = $('.change').val();
    switch (val) {
        case "content" : {
            return $('.' + val).html();
            break;
        }
        case "textarea": {
            return $('.' + val + ' textarea').val();
            break;
        }
    }
}

/**
 * 切换env
 * @param string
 */
function envChangeApi(env) {
    $.ajax({
        'method': 'POST',
        'url': '/start.php?act=envChange',
        'data': {
            env: env,
        },
        success: function (e) {
            showTips(e.msg);
            init();
        }
    })

}

/**
 * 新建env
 * @param val
 */
function createEnvApi(val, flag) {
    if (typeof flag == 'undefined') flag = 0;
    $.ajax({
        'method': 'POST',
        'url': '/start.php?act=envCreate',
        'data': {
            env: val,
            flag: flag,
        },
        success: function (e) {
            if (e.code === 200) {
                showTips(e.msg);
                if (!flag) {
                    init_env_list()
                } else {
                    init();
                }
            } else {
                showTips(e.msg, 'error');
            }
        }
    })

}

function delApi(val) {
    $.ajax({
        'method': 'POST',
        'url': '/start.php?act=envDelete',
        'data': {
            env: val,
        },
        success: function (e) {
            showTips(e.msg);
            if (e.code === 200) {
                init();
            }
        }
    })

}

/**
 * 提交
 */
function submit() {
    $.ajax({
        'method': 'POST',
        'url': '/start.php?act=save',
        'data': {
            content: getContent()
        },
        success: function (e) {
            showTips(e.msg)
        }
    })
}

/**
 * 提示函数
 * @param msg
 * @param time
 */
function showTips(msg, type, time) {
    if (typeof time === 'undefined') time = 2000;
    if (typeof type === 'undefined') type = "success";
   switch (type) {
        case "success": {
            var icon = 1;
            break
        }
        case "error": {
            var icon = 5;
            break
        }
    }
    layer.msg(msg, {icon: icon});
    /*
    $(tip).html(msg);
    $(tip).fadeToggle();
    setTimeout(function () {
        $(tip).fadeToggle()
    }, 2000)*/
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

// 递归删除
function _del(obj) {
    if (obj.prev().html() === '#' || obj.prev().html() === ';') {
        obj.prev().remove();
        _del(obj)
    }
}
