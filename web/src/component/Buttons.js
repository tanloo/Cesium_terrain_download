import React, {useState} from "react";
import {Button} from 'react-bootstrap';
import TileLevelModal from "./TileLevelModal";
import DownloadModal from "./DownloadModal";

function DrawButton(props) {
    const [modalShow, setModalShow] = useState(false);

    async function handleClick() {
        if (await props.tracker.trackRectangle()) {
            setModalShow(true);
        }
    }

    return (
        <>
            <Button id="drawRectBtn" variant="info" onClick={handleClick}>DrawRect</Button>
            <TileLevelModal show={modalShow} onHide={() => setModalShow(false)} tracker={props.tracker}/>
        </>
    )

}

function ClearButton(props) {
    const handleClick = () => {
        props.tracker.clear();
    };
    return <Button id="clearBtn" variant="danger" onClick={handleClick}>ClearAll</Button>;
}

function DownloadButton(props) {
    const [modalShow, setModalShow] = useState(false);
    const [fileInfo, setFileInfo] = useState(null);

    const handleClick = () => {
        let data = props.tracker.getImgInfo();

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

    return (
        <>
            <Button id="downloadBtn" variant="light" onClick={handleClick}>下载原始数据</Button>
            <DownloadModal show={modalShow} onHide={() => setModalShow(false)} fileinfo={fileInfo}
            />
        </>
    )
}

function DownClipImgButton(props) {
    const handleClick = () => {
        props.tracker.getClipImg();
    };
    return <Button id="downClipImgBtn" variant="secondary" onClick={handleClick}>下载选中数据</Button>;
}


export {DrawButton, ClearButton, DownloadButton, DownClipImgButton}