import React, { useState, useEffect } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Row, Col, Form, Modal, Badge, Tabs, Tab } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash, FaEye, FaChevronRight, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import {
    useGetCollectionsQuery,
    useCreateCollectionMutation,
    useDeleteCollectionMutation,
    useGetSubCollectionsQuery
} from '../../slices/collectionsApiSlice';

const CollectionListScreen = () => {
    const { data: rootCollections, isLoading, error, refetch } = useGetCollectionsQuery();

    const [createCollection, { isLoading: isCreating }] = useCreateCollectionMutation();
    const [deleteCollection, { isLoading: isDeleting }] = useDeleteCollectionMutation();

    // For create collection modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [parentCollectionId, setParentCollectionId] = useState('');
    const [collectionName, setCollectionName] = useState('');
    const [collectionDescription, setCollectionDescription] = useState('');
    const [collectionImage, setCollectionImage] = useState('/images/sample.jpg');
    const [collectionIsActive, setCollectionIsActive] = useState(true);
    const [requiresCode, setRequiresCode] = useState(false);
    const [accessCode, setAccessCode] = useState('');

    // For viewing collections
    const [selectedRootCollection, setSelectedRootCollection] = useState(null);
    const [activeTab, setActiveTab] = useState('root');

    // Fetch subcollections if a root collection is selected
    const {
        data: subCollections,
        isLoading: isLoadingSubCollections
    } = useGetSubCollectionsQuery(selectedRootCollection, {
        skip: !selectedRootCollection
    });

    // Reset selected collection when tab changes
    useEffect(() => {
        if (activeTab === 'root') {
            setSelectedRootCollection(null);
        }
    }, [activeTab]);

    // Reset form fields when modal is closed
    useEffect(() => {
        if (!showCreateModal) {
            resetFormFields();
        }
    }, [showCreateModal]);

    const resetFormFields = () => {
        setCollectionName('');
        setCollectionDescription('');
        setCollectionImage('/images/sample.jpg');
        setCollectionIsActive(true);
        setRequiresCode(false);
        setAccessCode('');
    };

    const createCollectionHandler = async () => {
        try {
            await createCollection({
                parentCollectionId: parentCollectionId || null,
                name: collectionName,
                description: collectionDescription,
                image: collectionImage,
                isActive: collectionIsActive,
                requiresCode,
                accessCode: requiresCode ? accessCode : ''
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
                // If deleted collection was the selected one, reset selection
                if (id === selectedRootCollection) {
                    setSelectedRootCollection(null);
                }
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    const selectRootCollection = (id) => {
        setSelectedRootCollection(id);
        setActiveTab('sub');
    };

    return (
        <>
            <Row className='align-items-center'>
                <Col>
                    <h1>Collection Management</h1>
                </Col>
                <Col className='text-end'>
                    <Button className='my-3' onClick={() => setShowCreateModal(true)}>
                        <FaPlus /> Create Collection
                    </Button>
                </Col>
            </Row>

            {isCreating && <Loader />}
            {isDeleting && <Loader />}

            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
            >
                <Tab eventKey="root" title="Root Collections">
                    {isLoading ? (
                        <Loader />
                    ) : error ? (
                        <Message variant='danger'>{error}</Message>
                    ) : (
                        <Table striped bordered hover responsive className='table-sm'>
                            <thead>
                                <tr>
                                    <th>NAME</th>
                                    <th>DESCRIPTION</th>
                                    <th>SUB-COLLECTIONS</th>
                                    <th>PRODUCTS</th>
                                    <th>ACCESS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rootCollections.map((collection) => (
                                    <tr key={collection._id}>
                                        <td>
                                            <strong>{collection.name}</strong>
                                        </td>
                                        <td>
                                            {collection.description.length > 50
                                                ? `${collection.description.substring(0, 50)}...`
                                                : collection.description}
                                        </td>
                                        <td>
                                            {collection.subCollections ? (
                                                <Badge bg="primary" pill>
                                                    {collection.subCollections.length}
                                                </Badge>
                                            ) : (
                                                <Badge bg="secondary" pill>0</Badge>
                                            )}
                                        </td>
                                        <td>
                                            <Badge bg={collection.products.length > 0 ? "success" : "secondary"} pill>
                                                {collection.products.length}
                                            </Badge>
                                        </td>
                                        <td>
                                            {collection.requiresCode ? (
                                                <span className="text-danger">
                                                    <FaLock className="me-1" />
                                                    Private
                                                </span>
                                            ) : (
                                                <span className="text-success">Public</span>
                                            )}
                                        </td>
                                        <td>
                                            <Button
                                                variant='info'
                                                className='btn-sm me-2'
                                                onClick={() => selectRootCollection(collection._id)}
                                            >
                                                <FaEye /> View Subcollections
                                            </Button>
                                            <LinkContainer to={`/admin/collection/${collection._id}/edit`}>
                                                <Button variant='primary' className='btn-sm me-2'>
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
                    )}
                </Tab>

                <Tab eventKey="sub" title="Sub-Collections" disabled={!selectedRootCollection}>
                    {selectedRootCollection ? (
                        <>
                            <div className="mb-3">
                                <h3>
                                    {rootCollections && rootCollections.find(c => c._id === selectedRootCollection)?.name}
                                    <span className="text-muted"> - Sub-Collections</span>
                                </h3>
                            </div>

                            {isLoadingSubCollections ? (
                                <Loader />
                            ) : (
                                <>
                                    {subCollections && subCollections.length === 0 ? (
                                        <Message>No subcollections found for this collection</Message>
                                    ) : (
                                        <Table striped bordered hover responsive className='table-sm'>
                                            <thead>
                                                <tr>
                                                    <th>NAME</th>
                                                    <th>DESCRIPTION</th>
                                                    <th>PRODUCTS</th>
                                                    <th>ACCESS</th>
                                                    <th>ACTIONS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {subCollections && subCollections.map((collection) => (
                                                    <tr key={collection._id}>
                                                        <td>
                                                            <FaChevronRight className="me-2" />
                                                            {collection.name}
                                                        </td>
                                                        <td>
                                                            {collection.description.length > 50
                                                                ? `${collection.description.substring(0, 50)}...`
                                                                : collection.description}
                                                        </td>
                                                        <td>
                                                            <Badge bg={collection.products.length > 0 ? "success" : "secondary"} pill>
                                                                {collection.products.length}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            {collection.requiresCode ? (
                                                                <span className="text-danger">
                                                                    <FaLock className="me-1" />
                                                                    Private
                                                                </span>
                                                            ) : (
                                                                <span className="text-success">Public</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <LinkContainer to={`/admin/collection/${collection._id}/edit`}>
                                                                <Button variant='primary' className='btn-sm me-2'>
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
                                    )}

                                    <Button variant="primary" className="mt-3" onClick={() => {
                                        setParentCollectionId(selectedRootCollection);
                                        setShowCreateModal(true);
                                    }}>
                                        <FaPlus /> Add Sub-Collection
                                    </Button>
                                </>
                            )}
                        </>
                    ) : (
                        <Message>Please select a root collection first</Message>
                    )}
                </Tab>
            </Tabs>

            {/* Create Collection Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {parentCollectionId ? 'Create Sub-Collection' : 'Create Root Collection'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId='parentCollection' className="mb-3">
                            <Form.Label>Parent Collection</Form.Label>
                            <Form.Control
                                as='select'
                                value={parentCollectionId}
                                onChange={(e) => setParentCollectionId(e.target.value)}
                            >
                                <option value=''>None (Root Collection)</option>
                                {rootCollections && rootCollections.map((collection) => (
                                    <option key={collection._id} value={collection._id}>
                                        {collection.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId='name' className="mb-3">
                            <Form.Label>Collection Name</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='Enter collection name'
                                value={collectionName}
                                onChange={(e) => setCollectionName(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId='description' className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as='textarea'
                                rows={3}
                                placeholder='Enter collection description'
                                value={collectionDescription}
                                onChange={(e) => setCollectionDescription(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId='image' className="mb-3">
                            <Form.Label>Image URL</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='Enter image URL (e.g. /images/sample.jpg)'
                                value={collectionImage}
                                onChange={(e) => setCollectionImage(e.target.value)}
                                required
                            />
                            <Form.Text className="text-muted">
                                You can modify the image after creation
                            </Form.Text>
                        </Form.Group>

                        <Form.Group controlId='isActive' className="mb-3">
                            <Form.Check
                                type='checkbox'
                                label='Active (visible to users)'
                                checked={collectionIsActive}
                                onChange={(e) => setCollectionIsActive(e.target.checked)}
                            />
                        </Form.Group>

                        <hr className="my-3" />
                        <h5>Access Protection</h5>
                        <Form.Group controlId='requiresCode' className="mb-3">
                            <Form.Check
                                type='checkbox'
                                label='Require access code'
                                checked={requiresCode}
                                onChange={(e) => setRequiresCode(e.target.checked)}
                            />
                            <Form.Text className="text-muted">
                                If enabled, users will need to enter a code to view this collection
                            </Form.Text>
                        </Form.Group>

                        {requiresCode && (
                            <Form.Group controlId='accessCode' className="mb-3">
                                <Form.Label>Access Code</Form.Label>
                                <Form.Control
                                    type='text'
                                    placeholder='Enter access code'
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                    required={requiresCode}
                                />
                                <Form.Text className="text-muted">
                                    Share this code with users who should have access
                                </Form.Text>
                            </Form.Group>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={() => setShowCreateModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant='primary'
                        onClick={createCollectionHandler}
                        disabled={isCreating || !collectionName || !collectionDescription || !collectionImage || (requiresCode && !accessCode)}
                    >
                        {isCreating ? 'Creating...' : 'Create Collection'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CollectionListScreen;
