import React, { useState, useEffect, useRef } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';
import { Dropdown, Form, Button } from 'react-bootstrap';
import { cloneDeep } from 'lodash';

import './Column.scss';
import { mapOrder } from 'utils/sorts';
import Card from 'components/Card/Card';
import ConfirmModal from 'components/Common/ConfirmModal';
import { MODAL_ACTION_CONFIRM } from 'utils/constants';
import { selectAllInlineText } from 'utils/contentEditable';

const Column = (props) => {
    const { column, onCardDrop, onUpdateColumn } = props;
    const cards = mapOrder(column.cards, column.cardOrder, 'id');

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const toggleShowConfirmModal = () => setShowConfirmModal(!showConfirmModal);

    const [columnTitle, setColumnTitle] = useState('');
    const handleColumnTitleChange = (e) => {
        setColumnTitle(e.target.value);
    };

    const [openNewCardForm, setOpenNewCardForm] = useState(false);
    const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm);

    const [newCardTitle, setNewCardTitle] = useState('');
    const onChangeContentCardArea = (e) => setNewCardTitle(e.target.value);

    const refInput = useRef(column.title);
    const refArea = useRef();

    useEffect(() => {
        setColumnTitle(column.title);
    }, [column.title]);

    useEffect(() => {
        if (refArea && refArea.current) {
            refArea.current.focus();
            refArea.current.setSelectionRange(
                refArea.current.value.length,
                refArea.current.value.length
            );
        }
    }, [openNewCardForm]);

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

    const addNewCard = () => {
        if (!newCardTitle || !newCardTitle.trim()) {
            refArea.current.focus();
            return;
        }

        const newCardToAdd = {
            id: Math.random().toString(36).substring(2, 5), // 5 random characters, will remove when we implement code api
            boardId: column.boardId,
            columnId: column.id,
            title: newCardTitle.trim(),
            cover: null
        };

        let newColumn = cloneDeep(column);
        newColumn.cards.push(newCardToAdd);
        newColumn.cardOrder.push(newCardToAdd.id);

        onUpdateColumn(newColumn);
        setNewCardTitle('');
        refArea.current.focus();
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
                            <Dropdown.Item onClick={toggleOpenNewCardForm}>
                                Add card...
                            </Dropdown.Item>
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

                {openNewCardForm && (
                    <div className="add-new-card-area">
                        <Form.Control
                            as="textarea"
                            rows="3"
                            className="textarea-enter-new-card"
                            placeholder="Enter a title for this card..."
                            // autoFocus
                            ref={refArea}
                            value={newCardTitle}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setOpenNewCardForm(false);
                                }

                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addNewCard();
                                }
                            }}
                            onChange={onChangeContentCardArea}

                            // autoFocus
                            // ref={refInput}
                            // value={newColumnTitle}
                            // onKeyDown={(e) => e.key === 'Enter' && addNewColumn()}
                            // onChange={onNewColumnTitleChange}
                        />
                    </div>
                )}
            </div>

            <footer>
                {openNewCardForm && (
                    <div className="add-new-card-actions">
                        <Button variant="success" size="sm" onClick={addNewCard}>
                            Add card
                        </Button>
                        <span className="cancel-icon" onClick={toggleOpenNewCardForm}>
                            <i className="fa fa-times icon" />
                        </span>
                    </div>
                )}
                {!openNewCardForm && (
                    <div className="footer-actions" onClick={toggleOpenNewCardForm}>
                        <i className="fa fa-plus icon" /> Add another card
                    </div>
                )}
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
