import React from "react";
import GlobeTracker from "./GlobeTracker";

class DrawButton extends React.Component{
    handleClick(){
        let tracker = new GlobeTracker(this.props.viewer);
        tracker.trackRectangle();
    }
    render() {
        return <button id="drawRectBtn" className="btn btn-info" onClick={this.handleClick.bind(this)}>DrawRect</button>
    }
}

class ClearButton extends React.Component {
    handleClick(){
        let tracker = new GlobeTracker(this.props.viewer);
        tracker.clear();
    }
    render() {
        return <button id="clearBtn" className="btn btn-danger" onClick={this.handleClick.bind(this) }>ClearAll</button>
    }
}

export {DrawButton,ClearButton}