import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Row,
    Col,
    Image,
    ListGroup,
    Card,
    Button,
    Form,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
    useGetProductDetailsQuery,
    useCreateReviewMutation,
} from '../slices/productsApiSlice';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { addToCart } from '../slices/cartSlice';

const ProductScreen = () => {
    const { id: productId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const videoContainerRef = useRef(null);
    const youtubePlayerRef = useRef(null);

    const [qty, setQty] = useState(1);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [videoVisible, setVideoVisible] = useState(false);
    const [playerReady, setPlayerReady] = useState(false);

    const addToCartHandler = () => {
        dispatch(addToCart({ ...product, qty }));
        navigate('/cart');
    };

    const {
        data: product,
        isLoading,
        refetch,
        error,
    } = useGetProductDetailsQuery(productId);

    const { userInfo } = useSelector((state) => state.auth);

    const [createReview, { isLoading: loadingProductReview }] =
        useCreateReviewMutation();

    // Load YouTube API
    useEffect(() => {
        // Only load the API once
        if (window.YT) return;

        // Create YouTube API script
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";

        // Insert the script before the first script tag
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }, []);

    // Set up intersection observer to detect when video is in/out of viewport
    useEffect(() => {
        if (!videoContainerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                setVideoVisible(entry.isIntersecting);

                // If player is ready and video is playing but scrolled out of view, pause it
                if (!entry.isIntersecting && videoPlaying && youtubePlayerRef.current) {
                    youtubePlayerRef.current.pauseVideo();
                    // Keep videoPlaying state true so it doesn't show play button overlay
                } else if (entry.isIntersecting && videoPlaying && youtubePlayerRef.current) {
                    youtubePlayerRef.current.playVideo();
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.2, // 20% visibility is required to be considered "visible"
            }
        );

        observer.observe(videoContainerRef.current);

        return () => {
            if (videoContainerRef.current) {
                observer.unobserve(videoContainerRef.current);
            }
        };
    }, [videoContainerRef.current, videoPlaying, youtubePlayerRef.current]);

    // Function to initialize YouTube player with API
    const initializeYouTubePlayer = (videoId) => {
        if (!videoId || !window.YT || !window.YT.Player) return;

        youtubePlayerRef.current = new window.YT.Player(videoRef.current, {
            videoId: videoId,
            playerVars: {
                'playsinline': 1,
                'modestbranding': 1,
                'rel': 0,
                'showinfo': 0,
                'fs': 1, // Allow fullscreen
                'vq': 'small', // Low quality for data saving
                'iv_load_policy': 3, // Hide annotations
                'disablekb': 1, // Disable keyboard controls
            },
            events: {
                'onReady': (event) => {
                    setPlayerReady(true);
                },
                'onStateChange': (event) => {
                    // Playing = 1, Paused = 2, Ended = 0, etc.
                    setVideoPlaying(event.data === 1);
                }
            }
        });
    };

    // Function to play video when clicked
    const handleVideoClick = () => {
        if (!videoPlaying && youtubePlayerRef.current && playerReady) {
            youtubePlayerRef.current.playVideo();
            setVideoPlaying(true);
        }
    };

    // Extract YouTube video ID from a URL
    const extractVideoId = (url) => {
        if (!url) return null;

        let videoId = null;

        // Handle YouTube shorts
        if (url.includes('shorts/')) {
            videoId = url.split('shorts/')[1]?.split('?')[0];
        }
        // Handle regular YouTube URLs
        else if (url.includes('watch?v=')) {
            videoId = url.split('watch?v=')[1]?.split('&')[0];
        }
        // Handle youtu.be URLs
        else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        }
        // Handle embed URLs
        else if (url.includes('embed/')) {
            videoId = url.split('embed/')[1]?.split('?')[0];
        }

        return videoId || '-51nvIAx0mc'; // Default video ID if parsing fails
    };

    // Initialize YouTube player once product is loaded and YouTube API is ready
    useEffect(() => {
        if (product && window.YT && window.YT.Player) {
            const videoId = extractVideoId(product.youtubeVideo);
            if (videoId) {
                if (youtubePlayerRef.current) {
                    // If player exists, load new video
                    youtubePlayerRef.current.loadVideoById(videoId);
                    youtubePlayerRef.current.pauseVideo();
                } else {
                    // Initialize new player
                    initializeYouTubePlayer(videoId);
                }
            }
        }
    }, [product, window.YT]);

    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            await createReview({
                productId,
                rating,
                comment,
            }).unwrap();
            refetch();
            toast.success('Review created successfully');
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    return (
        <>
            <Link className='btn btn-light my-3' to='/'>
                Go Back
            </Link>
            {isLoading ? (
                <Loader />
            ) : error ? (
                <Message variant='danger'>
                    {error?.data?.message || error.error}
                </Message>
            ) : (
                <>
                    <Meta title={product.name} description={product.description} />
                    <Row>
                        <Col md={6}>
                            <Image src={product.image} alt={product.name} fluid />
                        </Col>
                        <Col md={3}>
                            <ListGroup variant='flush'>
                                <ListGroup.Item>
                                    <h3>{product.name}</h3>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Rating
                                        value={product.rating}
                                        text={`${product.numReviews} reviews`}
                                    />
                                </ListGroup.Item>
                                <ListGroup.Item>Price: ${product.price}</ListGroup.Item>
                                <ListGroup.Item>
                                    Description: {product.description}
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                        <Col md={3}>
                            <Card>
                                <ListGroup variant='flush'>
                                    <ListGroup.Item>
                                        <Row>
                                            <Col>Price:</Col>
                                            <Col>
                                                <strong>${product.price}</strong>
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <Row>
                                            <Col>Status:</Col>
                                            <Col>
                                                {product.countInStock > 0 ? 'In Stock' : 'Out Of Stock'}
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>

                                    {/* Qty Select */}
                                    {product.countInStock > 0 && (
                                        <ListGroup.Item>
                                            <Row>
                                                <Col>Qty</Col>
                                                <Col>
                                                    <Form.Control
                                                        as='select'
                                                        value={qty}
                                                        onChange={(e) => setQty(Number(e.target.value))}
                                                    >
                                                        {[...Array(product.countInStock).keys()].map(
                                                            (x) => (
                                                                <option key={x + 1} value={x + 1}>
                                                                    {x + 1}
                                                                </option>
                                                            )
                                                        )}
                                                    </Form.Control>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    )}

                                    <ListGroup.Item>
                                        <Button
                                            className='btn-block'
                                            type='button'
                                            disabled={product.countInStock === 0}
                                            onClick={addToCartHandler}
                                        >
                                            Add To Cart
                                        </Button>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>

                    {/* YouTube Video Section with Click-to-Play and Minimal UI */}
                    <Row className="my-4">
                        <Col md={12}>
                            <h2 className="mb-3">Product Video</h2>
                            <div
                                ref={videoContainerRef}
                                className="ratio ratio-16x9 position-relative"
                                style={{
                                    maxWidth: '800px',
                                    margin: '0 auto',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    backgroundColor: '#000',
                                    cursor: videoPlaying ? 'auto' : 'pointer',
                                }}
                                onClick={handleVideoClick}
                            >
                                {/* YouTube player container */}
                                <div id="youtube-player" ref={videoRef}></div>

                                {!videoPlaying && (
                                    <div
                                        className="position-absolute d-flex align-items-center justify-content-center"
                                        style={{
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            zIndex: 1,
                                        }}
                                    >
                                        <div
                                            className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                opacity: 0.8,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 0,
                                                    height: 0,
                                                    borderTop: '15px solid transparent',
                                                    borderBottom: '15px solid transparent',
                                                    borderLeft: '25px solid #333',
                                                    marginLeft: '8px',
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Optional text to inform users to click to play */}
                            {!videoPlaying && (
                                <p className="text-center mt-2 text-muted small">Click to play video</p>
                            )}
                        </Col>
                    </Row>

                    <Row className='review'>
                        <Col md={6}>
                            <h2>Reviews</h2>
                            {product.reviews.length === 0 && <Message>No Reviews</Message>}
                            <ListGroup variant='flush'>
                                {product.reviews.map((review) => (
                                    <ListGroup.Item key={review._id}>
                                        <strong>{review.name}</strong>
                                        <Rating value={review.rating} />
                                        <p>{review.createdAt.substring(0, 10)}</p>
                                        <p>{review.comment}</p>
                                    </ListGroup.Item>
                                ))}
                                <ListGroup.Item>
                                    <h2>Write a Customer Review</h2>

                                    {loadingProductReview && <Loader />}

                                    {userInfo ? (
                                        <Form onSubmit={submitHandler}>
                                            <Form.Group className='my-2' controlId='rating'>
                                                <Form.Label>Rating</Form.Label>
                                                <Form.Control
                                                    as='select'
                                                    required
                                                    value={rating}
                                                    onChange={(e) => setRating(e.target.value)}
                                                >
                                                    <option value=''>Select...</option>
                                                    <option value='1'>1 - Poor</option>
                                                    <option value='2'>2 - Fair</option>
                                                    <option value='3'>3 - Good</option>
                                                    <option value='4'>4 - Very Good</option>
                                                    <option value='5'>5 - Excellent</option>
                                                </Form.Control>
                                            </Form.Group>
                                            <Form.Group className='my-2' controlId='comment'>
                                                <Form.Label>Comment</Form.Label>
                                                <Form.Control
                                                    as='textarea'
                                                    row='3'
                                                    required
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                ></Form.Control>
                                            </Form.Group>
                                            <Button
                                                disabled={loadingProductReview}
                                                type='submit'
                                                variant='primary'
                                            >
                                                Submit
                                            </Button>
                                        </Form>
                                    ) : (
                                        <Message>
                                            Please <Link to='/login'>sign in</Link> to write a review
                                        </Message>
                                    )}
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                    </Row>
                </>
            )}
        </>
    );
};

export default ProductScreen;
