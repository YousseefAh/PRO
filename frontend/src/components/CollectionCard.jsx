import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

const CollectionCard = ({ collection, lockedAccess }) => {
    return (
        <Card className="my-3 p-3 rounded">
            <Link to={`/collections/${collection._id}`}>
                <div style={{ position: 'relative' }}>
                    <Card.Img src={collection.image} variant="top" alt={collection.name} />
                    {(collection.requiresCode || lockedAccess) && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(0,0,0,0.6)',
                                padding: '5px 10px',
                                borderRadius: '4px'
                            }}
                        >
                            <FaLock color="white" />
                        </div>
                    )}
                </div>
            </Link>

            <Card.Body>
                <Link to={`/collections/${collection._id}`}>
                    <Card.Title as="div" className="product-title">
                        <strong>
                            {collection.name}
                            {(collection.requiresCode || lockedAccess) && (
                                <Badge bg="danger" className="ms-2" style={{ fontSize: '0.7em', verticalAlign: 'middle' }}>
                                    <FaLock size="0.8em" className="me-1" /> Protected
                                </Badge>
                            )}
                        </strong>
                    </Card.Title>
                </Link>

                <Card.Text as="div">
                    <div className="my-2">
                        {collection.description.length > 100
                            ? `${collection.description.substring(0, 100)}...`
                            : collection.description}
                    </div>
                </Card.Text>
            </Card.Body>
        </Card>
    );
};

export default CollectionCard;
