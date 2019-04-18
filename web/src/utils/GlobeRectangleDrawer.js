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
    toolBarIndex: null,
    layerId: "globeEntityDrawerLayer",
    codes: [],
    imgInfo:null,
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
        //_this._computeGrid(Cesium.Cartesian3.fromDegrees(0, 45), Cesium.Cartesian3.fromDegrees(180, 0));
        //_this._computeGrid(Cesium.Cartesian3.fromDegrees(-91.96530365851015, 25.34859337209848), Cesium.Cartesian3.fromDegrees(-77.6934107113205, 16.69940417685254));
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
    startDrawRectangle: function (okHandler, cancelHandler) {
        var _this = this;

        return new Promise(resolve => {
            _this.okHandler = okHandler;
            _this.cancelHandler = cancelHandler;

            _this.positions = [];
            var floatingPoint = null;
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
                    floatingPoint = _this._createPoint(cartesian, -1);
                    _this._showRegion2Map();
                }
                _this.positions.push(cartesian);
                var oid = _this.positions.length - 2;
                _this._createPoint(cartesian, oid);
                if (num > 1) {
                    _this.positions.pop();
                    _this.viewer.entities.remove(floatingPoint);
                    _this.tooltip.setVisible(false);
                    if (_this.drawHandler) {
                        _this.drawHandler.destroy();
                        _this.drawHandler = null;
                    }
                    _this._computeRectangle();
                    resolve(true);
                    // _this._computeGrid(Cesium.Cartesian3.fromDegrees(-79, 0), Cesium.Cartesian3.fromDegrees(-34, -52));
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
                floatingPoint.position.setValue(cartesian);
                _this.positions.pop();
                _this.positions.push(cartesian);
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        });


    },
    _createPoint: function (cartesian, oid) {
        var _this = this;
        var point = _this.viewer.entities.add({
            position: cartesian,
            billboard: {
                image: _this.dragIconLight,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -500)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
        point.oid = oid;
        point.layerId = _this.layerId;
        point.flag = "anchor";
        return point;
    },
    _showRegion2Map: function () {
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
                outlineColor: Cesium.Color.RED,
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

        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
    },
    _computeRectangle: function () {
        let _this = this;
        let p1 = _this.positions[0];
        let p2 = _this.positions[1];
        let p1_cartographic = _this.ellipsoid.cartesianToCartographic(p1);
        let p1_longitude = Cesium.Math.toDegrees(p1_cartographic.longitude);
        let p1_latitude = Cesium.Math.toDegrees(p1_cartographic.latitude);
        let p2_cartographic = _this.ellipsoid.cartesianToCartographic(p2);
        let p2_latitude = Cesium.Math.toDegrees(p2_cartographic.latitude);
        let p2_longitude = Cesium.Math.toDegrees(p2_cartographic.longitude);
        //判断是否跨南北半球
        if ((p1_latitude > 0 && p2_latitude < 0) || (p1_latitude < 0 && p2_latitude > 0)) {
            _this._divideL(p1, Cesium.Cartesian3.fromDegrees(p2_longitude, 0), p1_longitude, p2_longitude, p1_latitude, 0);
            _this._divideL(Cesium.Cartesian3.fromDegrees(p1_longitude, 0), p2, p1_longitude, p2_longitude, 0, p2_latitude);
        } else if ((p1_longitude > 0 && p2_longitude < 0) || (p1_longitude < 0 && p2_longitude > 0)) {
            if ((Math.abs(p1_longitude) + Math.abs(p2_longitude) > 180) && ((p1_longitude > 0 && p2_longitude < 0) || (p1_longitude < 0 && p2_longitude > 0))) {
                _this._divideL(p1, Cesium.Cartesian3.fromDegrees(180, p2_latitude), p1_longitude, 180, p1_latitude, p2_latitude);
                _this._divideL(Cesium.Cartesian3.fromDegrees(180, p1_latitude), p2, 180, p2_longitude, p1_latitude, p2_latitude);
            }
            _this._divideL(p1, Cesium.Cartesian3.fromDegrees(0, p2_latitude), p1_longitude, 0, p1_latitude, p2_latitude);
            _this._divideL(Cesium.Cartesian3.fromDegrees(0, p1_latitude), p2, 0, p2_longitude, p1_latitude, p2_latitude);

        } else {
            _this._computeGrid(p1, p2);
        }

    },
    //判断是否跨子午线
    _divideL: function (p1, p2, p1_longitude, p2_longitude, p1_latitude, p2_latitude) {
        let _this = this;
        if ((p1_longitude > 0 && p2_longitude < 0) || (p1_longitude < 0 && p2_longitude > 0)) {
            if ((Math.abs(p1_longitude) + Math.abs(p2_longitude) > 180) && ((p1_longitude > 0 && p2_longitude < 0) || (p1_longitude < 0 && p2_longitude > 0))) {
                _this._computeGrid(p1, Cesium.Cartesian3.fromDegrees(180, p2_latitude));
                _this._computeGrid(Cesium.Cartesian3.fromDegrees(180, p1_latitude), p2);
                return;
            }
            _this._computeGrid(p1, Cesium.Cartesian3.fromDegrees(0, p2_latitude));
            _this._computeGrid(Cesium.Cartesian3.fromDegrees(0, p1_latitude), p2);
            return;
        }
        if ((p1_latitude > 0 && p2_latitude < 0) || (p1_latitude < 0 && p2_latitude > 0)) {
            _this._computeGrid(p1, Cesium.Cartesian3.fromDegrees(p2_longitude, 0));
            _this._computeGrid(Cesium.Cartesian3.fromDegrees(p1_longitude, 0), p2);
            return;
        }
        _this._computeGrid(p1, p2);
    },
    _computeGrid: function (point_1, point_2) {
        let _this = this;

        let level = 6;
        let p1 = point_1;
        let p2 = point_2;
        let p1_cartographic = _this.ellipsoid.cartesianToCartographic(p1);
        let p1_latitude = Cesium.Math.toDegrees(p1_cartographic.latitude);
        let p1_longitude = Cesium.Math.toDegrees(p1_cartographic.longitude);
        let p2_cartographic = _this.ellipsoid.cartesianToCartographic(p2);
        let p2_latitude = Cesium.Math.toDegrees(p2_cartographic.latitude);
        let p2_longitude = Cesium.Math.toDegrees(p2_cartographic.longitude);

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
        //console.log([p1_longitude, p1_latitude, p2_longitude, p2_latitude]);
        //获取两点纬域值
        let L1 = _this.gridUtils.SC2L(p1_latitude, level);
        let L2 = _this.gridUtils.SC2L(p2_latitude, level);
        let n = L1;
        //console.log("原纬域 L1:" + L1 + ",L2:" + L2);
        //纬域值反序转换
        n = level + 1 + 1 - n;
        L1 = level + 1 + 1 - L1;
        L2 = level + 1 + 1 - L2;
        //console.log("转换后纬域 L1:" + L1 + ",L2:" + L2);
        //判断两点是否在同一纬域
        if (L1 === L2) {
            _this._createGridFromL([p1, p2], n);
        } else {
            //相隔纬域量
            let Lnum = L2 - L1;
            //console.log("L1:" + L1 + "，L2:" + L2);
            let newP1, newP2;
            //根据剖分层获取纬域界限值数组
            let latArray = _this._getLatArrayFromLevel(level);
            //南半球只需要后半部分
            if (p1_latitude <= 0 && p2_latitude <= 0) {
                latArray = latArray.slice(latArray.length / 2);
            }
            //绘制纬域值最小的格网
            if (Math.abs(p1_latitude) > Math.abs(latArray[0])) {
                p1 = Cesium.Cartesian3.fromDegrees(p1_longitude, latArray[0]);
            }
            let first = L1 - 1;
            newP2 = Cesium.Cartesian3.fromDegrees(p2_longitude, latArray[first]);
            _this._createGridFromL([p1, newP2], n);
            //循环绘制中间纬域值格网
            if (Lnum > 1) {
                for (let i = 0; i < Lnum - 1; i++) {
                    newP1 = Cesium.Cartesian3.fromDegrees(p1_longitude, latArray[L1 - 1 + i]);
                    newP2 = Cesium.Cartesian3.fromDegrees(p2_longitude, latArray[L1 - 1 + i + 1]);
                    _this._createGridFromL([newP1, newP2], ++n);
                }
            }
            //绘制纬域值最大的格网
            let last = L2 - 2;
            newP1 = Cesium.Cartesian3.fromDegrees(p1_longitude, latArray[last]);
            _this._createGridFromL([newP1, p2], ++n);
        }
    },

    _createGridFromL: function (cartesianPointArray, L) {
        let _this = this;
        //console.log("开始绘制格网，纬域为：" + L);
        let cartographics = [_this.ellipsoid.cartesianToCartographic(cartesianPointArray[0]), _this.ellipsoid.cartesianToCartographic(cartesianPointArray[1])];
        let p1_longitude = Cesium.Math.toDegrees(cartographics[0].longitude);
        let p1_latitude = Cesium.Math.toDegrees(cartographics[0].latitude);
        let p2_longitude = Cesium.Math.toDegrees(cartographics[1].longitude);
        let p2_latitude = Cesium.Math.toDegrees(cartographics[1].latitude);

        let n = Math.pow(2, L - 1);
        let ratio = 1 / n;
        let latitude = (p2_latitude - p1_latitude) * ratio;
        let longitude = (p2_longitude - p1_longitude) * ratio;
        let isSouthern = false;
        if (p1_latitude <= 0 && p2_latitude <= 0) {
            isSouthern = true;
        }
        //若两点跨子午线，则比率需要判断计算
        if ((Math.abs(p1_longitude) + Math.abs(p2_longitude) > 180) && ((p1_longitude > 0 && p2_longitude < 0) || (p1_longitude < 0 && p2_longitude > 0))) {
            longitude = (180 - Math.abs(p2_longitude) + 180 - Math.abs(p1_longitude)) * ratio;
        }
        console.log([p1_longitude, p1_latitude, p2_longitude, p2_latitude]);
        //console.log([longitude, latitude]);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                let degreeArray = [];

                if (isSouthern) {
                    degreeArray.push(p1_longitude + (-longitude * j));
                    degreeArray.push(p1_latitude + (latitude * i));
                    longitude = Math.abs(longitude);
                    if (p2_longitude + (longitude * (n - 1 - j)) > 180) {
                        degreeArray.push(p2_longitude + (longitude * (n - 1 - j)) - 180 + -180);
                    } else {
                        degreeArray.push(p2_longitude + (longitude * (n - 1 - j)));
                    }
                    degreeArray.push(p2_latitude - (latitude * (n - 1 - i)));
                } else {
                    degreeArray.push(p1_longitude + (longitude * j));
                    degreeArray.push(p1_latitude + (latitude * i));
                    degreeArray.push(p2_longitude - (longitude * (n - 1 - j)));
                    degreeArray.push(p2_latitude - (latitude * (n - 1 - i)));
                }
                _this._addGirdRect(degreeArray, i, j);
            }
        }
        _this.codes = _this.gridUtils.getCodesFromPoints([p1_longitude, p1_latitude], [p2_longitude, p2_latitude], 6);

        console.log(_this.codes);
        //_this.getPath();

        _this._getPosition();
    },
    getPath: function (tileLevel) {
        let _this = this;
        /*  axios.post('/code', {codes: _this.codes, tileLevel: tileLevel}).then(({data}) => {
              console.log(data);
              /!*if (data !== null && data !== undefined) {
                  let terrainProvider = new Cesium.CesiumTerrainProvider({
                      url: "/terrain_tiles"
                  });
                  _this.viewer.terrainProvider = terrainProvider;
              }*!/
          });*/
        axios({
            method: 'post',
            url: '/code',
            data: {codes: _this.codes, tileLevel: tileLevel},
            timeout: 999990,
        }).then(({data}) => {
            console.log(data);
            _this.imgInfo = data;
            if (data !== null && data !== undefined) {
                let terrainProvider = new Cesium.CesiumTerrainProvider({
                    url: "/terrain_tiles"
                });
                _this.viewer.terrainProvider = terrainProvider;
            }
        })
    },
    _getLatArrayFromLevel: function (level) {
        let latArray = [];
        for (let i = level; i > 0; i--) {
            latArray.push(90 - 90 * (Math.pow(1 / 2, i)));
        }

        let length = latArray.length;
        for (let i = 0; i < length; i++) {
            latArray.push(-latArray[i]);
        }
        return latArray;
    },
    _addGirdRect: function (degreeArray, i, j) {
        let _this = this;
        let cartesianArray = Cesium.Cartesian3.fromDegreesArray(degreeArray);
        let bData = {
            name: 'Grid ' + i + ',' + j,
            rectangle: {
                coordinates: Cesium.Rectangle.fromCartesianArray(cartesianArray),
                outlineColor: Cesium.Color.RED,
                fill: false,
                outline: true,
                outlineWidth: 1,
            },
            layerId: _this.layerId
        };
        _this.viewer.entities.add(bData);

        /*  let center_cartesian = Cesium.Cartographic.toCartesian(Cesium.Rectangle.center(Cesium.Rectangle.fromCartesianArray(cartesianArray)));
          let center_cartographic = _this.ellipsoid.cartesianToCartographic(center_cartesian);
          let longitude = Cesium.Math.toDegrees(center_cartographic.longitude);
          let latitude = Cesium.Math.toDegrees(center_cartographic.latitude);

          let XYCode = _this.gridUtils.SC2QuadCode(longitude, latitude);
          let code = _this.gridUtils.DCSE2SDQGC(longitude, latitude, XYCode, 6);

          _this.viewer.entities.add({
              position: center_cartesian,
              label: {
                  text: code.toString(),
                  font: '18px Helvetica',
                  fillColor: Cesium.Color.BULE,
                  outlineColor: Cesium.Color.BLACK,
                  outlineWidth: 1,
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE
              },
              layerId: _this.layerId
          });*/
    },
    _getRowDegreeArray: function (point1, point2, ratio) {
        let _this = this;
        let cartographics = [_this.ellipsoid.cartesianToCartographic(point1), _this.ellipsoid.cartesianToCartographic(point2)];
        let rowDegreesArray = [];
        let latitude = (Cesium.Math.toDegrees(cartographics[1].latitude) - Cesium.Math.toDegrees(cartographics[0].latitude)) * ratio;
        for (let i = 0; i < cartographics.length; i++) {
            rowDegreesArray.push(Cesium.Math.toDegrees(cartographics[i].longitude));
            rowDegreesArray.push(Cesium.Math.toDegrees(cartographics[0].latitude) + latitude);
        }
        return rowDegreesArray;
    },
    _getColDegreeArray: function (point1, point2, ratio) {
        let _this = this;
        let cartographics = [_this.ellipsoid.cartesianToCartographic(point1), _this.ellipsoid.cartesianToCartographic(point2)];
        let colDegreesArray = [];
        let longitude = (Cesium.Math.toDegrees(cartographics[1].longitude) - Cesium.Math.toDegrees(cartographics[0].longitude)) * ratio;
        for (let i = 0; i < cartographics.length; i++) {
            colDegreesArray.push(Cesium.Math.toDegrees(cartographics[0].longitude) + longitude);
            colDegreesArray.push(Cesium.Math.toDegrees(cartographics[i].latitude));
        }
        return colDegreesArray;
    },
    _addGridLine: function (degreesArray) {

        let _this = this;
        _this.viewer.entities.add({
            name: 'Grid line',
            polyline: {
                positions: Cesium.Cartesian3.fromDegreesArray(degreesArray),
                width: 3,
                material: Cesium.Color.RED,
                arcType: Cesium.ArcType.RHUMB
            }
        });
    },

    _isSimpleXYZ: function (p1, p2) {
        if (p1.x === p2.x && p1.y === p2.y && p1.z === p2.z) {
            return true;
        }
        return false;
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