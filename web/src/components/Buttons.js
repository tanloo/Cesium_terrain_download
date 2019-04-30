import React, {useState} from "react";
import {Button} from 'react-bootstrap';
import TileLevelModal from "./TileLevelModal";
import DownloadModal from "./DownloadModal";
import {connect} from "react-redux";

function DrawButton({tracker, setCompleted, drawIsCompleted}) {
    const [modalShow, setModalShow] = useState(false);

    async function handleClick() {
        if (await tracker.trackRectangle()) {
            setModalShow(true);
        }
        setCompleted();
    }

    if (drawIsCompleted) {
        return <TileLevelModal show={modalShow} onHide={() => setModalShow(false)} tracker={tracker}/>
    }
    return (
        <>
            <Button id="drawRectBtn" variant="info" onClick={handleClick}>DrawRect</Button>
            <TileLevelModal show={modalShow} onHide={() => setModalShow(false)} tracker={tracker}/>
        </>
    )
}

const mapDispatchToDrawProps = (dispatch) => ({
    setCompleted: () => {
        dispatch({
            type: 'draw'
        })
    }
});
const DrawBtn = connect(({draw}) => ({drawIsCompleted: draw.drawIsCompleted}), mapDispatchToDrawProps)(DrawButton);

function ClearButton({tracker, setUncompleted, drawIsCompleted}) {
    const handleClick = () => {
        tracker.clear();
        setUncompleted();
    };
    if (!drawIsCompleted) {
        return <></>
    }
    return <Button id="clearBtn" variant="danger" onClick={handleClick}>ClearAll</Button>;
}

const mapDispatchToClearProps = (dispatch) => ({
    setUncompleted: () => {
        dispatch({
            type: 'clear'
        })
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
            <DownloadModal show={modalShow} onHide={() => setModalShow(false)} fileinfo={fileInfo}
            />
        </>
    )
}

const DownloadBtn = connect(({draw}) => ({drawIsCompleted: draw.drawIsCompleted}))(DownloadButton);

function DownClipImgButton({tracker, drawIsCompleted}) {
    const handleClick = () => {
        tracker.getClipImg();
    };
    if (!drawIsCompleted) {
        return <></>
    }
    return <Button id="downClipImgBtn" variant="secondary" onClick={handleClick}>下载选中数据</Button>;
}

const DownClipImgBtn = connect(({draw}) => ({drawIsCompleted: draw.drawIsCompleted}))(DownClipImgButton);


export {DrawBtn, ClearBtn, DownloadBtn, DownClipImgBtn}