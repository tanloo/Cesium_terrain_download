import Cesium from "cesium";
import GlobeTooltip from "./GlobeTooltip";
import GridUtils from "./GridUtils";
import axios from 'axios';

var GlobeRectangleDrawer = function () {
    this.init.apply(this, arguments);
};

GlobeRectangleDrawer.prototype = {
    viewer: null,
    scene: null,
    clock: null,
    canvas: null,
    camera: null,
    ellipsoid: null,
    tooltip: null,
    entity: null,
    positions: [],
    drawHandler: null,
    modifyHandler: null,
    okHandler: null,
    cancelHandler: null,
    material: null,
    outlineMaterial: null,
    fill: true,
    outline: true,
    outlineWidth: 2,
    extrudedHeight: 0,
    layerId: "globeEntityDrawerLayer",
    codes: [],
    imgInfo: null,
    level: 6,
    init: function (viewer) {
        var _this = this;
        _this.viewer = viewer;
        _this.scene = viewer.scene;
        _this.clock = viewer.clock;
        _this.canvas = viewer.scene.canvas;
        _this.camera = viewer.scene.camera;
        _this.ellipsoid = viewer.scene.globe.ellipsoid;
        _this.tooltip = new GlobeTooltip(viewer.container);
        _this.gridUtils = new GridUtils();
    },
    clear: function () {
        var _this = this;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
        if (_this.modifyHandler) {
            _this.modifyHandler.destroy();
            _this.modifyHandler = null;
        }
        _this._clearMarkers(_this.layerId);
        _this.tooltip.setVisible(false);
    },
    startDrawRectangle: function (isRedraw = false, okHandler, cancelHandler) {
        var _this = this;
        return new Promise(resolve => {
            _this.okHandler = okHandler;
            _this.cancelHandler = cancelHandler;

            _this.positions = [];
            _this.drawHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas);
            _this.drawHandler.setInputAction(function (event) {
                var position = event.position;
                if (!Cesium.defined(position)) {
                    return;
                }
                var ray = _this.camera.getPickRay(position);
                if (!Cesium.defined(ray)) {
                    return;
                }
                var cartesian = _this.scene.globe.pick(ray, _this.scene);
                if (!Cesium.defined(cartesian)) {
                    return;
                }
                var num = _this.positions.length;
                if (num === 0) {
                    _this.positions.push(cartesian);
                    _this._showRegion2Map(isRedraw);
                }
                _this.positions.push(cartesian);
                if (num > 1) {
                    _this.positions.pop();
                    _this.tooltip.setVisible(false);
                    if (_this.drawHandler) {
                        _this.drawHandler.destroy();
                        _this.drawHandler = null;
                    }

                    if (isRedraw) {
                        let fullRect = _this.viewer.entities.getById('Full Rect').rectangle.coordinates.getValue();
                        let insideRect = _this.viewer.entities.getById('Inside Rect').rectangle.coordinates.getValue();
                        if (Cesium.Rectangle.contains(fullRect, Cesium.Rectangle.northeast(insideRect)) &&
                            Cesium.Rectangle.contains(fullRect, Cesium.Rectangle.northwest(insideRect)) &&
                            Cesium.Rectangle.contains(fullRect, Cesium.Rectangle.southeast(insideRect)) &&
                            Cesium.Rectangle.contains(fullRect, Cesium.Rectangle.southwest(insideRect))) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    } else {
                        _this._computeRectangle();
                        console.log(_this.codes);
                        if (_this.codes.length !== 0) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }
                    _this._getPosition();
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            _this.drawHandler.setInputAction(function (event) {
                var position = event.endPosition;
                if (!Cesium.defined(position)) {
                    return;
                }
                if (_this.positions.length < 1) {
                    _this.tooltip.showAt(position, "<p>选择起点</p>");
                    return;
                }
                _this.tooltip.showAt(position, "<p>选择终点</p>");

                var ray = _this.camera.getPickRay(position);
                if (!Cesium.defined(ray)) {
                    return;
                }
                var cartesian = _this.scene.globe.pick(ray, _this.scene);
                if (!Cesium.defined(cartesian)) {
                    return;
                }
                _this.positions.pop();
                _this.positions.push(cartesian);
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        });


    },
    _showRegion2Map: function (isRedraw) {
        let _this = this;
        let dynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                let rect = Cesium.Rectangle.fromCartesianArray(_this.positions);
                return rect;
            } else {
                return null;
            }
        }, false);
        let bData = {
            rectangle: {
                coordinates: dynamicPositions,
                outlineColor: Cesium.Color.YELLOW,
                fill: false,
                outline: true,
                outlineWidth: 1,
            },
        };
        if (_this.extrudedHeight > 0) {
            bData.rectangle.extrudedHeight = _this.extrudedHeight;
            bData.rectangle.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
            bData.rectangle.closeTop = true;
            bData.rectangle.closeBottom = true;
        }
        if (isRedraw) {
            bData.rectangle.outlineColor = Cesium.Color.RED;
            bData.id = 'Inside Rect';
            bData.name = 'Inside Rect';
        } else {
            bData.id = 'Full Rect';
            bData.name = 'Full Rect';
        }
        _this.entity = _this.viewer.entities.add(bData);

        _this.entity.layerId = _this.layerId;
    },
    _computeCode: function (p1_longitude, p1_latitude, p2_longitude, p2_latitude) {
        let _this = this;
        _this.codes.push.apply(_this.codes, _this.gridUtils.getCodesFromPoints([p1_longitude, p1_latitude], [p2_longitude, p2_latitude], _this.level));

    },
    _computeRectangle: function () {
        let _this = this;
        //每次绘制矩形前清空数组
        _this.codes = [];
        let p1 = _this.positions[0];
        let p2 = _this.positions[1];
        let p1_cartographic = _this.ellipsoid.cartesianToCartographic(p1);
        let p1_longitude = Cesium.Math.toDegrees(p1_cartographic.longitude);
        let p1_latitude = Cesium.Math.toDegrees(p1_cartographic.latitude);
        let p2_cartographic = _this.ellipsoid.cartesianToCartographic(p2);
        let p2_latitude = Cesium.Math.toDegrees(p2_cartographic.latitude);
        let p2_longitude = Cesium.Math.toDegrees(p2_cartographic.longitude);
        console.log([p1_longitude, p1_latitude, p2_longitude, p2_latitude]);
        //交换坐标点为p1低纬域值，p2高纬域值
        if ((p2_latitude > p1_latitude && p2_latitude >= 0 && p1_latitude >= 0) || (p2_latitude < p1_latitude && p2_latitude <= 0 && p1_latitude <= 0)) {
            let temp = p1;
            p1 = p2;
            p2 = temp;
            temp = p1_latitude;
            p1_latitude = p2_latitude;
            p2_latitude = temp;
            temp = p1_longitude;
            p1_longitude = p2_longitude;
            p2_longitude = temp;
        }

        //判断是否跨南北半球，否则判断跨子午线
        if ((p1_latitude > 0 && p2_latitude < 0) || (p1_latitude < 0 && p2_latitude > 0)) {
            _this._divideMeridian(p1, Cesium.Cartesian3.fromDegrees(p2_longitude, 0), p1_longitude, p2_longitude, p1_latitude, 0);
            _this._divideMeridian(Cesium.Cartesian3.fromDegrees(p1_longitude, 0), p2, p1_longitude, p2_longitude, 0, p2_latitude);
        } else if ((p1_longitude > 0 && p2_longitude < 0) || (p1_longitude < 0 && p2_longitude > 0)) {
            if ((Math.abs(p1_longitude) + Math.abs(p2_longitude) > 180) && ((p1_longitude > 0 && p2_longitude < 0) || (p1_longitude < 0 && p2_longitude > 0))) {
                _this._computeGrid(p1, Cesium.Cartesian3.fromDegrees(-180, p2_latitude));
                _this._computeGrid(Cesium.Cartesian3.fromDegrees(-180, p1_latitude), p2);
                return;
            }
            _this._computeGrid(p1, Cesium.Cartesian3.fromDegrees(0, p2_latitude));
            _this._computeGrid(Cesium.Cartesian3.fromDegrees(0, p1_latitude), p2);
            return;
        } else {
            _this._computeGrid(p1, p2);
        }

    },
    //判断是否跨子午线
    _divideMeridian: function (p1, p2, p1_longitude, p2_longitude, p1_latitude, p2_latitude) {
        let _this = this;
        if ((p1_longitude > 0 && p2_longitude < 0) || (p1_longitude < 0 && p2_longitude > 0)) {
            if ((Math.abs(p1_longitude) + Math.abs(p2_longitude) > 180) && ((p1_longitude > 0 && p2_longitude < 0) || (p1_longitude < 0 && p2_longitude > 0))) {
                _this._computeGrid(p1, Cesium.Cartesian3.fromDegrees(180, p2_latitude));
                _this._computeGrid(Cesium.Cartesian3.fromDegrees(-180, p1_latitude), p2);
                return;
            }
            _this._computeGrid(p1, Cesium.Cartesian3.fromDegrees(0, p2_latitude));
            _this._computeGrid(Cesium.Cartesian3.fromDegrees(0, p1_latitude), p2);
            return;
        }
        _this._computeGrid(p1, p2);
    },
    _computeGrid: function (point_1, point_2) {
        let _this = this;

        let p1 = point_1;
        let p2 = point_2;
        let p1_cartographic = _this.ellipsoid.cartesianToCartographic(p1);
        let p1_latitude = Cesium.Math.toDegrees(p1_cartographic.latitude);
        let p1_longitude = Cesium.Math.toDegrees(p1_cartographic.longitude);
        let p2_cartographic = _this.ellipsoid.cartesianToCartographic(p2);
        let p2_latitude = Cesium.Math.toDegrees(p2_cartographic.latitude);
        let p2_longitude = Cesium.Math.toDegrees(p2_cartographic.longitude);

        let L1 = _this.gridUtils.SC2L(p1_latitude, _this.level);
        let L2 = _this.gridUtils.SC2L(p2_latitude, _this.level);
        if (L1 === L2) {
            _this._computeCode(p1_longitude, p1_latitude, p2_longitude, p2_latitude);
        } else {
            let Ldiff = L1 - L2;
            //根据剖分层获取纬域界限值数组
            let latArray = _this.gridUtils.getLatArrayFromLevel(_this.level);
            //南半球只需要后半部分
            if (p1_latitude <= 0 && p2_latitude <= 0) {
                latArray = latArray.slice(latArray.length / 2);
            }
            //计算最上层格网码
            let first = L1 - 2;
            _this._computeCode(p1_longitude, p1_latitude, p2_longitude, latArray[first]);
            //循环计算中间纬域格网码
            if (Ldiff > 1) {
                for (let i = 0; i < Ldiff - 1; i++) {
                    _this._computeCode(p1_longitude, latArray[L1 - 2 - i], p2_longitude, latArray[L1 - 2 - 1 - i]);
                }
            }
            //计算最下层格网码
            let last = L2 - 1;
            _this._computeCode(p1_longitude, latArray[last], p2_longitude, p2_latitude);
        }
    },
    //TODO:选取的矩形框与实际加载影像文件有偏差
    getPath: function (tileLevel) {
        let _this = this;
        axios({
            method: 'post',
            url: '/code',
            data: {codes: _this.codes, tileLevel: tileLevel},
            timeout: 999990,
        }).then(({data}) => {
            console.log(data);
            _this.imgInfo = data;
            for (let item in data) {
                console.log(data[item].path);
                let [lat, lon] = data[item].path.match(/\d+/g);
                lat = Number(lat);
                lon = Number(lon);
                let bData = {
                    rectangle: {
                        coordinates: Cesium.Rectangle.fromDegrees(lon, lat, lon + 1, lat + 1),
                        outlineColor: Cesium.Color.BLUE,
                        fill: false,
                        outline: true,
                        outlineWidth: 1,
                    },
                };
                _this.entity = _this.viewer.entities.add(bData);
            }
            if (data !== null && data !== undefined) {
                let terrainProvider = new Cesium.CesiumTerrainProvider({
                    url: "/terrain_tiles"
                });
                _this.viewer.terrainProvider = terrainProvider;
            }
        })
    },
    _clearMarkers: function (layerName) {
        var _this = this;
        var viewer = _this.viewer;
        var entityList = viewer.entities.values;
        if (entityList === null || entityList.length < 1)
            return;
        for (var i = 0; i < entityList.length; i++) {
            var entity = entityList[i];
            if (entity.layerId === layerName) {
                viewer.entities.remove(entity);
                i--;
            }
        }
    },

    _getPosition: function () {
        let _this = this;
        var entity = _this.viewer.entities.add({
            label: {
                show: false
            }
        });
        var longitudeString = null;
        var latitudeString = null;
        var height = null;
        var cartesian = null;
        // 定义当前场景的画布元素的事件处理
        var handler = new Cesium.ScreenSpaceEventHandler(_this.scene.canvas);
        //设置鼠标移动事件的处理函数，这里负责监听x,y坐标值变化
        handler.setInputAction(function (movement) {
            //通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
            cartesian = _this.viewer.camera.pickEllipsoid(movement.position, _this.ellipsoid);
            if (cartesian) {
                //将笛卡尔坐标转换为地理坐标
                var cartographic = _this.ellipsoid.cartesianToCartographic(cartesian);
                //将弧度转为度的十进制度表示
                longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
                latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
                //获取相机高度
                height = Math.ceil(_this.viewer.camera.positionCartographic.height);
                entity.position = cartesian;
                entity.label.show = true;
                entity.label.text = '(' + longitudeString + ', ' + latitudeString + "," + height + ')';
            } else {
                entity.label.show = false;
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //设置鼠标滚动事件的处理函数，这里负责监听高度值变化
        handler.setInputAction(function (wheelment) {
            height = Math.ceil(_this.viewer.camera.positionCartographic.height);
            entity.position = cartesian;
            entity.label.show = true;
            entity.label.text = '(' + longitudeString + ', ' + latitudeString + "," + height + ')';
        }, Cesium.ScreenSpaceEventType.WHEEL);
    },

    CLASS_NAME: "GlobeRectangleDrawer"
};

export default GlobeRectangleDrawer;