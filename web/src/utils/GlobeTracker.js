import GlobeRectangleDrawer from "./GlobeRectangleDrawer"

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
    trackRectangle: async function (okHandler, cancelHandler) {
        let _this = this;
        if (_this.rectDrawer == null) {
            _this.rectDrawer = new GlobeRectangleDrawer(_this.viewer);
            _this.ctrArr.push(_this.rectDrawer);
        }
        //_this.clear();
        let res = await _this.rectDrawer.startDrawRectangle(okHandler, cancelHandler);
        return new Promise(resolve => {
            resolve(res);
        });
    },
    getTile: function (tileLevel) {
        let _this = this;
        _this.rectDrawer.getPath(tileLevel);
    },
    getImgInfo: function () {
        return this.rectDrawer.imgInfo;
    },
    getClipImg:function(){
        this.rectDrawer.getSelectedRect();
    },
    CLASS_NAME: "GlobeTracker"
};

export default GlobeTracker;