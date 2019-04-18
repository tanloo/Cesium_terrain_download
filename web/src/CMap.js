import React from 'react';
import Cesium from "cesium";
import {DrawButton, ClearButton,DownloadButton} from "./component/Buttons";
import GlobeTracker from "./utils/GlobeTracker";


class Viewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tracker: null
        }
    }

    componentDidMount() {
        //默认选择ESRI影像底图
        let imageryProviders = new Cesium.createDefaultImageryProviderViewModels();
        let selectedImageryProviderIndex = 6;
        let viewer = new Cesium.Viewer('cesiumContainer', {
            animation: false,
            creditsDisplay: false,
            timeline: false,
            fullscreenButton: false,
            sceneModePicker: false,
            navigationHelpButton: false,
            creditContainer: null,
            imageryProviderViewModels: imageryProviders,
            selectedImageryProviderViewModel: imageryProviders[selectedImageryProviderIndex]
        });
        //赤道
        viewer.entities.add({
            polyline: {
                positions: Cesium.Cartesian3.fromDegreesArray([0, 0, 90, 0, 180, 0, -90, 0, 0, 0]),
                width: 2,
                material: Cesium.Color.GREEN,
            },
        });
        //子午线
        viewer.entities.add({
            polyline: {
                positions: Cesium.Cartesian3.fromDegreesArray([0, 0, 0, -90, -180, 45, 0, 0]),
                width: 2,
                material: Cesium.Color.GREEN,
            }
        });
        viewer._cesiumWidget._creditContainer.style.display = "none";
        this.setState({tracker: new GlobeTracker(viewer)});
    }

    render() {
        return <div id="btnGroup">
            <DrawButton  tracker={this.state.tracker}/>
            <DownloadButton tracker={this.state.tracker}/>
            <ClearButton  tracker={this.state.tracker}/>
        </div>;
    }
}

const CMap = () => (
    <Viewer>

    </Viewer>
);

export default CMap;
