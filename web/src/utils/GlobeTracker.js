import GlobeRectangleDrawer from "./GlobeRectangleDrawer"
import Cesium from "cesium";
import axios from "axios";

var GlobeTracker = function () {
    this.init.apply(this, arguments);
};

GlobeTracker.prototype = {
    viewer: null,
    ctrArr: [],
    rectDrawer: null,
    init: function (viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.rectDrawer = new GlobeRectangleDrawer(_this.viewer);
        _this.ctrArr.push(_this.rectDrawer);

    },
    clear: function () {
        let _this = this;
        for (let i = 0; i < _this.ctrArr.length; i++) {
            try {
                let ctr = _this.ctrArr[i];
                if (ctr.clear) {
                    ctr.clear();
                }
            } catch (err) {
                console.log("发生未知出错：GlobeTracker.clear");
            }
        }
    },
    trackRectangle: async function (isRedraw = false, okHandler, cancelHandler) {
        let _this = this;
        if (_this.rectDrawer == null) {
            _this.rectDrawer = new GlobeRectangleDrawer(_this.viewer);
            _this.ctrArr.push(_this.rectDrawer);
        }
        //_this.clear();

        let res = await _this.rectDrawer.startDrawRectangle(isRedraw, okHandler, cancelHandler);
        return new Promise(resolve => {
            resolve(res);
        });
    },
    getTile: function (tileLevel) {
        let _this = this;
        //_this.rectDrawer.getPath(tileLevel);
    },
    getImgInfo: function () {
        return this.rectDrawer.imgInfo;
    },
    getClipImg: function () {
        let _this = this;
        let insideRect = _this.viewer.entities.getById('Inside Rect').rectangle.coordinates.getValue();
        if (insideRect === undefined) {
            window.alert("未选择范围！");
            return;
        }
        let west = Cesium.Math.toDegrees(insideRect.west);
        let north = Cesium.Math.toDegrees(insideRect.north);
        let south = Cesium.Math.toDegrees(insideRect.south);
        let east = Cesium.Math.toDegrees(insideRect.east);
        let [xMin, xMax] = [Math.min(west, east), Math.max(west, east)];
        let [yMin, yMax] = [Math.min(north, south), Math.max(north, south)];
        axios.get('/downloadClipImg', {
            params: {xMin, yMin, xMax, yMax}
        }).then(({data}) => {
            if (data === "success") {
                window.alert("数据下载成功");
            }
        })
    },
    clearInsideRectangle: function () {
        let _this = this;
        _this.viewer.entities.removeById('Inside Rect');
    },
    CLASS_NAME: "GlobeTracker"
};

export default GlobeTracker;