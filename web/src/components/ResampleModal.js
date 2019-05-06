import React, {useState} from "react";
import {Button, Form, Modal, Alert} from "react-bootstrap";
import axios from 'axios';

function ResampleModal(props) {
    const {...rest} = props;
    const RESOLUTION = 0.0002778;
    const [resolution, setResolution] = useState({x: 0.0002778, y: 0.0002778});
    const [sampleMethod, setSampleMethod] = useState('none');
    const handleMethodSelectChange = (event) => {
        setSampleMethod(event.target.value);
    };
    const handleRatioSelectChange = (event) => {
        setResolution(
            {
                x: (RESOLUTION + RESOLUTION * event.target.value).toFixed(7),
                y: (RESOLUTION + RESOLUTION * event.target.value).toFixed(7)
            }
        );
    };
    const handleCancel = () => {

        rest.onHide();
    };
    const handleDownloadClick = () => {
        axios.get('/downloadResampleImg', {
            params: {method: sampleMethod, resolution: resolution.x}
        }).then(({data}) => {
            if (data === "error") {
                window.alert("文件下载出错，请检查服务器端");
            }
        });
    };
    return (
        <Modal
            {...rest}
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    重采样方式选择
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="resampleSelect">
                    <Form.Label>
                        <Alert key={1} variant="primary" show={true}>
                            当前选项下输出的影像分辨率为（{resolution.x}，{resolution.y}）
                        </Alert>
                    </Form.Label>
                    <Form.Control as="select" onChange={handleMethodSelectChange}>
                        <option value='none'>选择重采样方法(默认不重采样)</option>
                        <option value='near'>最邻近值</option>
                        <option value='bilinear'>双线性内插</option>
                        <option value='cubic'>三次卷积</option>
                        <option value='cubicspline'>三次样条插值</option>
                        <option value='lanczos'>Lanczos插值</option>
                    </Form.Control>
                    <Form.Control as="select" onChange={handleRatioSelectChange}>
                        <option value={0}>选择分辨率比率(默认不改变分辨率)</option>
                        <option value={0.5}>+50%</option>
                        <option value={0.3}>+30%</option>
                        <option value={0.2}>+20%</option>
                        <option value={0.1}>+10%</option>
                        <option value={-0.1}>-10%</option>
                        <option value={-0.2}>-20%</option>
                    </Form.Control>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCancel}>
                    取消
                </Button>
                <Button variant="primary" onClick={handleDownloadClick}>
                    下载重采样影像
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ResampleModal;