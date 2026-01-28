"use client";
import React, { useState } from 'react';

export default function AdminPanel() {
  // Por ahora, simularemos la base de datos con este estado local
  const [productos, setProductos] = useState([
    { id: 1, nombre: "La Ultra Fifi", agotado: false },
    { id: 2, nombre: "La Doble Fifi", agotado: false },
    { id: 3, nombre: "Fifi Wings", agotado: false },
    { id: 4, nombre: "Chicken Tenders", agotado: false },
    { id: 5, nombre: "Salchipapa Jumbo", agotado: false },
    { id: 6, nombre: "Papas Clásicas", agotado: false },
    { id: 7, nombre: "Dados de Queso", agotado: false },
    { id: 8, nombre: "Papas Waffle", agotado: false },
  ]);

  const toggleAgotado = (id) => {
    setProductos(productos.map(p => 
      p.id === id ? { ...p, agotado: !p.agotado } : p
    ));
  };

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '30px' }}>
      <h1 style={{ color: '#FF8C00', textAlign: 'center' }}>Panel Admin - Fifi's</h1>
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#777' }}>Control de inventario en tiempo real</p>

      <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {productos.map(p => (
          <div key={p.id} style={{ 
            backgroundColor: '#111', 
            padding: '20px', 
            borderRadius: '15px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            border: `1px solid ${p.agotado ? '#ff4444' : '#222'}`
          }}>
            <div>
              <h3 style={{ margin: 0 }}>{p.nombre}</h3>
              <span style={{ color: p.agotado ? '#ff4444' : '#28a745', fontSize: '12px', fontWeight: 'bold' }}>
                {p.agotado ? 'AGOTADO' : 'DISPONIBLE'}
              </span>
            </div>
            
            <button 
              onClick={() => toggleAgotado(p.id)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: p.agotado ? '#28a745' : '#ff4444',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {p.agotado ? 'Activar' : 'Agotar'}
            </button>
          </div>
        ))}
      </div>
      
      <p style={{ marginTop: '40px', fontSize: '12px', color: '#444', textAlign: 'center' }}>
        Nota: Por ahora los cambios solo se ven en esta pantalla. 
        Para que se conecten al cliente, mañana usaremos una base de datos real.
      </p>
    </div>
  );
}