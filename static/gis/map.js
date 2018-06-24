define([
  'require',
  'jquery',
  'mapconfig',
  'ol',
  'util',
  'draw',
  'event',
  'extend'
], function (require, $, mapcfg, ol, util, draw, event) {
  'use strict';

  var map = {
    'modulename': 'map',
    'desc': 'init map, add layers and provide method to handle map',
    'version': '0.0.1',
    'author': 'QinChao'
  };

  var _map = null, _layers = [];

  //地图配置
  var _map_cfg = mapcfg._MAP_CONFIG;

  //创建地图并添加图层
  function crtMap(dom) {
    _map = new ol.Map({
      target: dom,
      view: new ol.View(_map_cfg.view_config),
      controls: ol.control.defaults({ attribution: false, zoom: false })
    });
    //_bindEvents();
    _init_layer();

    //初始化绘图层
    draw.init(_map, _map_cfg.drawOpts);
    return _map;
  }

  //根据配置文件向地图添加图层
  function _init_layer() {
    var layers = _map_cfg.layers;
    $.each(layers, function (idx, item) {
      var layer = util.crtLayer(item);
      if (layer instanceof Array) {//天地图底图
        $.each(layer, function (i, lyr) {
          _map.addLayer(lyr);
          _layers.push(lyr);
        });
      } else {
        _map.addLayer(layer);
        _layers.push(layer);
      }
    });
  }

  //绑定地图事件
  function _bindEvents() {
    var events = _map_cfg.events;
    console.log(events);
    $.each(events, function (idx, eventname) {
      _map.on(event, function (evt) {
        console.log(evt);
        dispatchEvents(eventname, evt);
      }.bind(this));
    });
  }

  //绑定事件具体的操作函数
  function getFeaturesAtEvt(e) {
    if (!_map) return;
    var features = [];
    if (e.originalEvent) {
      var pixel = _map.getEventPixel(e.originalEvent);
      var flayer = _map.forEachFeatureAtPixel(pixel, function (feature, layer) {
        if (layer) {
          var viewonly = layer.get('viewonly');
          if (!viewonly) {
            //保证所有图层的要素都会被返回
            features.push({'layer': layer, 'feature': feature});
          }
        }
      });
    }

    return features;
  }

  function addMapEvent(callback, event_type =  'singleclick', impl_type = 'pixel', source, tablename){
    event.init(_map, callback, event_type, impl_type, source, tablename);
  }

  //根据id获取图层
  function getLayerById(id) {
    var lyr = null;
    $.each(_layers, function (idx, layer) {
      if (layer.id == id) {
        console.log(id);
        lyr = layer;
        return false;
      }
    });

    return lyr;
  }

  //根据id获取数据源
  function getSourceById(id){
    var source = null;
    $.each(_layers, function (idx, layer) {
      if (layer.id == id) {
        console.log(id);
        source = layer.getSource();
        return false;
      }
    });

    return source;
  }

  //通过url重新设置矢量图层数据源
  function setDataSource(lyrid, url) {
    var layer = getLayerById(lyrid);
    var source = layer.getSource();
    $.ajax({
      url: url,
      type: 'GET',
      //async: false,
      dataType: 'json', //返回数据类型
      success: function (data) {
        console.log(data);
        source.clear();
        source.addFeatures((new ol.format.GeoJSON()).readFeatures(data));
        source.refresh();
      },
      error: function (error) {
        console.log('error');
        console.log(error)
      }
    });
  }

  //根据id移除图层
  function removeLayerById(id) {
    var layer = getLayerById(id);
    _map.removeLayer(layer);
    _layers.remove(layer);
  }

  //添加wfs图层
  function addWfslayer(config) {
    //尝试清空数据源，重新加载的方式
  }

  //添加wms图层
  function addWmsLayer(config) {
    var id = config.id;
    removeLayerById(id);
    var layer = util.crtLayer(config);
    _map.addLayer(layer);
    _layers.push(layer);
  }

  /**
   * 画图
   * @param {type} 几何类型
   * @param {isMeasure} 是否标注坐标、长度、面积周长
   */
  // function drawByType(type, isMeasure){
  //   draw.draw(type, isMeasure);
  // }

  // function clearDraw(){
  //   draw.clear();
  // }

  map._map = _map;
  map._layers = _layers;
  map.crtMap = crtMap;
  map.getFeaturesAtEvt = getFeaturesAtEvt;
  map.addMapEvent = addMapEvent;
  map.getLayerById = getLayerById;
  map.getSourceById = getSourceById;
  map.setDataSource = setDataSource;
  map.addWfslayer = addWfslayer;
  map.addWmsLayer = addWmsLayer;
  // map.drawByType = drawByType;
  // map.clearDraw = clearDraw;

  return map;
});