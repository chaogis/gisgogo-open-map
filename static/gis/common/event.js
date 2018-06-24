define([
    'require',
    'jquery',
    'ol'
], function(require, $, ol) {
    'use strict';

    var event = {
        'modulename': 'event',
        'desc': 'different way to implement map event',
        'version': '0.0.1',
        'author': 'QinChao'
      };

    var _map = null;
    /**
     * 鼠标点击模块初始化函数
     * @param {ol.Map} map 地图对象
     * @param {function} callback 回调函数
     * @param {string} event_type 鼠标事件类型，默认singleclick
     * @param {string} impl_type 鼠标事件实现查询的方式，默认为pixel
     * @param {ol.Source.WMS} source 数据源
     * @param {string} tablename 表名称
     */
    function init(map, callback, event_type =  'singleclick', impl_type = 'pixel', source, tablename){
        _map = map;
        if(impl_type == 'select'){
            select(callback, event_type);
        }else{
            _map.on(event_type, function(evt){
                switch (impl_type) {
                    case 'pixel':
                        featureAtPixel(evt, callback);
                        break;
                    case 'wms':
                        wms(evt, callback, source);
                        break;
                    case 'wfs':
                        wfs(evt, callback);
                        break;
                    case 'pg':
                        postgis(evt, callback, tablename);
                        break;
                    default:
                        console.log('hi, i\'m click, please provide available type, thank you!');
                        break;
                }
            });
        }       
    }

    /**
     * 针对矢量数据（必须加载到地图上），以Select控制器方式实现鼠标点击（或其他）事件
     * @param {function} cb 选中要素后的回调函数
     * @param {string} event_type 鼠标事件类型
     */
    function select(cb, event_type){
        var select = null;

        if(event_type == "singleclick"){
            select = new ol.interaction.Select();
        }else if(event_type == "click"){ //click
            select = new ol.interaction.Select({
                condition: ol.events.condition.click
            });
        }else if(event_type == "pointermove"){ //pointermove
            select = new ol.interaction.Select({
                condition: ol.events.condition.pointerMove
            });
        }else if(event_type == "alt-click"){
            select = new ol.interaction.Select({
                condition: function(mapBrowserEvent) {
                  return ol.events.condition.click(mapBrowserEvent) &&
                      ol.events.condition.altKeyOnly(mapBrowserEvent);
                }
              });
        }

        if (select !== null) {
            _map.addInteraction(select);
            select.on('select', function(evt) {
                //evt.deselected 表示取消选中的数量
                //evt.target.getFeatures()
                var features = evt.selected;
                if(features && features.length > 0){
                    console.log('***select ' + features.length + ' feature(s)***');
                    if(typeof cb === 'function'){
                        cb(features);
                    }else{
                        console.log('please provide function to handle selected feature');
                    }     
                }else{
                    console.log('fail to select feature at position clicks');
                }
            });
        }
    }

    /**
     * 针对矢量数据（必须加载到地图上），以featureAtPixel的方式实现
     * @param {Event} evt 事件对象
     * @param {function} cb 回调函数
     */
    function featureAtPixel(evt, cb){
        if (!_map) return;
        var features = [];
        if (evt.originalEvent) {
            var pixel = _map.getEventPixel(evt.originalEvent);
            _map.forEachFeatureAtPixel(pixel, function (feature, layer) {
                if (layer) {
                    var viewonly = layer.get('viewonly');
                    if (!viewonly) {
                        //保证所有图层的要素都会被返回
                        features.push({'layer': layer, 'feature': feature});
                    }
                }
            });
        }
        if(features.length > 0){
            console.log('***select ' + features.length + ' feature(s)***');
            if(typeof cb === 'function'){
                cb(features);
            }else{
                console.log('please provide function to handle selected feature');
            }
        }else{
            console.log('fail to select feature at position click');
        }
    }

    /**
     * 
     * @param {Event} evt 事件对象
     * @param {function} cb 回调函数
     * @param {ol.source.Image} ds 数据源
     */
    function wms(evt, cb, ds){
        var resolution = _map.getView().getResolution();
        var projection = _map.getView().getProjection();
        var url = ds.getGetFeatureInfoUrl(
                evt.coordinate, 
                resolution, 
                projection,
                {
                    'INFO_FORMAT': 'application/json',//geoserver支持jsonp才能输出为jsonp的格式
                    //'INFO_FORMAT': 'text/javascript',//geoserver支持jsonp才能输出为jsonp的格式
                    'FEATURE_COUNT': 50     //点击查询能返回的数量上限
                });
        $.ajax({
                type: 'GET',
                url:url,
                //dataType: 'jsonp',
                //jsonp:'format_options',
                //jsonpCallback:'callback:success_jsonpCallback'
                dataType: 'json',
                success: wms_success,
                error: function(err){
                    console.log(err);
                }
        });

        //回调函数接收查询结果
        function wms_success(res)
        {
            var geojsonFormat=new ol.format.GeoJSON({defaultDataProjection: projection});
            var features = geojsonFormat.readFeatures(res);
            if(features.length > 0){
                console.log('***select ' + features.length + ' feature(s)***');
                if(typeof cb === 'function'){
                    cb(features);
                }else{
                    console.log('please provide function to handle selected feature');
                }
            }else{
                console.log('fail to select feature at position click');
            }
        }
    }

    function wfs(evt,cb){

    }

    function postgis(evt, cb, tablename){

    }

    event.init = init

    return event;
});