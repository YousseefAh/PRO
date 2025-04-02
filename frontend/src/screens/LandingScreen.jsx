import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Row, Col } from 'react-bootstrap';
import Meta from '../components/Meta';
import { FaShoppingCart, FaArrowRight, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const LandingScreen = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Set loaded state after component mounts for animations
        setIsLoaded(true);

        // Check if we need to add animate.css
        if (!document.querySelector('link[href*="animate.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
            document.head.appendChild(link);
        }
    }, []);

    return (
        <>
            <Meta title="Welcome to ProShop" description="Latest tech products at the best prices" />

            {/* Authentication buttons in top-right corner */}
            <Container fluid className="position-absolute" style={{ top: '10px', zIndex: 10 }}>
                <Row className="justify-content-end pe-3">
                    <Col xs="auto">
                        <Link to="/login" className="btn btn-outline-light btn-sm me-2">
                            <FaSignInAlt className="me-1" /> Login
                        </Link>
                        <Link to="/register" className="btn btn-outline-light btn-sm">
                            <FaUserPlus className="me-1" /> Register
                        </Link>
                    </Col>
                </Row>
            </Container>

            <div className="hero-section py-5 d-flex flex-column justify-content-center align-items-center text-center"
                style={{
                    minHeight: '100vh',
                    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/images/screens.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: 'white',
                    position: 'relative'
                }}>
                <div className="container">
                    <div className={`${isLoaded ? 'animate__animated animate__fadeInDown' : ''}`}>
                        <h1 className="display-3 fw-bold mb-4">Welcome to ProShop</h1>
                        <p className={`lead mb-5 px-md-5 mx-md-5 ${isLoaded ? 'animate__animated animate__fadeIn animate__delay-1s' : ''}`}>
                            Discover the latest tech products at unbeatable prices. Quality electronics that fit your lifestyle.
                        </p>
                    </div>

                    <div className={`d-flex justify-content-center gap-3 flex-wrap ${isLoaded ? 'animate__animated animate__fadeInUp animate__delay-1s' : ''}`}>
                        <Button
                            as={Link}
                            to="/login"
                            className="btn btn-primary btn-lg px-5 py-3 shadow d-flex align-items-center justify-content-center"
                            style={{
                                borderRadius: '50px',
                                minWidth: '220px'
                            }}
                        >
                            <FaShoppingCart className="me-2" /> Start Shopping
                        </Button>
                    </div>

                    <div className={`position-absolute bottom-0 pb-4 w-100 text-center ${isLoaded ? 'animate__animated animate__fadeIn animate__delay-2s' : ''}`} style={{ left: 0 }}>
                        <p className="text-white mb-2">Please sign in to continue</p>
                        <Link to="/login" className="text-white text-decoration-none d-inline-flex align-items-center">
                            <span className="me-2">Login to browse products</span>
                            <FaArrowRight className="animate__animated animate__fadeInLeft animate__infinite" />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LandingScreen;
