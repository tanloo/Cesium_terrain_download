import React from "react";
import {Button, Form, Modal, Alert} from "react-bootstrap";

class TileLevelModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {alertShow: false, tileLevel: 0}
    }

    handleSelectChange(event) {
        if (event.target.value > 10) {
            this.setState({alertShow: true})
        } else {
            this.setState({alertShow: false})
        }
        this.setState({tileLevel: event.target.value})
    }

    handleSubmit(event) {
        if(this.state.tileLevel===0){
            window.alert("请选择切片等级！");
            return;
        }
        this.props.tracker.getTile(this.state.tileLevel);
        this.props.onHide();
        this.setState({alertShow: false})
    }

    render() {
        return (
            <Modal
                {...this.props}
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
                            <Alert key={1} variant="warning" show={this.state.alertShow}>
                                切片等级越大会花费更多的时间！
                            </Alert>
                        </Form.Label>
                        <Form.Control as="select" onChange={this.handleSelectChange.bind(this)}>
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
                    <Button variant="secondary" onClick={this.props.onHide}>
                        取消
                    </Button>
                    <Button variant="primary" onClick={this.handleSubmit.bind(this)}>
                        确认
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default TileLevelModal;