import React, { useEffect, useState } from 'react';
import { Table, Form, Button, Row, Col, Card } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';

import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { useProfileMutation } from '../slices/usersApiSlice';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { Link } from 'react-router-dom';

const ProfileScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [age, setAge] = useState('');
    const [fitnessGoal, setFitnessGoal] = useState('');
    const [injuries, setInjuries] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [whatsAppPhoneNumber, setWhatsAppPhoneNumber] = useState('');

    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);

    const { data: orders, isLoading, error } = useGetMyOrdersQuery();

    const [updateProfile, { isLoading: loadingUpdateProfile }] =
        useProfileMutation();

    useEffect(() => {
        if (userInfo) {
            setName(userInfo.name);
            setEmail(userInfo.email);
            // Set fitness profile data if available
            setAge(userInfo.age || '');
            setFitnessGoal(userInfo.fitnessGoal || '');
            setInjuries(userInfo.injuries || '');
            setAdditionalInfo(userInfo.additionalInfo || '');
            setWhatsAppPhoneNumber(userInfo.whatsAppPhoneNumber || '');
        }
    }, [userInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
        } else {
            try {
                const res = await updateProfile({
                    _id: userInfo._id,
                    name,
                    email,
                    password: password || undefined,
                    age: age ? Number(age) : null,
                    fitnessGoal,
                    injuries,
                    additionalInfo,
                    whatsAppPhoneNumber,
                }).unwrap();

                // Update Redux state with the new user info
                dispatch(setCredentials({ ...res }));

                // Force a refresh of the local state to match Redux state
                setName(res.name);
                setEmail(res.email);
                setAge(res.age || '');
                setFitnessGoal(res.fitnessGoal || '');
                setInjuries(res.injuries || '');
                setAdditionalInfo(res.additionalInfo || '');
                setWhatsAppPhoneNumber(res.whatsAppPhoneNumber || '');

                // Clear passwords
                setPassword('');
                setConfirmPassword('');

                toast.success('Profile updated successfully');
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    return (
        <Row>
            <Col md={3}>
                <h2>User Profile</h2>

                <Form onSubmit={submitHandler}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Account Information</Card.Title>

                            <Form.Group className='my-2' controlId='name'>
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type='text'
                                    placeholder='Enter name'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                ></Form.Control>
                            </Form.Group>

                            <Form.Group className='my-2' controlId='email'>
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                    type='email'
                                    placeholder='Enter email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                ></Form.Control>
                            </Form.Group>

                            <Form.Group className='my-2' controlId='password'>
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type='password'
                                    placeholder='Enter password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                ></Form.Control>
                            </Form.Group>

                            <Form.Group className='my-2' controlId='confirmPassword'>
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type='password'
                                    placeholder='Confirm password'
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                ></Form.Control>
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Fitness Profile</Card.Title>

                            <Form.Group className='my-2' controlId='age'>
                                <Form.Label>Age</Form.Label>
                                <Form.Control
                                    type='number'
                                    placeholder='Enter your age'
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                ></Form.Control>
                            </Form.Group>

                            <Form.Group className='my-2' controlId='fitnessGoal'>
                                <Form.Label>Fitness Goal</Form.Label>
                                <Form.Select
                                    value={fitnessGoal}
                                    onChange={(e) => setFitnessGoal(e.target.value)}
                                >
                                    <option value=''>Select a goal</option>
                                    <option value='gain weight'>Gain Weight</option>
                                    <option value='lose weight'>Lose Weight</option>
                                    <option value='build muscle'>Build Muscle</option>
                                    <option value='get lean'>Get Lean</option>
                                    <option value='maintain'>Maintain</option>
                                    <option value='other'>Other</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className='my-2' controlId='whatsAppPhoneNumber'>
                                <Form.Label>WhatsApp Phone Number</Form.Label>
                                <Form.Control
                                    type='text'
                                    placeholder='Enter your WhatsApp phone number'
                                    value={whatsAppPhoneNumber}
                                    onChange={(e) => setWhatsAppPhoneNumber(e.target.value)}
                                ></Form.Control>
                            </Form.Group>

                            <Form.Group className='my-2' controlId='injuries'>
                                <Form.Label>Injuries/Limitations</Form.Label>
                                <Form.Control
                                    as='textarea'
                                    rows={3}
                                    placeholder='Any injuries or physical limitations?'
                                    value={injuries}
                                    onChange={(e) => setInjuries(e.target.value)}
                                ></Form.Control>
                            </Form.Group>

                            <Form.Group className='my-2' controlId='additionalInfo'>
                                <Form.Label>Additional Information</Form.Label>
                                <Form.Control
                                    as='textarea'
                                    rows={3}
                                    placeholder='Any other information'
                                    value={additionalInfo}
                                    onChange={(e) => setAdditionalInfo(e.target.value)}
                                ></Form.Control>
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    <Button type='submit' variant='primary'>
                        Update
                    </Button>
                    {loadingUpdateProfile && <Loader />}
                </Form>
            </Col>
            <Col md={9}>
                <h2>My Orders</h2>
                {isLoading ? (
                    <Loader />
                ) : error ? (
                    <Message variant='danger'>
                        {error?.data?.message || error.error}
                    </Message>
                ) : (
                    <Table striped hover responsive className='table-sm'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>DATE</th>
                                <th>TOTAL</th>
                                <th>PAID</th>
                                <th>DELIVERED</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>{order.createdAt.substring(0, 10)}</td>
                                    <td>{order.totalPrice}</td>
                                    <td>
                                        {order.isPaid ? (
                                            order.paidAt.substring(0, 10)
                                        ) : (
                                            <FaTimes style={{ color: 'red' }} />
                                        )}
                                    </td>
                                    <td>
                                        {order.isDelivered ? (
                                            order.deliveredAt.substring(0, 10)
                                        ) : (
                                            <FaTimes style={{ color: 'red' }} />
                                        )}
                                    </td>
                                    <td>
                                        <LinkContainer to={`/order/${order._id}`}>
                                            <Button className='btn-sm' variant='light'>
                                                Details
                                            </Button>
                                        </LinkContainer>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Col>
        </Row>
    );
};

export default ProfileScreen;
