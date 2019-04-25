import React from "react";
import {Button} from 'react-bootstrap';
import TileLevelModal from "./TileLevelModal";
import DownloadModal from "./DownloadModal";


class DrawButton extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = {modalShow: false};
    }

    async handleClick() {
        if (await this.props.tracker.trackRectangle()) {
            this.setState({modalShow: true});
        }
    }

    render() {
        let modalClose = () => this.setState({modalShow: false});
        return (
            <>
                <Button id="drawRectBtn" variant="info" onClick={this.handleClick.bind(this)}>DrawRect</Button>
                <TileLevelModal show={this.state.modalShow} onHide={modalClose} tracker={this.props.tracker}/>
            </>
        )
    }
}

class ClearButton extends React.Component {

    handleClick() {
        this.props.tracker.clear();
    }

    render() {
        return <Button id="clearBtn" variant="danger" onClick={this.handleClick.bind(this)}>ClearAll</Button>
    }
}

class DownloadButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {modalShow: false, fileInfo: null};
    }

    handleClick() {
        let data = this.props.tracker.getImgInfo();

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
        this.setState({modalShow: true, fileInfo: arr});
    }

    render() {
        let modalClose = () => this.setState({modalShow: false});
        return (
            <>
                <Button id="downloadBtn" variant="light" onClick={this.handleClick.bind(this)}>下载原始数据</Button>
                <DownloadModal show={this.state.modalShow} onHide={modalClose} fileinfo={this.state.fileInfo}
                               />
            </>
        )
    }
}

class DownClipImgButton extends React.Component {

    handleClick() {
        this.props.tracker.getClipImg();
    }
    render() {
        return <Button id="downClipImgBtn" variant="secondary" onClick={this.handleClick.bind(this)}>下载选中数据</Button>
    }
}

export {DrawButton, ClearButton, DownloadButton,DownClipImgButton}