import React from 'react';
import Cesium from "cesium";
import {DrawButton, ClearButton} from "./Buttons";


class Viewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            viewer: null
        }
    }

    componentDidMount() {
        let viewer = new Cesium.Viewer('cesiumContainer', {
            animation: false,
            creditsDisplay: false,
            timeline: false,
            fullscreenButton: false,
            sceneModePicker: false,
            navigationHelpButton: false,
            creditContainer: null
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
        this.setState({viewer: viewer});
    }

    render() {

        return <div id="btnGroup">
            <DrawButton viewer={this.state.viewer}/>
            <ClearButton viewer={this.state.viewer}/>
        </div>;
    }
}

const CMap = () => (
    <Viewer>

    </Viewer>
);

export default CMap;
