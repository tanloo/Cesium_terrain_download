import Cesium from "cesium";
import GlobeTracker from "../utils/GlobeTracker";

Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMDgxODdlMy04YjA1LTQxZDYtYjgwYi0wNGE4NjNiZWExMDkiLCJpZCI6NzExMywic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0ODMwMTI4MX0.EiI79H37qhbkV9mkW0mcZpmJSUr9K_jNqglNGAUiCCY';
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
/*viewer.entities.add({
    polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([0, 0, 90, 0, 180, 0, -90, 0, 0, 0]),
        width: 2,
        material: Cesium.Color.GREEN,
    },
});
//纬域
viewer.entities.add({
    polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([0, 45, 90, 45, 180, 45, -90, 45, 0, 45]),
        width: 2,
        material: Cesium.Color.RED,
        arcType: Cesium.ArcType.RHUMB
    },

});
viewer.entities.add({
    polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([0, 67.5, 90, 67.5, 180, 67.5, -90, 67.5, 0, 67.5]),
        width: 2,
        material: Cesium.Color.RED,
        arcType: Cesium.ArcType.RHUMB
    },

});
viewer.entities.add({
    polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([0, 78.75, 90, 78.75, 180, 78.75, -90, 78.75, 0, 78.75]),
        width: 2,
        material: Cesium.Color.RED,
        arcType: Cesium.ArcType.RHUMB
    },

});
viewer.entities.add({
    polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([0, 84.375, 90, 84.375, 180, 84.375, -90, 84.375, 0, 84.375]),
        width: 2,
        material: Cesium.Color.RED,
        arcType: Cesium.ArcType.RHUMB
    },

});
viewer.entities.add({
    polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([0, -45, 90, -45, 180, -45, -90, -45, 0, -45]),
        width: 2,
        material: Cesium.Color.RED,
        arcType: Cesium.ArcType.RHUMB
    },
});
viewer.entities.add({
    polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([0, -67.5, 90, -67.5, 180, -67.5, -90, -67.5, 0, -67.5]),
        width: 2,
        material: Cesium.Color.RED,
        arcType: Cesium.ArcType.RHUMB
    },

});
viewer.entities.add({
    polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([0, -78.75, 90, -78.75, 180, -78.75, -90, -78.75, 0, -78.75]),
        width: 2,
        material: Cesium.Color.RED,
        arcType: Cesium.ArcType.RHUMB
    },

});
viewer.entities.add({
    polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([0, -84.375, 90, -84.375, 180, -84.375, -90, -84.375, 0, -84.375]),
        width: 2,
        material: Cesium.Color.RED,
        arcType: Cesium.ArcType.RHUMB
    },

});
//子午线
viewer.entities.add({
    polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([0, 0, 0, -90, -180, 45, 0, 0]),
        width: 2,
        material: Cesium.Color.GREEN,
    }
});*/
viewer._cesiumWidget._creditContainer.style.display = "none";
//export const TrackerContext = React.createContext(new GlobeTracker(viewer));
const Tracker = new GlobeTracker(viewer);
export {viewer, Tracker};