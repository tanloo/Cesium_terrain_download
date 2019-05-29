import React, {useState} from 'react';
import {DrawBtn, ClearBtn, DownloadBtn, DownClipImgBtn, RedrawInsideRectBtn, ResampleBtn} from "./Buttons";
import {viewer, Tracker} from '../modules/cesiumOps';
import {ButtonGroup} from 'react-bootstrap';

function Viewer() {
    const [tracker] = useState(Tracker);
    return (
        <ButtonGroup id="btnGroup">
            <DrawBtn tracker={tracker}/>
            <RedrawInsideRectBtn viewer={viewer}/>
            <DownClipImgBtn tracker={tracker}/>
            <DownloadBtn tracker={tracker}/>
            <ResampleBtn/>
            <ClearBtn tracker={tracker}/>
        </ButtonGroup>
    );
}


export default Viewer;
