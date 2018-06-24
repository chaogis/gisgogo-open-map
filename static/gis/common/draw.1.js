define([
    'require',
    'ol'
], function(require, ol) {
    'use strict';
    var drawmodule = {
        'modulename': 'draw',
        'desc': 'draw geometry',
        'version': '0.0.1',
        'author': 'QinChao'
      };

    var _map = null;
    var drawInteraction = null;
    var drawSource = null;   

    function init(map){
        _map = map;
        drawSource = new ol.source.Vector({
            wrapX: false
        });

        var drawStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 10,
                fill: new ol.style.Fill({
                    color: 'green'
                }),
                stroke: new ol.style.Stroke({
                    color: 'yellow',
                    width: 1.2,
                    //lineDash: [3, 7]
                })
            }),
            stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 1.5,
                //lineDash: [3, 7]
            }),
            fill: new ol.style.Fill({
                color: 'rgba(0, 255, 0, 0.6)'
            })
        });
    
        var drawLayer = new ol.layer.Vector({
            source: drawSource,
            style: drawStyle,
            zIndex: 999,
            id: 'draw'
        });
        //_drawLayer.id = 'draw';

        _map.addLayer(drawLayer);
    }
    
    function draw (type, isMeasure){
        _map.removeInteraction(drawInteraction);
        drawInteraction = new ol.interaction.Draw({
            source: drawSource,
            type: type
        });
        _map.addInteraction(drawInteraction);
        if(isMeasure){
            drawInteraction.on('drawend', function(evt){
                doMeasure(evt);
            });
        }
    }

    function clear(){
        drawSource.clear();
    }

    function doMeasure(evt){
        console.log(evt);
        var feature = evt.feature;
        var geometry = feature.getGeometry;
        var coords = geometry.getCoordinates();
        var type = geometry.getType(); //将geometry的方法进行封装
        switch(type){
            case 'Point':
                break;
            case 'LineString':

            case 'Polygon':

        }
    }

    drawmodule.init = init;
    drawmodule.draw = draw;
    drawmodule.clear = clear;

    return drawmodule;
});