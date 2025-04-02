import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CollectionCard = ({ collection }) => {
    return (
        <Card className="my-3 p-3 rounded">
            <Link to={`/collections/${collection._id}`}>
                <Card.Img src={collection.image} variant="top" alt={collection.name} />
            </Link>

            <Card.Body>
                <Link to={`/collections/${collection._id}`}>
                    <Card.Title as="div" className="product-title">
                        <strong>{collection.name}</strong>
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
