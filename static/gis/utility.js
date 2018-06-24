define([
    'require',
    'tdt',
    'vector',
    'wms'
], function(require, tdt, vector, wms) {
    'use strict';

    var util = {
        'modulename': 'Utility',
        'desc': 'Utility method of layer',
        'version': '0.0.1',
        'author': 'QinChao'
    };

    //根据类型创建图层
    function crtLayer(config){
        var type = config.type ? config.type : 'tdt';
        switch(type){
            case 'tdt':
                return tdt.crtLayer(config);
            case 'vector':
                return vector.crtLayer(config);
            case 'wms':
                return wms.crtLayer(config);
        }
    }

    util.crtLayer = crtLayer;

    return util;    
});