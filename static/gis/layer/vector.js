define([
    'require',
    'jquery',
    'ol'
], function(require, $, ol) {
    'use strict';
    var vector = {
        'modulename': 'vectorLayer',
        'desc': 'vector layer',
        'version': '0.0.1',
        'author': 'QinChao',
        'layer': null
    };


    //创建矢量图层
    function crtLayer(config){
        var id = config.id, source = config.source;
        var vectorSource = crtWfsSource(config);
        if(source == 'api'){
            vectorSource = crtApiSource(config);
        } 

       vector.layer = new ol.layer.Vector({
            source: vectorSource,
            // style: new ol.style.Style({
            //   stroke: new ol.style.Stroke({
            //     color: 'rgba(0, 0, 255, 1.0)',
            //     width: 2
            //   })
            // })
          });

        vector.layer.id = id;

        return vector.layer;
    }

    function crtWfsSource(config){
        var gs_url = config.gs_url, layer = config.layer, proj = config.projection, url = config.url;
        // var wfsParams = { 
        //     gsUrl: gs_url,     
        //     service : 'WFS',      
        //     version : '1.0.0',      
        //     request : 'GetFeature',      
        //     typeName : layer,  //图层名称，可以是单个或多个       
        //     outputFormat : 'application/json',  //重点，不要改变
        //     srsname: proj
        // };      
        
        // // wfs方式 因存在跨域，故以loader方式加载要素(设置代理)
        // var vectorSource = new ol.source.Vector({      
        //     format: new ol.format.GeoJSON(), 
        //     //loader方式一   
        //     // loader: function(extent, resolution, projection) {  //加载函数
        //     //     wfsParams.bbox = extent.join(',') + ',' + proj;
        //     //     console.log(wfsParams.bbox);      
        //     //     $.ajax({      
        //     //         url: url,      
        //     //         data : JSON.stringify(wfsParams),   //将js对象或数组转为json字符串对象
        //     //         type : 'POST',
        //     //         contentType: 'application/json; charset=UTF-8', //传入数据类型  
        //     //         dataType: 'json', //返回数据类型
        //     //         success: function(data){
        //     //           console.log(data); 
        //     //           vectorSource.addFeatures((new ol.format.GeoJSON()).readFeatures(data));  //载入要素 
        //     //         },
        //     //         error: function(error){
        //     //             console.log(error);
        //     //         }        
        //     //     });      
        //     // }, 
        //     //loader方式二（ol官方示例）
        //     loader: function(extent, resolution, projection) {  //加载函数
        //         wfsParams.bbox = extent.join(',') + ',' + proj;
        //         var xhr = new XMLHttpRequest();
        //         xhr.open('POST', url, true);
        //         xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8'); 
        //         var onError = function() {
        //             vectorSource.removeLoadedExtent(extent);
        //         }
        //         xhr.onerror = onError;
        //         xhr.onload = function() {
        //             if (xhr.status == 200) {
        //                 vectorSource.addFeatures(
        //                     vectorSource.getFormat().readFeatures(xhr.responseText));
        //             } else {
        //                 onError();
        //             }
        //         }
        //         xhr.send(JSON.stringify(wfsParams));
        //     },
        //     strategy: ol.loadingstrategy.bbox,     
        //     // strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({      
        //     //     maxZoom: 20   
        //     // })),      
        //     projection: proj      
        // }); 

        //直接采用这种方式，跨域，因端口8089（跨域问题已解决）
        //需增加对条件过滤的支持，CQ_FILTER = 与 bbox不可共存
        var vectorSource = new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: function(extent) {
                return gs_url + 
                    '?service=WFS&version=1.1.0&request=GetFeature' +
                    '&typename='+ layer +
                    '&outputFormat=application/json&srsname=' + proj +
                    '&bbox=' + extent.join(',') + ',' + proj;
            },
            strategy: ol.loadingstrategy.bbox
        });

        return vectorSource;
    }


    //开发api返回geojson
    function crtApiSource(config){
        var proj = config.projection, url = config.url;
        var vectorSource = new ol.source.Vector({      
                format: new ol.format.GeoJSON(),      
                //features: (new ol.format.GeoJSON()).readFeatures({}),      
                projection: proj     
            });

        addFeatures(vectorSource, url);
        
        /**
         * 下面直接指定url的方式创建数据源，存在两个问题：
         * 1、strategy 必须为all，否则会一直请求数据，数据源中存在多次重复要素；
         * 2、用clear的方式清除要素refresh后，要素再次出现
         **/
        // var vectorSource = new ol.source.Vector({      
        //     format: new ol.format.GeoJSON(),      
        //     url: url,   
        //     strategy: ol.loadingstrategy.all,      
        //     projection: proj     
        // });
        
        return vectorSource;
    }

    function addFeatures(source, url){
        $.ajax({
            url: url,
            type: 'GET',
            //async: false,
            dataType: 'json', //返回数据类型
            success: function(data){
                source.addFeatures((new ol.format.GeoJSON()).readFeatures(data));
            },
            error: function(error){
                console.log(error);
            }
        });
    }

    vector.crtLayer = crtLayer;

    return vector;
});