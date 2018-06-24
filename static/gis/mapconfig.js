define([
    'require'
], function(require) {
    'use strict';
    var mapconfig = {
        'modulename': 'mapconfig',
        'desc': 'map config parameter, especially layers',
        'version': '0.0.1',
        'author': 'QinChao',
        'wfs_url': 'http://www.gisgogo.cn:8089/geoserver/wfs',
        'wms_url': 'http://www.gisgogo.cn:8089/geoserver/wms',
        'api_url': '/todo/api/v1.0',
        'wfs_proxy': '/todo/wfs/v1.0/proxy'
      };
    var _MAP_CONFIG = {
        view_config: {
          //center: ol.proj.fromLonLat([114.31, 30.52]),
          center: [105.22, 34.52],
          projection: 'EPSG:4326',
          zoom: 5
        },
        layers: [
          {
            type: 'tdt', id: 'vec_c', option: { type: 'vec_c', opacity: 1 }, //option表示天地图矢量地图，透明度为1
            label: true, //label标识是否添加标注
          },
          // {
          //   type: 'tdt', id: 'img_w', option: { type: 'img_w', opacity: 1 }, //option表示天地图影像图，透明度为1
          //   label: true, //label标识是否添加标注
          // },
          // {
          //   type: 'tdt', id: 'ter_c', option: { type: 'ter_c', opacity: 1 }, //option表示天地图地形图，透明度为1
          //   label: false, //label标识是否添加标注
          // }

          // {
          //   type: 'vector', id: 'province', projection: 'EPSG:4326',
          //   source: 'wfs',
          //   gs_url: mapconfig.wfs_url, //geoserver服务地址
          //   url: mapconfig.wfs_proxy, //代理服务地址
          //   layer: 'climate:surf_chn_climate_station', //layer表示图层名称
          //   style: {  } //图层渲染样式
          // },
          // {
          //   type: 'vector', id: 'station', projection: 'EPSG:4326',
          //   source: 'wfs',
          //   gs_url: mapconfig.wfs_url, //geoserver服务地址
          //   url: mapconfig.wfs_proxy, //代理服务地址
          //   layer: 'climate:chn_province_polygon', //layer表示图层名称
          //   style: {  } //图层渲染样式
          // }
          
          // {
          //   type: 'vector', id: 'province', projection: 'EPSG:4326',
          //   source: 'api',
          //   url: mapconfig.api_url + '/provinces/HB',
          //   style: {  } //图层渲染样式
          // },
          // {
          //   type: 'vector', id: 'station', projection: 'EPSG:4326',
          //   source: 'api',
          //   url: mapconfig.api_url + '/stations/HB',
          //   style: {  } //图层渲染样式
          // }

          {
            type: 'wms', id: 'layergroup', projection: 'EPSG:4326',
            layer: 'climate:climate_layergroup',
            url: mapconfig.wms_url,
            style: {  } //图层渲染样式
          }
        ],
      events: ['click','singleclick','dbclick'/*, 'movestart', 'moveend','pointerdrag','pointermove'*/],
      drawOpts: [{id: 'Point', src: '/static/image/point.png'}, 
                 {id: 'LineString', src: '/static/image/line.png'}, 
                 {id: 'Polygon', src: '/static/image/polygon.png'},
                 {id: 'Clear', src: '/static/image/clear.png'}]
    };

    function getLayerCfgById(id){
      var lyr = null;
      $.each(_MAP_CONFIG.layers, function(idx, layer){
        if(layer.id == id){
          lyr = layer;
          return false;
        }
      });

      return lyr;
    }

    mapconfig._MAP_CONFIG = _MAP_CONFIG;
    mapconfig.getLayerCfgById = getLayerCfgById;

    return mapconfig;
});