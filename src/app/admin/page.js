"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function AdminPanel() {
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [password, setPassword] = useState('');
  const [autorizado, setAutorizado] = useState(false);

  const PASSWORD_CORRECTA = "Fifi2026"; // <--- CAMBIA TU CONTRASEÑA AQUÍ

  // Cargar productos actuales
  useEffect(() => {
    if (autorizado) {
      const cargarProductos = async () => {
        const { data, error } = await supabase.from('productos').select('*').order('id', { ascending: true });
        if (error) console.log('Error:', error);
        else setProductos(data);
      };
      cargarProductos();
    }
  }, [autorizado]);

  const manejarLogin = (e) => {
    e.preventDefault();
    if (password === PASSWORD_CORRECTA) {
      setAutorizado(true);
    } else {
      alert("Código incorrecto, Oscar.");
    }
  };

  const cambiarEstado = async (id, estadoActual) => {
    const { error } = await supabase
      .from('productos')
      .update({ agotado: !estadoActual })
      .eq('id', id);

    if (error) {
      setMensaje("❌ Error al actualizar");
    } else {
      setProductos(productos.map(p => p.id === id ? { ...p, agotado: !estadoActual } : p));
      setMensaje("✅ Inventario actualizado");
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  // 1. SI NO ESTÁ AUTORIZADO, MUESTRA EL LOGIN
  if (!autorizado) {
    return (
      <main style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#111', padding: '40px', borderRadius: '30px', border: '1px solid #222', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2 style={{ color: '#FF8C00', fontSize: '28px', fontWeight: '900', marginBottom: '10px' }}>Admin Fifi's</h2>
          <p style={{ color: '#777', marginBottom: '30px', fontSize: '14px' }}>Ingresa el código maestro</p>
          <form onSubmit={manejarLogin}>
            <input 
              type="password" 
              placeholder="Código"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '15px', padding: '15px', color: '#fff', textAlign: 'center', outline: 'none', marginBottom: '20px' }}
            />
            <button type="submit" style={{ width: '100%', backgroundColor: '#FF8C00', color: '#000', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
              ENTRAR
            </button>
          </form>
        </div>
      </main>
    );
  }

  // 2. SI ESTÁ AUTORIZADO, MUESTRA EL PANEL QUE YA TENÍAS
  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '30px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#FF8C00', fontSize: '28px', fontWeight: '900' }}>CONTROL FIFI'S</h1>
        <p style={{ color: '#777' }}>Toca para agotar o activar productos</p>
        <button onClick={() => setAutorizado(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}>Cerrar Sesión</button>
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