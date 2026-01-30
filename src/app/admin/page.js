"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase'; // Fíjate en los dos puntos (..) para subir de carpeta

export default function AdminPanel() {
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // Cargar productos actuales
  useEffect(() => {
    const cargarProductos = async () => {
      const { data, error } = await supabase.from('productos').select('*').order('id', { ascending: true });
      if (error) console.log('Error:', error);
      else setProductos(data);
    };
    cargarProductos();
  }, []);

  // Función mágica para cambiar el estado de AGOTADO
  const cambiarEstado = async (id, estadoActual) => {
    const { error } = await supabase
      .from('productos')
      .update({ agotado: !estadoActual })
      .eq('id', id);

    if (error) {
      setMensaje("❌ Error al actualizar");
    } else {
      // Actualizar la lista local para que veas el cambio rápido
      setProductos(productos.map(p => p.id === id ? { ...p, agotado: !estadoActual } : p));
      setMensaje("✅ Inventario actualizado");
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '30px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#FF8C00', fontSize: '28px', fontWeight: '900' }}>CONTROL FIFI'S</h1>
        <p style={{ color: '#777' }}>Toca para agotar o activar productos</p>
      </header>

      {mensaje && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#333', padding: '10px 20px', borderRadius: '10px', zIndex: 1000, fontWeight: 'bold' }}>
          {mensaje}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {productos.map(p => (
          <div key={p.id} style={{ 
            backgroundColor: '#111', 
            padding: '20px', 
            borderRadius: '20px', 
            border: `1px solid ${p.agotado ? '#ff4444' : '#222'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px' }}>{p.nombre}</h3>
              <p style={{ margin: 0, color: p.agotado ? '#ff4444' : '#28a745', fontSize: '12px', fontWeight: 'bold' }}>
                {p.agotado ? '● AGOTADO' : '● DISPONIBLE'}
              </p>
            </div>

            <button 
              onClick={() => cambiarEstado(p.id, p.agotado)}
              style={{
                backgroundColor: p.agotado ? '#28a745' : '#ff4444',
                color: '#fff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {p.agotado ? 'Activar' : 'Agotar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}