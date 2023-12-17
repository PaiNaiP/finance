import React, { useEffect, useState } from 'react';
import { Table, Tabs, Tab, Modal, Button, Form } from 'react-bootstrap';
import supabase from '../config';


const monthsList = [
  'январь', 'февраль', 'март',
  'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь',
  'октябрь', 'ноябрь', 'декабрь'
];

const IncomeTable = ({ income }) => {
  const [sortedData, setSortedData] = useState([]);
  const [show, setShow] = useState(false);
  const [id, setId] = useState();
  const [name, setName] = useState();
  const [sum, setSum] = useState();
  const [month, setMonth] = useState();
  const [year, setYear] = useState();
  const [user_id, setUser_id] = useState();

  useEffect(() => {
    const sorted = income.sort((a, b) => new Date(a.year, monthsList.indexOf(a.month)) - new Date(b.year, monthsList.indexOf(b.month)));
    const groupedData = {};

    sorted.forEach(item => {
      const key = `${item.year}-${item.month}`;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(item);
    });

    setSortedData(Object.entries(groupedData));
  }, [income]);

  const handleRowClick = (rowData) => {
    setId(rowData.id);
    setName(rowData.name);
    setSum(rowData.sum);
    setMonth(rowData.month);
    setYear(rowData.year);
    setUser_id(rowData.user_id);

    setShow(true);
  };

  const handleEdit = async() =>{
    try {
        const { error } = await supabase
          .from('income')
          .update({ name: name, sum: sum })
          .eq('id', id);
    
        if (error) {
          console.error('Error updating data:', error);
        } else {
          console.log('Data updated successfully');
          // Optionally, you can perform additional actions after successful update
          // For example, you may want to refresh the data or close the modal
          window.location.reload();
        }
      } catch (error) {
        console.error('Error updating data:', error);
      }
  }

  const handleDelete = async() =>{
    try {
        const { error } = await supabase
        .from('income')
        .delete()
        .eq('id', id)

    
        if (error) {
          console.error('Error updating data:', error);
        } else {
          console.log('Data updated successfully');
          // Optionally, you can perform additional actions after successful update
          // For example, you may want to refresh the data or close the modal
          window.location.reload();
        }
      } catch (error) {
        console.error('Error updating data:', error);
      }
  }
  return (
    <div>
        <p>Нажмите на строку, чтобы изменить или удалить информацию</p>
      <Tabs defaultActiveKey="0">
        {sortedData.map(([key, items], index) => (
          <Tab eventKey={index.toString()} title={key} key={index}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Месяц</th>
                  <th>Год</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} onClick={() => handleRowClick(item)}>
                    <td>{item.name}</td>
                    <td>{item.month}</td>
                    <td>{item.year}</td>
                    <td>{item.sum}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
        ))}
      </Tabs>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Изменить доходы</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Название дохода</Form.Label>
            <Form.Control type="text" placeholder="Salary" onChange={(e) => setName(e.target.value)} value={name} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Сумма</Form.Label>
            <Form.Control type="number" placeholder="0" onChange={(e) => setSum(e.target.value)} value={sum} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="danger" onClick={handleDelete}>Удалить</Button>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Закрыть
          </Button>
          <Button variant="primary" onClick={handleEdit}>
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default IncomeTable;
