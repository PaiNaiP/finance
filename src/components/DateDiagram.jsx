import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Doughnut } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import supabase from '../config';

const SummaryComponent = ({ income, expenses, debts, saving }) => {
  // Объединение всех данных
  const {id} = useParams()
  const [dolg, setDolg] = useState()
  let allData
  if(income||expenses||debts||saving)
  allData = [...income, ...expenses, ...debts, ...saving];

  // Группировка данных по месяцам и годам для каждой категории
  const groupedData = {};

  allData.forEach(item => {
    const key = `${item.month}-${item.year}`;
    groupedData[key] = groupedData[key] || { income: 0, expenses: 0, saving: 0, debts: 0 };

    // Используем поле category для определения категории
    const category = item.category.toLowerCase();
    switch (category) {
      case 'income':
        groupedData[key].income += item.sum;
        break;
      case 'expenses':
        groupedData[key].expenses += item.sum;
        break;
      case 'debts':
        groupedData[key].debts += item.sum;
        break;
      case 'saving':
        groupedData[key].saving += item.sum;
        break;
      default:
        break;
    }
  });

  // Состояние для активной вкладки
  const [activeTab, setActiveTab] = useState(Object.keys(groupedData)[0]);
  const [notification, setNotification] = useState(null);
  const [expenseWarning, setExpenseWarning] = useState(false);

  // Функция для анализа финансов
  const analyzeFinances = () => {
    const currentData = groupedData[activeTab];
    if(currentData){
      const expenseThreshold = currentData.income * 0.9;
  
      if (currentData.expenses  > currentData.income ) {
        const neededIncome = currentData.expenses - currentData.income;
        setNotification(`Внимание: Расходы превышают доходы. Необходимо заработать ещё ${neededIncome} для покрытия расходов.`);
      }else if (currentData.debts > currentData.income){
        const neededIncome = currentData.debts - currentData.income;
        setNotification(`Внимание: Долги превышают доходы. Необходимо заработать ещё ${neededIncome} для покрытия долгов.`);
      }
      else if (currentData.expenses >= expenseThreshold && !expenseWarning) {
        setExpenseWarning(true);
        setNotification('Внимание: Расходы приближаются к доходам на 10%. Сократите расходы для поддержания финансового баланса.');
      } else {
        setNotification('Финансы в порядке.');
      }
    }
  };
  

  // Вызов функции при монтировании компонента
  useEffect(() => {
    analyzeFinances();
    handleDolg()
    setExpenseWarning(false); 
  }, [activeTab]);

  // Формирование данных для круговых диаграмм
  const chartData = {
    labels: ['Доходы', 'Расходы', 'Сбережения', 'Долги'],
    datasets: [
      {
        data: [
          groupedData[activeTab]?.income || 0,
          groupedData[activeTab]?.expenses || 0,
          groupedData[activeTab]?.saving || 0,
          groupedData[activeTab]?.debts || 0,
        ],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const handleDolg = async() =>{
    let { data: debts, error } = await supabase
    .from('debts')
    .select("*")
    // Filters
    .eq('user_id', id)
    let num = debts.reduce((accumulator, debt) => accumulator + debt.sum, 0);
    setDolg(num)
  }
  
  return (
    <div style={{ marginTop: '2rem' }}>
      {Object.keys(groupedData).length > 0 &&(
        <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Обзор финансов</h2>
      )}

      {/* Tabs для каждой даты */}
      <ul className="nav nav-tabs">
        {Object.keys(groupedData).map(period => (
          <li key={period} className="nav-item">
            <a
              className={`nav-link ${activeTab === period ? 'active' : ''}`}
              onClick={() => setActiveTab(period)}
            >
              {period}
            </a>
          </li>
        ))}
      </ul>

      {/* Содержимое вкладок */}
      {Object.keys(groupedData).map(period => (
        <div key={period} className={`tab-content ${activeTab === period ? 'active' : 'fade'}`}>
          {activeTab === period && (
            <div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                {/* Центрирование диаграммы */}
                <div style={{ maxWidth: '500px', margin: 'auto' }}>
                    <Doughnut data={chartData} width={500} height={500} />
                </div>
                </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: '20px' }}>
                <div style={{ display: 'flex', marginRight: '20px' }}>
                  <h1 style={{ fontSize: '22px', marginRight: '10px' }}>Доходы:</h1>
                  <p style={{ marginTop: '3.5px' }}> {groupedData[period]?.income || 0}</p>
                </div>
                <div style={{ display: 'flex', marginRight: '20px' }}>
                  <h1 style={{ fontSize: '22px', marginRight: '10px' }}>Расходы:</h1>
                  <p style={{ marginTop: '3.5px' }}> {groupedData[period]?.expenses || 0}</p>
                </div>
                <div style={{ display: 'flex', marginRight: '20px' }}>
                  <h1 style={{ fontSize: '22px', marginRight: '10px' }}>Сбережения:</h1>
                  <p style={{ marginTop: '3.5px' }}> {groupedData[period]?.saving || 0}</p>
                </div>
                <div style={{ display: 'flex' }}>
                  <h1 style={{ fontSize: '22px', marginRight: '10px' }}>Долги:</h1>
                  <p style={{ marginTop: '3.5px' }}> {groupedData[period]?.debts || 0}</p>
                </div>
              </div>
              {notification!=='Финансы в порядке.'?(
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    {notification && <h1 style={{ color: 'red', fontSize:'18px' }}>{notification}</h1>}
                </div>
              ):(
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    {notification && <h1 style={{ color: 'green', fontSize:'18px' }}>{notification}</h1>}
                    <p>Вы можете закрыть ваши долги. Общая сумма долгов: {dolg}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SummaryComponent;
