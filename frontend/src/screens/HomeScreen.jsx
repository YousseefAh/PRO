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

const HomeScreen = () => {
    const { pageNumber, keyword } = useParams();

    const { data, isLoading, error } = useGetProductsQuery({
        keyword,
        pageNumber,
    });

    return (
        <>
            <Meta title="ProShop | Home" description="Latest products at the best prices" />

            {!keyword ? (
                <ProductCarousel />
            ) : (
                <Link to='/' className='btn btn-light mb-4'>
                    Go Back
                </Link>
            )}

            {isLoading ? (
                <Loader />
            ) : error ? (
                <Message variant='danger'>
                    {error?.data?.message || error.error}
                </Message>
            ) : (
                <div id="products-section" className="container py-5">
                    <div className="section-header text-center mb-5">
                        <h2 className="fw-bold">Latest Products</h2>
                        <div className="divider mx-auto my-3" style={{ width: '80px', height: '3px', backgroundColor: '#593196' }}></div>
                        <p className="text-muted">Explore our newest arrivals</p>
                    </div>

                    <Row className="g-4">
                        {data.products.map((product) => (
                            <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                                <Product product={product} />
                            </Col>
                        ))}
                    </Row>
                    <div className="mt-5 d-flex justify-content-center">
                        <Paginate
                            pages={data.pages}
                            page={data.page}
                            keyword={keyword ? keyword : ''}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default HomeScreen;
