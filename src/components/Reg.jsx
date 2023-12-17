import React, { useState } from 'react';
import supabase from '../config';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

export const Reg = () => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [name, setName] = useState();
  const navigate = useNavigate();

  const addAccount = async () => {
    const { data, error } = await supabase
      .from('account')
      .insert([{ login: email, password: password, name: name }])
      .select();

    navigate('/');
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div>
        <Form>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" placeholder="name@example.com" onChange={(e) => setEmail(e.target.value)} value={email} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} value={password} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Название</Form.Label>
            <Form.Control type="text" placeholder="Название" onChange={(e) => setName(e.target.value)} value={name} />
          </Form.Group>
        </Form>
        <Button variant="primary" onClick={addAccount}>Регистрация</Button>
        <Button variant="primary" style={{marginLeft:'10px'}} onClick={() => navigate('/')}>Авторизация</Button>
      </div>
    </Container>
  );
};
