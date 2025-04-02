import React, { useState } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Row, Col, Form, Modal } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import {
    useGetCollectionsQuery,
    useCreateCollectionMutation,
    useDeleteCollectionMutation
} from '../../slices/collectionsApiSlice';

const CollectionListScreen = () => {
    const { data: collections, isLoading, error, refetch } = useGetCollectionsQuery();

    const [createCollection, { isLoading: isCreating }] = useCreateCollectionMutation();
    const [deleteCollection, { isLoading: isDeleting }] = useDeleteCollectionMutation();

    // For create collection modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [parentCollectionId, setParentCollectionId] = useState('');

    const createCollectionHandler = async () => {
        try {
            await createCollection({
                parentCollectionId: parentCollectionId || null
            }).unwrap();
            refetch();
            toast.success('Collection created');
            setShowCreateModal(false);
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const deleteCollectionHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this collection?')) {
            try {
                await deleteCollection(id).unwrap();
                refetch();
                toast.success('Collection deleted');
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    return (
        <>
            <Row className='align-items-center'>
                <Col>
                    <h1>Collections</h1>
                </Col>
                <Col className='text-end'>
                    <Button className='my-3' onClick={() => setShowCreateModal(true)}>
                        <FaPlus /> Create Collection
                    </Button>
                </Col>
            </Row>

            {isCreating && <Loader />}
            {isDeleting && <Loader />}
            {isLoading ? (
                <Loader />
            ) : error ? (
                <Message variant='danger'>{error}</Message>
            ) : (
                <>
                    <Table striped bordered hover responsive className='table-sm'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>NAME</th>
                                <th>DESCRIPTION</th>
                                <th>PARENT</th>
                                <th>ACTIVE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {collections.map((collection) => (
                                <tr key={collection._id}>
                                    <td>{collection._id}</td>
                                    <td>{collection.name}</td>
                                    <td>
                                        {collection.description.length > 50
                                            ? `${collection.description.substring(0, 50)}...`
                                            : collection.description}
                                    </td>
                                    <td>
                                        {collection.parentCollection ? collection.parentCollection : 'Root Collection'}
                                    </td>
                                    <td>{collection.isActive ? 'Yes' : 'No'}</td>
                                    <td>
                                        <LinkContainer to={`/admin/collection/${collection._id}/edit`}>
                                            <Button variant='light' className='btn-sm mx-2'>
                                                <FaEdit />
                                            </Button>
                                        </LinkContainer>
                                        <Button
                                            variant='danger'
                                            className='btn-sm'
                                            onClick={() => deleteCollectionHandler(collection._id)}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </>
            )}

            {/* Create Collection Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Collection</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId='parentCollection'>
                            <Form.Label>Parent Collection (optional)</Form.Label>
                            <Form.Control
                                as='select'
                                value={parentCollectionId}
                                onChange={(e) => setParentCollectionId(e.target.value)}
                            >
                                <option value=''>None (Root Collection)</option>
                                {collections && collections.map((collection) => (
                                    <option key={collection._id} value={collection._id}>
                                        {collection.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Form>
                    <p className="mt-3">
                        You can edit the collection details after creation.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={() => setShowCreateModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant='primary'
                        onClick={createCollectionHandler}
                        disabled={isCreating}
                    >
                        {isCreating ? 'Creating...' : 'Create Collection'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CollectionListScreen;
