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

    const { userInfo } = useSelector((state) => state.auth);

    const { data: orders, isLoading, error } = useGetMyOrdersQuery();

    const [updateProfile, { isLoading: loadingUpdateProfile }] =
        useProfileMutation();

    useEffect(() => {
        setName(userInfo.name);
        setEmail(userInfo.email);
        // Set fitness profile data if available
        if (userInfo.age) setAge(userInfo.age);
        if (userInfo.fitnessGoal) setFitnessGoal(userInfo.fitnessGoal);
        if (userInfo.injuries) setInjuries(userInfo.injuries);
        if (userInfo.additionalInfo) setAdditionalInfo(userInfo.additionalInfo);
    }, [userInfo]);

    const dispatch = useDispatch();
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
                }).unwrap();
                dispatch(setCredentials({ ...res }));
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

                <Card className="mb-4">
                    <Card.Body>
                        <Card.Title>Account Information</Card.Title>
                        <Form onSubmit={submitHandler}>
                            <Form.Group className='my-2' controlId='name'>
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type='name'
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
                        </Form>
                    </Card.Body>
                </Card>

                <Card>
                    <Card.Body>
                        <Card.Title>Fitness Profile</Card.Title>
                        <Form onSubmit={submitHandler}>
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
                                    <option value=''>Select your goal</option>
                                    <option value='gain weight'>Gain Weight</option>
                                    <option value='lose weight'>Lose Weight</option>
                                    <option value='build muscle'>Build Muscle</option>
                                    <option value='get lean'>Get Lean</option>
                                    <option value='maintain'>Maintain</option>
                                    <option value='other'>Other</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className='my-2' controlId='injuries'>
                                <Form.Label>Injuries / Past Injuries</Form.Label>
                                <Form.Control
                                    as='textarea'
                                    rows={3}
                                    placeholder='List any current or past injuries'
                                    value={injuries}
                                    onChange={(e) => setInjuries(e.target.value)}
                                ></Form.Control>
                            </Form.Group>

                            <Form.Group className='my-2' controlId='additionalInfo'>
                                <Form.Label>Additional Information</Form.Label>
                                <Form.Control
                                    as='textarea'
                                    rows={3}
                                    placeholder='Any additional information'
                                    value={additionalInfo}
                                    onChange={(e) => setAdditionalInfo(e.target.value)}
                                ></Form.Control>
                            </Form.Group>

                            <Button type='submit' variant='primary' className='my-3'>
                                Update
                            </Button>
                            {loadingUpdateProfile && <Loader />}
                        </Form>
                    </Card.Body>
                </Card>
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
