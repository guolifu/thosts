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
    })

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

    // 提交
    $('.submit').click(function () {
        submit()
    });
});

/**
 * 初始化
 */
function init() {
    init_select();
    init_default();
    init_textarea();
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
        'url': '/index.php?act=get',
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
 * 获取hosts文件信息
 */
function init_textarea() {
    // 获取hosts文件信息
    $.ajax({
        'method': 'GET',
        'url': '/index.php?act=getarea',
        success: function (e) {
            $('.textarea').html(e.data.data);
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
 * 提交
 */
function submit() {
    $.ajax({
        'method': 'POST',
        'url': '/index.php?act=save',
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
function showTips(msg, time) {
    if (typeof time === 'undefined') time = 2000;
    $('.tip').html(msg);
    $('.tip').fadeToggle();
    setTimeout(function () {
        $('.tip').fadeToggle()
    }, 2000)
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
