import React, { useEffect, useState } from 'react';
import { Table, Tabs, Tab, Modal, Button, Form } from 'react-bootstrap';
import supabase from '../config';

const monthsList = [
  'январь', 'февраль', 'март',
  'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь',
  'октябрь', 'ноябрь', 'декабрь'
];

const ExpensesTable = ({ expenses }) => {
  const [sortedData, setSortedData] = useState([]);
  const [show, setShow] = useState(false);
  const [id, setId] = useState();
  const [name, setName] = useState();
  const [sum, setSum] = useState();
  const [month, setMonth] = useState();
  const [year, setYear] = useState();
  const [user_id, setUser_id] = useState();
  const [mostExpensiveExpenses, setMostExpensiveExpenses] = useState({});

  useEffect(() => {
    const sorted = expenses.sort((a, b) => new Date(a.year, monthsList.indexOf(a.month)) - new Date(b.year, monthsList.indexOf(b.month)));
    const groupedData = {};

    sorted.forEach(item => {
      const key = `${item.year}-${item.month}`;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(item);
    });

    setSortedData(Object.entries(groupedData));
  }, [expenses]);

  const handleRowClick = (rowData) => {
    setId(rowData.id);
    setName(rowData.name);
    setSum(rowData.sum);
    setMonth(rowData.month);
    setYear(rowData.year);
    setUser_id(rowData.user_id);

    setShow(true);
  };

  const handleEdit = async () => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ name: name, sum: sum })
        .eq('id', id);

      if (error) {
        console.error('Error updating data:', error);
      } else {
        console.log('Data updated successfully');
        // Optionally, you can perform additional actions after a successful update
        // For example, you may want to refresh the data or close the modal
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error updating data:', error);
      } else {
        console.log('Data updated successfully');
        // Optionally, you can perform additional actions after a successful update
        // For example, you may want to refresh the data or close the modal
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const findMostExpensiveExpense = (items) => {
    let mostExpensive = 0;
    let mostExpensiveExpense = null;

    items.forEach(item => {
      if (item.sum > mostExpensive) {
        mostExpensive = item.sum;
        mostExpensiveExpense = item;
      }
    });

    return mostExpensiveExpense;
  };

  useEffect(() => {
    const mostExpensiveExpenses = {};

    sortedData.forEach(([key, items], index) => {
      mostExpensiveExpenses[index] = findMostExpensiveExpense(items);
    });

    setMostExpensiveExpenses(mostExpensiveExpenses);
  }, [sortedData]);

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
            {mostExpensiveExpenses[index] && (
              <h1 style={{ color: 'red',fontSize:'18px' }}>{`Предупреждение: Самый дорогой расход для ${key} - "${mostExpensiveExpenses[index].name}" с суммой ${mostExpensiveExpenses[index].sum}. Рассмотрите возможность сокращения этого расхода.`}</h1>
            )}
          </Tab>
        ))}
      </Tabs>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Изменение расхода</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Название расхода</Form.Label>
            <Form.Control type="text" placeholder="Groceries" onChange={(e) => setName(e.target.value)} value={name} />
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

export default ExpensesTable;
