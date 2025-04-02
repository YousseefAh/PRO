import { useParams, Link } from 'react-router-dom';
import { Row, Col, ListGroup, Card, Button } from 'react-bootstrap';
import { useGetCollectionDetailsQuery } from '../slices/collectionsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Product from '../components/Product';
import CollectionCard from '../components/CollectionCard';
import Meta from '../components/Meta';

const CollectionScreen = () => {
    const { id: collectionId } = useParams();

    const {
        data: collection,
        isLoading,
        error
    } = useGetCollectionDetailsQuery(collectionId);

    return (
        <>
            <Link className="btn btn-light my-3" to="/">
                Go Back
            </Link>

            {isLoading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">
                    {error?.data?.message || error.error}
                </Message>
            ) : (
                <>
                    <Meta title={collection.name} />
                    <Row>
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
                                        <CollectionCard collection={subCollection} />
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}

                    {/* Products in this collection */}
                    <h2 className="mt-4">Products</h2>
                    {collection.products && collection.products.length === 0 && (
                        <Message>No products in this collection</Message>
                    )}

                    <Row>
                        {collection.products && collection.products.map((item) => (
                            <Col key={item.product._id} sm={12} md={6} lg={4} xl={3}>
                                <Product product={item.product} />
                            </Col>
                        ))}
                    </Row>
                </>
            )}
        </>
    );
};

export default CollectionScreen;
