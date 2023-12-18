import React, { useState } from 'react';
import supabase from '../config';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

export const Auth = () => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const navigate = useNavigate();

  const addAccount = async () => {
    let { data: account, error } = await supabase
      .from('account')
      .select("*")
      .eq('login', email);

    if (account[0] && account[0].password === password) {
      navigate(`/home/${account[0].id}`);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', width:'800px'}}>
      <div>
        <Form>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Почта</Form.Label>
            <Form.Control type="email" placeholder="name@example.com" onChange={(e) => { setEmail(e.target.value) }} value={email} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Пароль</Form.Label>
            <Form.Control type="password" placeholder="Пароль" onChange={(e) => { setPassword(e.target.value) }} value={password} />
          </Form.Group>
        </Form>
        <Button variant="primary" onClick={addAccount}>Авторизоваться</Button>
        <Button variant="primary" style={{marginLeft:'10px'}} onClick={()=>navigate('/reg')}>Регистрация</Button>
      </div>
    </Container>
  );
};
