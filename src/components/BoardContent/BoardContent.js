import React, { useEffect, useState, useRef, useCallback } from 'react';
import { isEmpty } from 'lodash';
import { Container, Draggable } from 'react-smooth-dnd';
import { Container as BootstrapContainer, Row, Col, Form, Button } from 'react-bootstrap';

import './BoardContent.scss';
import Column from 'components/Column/Column';
import { initialData } from 'actions/initialData';
import { mapOrder } from 'utils/sorts';
import { applyDrag } from 'utils/dragDrop';

const BoardContent = () => {
    const [board, setBoard] = useState({});
    const [columns, setColumns] = useState([]);
    const [openNewColumnForm, setOpenNewColumnForm] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');

    const refInput = useRef();

    const onNewColumnTitleChange = useCallback((e) => setNewColumnTitle(e.target.value), []);

    useEffect(() => {
        const boardFromDB = initialData.boards.find((board) => board.id === 'board-1');
        if (boardFromDB) {
            setBoard(boardFromDB);

            // sort column
            setColumns(mapOrder(boardFromDB.columns, boardFromDB.columnOrder, 'id'));
        }
    }, []);

    useEffect(() => {
        if (refInput && refInput.current) {
            refInput.current.focus();
            refInput.current.select();
        }
    }, [openNewColumnForm]);

    if (isEmpty(board)) {
        return (
            <div className="not-found" style={{ padding: 10, color: 'white' }}>
                Board not found!
            </div>
        );
    }

    const onColumnDrop = (dropResult) => {
        let newColumns = [...columns];
        newColumns = applyDrag(newColumns, dropResult);

        let newBoard = { ...board };
        newBoard.columnOrder = newColumns.map((c) => c.id);
        newBoard.columns = newColumns;

        setColumns(newColumns);
        setBoard(newBoard);
    };

    const onCardDrop = (columnId, dropResult) => {
        if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
            let newColumns = [...columns];

            let currentColumn = newColumns.find((c) => c.id === columnId);
            currentColumn.cards = applyDrag(currentColumn.cards, dropResult);
            currentColumn.cardOrder = currentColumn.cards.map((i) => i.id);

            setColumns(newColumns);
        }
    };

    const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm);

    const addNewColumn = () => {
        const newColumnToAdd = {
            id: Math.random().toString(36).substring(2, 5), // 5 random characters, will remove when we implement code api
            boardId: board.id,
            title: newColumnTitle.trim(),
            cardOrder: [],
            cards: []
        };

        if (!newColumnTitle || !newColumnTitle.trim()) {
            refInput.current.focus();
            return;
        }

        let newColumns = [...columns];
        newColumns.push(newColumnToAdd);

        let newBoard = { ...board };
        newBoard.columnOrder = newColumns.map((c) => c.id);
        newBoard.columns = newColumns;

        setColumns(newColumns);
        setBoard(newBoard);
        setNewColumnTitle('');
        toggleOpenNewColumnForm();
    };

    return (
        <div className="board-content">
            <Container
                orientation="horizontal"
                onDrop={onColumnDrop}
                dragHandleSelector=".column-drag-handle"
                dropPlaceholder={{
                    animationDuration: 150,
                    showOnTop: true,
                    className: 'column-drop-preview'
                }}
                getChildPayload={(index) => columns[index]}
            >
                {columns.map((column, index) => (
                    <Draggable key={index}>
                        <Column column={column} onCardDrop={onCardDrop} />
                    </Draggable>
                ))}
            </Container>

            <BootstrapContainer className="trello-column-container">
                {!openNewColumnForm ? (
                    <Row>
                        <Col className="add-new-column" onClick={toggleOpenNewColumnForm}>
                            <i className="fa fa-plus icon" /> Add another column
                        </Col>
                    </Row>
                ) : (
                    <Row>
                        <Col
                            className="enter-new-column"
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setOpenNewColumnForm(false);
                                }
                            }}
                        >
                            <Form.Control
                                type="text"
                                className="input-enter-new-column"
                                placeholder="Enter column title..."
                                // autoFocus
                                ref={refInput}
                                value={newColumnTitle}
                                onKeyDown={(e) => e.key === 'Enter' && addNewColumn()}
                                onChange={onNewColumnTitleChange}
                            />

                            <Button variant="success" size="sm" onClick={addNewColumn}>
                                Add column
                            </Button>

                            <span className="cancel-new-column" onClick={toggleOpenNewColumnForm}>
                                <i className="fa fa-times icon" />
                            </span>
                        </Col>
                    </Row>
                )}
            </BootstrapContainer>
        </div>
    );
};

export default BoardContent;
