import React, {useState} from 'react';
import {DrawBtn, ClearBtn, DownloadBtn, DownClipImgBtn} from "./components/Buttons";
import Tracker from './modules/cesiumOps';
import {ButtonGroup} from 'react-bootstrap';

function Viewer() {
    const [tracker] = useState(Tracker);
    return (
        <ButtonGroup id="btnGroup"  size="lg">
            <DrawBtn tracker={tracker}/>
            <DownClipImgBtn tracker={tracker}/>
            <DownloadBtn tracker={tracker}/>
            <ClearBtn tracker={tracker}/>
        </ButtonGroup>
    );
}


export default Viewer;
