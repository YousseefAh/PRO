import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, ListGroup, Row, Col, Table, InputGroup } from 'react-bootstrap';
import { FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import {
    useGetCollectionDetailsQuery,
    useUpdateCollectionMutation,
    useUploadCollectionImageMutation,
    useAddProductToCollectionMutation,
    useRemoveProductFromCollectionMutation,
    useUpdateProductsOrderMutation,
    useGetCollectionsQuery
} from '../../slices/collectionsApiSlice';
import { useGetProductsQuery } from '../../slices/productsApiSlice';

const CollectionEditScreen = () => {
    const { id: collectionId } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [parentCollection, setParentCollection] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [productOrders, setProductOrders] = useState([]);
    const [requiresCode, setRequiresCode] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data: collection,
        isLoading,
        refetch,
        error
    } = useGetCollectionDetailsQuery(collectionId);

    const { data: productsData } = useGetProductsQuery({});
    const { data: collections } = useGetCollectionsQuery();

    const [updateCollection, { isLoading: isUpdating }] = useUpdateCollectionMutation();
    const [uploadCollectionImage, { isLoading: isUploading }] = useUploadCollectionImageMutation();
    const [addProductToCollection] = useAddProductToCollectionMutation();
    const [removeProductFromCollection] = useRemoveProductFromCollectionMutation();
    const [updateProductsOrder] = useUpdateProductsOrderMutation();

    useEffect(() => {
        if (collection) {
            setName(collection.name);
            setDescription(collection.description);
            setImage(collection.image);
            setIsActive(collection.isActive);
            setParentCollection(collection.parentCollection || '');

            // Load access code settings
            setRequiresCode(collection.requiresCode || false);
            setAccessCode(collection.accessCode || '');

            // Set selected products
            if (collection.products) {
                setSelectedProducts(collection.products.map(item => item.product._id));
                setProductOrders(collection.products.map(item => ({
                    productId: item.product._id,
                    displayOrder: item.displayOrder,
                    name: item.product.name,
                    image: item.product.image,
                })));
            }
        }
    }, [collection]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await updateCollection({
                collectionId,
                name,
                description,
                image,
                isActive,
                parentCollection: parentCollection || null,
                requiresCode,
                accessCode: requiresCode ? accessCode : ''
            }).unwrap();
            toast.success('Collection updated');
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const uploadFileHandler = async (e) => {
        const formData = new FormData();
        formData.append('image', e.target.files[0]);
        try {
            const res = await uploadCollectionImage(formData).unwrap();
            toast.success('Image uploaded');
            setImage(res.image);
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const addProductHandler = async (productId) => {
        try {
            // Find the next display order (highest + 1)
            const nextOrder = productOrders.length > 0
                ? Math.max(...productOrders.map(p => p.displayOrder)) + 1
                : 0;

            await addProductToCollection({
                collectionId,
                productId,
                displayOrder: nextOrder
            }).unwrap();

            toast.success('Product added to collection');
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const removeProductHandler = async (productId) => {
        if (window.confirm('Are you sure you want to remove this product?')) {
            try {
                await removeProductFromCollection({ collectionId, productId }).unwrap();
                toast.success('Product removed from collection');
                refetch();
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    const moveProductHandler = async (productId, direction) => {
        try {
            // Find the current product and the one to swap with
            const currentIndex = productOrders.findIndex(p => p.productId === productId);
            const currentProduct = productOrders[currentIndex];

            // Calculate new index based on direction
            const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

            // Check if the move is valid
            if (newIndex < 0 || newIndex >= productOrders.length) {
                return; // Can't move beyond boundaries
            }

            const swapProduct = productOrders[newIndex];

            // Swap display orders
            const updatedOrders = [
                { productId: currentProduct.productId, displayOrder: swapProduct.displayOrder },
                { productId: swapProduct.productId, displayOrder: currentProduct.displayOrder }
            ];

            await updateProductsOrder({ collectionId, productOrders: updatedOrders }).unwrap();
            toast.success('Product order updated');
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    // Filter products based on search term
    const filteredProducts = productsData?.products
        ? productsData.products
            .filter(product => !selectedProducts.includes(product._id))
            .filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        : [];

    return (
        <>
            <Link to='/admin/collectionlist' className='btn btn-light my-3'>
                Go Back
            </Link>

            <Row>
                <Col md={5}>
                    <FormContainer>
                        <h1>Edit Collection</h1>
                        {isLoading ? (
                            <Loader />
                        ) : error ? (
                            <Message variant='danger'>{error.data.message}</Message>
                        ) : (
                            <Form onSubmit={submitHandler}>
                                <Form.Group controlId='name' className='my-2'>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type='text'
                                        placeholder='Enter name'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId='description' className='my-2'>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as='textarea'
                                        rows={3}
                                        placeholder='Enter description'
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId='parentCollection' className='my-2'>
                                    <Form.Label>Parent Collection</Form.Label>
                                    <Form.Control
                                        as='select'
                                        value={parentCollection}
                                        onChange={(e) => setParentCollection(e.target.value)}
                                    >
                                        <option value=''>None (Root Collection)</option>
                                        {collections && collections
                                            .filter(c => c._id !== collectionId) // Can't be its own parent
                                            .map((collection) => (
                                                <option key={collection._id} value={collection._id}>
                                                    {collection.name}
                                                </option>
                                            ))}
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group controlId='image' className='my-2'>
                                    <Form.Label>Image</Form.Label>
                                    <Form.Control
                                        type='text'
                                        placeholder='Enter image url'
                                        value={image}
                                        onChange={(e) => setImage(e.target.value)}
                                        required
                                    />
                                    <Form.Control
                                        type='file'
                                        label='Choose File'
                                        onChange={uploadFileHandler}
                                    />
                                    {isUploading && <Loader />}
                                </Form.Group>

                                <Form.Group controlId='isActive' className='my-2'>
                                    <Form.Check
                                        type='checkbox'
                                        label='Active'
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                    />
                                </Form.Group>

                                <hr className="my-3" />
                                <h4>Access Protection</h4>
                                <Form.Group controlId='requiresCode' className='my-2'>
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
                                    <Form.Group controlId='accessCode' className='my-2'>
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

                                <Button
                                    type='submit'
                                    variant='primary'
                                    className='my-3'
                                    disabled={isUpdating || (requiresCode && !accessCode)}
                                >
                                    Update Collection
                                </Button>
                                {isUpdating && <Loader />}
                            </Form>
                        )}
                    </FormContainer>
                </Col>

                <Col md={7}>
                    <h2>Products in Collection</h2>
                    {productOrders.length === 0 ? (
                        <Message>No products in this collection</Message>
                    ) : (
                        <Table striped bordered hover responsive className='table-sm'>
                            <thead>
                                <tr>
                                    <th>IMAGE</th>
                                    <th>NAME</th>
                                    <th>ORDER</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productOrders
                                    .sort((a, b) => a.displayOrder - b.displayOrder)
                                    .map((product, index) => (
                                        <tr key={product.productId}>
                                            <td>
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    style={{ width: '50px' }}
                                                />
                                            </td>
                                            <td>{product.name}</td>
                                            <td>{product.displayOrder}</td>
                                            <td>
                                                <Button
                                                    variant='light'
                                                    className='btn-sm'
                                                    onClick={() => moveProductHandler(product.productId, 'up')}
                                                    disabled={index === 0}
                                                >
                                                    <FaArrowUp />
                                                </Button>
                                                <Button
                                                    variant='light'
                                                    className='btn-sm'
                                                    onClick={() => moveProductHandler(product.productId, 'down')}
                                                    disabled={index === productOrders.length - 1}
                                                >
                                                    <FaArrowDown />
                                                </Button>
                                                <Button
                                                    variant='danger'
                                                    className='btn-sm'
                                                    onClick={() => removeProductHandler(product.productId)}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>
                    )}

                    <h2>Add Products to Collection</h2>
                    <Row className="mb-3">
                        <Col>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Search products by name or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </InputGroup>
                        </Col>
                    </Row>

                    {productsData?.products ? (
                        filteredProducts.length > 0 ? (
                            <ListGroup variant='flush'>
                                {filteredProducts.map((product) => (
                                    <ListGroup.Item key={product._id}>
                                        <Row className='align-items-center'>
                                            <Col xs={2}>
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    style={{ width: '50px' }}
                                                />
                                            </Col>
                                            <Col>
                                                <div>{product.name}</div>
                                                <small className="text-muted">{product.description.substring(0, 100)}...</small>
                                            </Col>
                                            <Col xs={3}>
                                                <Button
                                                    className='btn-sm'
                                                    onClick={() => addProductHandler(product._id)}
                                                >
                                                    Add to Collection
                                                </Button>
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        ) : searchTerm ? (
                            <Message>No products match your search</Message>
                        ) : (
                            <Message>No products available to add</Message>
                        )
                    ) : (
                        <Loader />
                    )}
                </Col>
            </Row>
        </>
    );
};

export default CollectionEditScreen;
