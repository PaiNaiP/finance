import React, { useEffect, useState } from 'react';
import { Table, Tabs, Tab, Modal, Button, Form } from 'react-bootstrap';
import supabase from '../config';
import { ToastContainer, toast } from 'react-toastify';

const monthsList = [
  'январь', 'февраль', 'март',
  'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь',
  'октябрь', 'ноябрь', 'декабрь'
];

const DebtsTable = ({ debts }) => {
  const [sortedData, setSortedData] = useState([]);
  const [show, setShow] = useState(false);
  const [id, setId] = useState();
  const [name, setName] = useState();
  const [sum, setSum] = useState();
  const [month, setMonth] = useState();
  const [year, setYear] = useState();
  const [user_id, setUser_id] = useState();
  const [mostExpensiveDebts, setMostExpensiveDebts] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [concealmentModal, setConcealmentModal] = useState(false)
  const [concealment, setConcealment] = useState(false)

  useEffect(() => {
    const sorted = debts.sort((a, b) => new Date(a.year, monthsList.indexOf(a.month)) - new Date(b.year, monthsList.indexOf(b.month)));
    const groupedData = {};

    sorted.forEach(item => {
      const key = `${item.year}-${item.month}`;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(item);
    });

    setSortedData(Object.entries(groupedData));
  }, [debts]);

  const handleRowClick = (rowData) => {
    setId(rowData.id);
    setName(rowData.name);
    setSum(rowData.sum);
    setMonth(rowData.month);
    setYear(rowData.year);
    setUser_id(rowData.user_id);

    setConfirmationModal(true);
  };

  const handleEdit = async () => {
    try {
      const { error } = await supabase
        .from('debts')
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

  const notify = () => {
    toast.error('Ваше число превышает ваш долг', {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      });
  }
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('debts')
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

  const findMostExpensiveDebt = (items) => {
    let mostExpensive = 0;
    let mostExpensiveDebt = null;

    items.forEach(item => {
      if (item.sum > mostExpensive) {
        mostExpensive = item.sum;
        mostExpensiveDebt = item;
      }
    });

    return mostExpensiveDebt;
  };

  useEffect(() => {
    const mostExpensiveDebts = {};

    sortedData.forEach(([key, items], index) => {
      mostExpensiveDebts[index] = findMostExpensiveDebt(items);
    });

    setMostExpensiveDebts(mostExpensiveDebts);
  }, [sortedData]);

  const handleShow = () =>{
    setShow(true)
    setConfirmationModal(false)
  }

  const sokrModal = () =>{
    setConcealmentModal(true)
    setConfirmationModal(false)
  }

  const handleEditConcealment = async() =>{
    const num = sum - concealment
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    if(num<0&&num!==0){
      notify()
    }
    else{
      if(num>0){
        try {
            const { error } = await supabase
              .from('debts')
              .update({ sum: num })
              .eq('id', id);
      
            if (error) {
              console.error('Error updating data:', error);
            } else {
              console.log('Data updated successfully');
              try {
                const { data, error } = await supabase
                  .from('expenses')
                  .insert([
                    { name: `Сокрытие долга - "${name}" `, month: currentMonth, year: currentYear, sum: concealment, user_id: user_id },
                  ])
                  .select();
            
                if (error) {
                  console.error('Error adding income:', error.message);
                } else {
                  console.log('Income added successfully:', data);
                  // Optionally, you can add logic to handle success (e.g., reload the page)
                  window.location.reload();
                }
              } catch (error) {
                console.error('Unexpected error:', error.message);
              }
              // Optionally, you can perform additional actions after a successful update
              // For example, you may want to refresh the data or close the modal
            }
        } catch (error) {
            console.error('Error updating data:', error);
        }
    }else{
        try {
            const { error } = await supabase
              .from('debts')
              .delete()
              .eq('id', id);
      
            if (error) {
              console.error('Error updating data:', error);
            } else {
              console.log('Data updated successfully');
              try {
                const { data, error } = await supabase
                  .from('expenses')
                  .insert([
                    { name: `Сокрытие долга - "${name}" `, month: currentMonth, year: currentYear, sum: concealment, user_id: user_id },
                  ])
                  .select();
            
                if (error) {
                  console.error('Error adding income:', error.message);
                } else {
                  console.log('Income added successfully:', data);
                  // Optionally, you can add logic to handle success (e.g., reload the page)
                  window.location.reload();
                }
              } catch (error) {
                console.error('Unexpected error:', error.message);
              }
            }
          } catch (error) {
            console.error('Error updating data:', error);
          }
    }
    }
  }

  const handleCloseConcealment = () =>{
    setConcealment()
    setConcealmentModal(false)
  }
  return (
    <div>
        <p>Нажмите на строку, чтобы изменить, удалить информацию или сокрыть долги</p>
      <Tabs defaultActiveKey={activeTab.toString()} onSelect={(key) => setActiveTab(Number(key))}>
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
            {mostExpensiveDebts[index] && (
              <h1 style={{ color: 'red', fontSize:'18px' }}>{`Предупреждение: Самый дорогой долг для ${key} - "${mostExpensiveDebts[index].name}" с суммой ${mostExpensiveDebts[index].sum}. Рассмотрите возможность его погашения.`}</h1>
            )}
          </Tab>
        ))}
      </Tabs>
      <Modal show={concealmentModal} onHide={handleCloseConcealment}>
        <Modal.Header closeButton>
          <Modal.Title>Сокрытие долга</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Form.Group className="mb-3">
            <Form.Label>Сумма сокрытия долга</Form.Label>
            <Form.Control type="number" placeholder="0" onChange={(e) => setConcealment(e.target.value)} value={concealment} max={sum}/>
        </Form.Group>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={handleEditConcealment}>
            Сокрыть
          </Button>
          <Button variant="secondary" onClick={handleCloseConcealment}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      />
      <Modal show={confirmationModal} onHide={()=>setConfirmationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Изменение долга</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
        <Button variant="primary" onClick={sokrModal}>
            Сокрыть долг
          </Button>
            <Button variant="primary" onClick={handleShow}>
            Изменить или удалить
          </Button>
          <Button variant="secondary" onClick={()=>setConfirmationModal(false)}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Изменение долга</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Название долга</Form.Label>
            <Form.Control type="text" placeholder="Loan" onChange={(e) => setName(e.target.value)} value={name} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Сумма</Form.Label>
            <Form.Control type="number" max={sum} placeholder="0" onChange={(e) => setSum(e.target.value)} value={sum} />
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

export default DebtsTable;
