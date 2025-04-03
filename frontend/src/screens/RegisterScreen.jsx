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

    // Fitness profile fields
    const [age, setAge] = useState('');
    const [fitnessGoal, setFitnessGoal] = useState('');
    const [injuries, setInjuries] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [whatsAppPhoneNumber, setWhatsAppPhoneNumber] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [register, { isLoading }] = useRegisterMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const { search } = useLocation();
    const sp = new URLSearchParams(search);
    const redirect = sp.get('redirect') || '/home';

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
                    additionalInfo,
                    whatsAppPhoneNumber
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
            <h1>Sign Up</h1>
            <Form onSubmit={submitHandler}>
                <Card className="mb-4">
                    <Card.Body>
                        <Card.Title>Account Information</Card.Title>

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
                    </Card.Body>
                </Card>

                <Card className="mb-4">
                    <Card.Body>
                        <Card.Title>Fitness Profile</Card.Title>
                        <Card.Subtitle className="text-muted mb-3">Optional, but helps us personalize your experience</Card.Subtitle>

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
                                placeholder='Any injuries or physical limitations we should know about?'
                                value={injuries}
                                onChange={(e) => setInjuries(e.target.value)}
                            ></Form.Control>
                        </Form.Group>

                        <Form.Group className='my-2' controlId='additionalInfo'>
                            <Form.Label>Additional Information</Form.Label>
                            <Form.Control
                                as='textarea'
                                rows={3}
                                placeholder='Any other information you want to share'
                                value={additionalInfo}
                                onChange={(e) => setAdditionalInfo(e.target.value)}
                            ></Form.Control>
                        </Form.Group>
                    </Card.Body>
                </Card>

                <Button
                    disabled={isLoading}
                    type='submit'
                    variant='primary'
                >
                    Register
                </Button>

                {isLoading && <Loader />}
            </Form>

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
