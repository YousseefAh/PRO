import { Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import { Link } from 'react-router-dom';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import Meta from '../components/Meta';
import { useGetCollectionsQuery } from '../slices/collectionsApiSlice';
import CollectionCard from '../components/CollectionCard';

const HomeScreen = () => {
    const { pageNumber, keyword } = useParams();

    const { data: collectionsData, isLoading: collectionsLoading, error: collectionsError } = useGetCollectionsQuery();
    const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({
        pageNumber,
        keyword
    });

    return (
        <>
            <Meta title="ProShop | Home" description="Explore our collections" />

            {/* {!keyword && <ProductCarousel />} */}

            {collectionsLoading ? (
                <Loader />
            ) : collectionsError ? (
                <Message variant='danger'>
                    {collectionsError?.data?.message || collectionsError.error}
                </Message>
            ) : collectionsData && collectionsData.length > 0 ? (
                <>
                    <div id="collections-section" className="container py-5">
                        <div className="section-header text-center mb-5">
                            <h2 className="fw-bold">Product Collections</h2>
                            <div className="divider mx-auto my-3" style={{ width: '80px', height: '3px', backgroundColor: '#593196' }}></div>
                            <p className="text-muted">Browse our curated collections</p>
                        </div>

                        <Row className="g-4">
                            {collectionsData.map((collection) => (
                                <Col key={collection._id} sm={12} md={6} lg={4} xl={3}>
                                    <CollectionCard collection={collection} />
                                </Col>
                            ))}
                        </Row>
                    </div>

                    {!keyword && productsData && !productsLoading && (
                        <div className="latest-products py-5">
                            <h2 className="text-center mb-4">Latest Products</h2>
                            <Row>
                                {productsData.products.slice(0, 4).map((product) => (
                                    <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                                        <Product product={product} />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}
                </>
            ) : (
                <Message>No collections found</Message>
            )}
        </>
    );
};

export default HomeScreen;
