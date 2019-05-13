let GridUtils = function () {
    this.init.apply(this, arguments);
};
GridUtils.prototype = {
    longitude: null,
    latitude: null,
    GesRadius: 6400000 * 4,
    Ges90Degree: 90.0,

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
        let mask = 1;
        if (lat < 0) {
            lat = -lat;
            //mask = -1;
        }
        let temp = this.Ges90Degree - this.Ges90Degree / _this._Pow2(level);
        if (lat >= 0 && lat <= this.Ges90Degree / 2) {
            return 1 * mask;
        }
        if (lat >= temp && this.Ges90Degree) {
            return (level + 1) * mask;
        } else if (lat < temp) {
            return (_this._DownLog2(this.Ges90Degree / (this.Ges90Degree - lat)) + 1) * mask;
        }
    },
    _SC2B: function (r, level) {
        let temp = this.GesRadius / this._Pow2(level);
        if (r > this.GesRadius / 2 && r <= this.GesRadius) {
            return 1;
        } else if (r > temp && r <= this.GesRadius / 2) {
            return 1 + this._DownLog2(this.GesRadius / r);
        } else if (r <= temp) {
            return level + 1;
        }
        return 0;

    },
    _NsGes2B: function (gama, n) {
        let n_12 = this._Pow2(n - 1);
        let n_2 = n_12 << 1;
        if (gama <= n_12) {
            return 1;
        } else if (gama <= n_2) {
            return n - this._DownLog2(n_2 - gama);
        } else {
            return n + 1;
        }
    },
    _NsGes2L: function (beta, k, n) {
        let n_12 = this._Pow2(n - k);
        let n_2 = n_12 << 1;
        let mask = 1;
        if (beta < 0) {
            beta = -beta;
            mask = -1;
        } else if (beta <= n_12) {
            return 1 * mask;
        } else if (beta <= n_2) {
            return (n + 1 - k - this._DownLog2(n_2 - beta)) * mask;
        } else {
            return (n - k + 2) * mask;
        }

    },
    _QuadCode2Longitude: function (qc) {
        return (qc & 0x3) * this.Ges90Degree;
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
    },
    SC2QuadCode: function (lon, lat) {
        let temp = lon;
        let XYCode;
        if (lon < 0) {
            while (temp < 0) {
                temp += this.Ges90Degree * 4;
            }
            XYCode = temp / this.Ges90Degree;
        } else if (lon >= this.Ges90Degree * 4) {
            while (temp > this.Ges90Degree * 4) {
                temp -= this.Ges90Degree * 4;
            }
            XYCode = temp / this.Ges90Degree;
        } else {
            XYCode = lon / this.Ges90Degree;
        }
        return Math.floor(lat > 0 ? XYCode : XYCode | 0X4);
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
    DCSE2SDQGC: function (iLon, iLat, Qua/*象限码*/, MSL/*剖次*/) {
        let DZF = this._ZFilling(iLon, iLat, MSL);
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
    },
    //层纬域计算格网大小
    GesCellSize: function (k, j, n) {
        let gSize = [];
        gSize[0] = this.Ges90Degree / this._Pow2(n + 2 - k - Math.abs(j));
        gSize[1] = this.Ges90Degree / this._Pow2(n + 1 - k);
        gSize[2] = this.GesRadius / this._Pow2(n);
        return gSize;
    },
    SC2NsGes: function (point, level) {
        let k = this._SC2B(25600000, level);
        let j = this.SC2L(point[1], level);
        let dR = this.Ges90Degree / this._Pow2(level + 1 - k);
        let dLat = this.Ges90Degree / this._Pow2(level + 1 - k);
        let dLon = this.Ges90Degree / this._Pow2(level + 2 - k - Math.abs(j));

        let NsCoord = [];
        NsCoord[4] = this.SC2QuadCode(point[0], point[1]);
        NsCoord[3] = level;
        NsCoord[2] = Math.floor(((this.GesRadius - 25600000) / dR)) + 1;
        NsCoord[1] = point[1] < 0 ? Math.floor((-(point[1]) / dLat)) + 1 : Math.floor(((point[1]) / dLat)) + 1;

        let temp = point[0];
        while (temp >= this.Ges90Degree) {
            temp -= this.Ges90Degree;
        }
        while (temp < 0) {
            temp += this.Ges90Degree;
        }
        NsCoord[0] = Math.floor((temp / dLon)) + 1;
        return NsCoord;
    },
    getCodesFromPoints: function (point1, point2, level) {
        let L = this.SC2L((point1[1] + point2[1]) / 2, level);

        let cellSize = this.GesCellSize(1, L, level);

        let m1 = Math.ceil(Math.abs(point2[0] - point1[0]) / cellSize[0]);
        let m2 = Math.ceil(Math.abs(point2[1] - point1[1]) / cellSize[1]);
        // m1 = Math.abs(m1);
        //m2 = Math.abs(m2);
        let JWX = this.SC2NsGes(point1, level);
        let XYCode = Math.floor(this.SC2QuadCode(point1[0], point1[1]));
        let codes = [];
        for (let i = 0; i < m1; i++) {
            for (let j = 0; j < m2; j++) {
                codes.push(this.DCSE2SDQGC(JWX[0] + i, JWX[1] + j, XYCode, level));
            }
        }
        //let gCenter = this._NsGes2GesSC(JWX);
        //let rect = [gCenter[0] - cellSize[0], gCenter[1] - cellSize[1], gCenter[0] + cellSize[0], gCenter[1] + cellSize[1]];
        return codes;
    },
    getLatArrayFromLevel: function (level) {
        let latArray = [];
        for (let i = 1; i < level + 1; i++) {
            latArray.push(90 - 90 * (Math.pow(1 / 2, i)));
        }

        let length = latArray.length;
        for (let i = 0; i < length; i++) {
            latArray.push(-latArray[i]);
        }
        return latArray;
    },
    _NsGes2GesSC: function (nsGes) {
        let k = this._NsGes2B(nsGes[2], nsGes[3]);
        let j = this._NsGes2L(nsGes[1], k, nsGes[3]);
        let gSize = [];
        gSize.push(this.Ges90Degree / this._Pow2(nsGes[3] + 2 - k - Math.abs(j)));
        gSize.push(this.Ges90Degree / this._Pow2(nsGes[3] + 1 - k));
        gSize.push(this.GesRadius / this._Pow2(nsGes[3]));

        let coordX = nsGes[0] - 1;
        if (coordX[0] < 0) {
            let k = this._NsGes2B(nsGes[2], nsGes[3]);
            let j = this._NsGes2L(nsGes[1], k, nsGes[3]);
            let count = ((j == (nsGes[3] + 2 - k)) ? 1 : 1 << (nsGes[3] + 2 - k - j));
            coordX += count;
        }
        let coordY = nsGes[1] > 0 ? nsGes[1] - 1 : -nsGes[1] - 1;
        let gCenter = [];
        gCenter.push(this._QuadCode2Longitude(nsGes[4]) + (coordX + 0.5) * gSize[0]);
        gCenter.push((nsGes[4] & 0x4) ? -(coordY + 0.5) * gSize[1] : (coordY + 0.5) * gSize[1]);
        gCenter.push(this.GesRadius - (nsGes[2] - 0.5) * gSize[2]);
        console.log("center:", gCenter);
        return gCenter;
    },
};

export default GridUtils;