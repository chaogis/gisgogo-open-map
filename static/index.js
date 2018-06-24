require.config({
       waitSeconds: 60,
　　　　paths: {
　　　　 'jquery': '/static/jslib/jquery/jquery-3.3.1.min',
        'extend': '/static/common/extend',
　　　　 'ol': '/static/jslib/ol/ol-debug',
        'mapconfig': '/static/gis/mapconfig',
        'tdt': '/static/gis/layer/basemap/tdt',
        'vector': '/static/gis/layer/vector',
        'wms': '/static/gis/layer/wms',
        'util': '/static/gis/utility',
        'draw': '/static/gis/common/draw',
        'event': '/static/gis/common/event',
        'map': '/static/gis/map'
　　　　},
    shim: {
        ol: {
            exports: 'ol'
        }
    }
});
    
require(['mapconfig', 'map'], function(mapcfg, map){

    //创建地图
    var _map =map.crtMap('mapdom');

    //加载省份
    $.ajax({
        url: '/todo/api/v1.0/allprovince',
        type: 'GET',
        dataType: 'json', //返回数据类型
        success: function(data){
            //console.log(data);
            if(data.status == 'success'){
                var provinces = data.data;
                $.each(provinces, function(idx, province){
                    $('#province-select').append('<option value ="' + province.pcode +'">' + province.name + '</option>');
                });
            }
        },
        error: function(error){
            console.log('error');
            console.log(error)
        }
    });

    //添加选择事件
    $('#province-select').on("change", function () {
        var pcode = $(this).find("option:selected").val();
        api_selectResponse(pcode);
    });

    //wms的方式加载图层及选择响应
    function wms_selectResponse(code){
        console.log(code);
        var filter = null;
        if(code != 'CN'){ //选择其他省份
            filter = {'CQL_FILTER': "province_code ='" + code +"'"};    
        }
        //var layercfg = mapcfg.getLayerCfgById('layergroup'); //这样修改了layergroup的原始配置
        var layercfg = $.extend({}, mapcfg.getLayerCfgById('layergroup'), filter);
        map.addWmsLayer(layercfg);
    }

    //api的方式加载图层及选择响应
    function api_selectResponse(code){
        console.log(code);
        var provinces_url = mapcfg.api_url + '/provinces';
        var stations_url = mapcfg.api_url + '/stations';
        if(code != 'CN'){
            provinces_url = provinces_url + '/' + code;
            stations_url = stations_url + '/' + code; 
        }
        map.setDataSource('province', provinces_url);
        map.setDataSource('station', stations_url);
    }

    function sel_features_handle(features){
        if(features && features.length > 0){
            var len = features.length;
            console.log('我是 选择要素 测试 处理函数，共有 ' + len + ' 个要素待处理!')
        }else{
            console.log('选取要素失败');
        }
    }

    map.addMapEvent(sel_features_handle, 'singleclick', 'pixel');

    //绑定地图上的鼠标事件
    // $('#mapdom').on('click', function(evt){
    //     var feaObj = map.getFeaturesAtEvt(evt);
    //     console.log(feaObj);
    // });


    // $('#draw img').on('click', function(evt){
    //     var type = $(this).attr('id');
    //     console.log(type);
    //     if(type == 'Clear'){
    //         map.clearDraw();
    //     }else{
    //         map.drawByType(type, 0);
    //     }    
    // });
});