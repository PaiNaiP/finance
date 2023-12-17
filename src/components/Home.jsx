import React, { useEffect, useState } from 'react'
import ExcelReader from './ExcelUploader'
import Button from 'react-bootstrap/esm/Button'
import Modal from 'react-bootstrap/Modal';
import { useParams } from 'react-router-dom';
import supabase from '../config';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Form from 'react-bootstrap/Form';
import { registerLocale } from 'react-datepicker';
import ru from 'date-fns/locale/ru';
import Spinner from 'react-bootstrap/Spinner';
import ChartCard from './ChartCard';
import Card from 'react-bootstrap/Card';
import IncomeTable from './IncomeTable';
import DebtsTable from './DebtsTable';
import ExpensesTable from './ExpensesTable';
import SavingTable from './SavingTable';
import SummaryComponent from './DateDiagram';


registerLocale('ru', ru);

export const Home = () => {
  const {id} = useParams();

  const [lgShow, setLgShow] = useState(false);
  const [income, setIncome] = useState(false);
  const [debts, setDebts] = useState(false);
  const [expenses, setExpenses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [xlsxData, setXlsxData] = useState();
  const [selectedDate, setSelectedDate] = useState(null);
  const [name, setName] = useState()
  const [month, setMonth] = useState()
  const [sum, setSum]=useState()
  const [year, setYear] = useState()
  const [accountName, setAccountName] = useState()
  const [loading, setLoading] = useState(true)
  const [incomeData, setIncomeData] = useState()
  const [expensesData, setExpensesData] = useState()
  const [debtsData, setDebtsData] = useState()
  const [savingData, setSavingData] = useState()
  const [incomeTableModal, setIncomeTableModal] = useState(false);
  const [debtsTableModal, setDebtsTableModal] = useState(false);
  const [expensesTableModal, setExpensesTableModal] = useState(false);
  const [savingTableModal, setSavingTableModal] = useState(false);

  useEffect(() => {
    // Set the locale globally
    registerLocale('ru', ru);
    getAccountName()
  }, []);

  const getAccountName = async() =>{
    let { data: account, error } = await supabase
    .from('account')
    .select("*")
    // Filters
    .eq('id', id)
    let { data: income, error2 } = await supabase
      .from('income')
      .select("*")
      // Filters
      .eq('user_id', id)
      setIncomeData(income)
    let { data: expenses, error3 } = await supabase
      .from('expenses')
      .select("*")
      // Filters
      .eq('user_id', id)
      setExpensesData(expenses)
    let { data: debts, error4 } = await supabase
      .from('debts')
      .select("*")
      // Filters
      .eq('user_id', id)
    setDebtsData(debts)
    let { data: saving, error5 } = await supabase
      .from('saving')
      .select("*")
      // Filters
      .eq('user_id', id)
    setSavingData(saving)
    setAccountName(account[0].name)
    setLoading(false)
  }
  const handleDataLoaded = (data) => {
    setXlsxData(data)
  };

  const handleDateChange = (date) => {
    var dateObject = new Date(date);
    var monthNum = dateObject.getMonth(); 
    var yearNum = dateObject.getFullYear();
    if(monthNum===0)
      setMonth('январь')
    if(monthNum===1)
      setMonth('февраль')
    if(monthNum===2)
      setMonth('март')
    if(monthNum===3)
      setMonth('апрель')
    if(monthNum===4)
      setMonth('май')
    if(monthNum===5)
      setMonth('июнь')
    if(monthNum===6)
      setMonth('июль')
    if(monthNum===7)
      setMonth('август')
    if(monthNum===8)
      setMonth('сентябрь')
    if(monthNum===9)
      setMonth('октябрь')
    if(monthNum===10)
      setMonth('ноябрь')
    if(monthNum===11)
      setMonth('декабрь')
    setYear(yearNum)
    setSelectedDate(date);
  };

  const handleAddXlsxToDatabase = async () => {
    await handleAddIncomeFromXlsx().then(async()=>{
      await handleAddExpensesFromXlsx().then(async()=>{
        await handleAddDebtsFromXlsx().then(async()=>{
          await handleAddSavingFromXlsx().then(()=>{
            
          })
        })
      })
    })
  };
  

  const handleAddIncomeFromXlsx = async()=>{
    if (!xlsxData) {
      console.error('xlsxData is undefined');
      return;
    }
  
    const combinedData = {};
  
    xlsxData.forEach((dat) => {
      if (!dat.data) {
        console.error('dat.data is undefined for some sheet');
        return;
      }
  
    xlsxData.forEach((dat) => {
      dat.data.forEach((daay) => {
        const stringWithoutSpaces = daay.columnName.replace(/\s/g, ''); // Remove spaces from columnName
  
        // Check if the column name contains the substring 'Доход'
        if (stringWithoutSpaces.includes('Доход')) {
          daay.data.forEach((value, index) => {
            if (value) {
              if(stringWithoutSpaces === 'Доходы'){
                value = value + '|';
              }
              const key = `${index}_${daay.sheetName}`;
              // Initialize an array if it doesn't exist for the current key
              combinedData[key] = combinedData[key] || [];
  
              // Push the value to the array
              combinedData[key].push(value);
            }
          });
        }
      });
    });
  
    // Output the combined data
    Object.keys(combinedData).forEach(async(key) => {
      const [index, sheetName] = key.split('_');
      const values = combinedData[key].join(' ');
      const match = sheetName.match(/([а-я]+)(\d+)/i);
      let month;
      let year;
    if (match) {
      // Первая группа - месяц
      month = match[1] || '';
      // Вторая группа - год
      year = match[2] || '';
    }
      const parts = values.split('|');

    // Первая часть строки
    const first = parts[0] || '';

    // Вторая часть строки
    const second = parts.slice(1).join('|');

    const { data, error } = await supabase
    .from('income')
    .insert([
      { name: first, month: month, year: year, sum: second, user_id:id },
    ])
    .select()
    });
  })

  }

  const handleAddExpensesFromXlsx = async()=>{
    if (!xlsxData) {
      console.error('xlsxData is undefined');
      return;
    }
  
    const combinedData = {};
  
    xlsxData.forEach((dat) => {
      if (!dat.data) {
        console.error('dat.data is undefined for some sheet');
        return;
      }  
    xlsxData.forEach((dat) => {
      dat.data.forEach((daay) => {
        const stringWithoutSpaces = daay.columnName.replace(/\s/g, ''); // Remove spaces from columnName
  
        // Check if the column name contains the substring 'Доход'
        if (stringWithoutSpaces.includes('Расход')) {
          daay.data.forEach((value, index) => {
            if (value) {
              if(stringWithoutSpaces === 'Расходы'){
                value = value + '|';
              }
              const key = `${index}_${daay.sheetName}`;
              // Initialize an array if it doesn't exist for the current key
              combinedData[key] = combinedData[key] || [];
  
              // Push the value to the array
              combinedData[key].push(value);
            }
          });
        }
      });
    });
  
    // Output the combined data
    Object.keys(combinedData).forEach(async(key) => {
      const [index, sheetName] = key.split('_');
      const values = combinedData[key].join(' ');
      const match = sheetName.match(/([а-я]+)(\d+)/i);
      let month;
      let year;
    if (match) {
      // Первая группа - месяц
      month = match[1] || '';
      // Вторая группа - год
      year = match[2] || '';
    }
      const parts = values.split('|');

    // Первая часть строки
    const first = parts[0] || '';

    // Вторая часть строки
    const second = parts.slice(1).join('|');

    const { data, error } = await supabase
    .from('expenses')
    .insert([
      { name: first, month: month, year: year, sum: second, user_id:id },
    ])
    .select()
    });
  })
  }
  
  const handleAddDebtsFromXlsx = async()=>{
    if (!xlsxData) {
      console.error('xlsxData is undefined');
      return;
    }
  
    const combinedData = {};
  
    xlsxData.forEach((dat) => {
      if (!dat.data) {
        console.error('dat.data is undefined for some sheet');
        return;
      }  
    xlsxData.forEach((dat) => {
      dat.data.forEach((daay) => {
        const stringWithoutSpaces = daay.columnName.replace(/\s/g, ''); // Remove spaces from columnName
  
        // Check if the column name contains the substring 'Доход'
        if (stringWithoutSpaces.includes('Долг')) {
          daay.data.forEach((value, index) => {
            if (value) {
              if(stringWithoutSpaces === 'Долги'){
                value = value + '|';
              }
              const key = `${index}_${daay.sheetName}`;
              // Initialize an array if it doesn't exist for the current key
              combinedData[key] = combinedData[key] || [];
  
              // Push the value to the array
              combinedData[key].push(value);
            }
          });
        }
      });
    });
  
    // Output the combined data
    Object.keys(combinedData).forEach(async(key) => {
      const [index, sheetName] = key.split('_');
      const values = combinedData[key].join(' ');
      const match = sheetName.match(/([а-я]+)(\d+)/i);
      let month;
      let year;
    if (match) {
      // Первая группа - месяц
      month = match[1] || '';
      // Вторая группа - год
      year = match[2] || '';
    }
      const parts = values.split('|');

    // Первая часть строки
    const first = parts[0] || '';

    // Вторая часть строки
    const second = parts.slice(1).join('|');

    const { data, error } = await supabase
    .from('debts')
    .insert([
      { name: first, month: month, year: year, sum: second, user_id:id },
    ])
    .select()
    });
  })
  }

  const handleAddSavingFromXlsx = async()=>{
    if (!xlsxData) {
      console.error('xlsxData is undefined');
      return;
    }
  
    const combinedData = {};
  
    xlsxData.forEach((dat) => {
      if (!dat.data) {
        console.error('dat.data is undefined for some sheet');
        return;
      }  
    xlsxData.forEach((dat) => {
      dat.data.forEach((daay) => {
        const stringWithoutSpaces = daay.columnName.replace(/\s/g, ''); // Remove spaces from columnName
  
        // Check if the column name contains the substring 'Доход'
        if (stringWithoutSpaces.includes('Сбережен')) {
          daay.data.forEach((value, index) => {
            if (value) {
              if(stringWithoutSpaces === 'Сбережения'){
                value = value + '|';
              }
              const key = `${index}_${daay.sheetName}`;
              // Initialize an array if it doesn't exist for the current key
              combinedData[key] = combinedData[key] || [];
  
              // Push the value to the array
              combinedData[key].push(value);
            }
          });
        }
      });
    });
  
    // Output the combined data
    Object.keys(combinedData).forEach(async(key) => {
      const [index, sheetName] = key.split('_');
      const values = combinedData[key].join(' ');
      const match = sheetName.match(/([а-я]+)(\d+)/i);
      let month;
      let year;
    if (match) {
      // Первая группа - месяц
      month = match[1] || '';
      // Вторая группа - год
      year = match[2] || '';
    }
      const parts = values.split('|');

    // Первая часть строки
    const first = parts[0] || '';

    // Вторая часть строки
    const second = parts.slice(1).join('|');

    const { data, error } = await supabase
    .from('saving')
    .insert([
      { name: first, month: month, year: year, sum: second, user_id:id },
    ])
    .select()
    });
  })
  }
  
  const handleAddIncome = async () => {
    
    try {
      const { data, error } = await supabase
        .from('income')
        .insert([
          { name: name, month: month, year: year, sum: sum, user_id: id },
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
  };

  const handleAddDebts = async () => {
    try {
      const { data, error } = await supabase
        .from('debts')
        .insert([
          { name: name, month: month, year: year, sum: sum, user_id: id },
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
  };

  const handleAddExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([
          { name: name, month: month, year: year, sum: sum, user_id: id },
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
  };

  const handleAddSaving = async () => {
    try {
      const { data, error } = await supabase
        .from('saving')
        .insert([
          { name: name, month: month, year: year, sum: sum, user_id: id },
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
  };
  
  return (
    <div style={{display:'flex'}}>
      <div style={{margin:'0 auto', width:'80%', display:'flex'}}>
        <div style={{margin:'0 auto', marginTop:'3rem'}}>
          {loading?(
            <Spinner animation="border" />
          ):(
            <div style={{ margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom:'1rem' }}>Добрый день, {accountName}</h1>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <Button style={{ marginRight: '10px' }} onClick={() => setLgShow(true)} variant="primary">Добавить файл Excel</Button>
              <Button style={{ marginRight: '10px' }} onClick={() => setIncome(true)} variant="primary">Добавить доходы</Button>
              <Button style={{ marginRight: '10px' }} onClick={() => setDebts(true)} variant="primary">Добавить долги</Button>
              <Button style={{ marginRight: '10px' }} onClick={() => setExpenses(true)} variant="primary">Добавить расходы</Button>
              <Button onClick={() => setSaving(true)} variant="primary">Добавить сбережения</Button>
            </div>
              <div style={{display:'flex', flexWrap: 'wrap', margin:'0 auto', marginLeft:'5rem'}}>
                {incomeData.length!==0&&(
                <Card style={{maxWidth:'37%', marginTop:'2rem', marginRight:'20px'}}>
                  <Card.Body>          
                    <h1 style={{textAlign:'center'}}>Доходы</h1>    
                    <ChartCard data={incomeData}/>
                  </Card.Body>
                  <Button variant="primary" onClick={()=>setIncomeTableModal(true)}>Подробнее</Button>
                </Card>
                )}
                {expensesData.length!==0&&(
                <Card style={{maxWidth:'37%', marginTop:'2rem', marginRight:'20px'}}>
                  <Card.Body>          
                    <h1 style={{textAlign:'center'}}>Расходы</h1>    
                    <ChartCard data={expensesData}/>
                  </Card.Body>
                  <Button variant="primary" onClick={()=>setExpensesTableModal(true)}>Подробнее</Button>
                </Card>
                )}
                {debtsData.length!==0&&(
                <Card style={{maxWidth:'37%', marginTop:'2rem', marginRight:'20px'}}>
                  <Card.Body>          
                    <h1 style={{textAlign:'center'}}>Долги</h1>    
                    <ChartCard data={debtsData}/>
                  </Card.Body>
                  <Button variant="primary" onClick={()=>setDebtsTableModal(true)}>Подробнее</Button>
                </Card>
                )}
                {savingData.length!==0&&(
                <Card style={{maxWidth:'37%', marginTop:'2rem'}}>
                  <Card.Body>          
                    <h1 style={{textAlign:'center'}}>Сбережения</h1>    
                    <ChartCard data={savingData}/>
                  </Card.Body>
                  <Button variant="primary" onClick={()=>setSavingTableModal(true)}>Подробнее</Button>
                </Card>
                )}
              </div>
              <SummaryComponent income={incomeData} expenses={expensesData} debts={debtsData} saving={savingData} />
              <Modal
                size="fullscreen"
                show={lgShow}
                onHide={() => setLgShow(false)}
                aria-labelledby="example-modal-sizes-title-lg"
              >
                <Modal.Header closeButton>
                  <Modal.Title id="example-modal-sizes-title-lg">
                    Добавить excel
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <ExcelReader onDataLoaded={handleDataLoaded} />
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setLgShow(false)}>Закрыть</Button>
                  <Button variant="primary" onClick={handleAddXlsxToDatabase}>Сохранить</Button>
                </Modal.Footer>
              </Modal>
              <Modal show={income} onHide={()=>setIncome(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Доход</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>Дата</p>
                  <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                locale="ru"
              />
              <Form.Group className="mb-3" >
                <Form.Label>Название дохода</Form.Label>
                <Form.Control type="text" placeholder="Заработная плата" onChange={(e)=>setName(e.target.value)} value={name}/>
              </Form.Group>
              <Form.Group className="mb-3" >
                <Form.Label>Сумма дохода</Form.Label>
                <Form.Control type="number" placeholder="0" onChange={(e)=>setSum(e.target.value)} value={sum}/>
              </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={()=>setIncome(false)}>
                    Закрыть
                  </Button>
                  <Button variant="primary" onClick={handleAddIncome}>
                    Сохранить
                  </Button>
                </Modal.Footer>
              </Modal>
              <Modal show={debts} onHide={()=>setDebts(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Долги</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>Дата</p>
                  <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                locale="ru"
              />
              <Form.Group className="mb-3" >
                <Form.Label>Название долга</Form.Label>
                <Form.Control type="text" placeholder="Ипотека" onChange={(e)=>setName(e.target.value)} value={name}/>
              </Form.Group>
              <Form.Group className="mb-3" >
                <Form.Label>Сумма долга</Form.Label>
                <Form.Control type="number" placeholder="0" onChange={(e)=>setSum(e.target.value)} value={sum}/>
              </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={()=>setDebts(false)}>
                    Закрыть
                  </Button>
                  <Button variant="primary" onClick={handleAddDebts}>
                    Сохранить
                  </Button>
                </Modal.Footer>
              </Modal>
              <Modal show={expenses} onHide={()=>setExpenses(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Расходы</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>Дата</p>
                  <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                locale="ru"
              />
              <Form.Group className="mb-3" >
                <Form.Label>Название расход</Form.Label>
                <Form.Control type="text" placeholder="Транспорт" onChange={(e)=>setName(e.target.value)} value={name}/>
              </Form.Group>
              <Form.Group className="mb-3" >
                <Form.Label>Сумма расход</Form.Label>
                <Form.Control type="number" placeholder="0" onChange={(e)=>setSum(e.target.value)} value={sum}/>
              </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={()=>setExpenses(false)}>
                    Закрыть
                  </Button>
                  <Button variant="primary" onClick={handleAddExpenses}>
                    Сохранить
                  </Button>
                </Modal.Footer>
              </Modal>
              <Modal show={saving} onHide={()=>setSaving(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Сбережения</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>Дата</p>
                  <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                locale="ru"
              />
              <Form.Group className="mb-3" >
                <Form.Label>Название сбережения</Form.Label>
                <Form.Control type="text" placeholder="Цели" onChange={(e)=>setName(e.target.value)} value={name}/>
              </Form.Group>
              <Form.Group className="mb-3" >
                <Form.Label>Сумма сбережения</Form.Label>
                <Form.Control type="number" placeholder="0" onChange={(e)=>setSum(e.target.value)} value={sum}/>
              </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={()=>setSaving(false)}>
                    Закрыть
                  </Button>
                  <Button variant="primary" onClick={handleAddSaving}>
                    Сохранить
                  </Button>
                </Modal.Footer>
              </Modal>
              <Modal
              show={incomeTableModal}
              onHide={() => setIncomeTableModal(false)}
              size="fullscreen"
              dialogClassName="modal-90w"
              aria-labelledby="example-custom-modal-styling-title"
            >
              <Modal.Header closeButton>
                <Modal.Title id="example-custom-modal-styling-title">
                  Доходы
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <IncomeTable income={incomeData}/>
              </Modal.Body>
              <Modal.Footer>
                  <Button variant="secondary" onClick={() => setIncomeTableModal(false)}>Закрыть</Button>
              </Modal.Footer>
            </Modal>
            <Modal
              show={debtsTableModal}
              onHide={() => setDebtsTableModal(false)}
              size="fullscreen"
              dialogClassName="modal-90w"
              aria-labelledby="example-custom-modal-styling-title"
            >
              <Modal.Header closeButton>
                <Modal.Title id="example-custom-modal-styling-title">
                  Долги
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <DebtsTable debts={debtsData}/>
              </Modal.Body>
              <Modal.Footer>
                  <Button variant="secondary" onClick={() => setDebtsData(false)}>Закрыть</Button>
              </Modal.Footer>
            </Modal>
            <Modal
              show={expensesTableModal}
              onHide={() => setExpensesTableModal(false)}
              size="fullscreen"
              dialogClassName="modal-90w"
              aria-labelledby="example-custom-modal-styling-title"
            >
              <Modal.Header closeButton>
                <Modal.Title id="example-custom-modal-styling-title">
                  Расходы
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <ExpensesTable expenses={expensesData}/>
              </Modal.Body>
              <Modal.Footer>
                  <Button variant="secondary" onClick={() => setExpensesTableModal(false)}>Закрыть</Button>
              </Modal.Footer>
            </Modal>
            <Modal
              show={savingTableModal}
              onHide={() => setSavingTableModal(false)}
              size="fullscreen"
              dialogClassName="modal-90w"
              aria-labelledby="example-custom-modal-styling-title"
            >
              <Modal.Header closeButton>
                <Modal.Title id="example-custom-modal-styling-title">
                  Сбережения
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <SavingTable saving={savingData}/>
              </Modal.Body>
              <Modal.Footer>
                  <Button variant="secondary" onClick={() => setSavingTableModal(false)}>Закрыть</Button>
              </Modal.Footer>
            </Modal>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
