import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';
import { Dropdown, Form } from 'react-bootstrap';
import { FaEllipsisH } from 'react-icons/fa';

import './Column.scss';
import { mapOrder } from 'utils/sorts';
import Card from 'components/Card/Card';
import ConfirmModal from 'components/Common/ConfirmModal';
import { MODAL_ACTION_CLOSE, MODAL_ACTION_CONFIRM } from 'utils/constants';
import { selectAllInlineText } from 'utils/contentEditable';

const Column = (props) => {
    const { column, onCardDrop, onUpdateColumn } = props;
    const cards = mapOrder(column.cards, column.cardOrder, 'id');

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const toggleShowConfirmModal = () => setShowConfirmModal(!showConfirmModal);

    const [columnTitle, setColumnTitle] = useState('');
    const handleColumnTitleChange = useCallback((e) => {
        setColumnTitle(e.target.value);
    }, []);

    const refInput = useRef(column.title);

    useEffect(() => {
        setColumnTitle(column.title);
    }, [column.title]);

    const onConfirmModalAction = (type) => {
        if (type === MODAL_ACTION_CONFIRM) {
            // remove column
            const newColumn = {
                ...column,
                _destroy: true
            };

            onUpdateColumn(newColumn);
        }

        toggleShowConfirmModal();
    };

    const handleColumnTitleBlur = (e) => {
        const newColumn = {
            ...column,
            title: columnTitle
        };

        if (
            e.target.value.trim() == null ||
            e.target.value.trim() == undefined ||
            e.target.value.trim() == ''
        ) {
            setColumnTitle(refInput.current);
        } else {
            onUpdateColumn(newColumn);
        }
    };

    const handleContentAfterPressEnterOrEscape = (e) => {
        // (e.key === 'Enter' || e.key === 'Escape') && e.target.blur();

        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        }
        if (e.key === 'Escape') {
            setColumnTitle(refInput.current);
        }
    };

    return (
        <div className="column">
            <header className="column-drag-handle">
                <div className="column-title" style={{ flex: 1 }}>
                    {/* {column.title} */}
                    <Form.Control
                        type="text"
                        className="trello-content-editable"
                        value={columnTitle}
                        spellCheck={false}
                        onClick={selectAllInlineText}
                        onChange={handleColumnTitleChange}
                        onBlur={handleColumnTitleBlur}
                        onKeyDown={handleContentAfterPressEnterOrEscape}
                        onMouseDown={(e) => e.preventDefault()}
                    />
                </div>

                <div className="column-dropdown-actions">
                    <Dropdown>
                        <Dropdown.Toggle
                            variant="none"
                            id="dropdown-basic"
                            size="sm"
                            className="dropdown-btn"
                        >
                            {/* <FaEllipsisH className="icon-dropdown" /> */}
                        </Dropdown.Toggle>

                        <Dropdown.Menu style={{ margin: 0 }}>
                            <Dropdown.Item>Add card...</Dropdown.Item>
                            <Dropdown.Item onClick={toggleShowConfirmModal}>
                                Remove column...
                            </Dropdown.Item>
                            <Dropdown.Item>Move all cards in this column (beta)...</Dropdown.Item>
                            <Dropdown.Item>
                                Archive all cards in this column (beta)...
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </header>

            <div className="card-list">
                <Container
                    groupName="trello-columns"
                    orientation="vertical"
                    onDrop={(dropResult) => onCardDrop(column.id, dropResult)}
                    getChildPayload={(index) => cards[index]}
                    dragClass="card-ghost"
                    dropClass="card-ghost-drop"
                    dropPlaceholder={{
                        animationDuration: 150,
                        showOnTop: true,
                        className: 'card-drop-preview'
                    }}
                    dropPlaceholderAnimationDuration={200}
                >
                    {cards.map((card, index) => (
                        <Draggable key={index}>
                            <Card card={card} />
                        </Draggable>
                    ))}
                </Container>
            </div>

            <footer>
                <div className="footer-actions">
                    <i className="fa fa-plus icon" /> Add another card
                </div>
            </footer>

            <ConfirmModal
                // title={() => (
                //     <h5>
                //         Delete{' '}
                //         <span style={{ color: 'red', fontWeight: 'bold' }}>{column.title}</span> ?
                //     </h5>
                // )}
                // content={() => (
                //     <span>
                //         Are you sure you want to remove{' '}
                //         <span style={{ color: 'red', fontWeight: 'bold', fontSize: 16 }}>
                //             {column.title}
                //         </span>{' '}
                //         ? All related cards will also be removed
                //     </span>
                // )}

                title={`Delete <strong style="color:red;">${column.title}</strong> ?`}
                content={`Are you sure you want to remove <strong style="color:red;font-size:16px;">${column.title}</strong> ? <br/> All related cards will also be removed.`}
                show={showConfirmModal}
                onAction={onConfirmModalAction}
            />
        </div>
    );
};

export default Column;
