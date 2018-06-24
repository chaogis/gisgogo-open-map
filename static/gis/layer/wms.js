define([
    'require',
    'jquery',
    'ol'
], function(require, $, ol) {
    'use strict';

    var wms = {
        'modulename': 'wms',
        'desc': 'ogc wms service',
        'version': '0.0.1',
        'author': 'QinChao',
        'layer': null
      };

    function crtLayer(config){
        var id = config.id, url = config.url, layer = config.layer, proj = config.projection;
        var wmsParam = {      
            'LAYERS': layer,//此处可以是单个图层名称，也可以是图层组名称，或多个图层名称  
            //'TILED':false,
            'VERSION': '1.1.0',
            'BBOX': [89.17, 3.37, 135.31, 53.81],
            'SRS': proj   
        }; 
        if(config.CQL_FILTER){
            wmsParam.CQL_FILTER = config.CQL_FILTER;
        }       
        // wms.layer = new ol.layer.Tile({      
        //             source:new ol.source.TileWMS({ //切片WMS服务，多个标注
            wms.layer = new ol.layer.Image({      
                source:new ol.source.ImageWMS({      
                        url: url,
                        //crossOrigin: 'anonymous',      
                        params: wmsParam,      
                        serverType:'geoserver'    //服务器类型  
                    })     
                });

        wms.layer.id = id;
        return wms.layer;
    }

    wms.crtLayer = crtLayer;

    return wms;
});