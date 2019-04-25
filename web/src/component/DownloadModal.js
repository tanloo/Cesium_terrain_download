import React from "react";
import {Table, Modal, Button} from "react-bootstrap";
import axios from "axios";


class DownloadModal extends React.Component {
    handleClick() {
        axios.get('/downloadSourceImg', {
            params: {fileName: this}
        }).then(({data}) => {
            if (data === "error") {
                window.alert("文件下载出错，请检查服务器端");
            }
        })
    }

    render() {
        if (this.props.fileinfo == null) {
            return <></>
        }
        return (
            <Modal {...this.props} size="lg" centered scrollable={true}>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        所选区域数据
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>编码</th>
                            <th>经度</th>
                            <th>纬度</th>
                            <th>文件名</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {

                            this.props.fileinfo.map(item => {
                                return (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.lon}</td>
                                        <td>{item.lat}</td>
                                        <td>{item.fileName}</td>
                                        <td><Button onClick={this.handleClick.bind(item.fileName)}>点击下载</Button></td>
                                    </tr>
                                )
                            })

                        }
                        </tbody>
                    </Table>
                </Modal.Body>

            </Modal>
        );
    }

}

export default DownloadModal;