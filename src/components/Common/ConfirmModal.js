import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import HTMLReactParser from 'html-react-parser';
import { MODAL_ACTION_CLOSE, MODAL_ACTION_CONFIRM } from 'utils/constants';

function ConfirmModal(props) {
    const { title, content, show, onAction } = props;

    return (
        <>
            <Modal
                show={show}
                onHide={() => onAction(MODAL_ACTION_CLOSE)}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header>
                    {/* <Modal.Title>{title()}</Modal.Title> */}
                    <Modal.Title className="h5">{HTMLReactParser(title)}</Modal.Title>
                    <Button
                        variant="none"
                        type="button"
                        className="close close-btn"
                        // data-dismiss="modal"
                        aria-hidden="true"
                        onClick={() => onAction(MODAL_ACTION_CLOSE)}
                    >
                        ×
                    </Button>
                </Modal.Header>
                <Modal.Body>{HTMLReactParser(content)}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => onAction(MODAL_ACTION_CLOSE)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => onAction(MODAL_ACTION_CONFIRM)}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ConfirmModal;
