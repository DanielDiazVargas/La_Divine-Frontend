
import {  Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import type { JSX } from 'react';

function App(): JSX.Element {
  return (
    <Routes>
      {/* Agregar más rutas aquí */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;