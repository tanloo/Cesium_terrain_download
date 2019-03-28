import GlobeRectangleDrawer from "./GlobeRectangleDrawer"

var GlobeTracker = function () {
    this.init.apply(this, arguments);
};

GlobeTracker.prototype = {
    viewer: null,
    ctrArr: [],
    rectDrawer: null,
    init: function (viewer) {
        var _this = this;
        _this.viewer = viewer;
        _this.rectDrawer = new GlobeRectangleDrawer(_this.viewer);
        _this.ctrArr.push(_this.rectDrawer);

    },
    clear: function () {
        var _this = this;
        for (var i = 0; i < _this.ctrArr.length; i++) {
            try {
                var ctr = _this.ctrArr[i];
                if (ctr.clear) {
                    ctr.clear();
                }
            } catch (err) {
                console.log("发生未知出错：GlobeTracker.clear");
            }
        }
    },
    trackRectangle: function (okHandler, cancelHandler) {
        var _this = this;
        if (_this.rectDrawer == null) {
            _this.rectDrawer = new GlobeRectangleDrawer(_this.viewer);
            _this.ctrArr.push(_this.rectDrawer);
        }
        //_this.clear();
        _this.rectDrawer.startDrawRectangle(okHandler, cancelHandler);
    },
    CLASS_NAME: "GlobeTracker"
};

export default GlobeTracker;