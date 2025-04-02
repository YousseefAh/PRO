import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Row, Col, ListGroup, Card, Button, Breadcrumb, Modal, Form } from 'react-bootstrap';
import { useGetCollectionDetailsQuery } from '../slices/collectionsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Product from '../components/Product';
import CollectionCard from '../components/CollectionCard';
import Meta from '../components/Meta';

const CollectionScreen = () => {
    const { id: collectionId } = useParams();
    const navigate = useNavigate();

    const [showCodeModal, setShowCodeModal] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [accessGranted, setAccessGranted] = useState(false);
    const [codeError, setCodeError] = useState(false);

    const {
        data: collection,
        isLoading,
        error
    } = useGetCollectionDetailsQuery(collectionId);

    // Check if collection requires code access
    useEffect(() => {
        if (collection) {
            checkCollectionAccess(collection);
        }
    }, [collection, collectionId]);

    const checkCollectionAccess = (collection) => {
        if (collection.requiresCode) {
            const hasAccess = localStorage.getItem(`collection_access_${collectionId}`);
            if (hasAccess === 'granted') {
                setAccessGranted(true);
            } else {
                setShowCodeModal(true);
                setAccessGranted(false);
            }
        } else {
            setAccessGranted(true);
        }
    };

    const handleCodeSubmit = (e) => {
        e.preventDefault();

        if (collection && accessCode === collection.accessCode) {
            setAccessGranted(true);
            setShowCodeModal(false);
            setCodeError(false);
            // Store access for this session
            localStorage.setItem(`collection_access_${collectionId}`, 'granted');
        } else {
            setCodeError(true);
        }
    };

    // Custom wrapper for CollectionCard to ensure access codes are checked for subcollections
    const SecureCollectionCard = ({ collection: subCollection }) => {
        // Determine if this subcollection requires a code that hasn't been granted yet
        const needsAccessCode = subCollection.requiresCode &&
            !localStorage.getItem(`collection_access_${subCollection._id}`);

        const handleSubCollectionClick = (e) => {
            if (needsAccessCode) {
                e.preventDefault();
                // Save the intended destination, then navigate
                localStorage.setItem('intended_collection', subCollection._id);
                navigate(`/collections/${subCollection._id}`);
            }
        };

        return (
            <div onClick={handleSubCollectionClick} style={{ cursor: needsAccessCode ? 'pointer' : 'default' }}>
                <CollectionCard
                    collection={subCollection}
                    lockedAccess={needsAccessCode}
                />
            </div>
        );
    };

    return (
        <>
            <Link className="btn btn-light my-3" to="/home">
                Go Back
            </Link>

            {isLoading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">
                    {error?.data?.message || error.error}
                </Message>
            ) : collection.requiresCode && !accessGranted ? (
                <Modal show={showCodeModal} backdrop="static" keyboard={false}>
                    <Modal.Header>
                        <Modal.Title>{collection.name} - Access Required</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>This collection requires an access code to view its contents.</p>
                        <Form onSubmit={handleCodeSubmit}>
                            <Form.Group controlId="accessCode" className="mb-3">
                                <Form.Label>Enter Access Code</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter the access code"
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                    isInvalid={codeError}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Invalid access code
                                </Form.Control.Feedback>
                            </Form.Group>
                            <div className="d-flex justify-content-between">
                                <Button variant="secondary" onClick={() => navigate('/home')}>
                                    Go Back
                                </Button>
                                <Button variant="primary" type="submit">
                                    Submit
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            ) : (
                <>
                    <Meta title={collection.name} />

                    {/* Breadcrumb navigation */}
                    {collection.parentCollection && (
                        <Breadcrumb className="mb-3">
                            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/home" }}>Home</Breadcrumb.Item>
                            {collection.parentCollection && (
                                <Breadcrumb.Item
                                    linkAs={Link}
                                    linkProps={{ to: `/collections/${collection.parentCollection._id}` }}
                                >
                                    {collection.parentCollection.name}
                                </Breadcrumb.Item>
                            )}
                            <Breadcrumb.Item active>{collection.name}</Breadcrumb.Item>
                        </Breadcrumb>
                    )}

                    <Row className="mb-4">
                        <Col md={6}>
                            <Card>
                                <Card.Img
                                    src={collection.image}
                                    alt={collection.name}
                                    fluid
                                />
                            </Card>
                        </Col>
                        <Col md={6}>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <h3>{collection.name}</h3>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    Description: {collection.description}
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                    </Row>

                    {/* Sub-collections */}
                    {collection.subCollections && collection.subCollections.length > 0 && (
                        <>
                            <h2 className="mt-4">Browse Categories</h2>
                            <Row>
                                {collection.subCollections.map((subCollection) => (
                                    <Col key={subCollection._id} sm={12} md={6} lg={4} xl={3}>
                                        <SecureCollectionCard collection={subCollection} />
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}

                    {/* Products in this collection */}
                    <h2 className="mt-4">Products</h2>
                    {collection.products && collection.products.length === 0 ? (
                        <Message variant="info">
                            {collection.subCollections && collection.subCollections.length > 0 ?
                                "This collection doesn't have products directly. Please browse the categories above to see products." :
                                "No products in this collection"
                            }
                        </Message>
                    ) : (
                        <Row>
                            {collection.products && [...collection.products]
                                .sort((a, b) => a.displayOrder - b.displayOrder)
                                .map((item) => (
                                    <Col key={item.product._id} sm={12} md={6} lg={4} xl={3}>
                                        <Product product={item.product} />
                                    </Col>
                                ))
                            }
                        </Row>
                    )}
                </>
            )}
        </>
    );
};

export default CollectionScreen;
