import React, {useState} from "react";
import {Button} from 'react-bootstrap';
import TileLevelModal from "./TileLevelModal";
import DownloadModal from "./DownloadModal";
import {connect} from "react-redux";
import GlobeTracker from "../utils/GlobeTracker";
import ResampleModal from './ResampleModal';

function DrawButton({tracker, drawIsCompleted}) {
    const [modalShow, setModalShow] = useState(false);

    async function handleClick() {
        tracker.clear();
        if (await tracker.trackRectangle()) {
            setModalShow(true);
        }
    }

    if (drawIsCompleted) {
        return <TileLevelModal show={modalShow} onHide={() => setModalShow(false)} tracker={tracker}/>
    }
    return (
        <>
            <Button id="drawRectBtn" variant="info" onClick={handleClick}>选取范围</Button>
            <TileLevelModal show={modalShow} onHide={() => setModalShow(false)} tracker={tracker}/>
        </>
    )
}

const DrawBtn = connect(({draw}) => ({drawIsCompleted: draw.drawIsCompleted}))(DrawButton);

function ClearButton({tracker, setUncompleted, drawIsCompleted}) {
    const handleClick = () => {
        tracker.clear();
        setUncompleted();
    };
    if (!drawIsCompleted) {
        return <></>
    }
    return <Button id="clearBtn" variant="danger" onClick={handleClick}>清除</Button>;
}

const mapDispatchToClearProps = (dispatch) => ({
    setUncompleted: () => {
        dispatch({
            type: 'clear'
        });
    }
});
const ClearBtn = connect(({draw}) => ({drawIsCompleted: draw.drawIsCompleted}), mapDispatchToClearProps)(ClearButton);

function DownloadButton({tracker, drawIsCompleted}) {
    const [modalShow, setModalShow] = useState(false);
    const [fileInfo, setFileInfo] = useState(null);

    const handleClick = () => {
        let data = tracker.getImgInfo();

        if (data === null) {
            window.alert("需要先选择存在数据的区域！");
            return;
        }
        let arr = [];
        for (let item in data) {
            let [lat, lon] = data[item].path.match(/\d+/g);
            let fileName = data[item].path.split("\\")[data[item].path.split("\\").length - 1];
            arr.push({id: data[item].id, lon: lon, lat: lat, fileName: fileName});
        }
        setModalShow(true);
        setFileInfo(arr);
    };
    if (!drawIsCompleted) {
        return <></>
    }
    return (
        <>
            <Button id="downloadBtn" variant="light" onClick={handleClick}>下载原始数据</Button>
            <DownloadModal show={modalShow} onHide={() => setModalShow(false)} fileInfo={fileInfo}/>
        </>
    )
}

const DownloadBtn = connect(({draw}) => ({drawIsCompleted: draw.drawIsCompleted}))(DownloadButton);

function DownClipImgButton({tracker, redrawIsCompleted}) {
    const handleClick = () => {
        tracker.getClipImg();
    };
    if (!redrawIsCompleted) {
        return <></>
    }
    return <Button id="downClipImgBtn" variant="secondary" onClick={handleClick}>下载选中数据</Button>;
}

const DownClipImgBtn = connect(({draw}) => ({redrawIsCompleted: draw.redrawIsCompleted}))(DownClipImgButton);

function RedrawInsideRectButton({viewer, drawIsCompleted, redrawIsCompleted, setRedrawCompleted, setUnRedrawCompleted}) {

    const handleClick = async () => {
        const tracker = new GlobeTracker(viewer);
        tracker.clearInsideRectangle();
        if (await tracker.trackRectangle(true)) {
            setRedrawCompleted();
        } else {
            window.alert("请在范围内选取！");
            tracker.clearInsideRectangle();
            setUnRedrawCompleted();
        }

    };
    if (!drawIsCompleted && !redrawIsCompleted) {
        return <></>;
    }
    return <Button variant="success" onClick={handleClick}>自定义裁剪</Button>;
}

const mapDispatchToRedrawProps = (dispatch) => ({
    setRedrawCompleted: () => {
        dispatch({
            type: 'redraw'
        });
    },
    setUnRedrawCompleted: () => {
        dispatch({
            type: 'unRedraw'
        });
    }
});
const RedrawInsideRectBtn = connect(({draw}) => ({
    drawIsCompleted: draw.drawIsCompleted,
    redrawIsCompleted: draw.redrawIsCompleted
}), mapDispatchToRedrawProps)(RedrawInsideRectButton);

function ResampleButton({drawIsCompleted}) {
    const [modalShow, setModalShow] = useState(false);
    if (!drawIsCompleted) {
        return <ResampleModal show={modalShow} onHide={() => setModalShow(false)}/>
    }
    return (
        <>
            <Button variant="warning" onClick={() => setModalShow(true)}>重采样源数据</Button>
            <ResampleModal show={modalShow} onHide={() => setModalShow(false)}/>
        </>
    );
}

const ResampleBtn = connect(({draw}) => ({
    drawIsCompleted: draw.drawIsCompleted
}))(ResampleButton);

export {DrawBtn, ClearBtn, DownloadBtn, DownClipImgBtn, RedrawInsideRectBtn, ResampleBtn}