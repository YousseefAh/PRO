import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Card } from 'react-bootstrap';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import {
    useGetUserDetailsQuery,
    useUpdateUserMutation,
} from '../../slices/usersApiSlice';

const UserEditScreen = () => {
    const { id: userId } = useParams();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [age, setAge] = useState('');
    const [fitnessGoal, setFitnessGoal] = useState('');
    const [injuries, setInjuries] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [whatsAppPhoneNumber, setWhatsAppPhoneNumber] = useState('');

    const {
        data: user,
        isLoading,
        error,
        refetch,
    } = useGetUserDetailsQuery(userId);

    const [updateUser, { isLoading: loadingUpdate }] = useUpdateUserMutation();

    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await updateUser({
                _id: userId,
                name,
                email,
                isAdmin,
                age: age ? Number(age) : null,
                fitnessGoal,
                injuries,
                additionalInfo,
                whatsAppPhoneNumber
            });
            toast.success('User updated successfully');
            refetch();
            navigate('/admin/userlist');
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setIsAdmin(user.isAdmin);
            setAge(user.age || '');
            setFitnessGoal(user.fitnessGoal || '');
            setInjuries(user.injuries || '');
            setAdditionalInfo(user.additionalInfo || '');
            setWhatsAppPhoneNumber(user.whatsAppPhoneNumber || '');
        }
    }, [user]);

    return (
        <>
            <Link to='/admin/userlist' className='btn btn-light my-3'>
                Go Back
            </Link>
            <FormContainer>
                <h1>Edit User</h1>
                {loadingUpdate && <Loader />}
                {isLoading ? (
                    <Loader />
                ) : error ? (
                    <Message variant='danger'>
                        {error?.data?.message || error.error}
                    </Message>
                ) : (
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

                                <Form.Group className='my-2' controlId='isadmin'>
                                    <Form.Check
                                        type='checkbox'
                                        label='Is Admin'
                                        checked={isAdmin}
                                        onChange={(e) => setIsAdmin(e.target.checked)}
                                    ></Form.Check>
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
                                        placeholder='Enter age'
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
                                        placeholder='Enter WhatsApp phone number'
                                        value={whatsAppPhoneNumber}
                                        onChange={(e) => setWhatsAppPhoneNumber(e.target.value)}
                                    ></Form.Control>
                                </Form.Group>

                                <Form.Group className='my-2' controlId='injuries'>
                                    <Form.Label>Injuries/Limitations</Form.Label>
                                    <Form.Control
                                        as='textarea'
                                        rows={3}
                                        placeholder='Enter any injuries or limitations'
                                        value={injuries}
                                        onChange={(e) => setInjuries(e.target.value)}
                                    ></Form.Control>
                                </Form.Group>

                                <Form.Group className='my-2' controlId='additionalInfo'>
                                    <Form.Label>Additional Information</Form.Label>
                                    <Form.Control
                                        as='textarea'
                                        rows={3}
                                        placeholder='Enter any additional information'
                                        value={additionalInfo}
                                        onChange={(e) => setAdditionalInfo(e.target.value)}
                                    ></Form.Control>
                                </Form.Group>
                            </Card.Body>
                        </Card>

                        <Button type='submit' variant='primary'>
                            Update
                        </Button>
                    </Form>
                )}
            </FormContainer>
        </>
    );
};

export default UserEditScreen;
