import React, {useState} from 'react';
import {DrawButton, ClearButton, DownloadButton, DownClipImgButton} from "./component/Buttons";
import Tracker from './modules/cesiumOps';

function Viewer() {
    const [tracker] = useState(Tracker);
    return (
        <div id="btnGroup">
            <DrawButton tracker={tracker}/>
            <DownClipImgButton tracker={tracker}/>
            <DownloadButton tracker={tracker}/>
            <ClearButton tracker={tracker}/>
        </div>
    );
}


export default Viewer;
