import React, {useState} from "react";
import {Button, Form, Modal, Alert} from "react-bootstrap";
import {connect} from "react-redux";


function TileLevelModal(props) {
    const [alertShow, setAlertShow] = useState(false);
    const [tileLevel, setTileLevel] = useState(8);
    const {tracker, setCompleted, ...rest} = props;
    const handleSelectChange = (event) => {
        if (event.target.value > 10) {
            setAlertShow(true);
        } else {
            setAlertShow(false);
        }
        setTileLevel(event.target.value);
    };
    const handleSubmit = (event) => {
        if (tileLevel === 0) {
            window.alert("请选择切片等级！");
            return;
        }
        tracker.getTile(tileLevel);
        rest.onHide();
        setAlertShow(false);
        setCompleted();
    };
    const handleCancel = () => {
        tracker.clear();
        rest.onHide();
    };
    return (
        <Modal
            {...rest}
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    选择切片等级
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="tileLevelSelect">
                    <Form.Label>
                        <Alert key={1} variant="warning" show={alertShow}>
                            切片等级越大会花费更多的时间！
                        </Alert>
                    </Form.Label>
                    <Form.Control as="select" onChange={handleSelectChange}>
                        <option value={0}>选择切片等级</option>
                        <option value={8}>8</option>
                        <option value={9}>9</option>
                        <option value={10}>10</option>
                        <option value={11}>11</option>
                        <option value={12}>12</option>
                        <option value={13}>13</option>
                        <option value={14}>14</option>
                    </Form.Control>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCancel}>
                    取消
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    确认
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

const mapDispatchToModalProps = (dispatch) => ({
    setCompleted: () => {
        dispatch({
            type: 'draw'
        })
    }
});
export default connect(null, mapDispatchToModalProps)(TileLevelModal);