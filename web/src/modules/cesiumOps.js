import Cesium from "cesium";
import GlobeTracker from "../utils/GlobeTracker";

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
//export const TrackerContext = React.createContext(new GlobeTracker(viewer));
export default new GlobeTracker(viewer);