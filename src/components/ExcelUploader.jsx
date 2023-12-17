import React, { useEffect, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Nav, Tab } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import image1 from '../image/imagesh.png'
import imagelist from '../image/imagelist.png'
import excelFile from '../excel/Шаблон.xlsx'

function ExcelReader({ onDataLoaded }) {
  const [data, setData] = useState([]);
  const inputRef = useRef(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [show, setShow] = useState(false);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      handleFile(acceptedFiles[0]);
    }
  };

  useEffect(() => {
    setShow(true)
  }, [])
  
  const notify = () => {
    toast.error('Файл Excel заполнен не верно', {
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

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // ...

const handleFile = (file) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    const workbook = XLSX.read(e.target.result, { type: 'binary' });
    const sheetNames = workbook.SheetNames;

    // Обработка данных из каждого листа
    const allData = sheetNames.map((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (sheetData.length < 2) {
        console.warn(`Sheet "${sheetName}" has no data or does not have explicit headers.`);
        return null;
      }

      const columns = sheetData[0];
      const columnData = columns.map((col, colIndex) => ({
        sheetName,
        columnName: col || `Column${colIndex + 1}`,
        data: sheetData.slice(1).map((row) => row[colIndex]),
      }));

      return { sheetName, data: columnData };
    }).filter(Boolean);

    setData(allData);
    setActiveSheet(allData.length > 0 ? allData[0].sheetName : null);


    // Передаем данные в родительский компонент
    onDataLoaded(allData);
    const pus = []
    allData.forEach((dat) => {
      // Список ожидаемых значений для columnName
      let columnString
      // Проверка, что все значения columnName соответствуют ожидаемым (игнорируя регистр и пробелы)
      // Проверка месяца и года
      const monthMatch = dat.sheetName.match(/^(январь|февраль|март|апрель|май|июнь|июль|август|сентябрь|октябрь|ноябрь|декабрь)/i);
      const yearMatch = dat.sheetName.match(/\d{4}/);
    
      if (monthMatch && yearMatch) {
        const extractedMonth = monthMatch[0].toLowerCase();
        const extractedYear = yearMatch[0];
        console.log(`Месяц: ${extractedMonth}, Год: ${extractedYear}`);
        dat.data.map((data1)=>{
          const cleanedColumnName = data1.columnName.replace(/\s/g, '');
          if(columnString)
          columnString+=cleanedColumnName
          else
          columnString=cleanedColumnName
        })
        if(columnString==='ДоходыСуммаДоходовРасходыСуммаРасходовДолгиСуммаДолговСбереженияСуммаСбережений')
        pus.push(true)
        else
        pus.push(false)
      } else {
        pus.push(false)
      }
    });
    
    if (pus.includes(false)) {
      setData([])
      notify()
    } 
    };

  reader.readAsBinaryString(file);
};

// ...


  useEffect(() => {
    // Добавляем обработчик события для выбора файла
    const handleFileChange = () => {
      const fileInput = inputRef.current;
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        handleFile(fileInput.files[0]);
      }
    };

    // Добавляем обработчик события для изменения файла
    inputRef.current.addEventListener('change', handleFileChange);

    // Очищаем обработчик события при размонтировании компонента
    return () => {
      const fileInput = inputRef.current;
      if (fileInput) {
        fileInput.removeEventListener('change', handleFileChange);
      }
    };
  }, []);

  return (
    <div>
      <div {...getRootProps()} style={dropzoneStyles}>
        <input {...getInputProps()} ref={inputRef} />
        <p>Перетащите файл сюда или кликните, чтобы выбрать файл</p>
      </div>
      <p style={{color:'blue', textDecoration:'underline'}} onClick={() => setShow(true)}>Посмотреть инструкцию</p>

      {data.length > 0 && (
  <Tab.Container activeKey={activeSheet}>
    <Nav variant="tabs" onSelect={(sheetName) => setActiveSheet(sheetName)}>
      {data.map((tableData, index) => (
        <Nav.Item key={index}>
          <Nav.Link eventKey={tableData.sheetName}>
            {tableData.sheetName}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>

    <Tab.Content>
      {data.map((tableData, index) => (
        <Tab.Pane key={index} eventKey={tableData.sheetName}>
          <div>
            <h2>Sheet: {tableData.sheetName}</h2>
            <table className="table">
              <thead>
                <tr>
                  {tableData.data.map((col) => (
                    <th key={`${col.sheetName}_${col.columnName}`}>{col.columnName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.data.length > 0 &&
                  tableData.data[0].data.map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {tableData.data.map((col) => (
                        <td key={`${col.sheetName}_${col.columnName}_${rowIndex}`}>{col.data[rowIndex]}</td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Tab.Pane>
      ))}
    </Tab.Content>
  </Tab.Container>
)}


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

      <Modal show={show} onHide={()=>setShow(false)} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Предупреждение</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Таблица Excel должна соответствовать шаблону</p>
          <img src={image1} alt="" style={{width:'45rem'}}/>
          <p>Название Листа должно соответствовать месяцгод. Пример:</p>
          <img src={imagelist} alt="" />
          <div></div>
          <div>
          <a href={excelFile}>Скачать шаблон</a>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>setShow(false)}>
            Понятно
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

const dropzoneStyles = {
  border: '2px dashed #cccccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
};

export default ExcelReader;
