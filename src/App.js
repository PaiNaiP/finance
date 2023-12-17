import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { Auth } from './components/Auth';
import { Reg } from './components/Reg';
import { HomeMain } from './components/HomeMain';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route exact path="/" element={<Auth/>}/>
      <Route exact path="/home/:id" element={<HomeMain/>}/>
      <Route exact path="/reg" element={<Reg/>}/>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
