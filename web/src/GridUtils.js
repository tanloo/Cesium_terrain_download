let GridUtils = function () {
    this.init.apply(this, arguments);
};
GridUtils.prototype = {
    longitude: null,
    latitude: null,

    init: function (degreeArray) {
        let _this = this;
        if (degreeArray === null || degreeArray === undefined) {
            return;
        }
        _this.longitude = degreeArray[0];
        _this.latitude = degreeArray[1];
    },
    SC2L: function (lat, level) {
        let _this = this;
        let Ges90Degree = 90.0;
        let mask = 1;
        if (lat < 0) {
            lat = -lat;
            //mask = -1;
        }
        let temp = Ges90Degree - Ges90Degree / _this._Pow2(level);
        if (lat >= 0 && lat <= Ges90Degree / 2) {
            return 1 * mask;
        }
        if (lat >= temp && Ges90Degree) {
            return (level + 1) * mask;
        } else if (lat < temp) {
            return (_this._DownLog2(Ges90Degree / (Ges90Degree - lat)) + 1) * mask;
        }
    },
    _Pow2: function (x) {
        if (x < 0) {
            return 0;
        }
        let val = 1;
        return val << x;
    },
    _DownLog2: function (x) {
        if (x < 1) {
            return -1;
        }
        let yValue = 1;
        let i = 0;
        while (true) {
            if (yValue === x) {
                return i;
            } else if (yValue > x) {
                return i - 1;
            }
            yValue = yValue << 1;
            i++;
        }
        return i;
    },
    _SC2QuadCode: function (lon, lat) {
        let temp = lon;
        let XYCode;
        if (lon < 0) {
            while (temp < 0) {
                temp += 90.0 * 4;
            }
            XYCode = temp / 90.0;
        } else if (lon >= 90.0 * 4) {
            while (temp > 90.0 * 4) {
                temp -= 90.0 * 4;
            }
            XYCode = temp / 90.0;
        } else {
            XYCode = lon / 90.0;
        }
        return lat > 0 ? XYCode : XYCode | 0X4;

    },
    _ZFilling: function (order0, order1, sl/*subdivision level*/) {
        let result = 0;
        for (let i = 0; i < sl; i++) {
            result |= (order0 & 1) << (2 * i);
            order0 = order0 >> 1;

            result |= (order1 & 1) << (2 * i + 1);
            order1 = order1 >> 1;
        }
        return result;
    },
    _PackageEssgC: function (ci, co) {
        co = 0;
        let MaskOne = 0x1;
        if (ci.TF === 0x0) {
            co = (ci.DZF) | (ci.ASL << (ci.MSL + ci.MSL + ci.MSL)) | ((ci.QC) << (ci.MSL + ci.MSL + ci.MSL + 5)) | ((ci.TF) << (ci.MSL + ci.MSL + ci.MSL + 5 + 3)) | (MaskOne << (ci.MSL + ci.MSL + ci.MSL + 5 + 5));
        } else if (ci.TF === 0x1) {
            co = (ci.DZF) | ((ci.SZ) << (ci.MSL + ci.MSL + ci.MSL)) | ((ci.ASL) << (ci.MSL + ci.MSL + ci.MSL + ci.ASL)) | ((ci.QC) << (ci.MSL + ci.MSL + ci.MSL + ci.ASL + 5)) | ((ci.TF) << (ci.MSL + ci.MSL + ci.MSL + ci.ASL + 5 + 3)) | (MaskOne << (ci.MSL + ci.MSL + ci.MSL + ci.ASL + 5 + 5));
        } else if (ci.TF === 0x2) {
            co = (ci.DZF) | ((ci.SZ) << (ci.MSL + ci.MSL + ci.MSL)) | ((ci.ASL) << (ci.MSL + ci.MSL + ci.MSL + ci.ASL + ci.ASL)) | ((ci.QC) << (ci.MSL + ci.MSL + ci.MSL + ci.ASL + ci.ASL + 5)) | ((ci.TF) << (ci.MSL + ci.MSL + ci.MSL + ci.ASL + ci.ASL + 5 + 3)) | (MaskOne << (ci.MSL + ci.MSL + ci.MSL + ci.ASL + ci.ASL + 5 + 5));
        } else {
            co = (ci.DZF) | ((ci.ASL) << (ci.MSL + ci.MSL)) | ((ci.QC) << (ci.MSL + ci.MSL + 5)) | ((ci.TF) << (ci.MSL + ci.MSL + 5 + 3)) | (MaskOne << (ci.MSL + ci.MSL + 5 + 5));
        }
        return co;
    },
    DCSE2SDQGC: function (lon, lat, Qua/*象限码*/, MSL/*剖次*/) {
        let DZF = this._ZFilling(lon, lat, MSL);
        let c = {
            TF: 0x3,
            QC: Qua,
            SZ: 0,
            ASL: 0,
            MSL: MSL,
            DZF: DZF
        };
        DZF = this._PackageEssgC(c, DZF);
        return DZF;
    }
};

export default GridUtils;