define([
    'require',
    'jquery',
    'ol'
], function(require, $, ol) {
    'use strict';
    var tdtlayer = {
        'modulename': 'Tianditu',
        'desc': 'create tiled layer of tianditu',
        'version': '0.0.1',
        'author': 'QinChao',
        'layers': []
    };

    // 全球影像地图服务（经纬度）    http://t0.tianditu.com/img_c/wmts
    // 全球影像注记服务（经纬度）    http://t0.tianditu.com/cia_c/wmts
    // 全球影像地图服务（墨卡托投影）   http://t0.tianditu.com/img_w/wmts
    // 全球影像注记服务（墨卡托投影）   http://t0.tianditu.com/cia_w/wmts

    // 全球矢量地图服务（经纬度）    http://t0.tianditu.com/vec_w/wmts
    // 全球矢量注记服务（经纬度）    http://t0.tianditu.com/cva_w/wmts
    // 全球矢量地图服务（墨卡托投影）   http://t0.tianditu.com/vec_c/wmts
    // 全球矢量注记服务（墨卡托投影）   http://t0.tianditu.com/cva_c/wmts

    // 全球地形晕渲地图服务（经纬度）     http://t0.tianditu.com/ter_c/wmts
    // 全球地形晕渲注记服务（经纬度）     http://t0.tianditu.com/cta_c/wmts
    // 全球地形晕渲地图服务（墨卡托投影） http://t0.tianditu.com/ter_w/wmts
    // 全球地形晕渲注记服务（墨卡托投影） http://t0.tianditu.com/cta_w/wmts
    // //var layer = null;

    function crtLayer(config){
        var type = config.option.type, label = config.label;
        var opacity = config.option.opacity ? config.option.opacity : 1;
        var proj = type.substring(4) == 'c' ? 'EPSG:4326' : 'EPSG:3857';
        tdtlayer.layers.push(crtLayerXYZ(type, proj, opacity));

        if(label){//添加标注
            var labeltype = '';
            var maptype = type.substr(0, 3);
            if(maptype == 'vec'){ //矢量图
                labeltype = 'cva_' + type.substring(4);
            }else if(maptype == 'img'){ //影像图
                labeltype = 'cia_' + type.substring(4);
            }else{//地形图
                labeltype = 'cta_' + type.substring(4);
            }
            tdtlayer.layers.push(crtLayerXYZ(labeltype, proj, opacity));
        }

        return tdtlayer.layers;
    }

    //创建图层(xyz方式)
    function crtLayerXYZ(type, proj, opacity){
       var layer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'http://t'+Math.round(Math.random()*7)+'.tianditu.com/DataServer?T='+type+'&x={x}&y={y}&l={z}',
                projection: proj
            }),
            opacity: opacity
        });
        layer.id = type;
        return layer;
    }

    //创建图层(WMTS方式)
    function crtLayerWMTS(type, proj, opacity){
        var projection = ol.proj.get(proj);
        var projectionExtent = projection.getExtent();
        var size = ol.extent.getWidth(projectionExtent) / 256;
        var resolutions = new Array(19);
        var matrixIds = new Array(19);
        for (var z = 1; z < 19; ++z) {
            // generate resolutions and matrixIds arrays for this WMTS
            resolutions[z] = size / Math.pow(2, z);
            matrixIds[z] = z;
        }

        var layer = new ol.layer.Tile({
            opacity: opacity,
            source: new ol.source.WMTS({
              attributions: 'Tiles © <a href="http://www.tianditu.com/service/info.html?sid=5292&type=info">天地图</a>',
              url: 'http://t'+Math.round(Math.random()*7)+'.tianditu.com/'+type+'/wmts',
              layer: type.substr(0, 3),
              matrixSet: type.substring(4),
              format: 'tiles',
              projection: projection,
              tileGrid: new ol.tilegrid.WMTS({
                origin: ol.extent.getTopLeft(projectionExtent),
                resolutions: resolutions,
                matrixIds: matrixIds
              }),
              style: 'default',
              wrapX: true
            })
          });
        layer.id = type;
        return layer;
    }

    //设置图层透明度
    function setOpacity(opacity){
        $.each(tdtlayer.layers, function(idx, layer){
            layer.setOpacity(opacity);
        });    
    }
    
    tdtlayer.crtLayer = crtLayer;
    tdtlayer.setOpacity = setOpacity;

    return tdtlayer;
});