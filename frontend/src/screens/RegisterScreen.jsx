import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';

import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

const RegisterScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [age, setAge] = useState('');
    const [fitnessGoal, setFitnessGoal] = useState('');
    const [injuries, setInjuries] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [register, { isLoading }] = useRegisterMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const { search, state } = useLocation();
    const sp = new URLSearchParams(search);
    const redirect = sp.get('redirect') || state?.from || '/home';

    useEffect(() => {
        if (userInfo) {
            navigate(redirect);
        }
    }, [navigate, redirect, userInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
        } else {
            try {
                const res = await register({
                    name,
                    email,
                    password,
                    age: age ? Number(age) : null,
                    fitnessGoal,
                    injuries,
                    additionalInfo
                }).unwrap();
                dispatch(setCredentials({ ...res }));
                navigate(redirect);
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    return (
        <FormContainer>
            <h1>Register</h1>
            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>Account Information</Card.Title>
                    <Form onSubmit={submitHandler}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className='my-2' controlId='name'>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type='name'
                                        placeholder='Enter name'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    ></Form.Control>
                                </Form.Group>

                                <Form.Group className='my-2' controlId='email'>
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type='email'
                                        placeholder='Enter email'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    ></Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className='my-2' controlId='password'>
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type='password'
                                        placeholder='Enter password'
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    ></Form.Control>
                                </Form.Group>
                                <Form.Group className='my-2' controlId='confirmPassword'>
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                        type='password'
                                        placeholder='Confirm password'
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    ></Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Card.Title className="mt-4">Fitness Profile</Card.Title>
                        <Row>
                            <Col md={6}>
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
                            </Col>
                            <Col md={6}>
                                <Form.Group className='my-2' controlId='injuries'>
                                    <Form.Label>Injuries / Past Injuries</Form.Label>
                                    <Form.Control
                                        as='textarea'
                                        rows={2}
                                        placeholder='List any current or past injuries'
                                        value={injuries}
                                        onChange={(e) => setInjuries(e.target.value)}
                                    ></Form.Control>
                                </Form.Group>

                                <Form.Group className='my-2' controlId='additionalInfo'>
                                    <Form.Label>Additional Information</Form.Label>
                                    <Form.Control
                                        as='textarea'
                                        rows={2}
                                        placeholder='Any additional information you want to share'
                                        value={additionalInfo}
                                        onChange={(e) => setAdditionalInfo(e.target.value)}
                                    ></Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Button disabled={isLoading} type='submit' variant='primary' className="mt-3">
                            Register
                        </Button>

                        {isLoading && <Loader />}
                    </Form>
                </Card.Body>
            </Card>

            <Row className='py-3'>
                <Col>
                    Already have an account?{' '}
                    <Link to={redirect ? `/login?redirect=${redirect}` : '/login'}>
                        Login
                    </Link>
                </Col>
            </Row>
        </FormContainer>
    );
};

export default RegisterScreen;
