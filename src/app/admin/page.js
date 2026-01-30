"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function AdminPanel() {
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [password, setPassword] = useState('');
  const [autorizado, setAutorizado] = useState(false);
  const [abiertoManual, setAbiertoManual] = useState(true);
  
  // ESTADOS PARA EDICIÓN DE PRECIO
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoPrecio, setNuevoPrecio] = useState("");

  const PASSWORD_CORRECTA = "Fifi2026";

  useEffect(() => {
    if (autorizado) cargarDatos();
  }, [autorizado]);

  const cargarDatos = async () => {
    const { data: prodData } = await supabase.from('productos').select('*').order('id', { ascending: true });
    setProductos(prodData || []);
    const { data: ajustData } = await supabase.from('ajustes').select('abierto_manual').eq('id', 1).single();
    if (ajustData) setAbiertoManual(ajustData.abierto_manual);
  };

  const manejarLogin = (e) => {
    e.preventDefault();
    if (password === PASSWORD_CORRECTA) setAutorizado(true);
    else alert("Código incorrecto.");
  };

  const toggleEstadoLocal = async () => {
    const nuevoEstado = !abiertoManual;
    const { error } = await supabase.from('ajustes').update({ abierto_manual: nuevoEstado }).eq('id', 1);
    if (!error) {
      setAbiertoManual(nuevoEstado);
      setMensaje(nuevoEstado ? "🟢 NEGOCIO ABIERTO" : "🔴 NEGOCIO CERRADO");
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  const cambiarEstadoProducto = async (id, estadoActual) => {
    const { error } = await supabase.from('productos').update({ agotado: !estadoActual }).eq('id', id);
    if (!error) {
      setProductos(productos.map(p => p.id === id ? { ...p, agotado: !estadoActual } : p));
      setMensaje("Inventario actualizado");
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  // FUNCIÓN PARA GUARDAR EL NUEVO PRECIO
  const guardarPrecio = async (id) => {
    if (!nuevoPrecio || isNaN(nuevoPrecio)) return alert("Poné un número válido");
    
    const { error } = await supabase.from('productos').update({ precio: parseInt(nuevoPrecio) }).eq('id', id);
    
    if (!error) {
      setProductos(productos.map(p => p.id === id ? { ...p, precio: parseInt(nuevoPrecio) } : p));
      setEditandoId(null);
      setNuevoPrecio("");
      setMensaje("✅ Precio actualizado");
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  if (!autorizado) {
    return (
      <main style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#111', padding: '40px', borderRadius: '30px', border: '1px solid #222', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2 style={{ color: '#FF8C00', fontSize: '28px', fontWeight: '900', marginBottom: '30px' }}>Admin Fifi's</h2>
          <form onSubmit={manejarLogin}>
            <input type="password" placeholder="Código" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '15px', padding: '15px', color: '#fff', textAlign: 'center', outline: 'none', marginBottom: '20px' }} />
            <button type="submit" style={{ width: '100%', backgroundColor: '#FF8C00', color: '#000', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: 'bold' }}>ENTRAR</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '30px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#FF8C00', fontSize: '28px', fontWeight: '900' }}>CONTROL FIFI'S</h1>
        <button onClick={() => setAutorizado(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: '12px', textDecoration: 'underline' }}>Cerrar Sesión</button>
      </header>

      <div style={{ backgroundColor: '#111', padding: '25px', borderRadius: '25px', border: '2px solid #222', marginBottom: '30px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 15px 0', fontWeight: 'bold', color: '#777' }}>ESTADO DEL FOOD TRUCK</p>
        <button onClick={toggleEstadoLocal} style={{ width: '100%', backgroundColor: abiertoManual ? '#28a745' : '#d50000', color: '#fff', padding: '20px', borderRadius: '15px', border: 'none', fontWeight: '900', fontSize: '18px' }}>
          {abiertoManual ? '🟢 ESTAMOS ABIERTOS' : '🔴 CERRADO MANUALMENTE'}
        </button>
      </div>

      {mensaje && <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#333', padding: '10px 20px', borderRadius: '10px', zIndex: 1000, fontWeight: 'bold' }}>{mensaje}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {productos.map(p => (
          <div key={p.id} style={{ backgroundColor: '#111', padding: '20px', borderRadius: '25px', border: `1px solid ${p.agotado ? '#ff4444' : '#222'}`, display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>{p.nombre}</h3>
                <p style={{ margin: 0, color: '#FF8C00', fontWeight: 'bold' }}>C$ {p.precio}</p>
              </div>
              <button onClick={() => cambiarEstadoProducto(p.id, p.agotado)} style={{ backgroundColor: p.agotado ? '#28a745' : '#ff4444', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}>
                {p.agotado ? 'Activar' : 'Agotar'}
              </button>
            </div>

            {/* EDITOR DE PRECIO */}
            <div style={{ borderTop: '1px solid #222', paddingTop: '10px', display: 'flex', gap: '10px' }}>
              {editandoId === p.id ? (
                <>
                  <input 
                    type="number" 
                    placeholder="Nuevo precio" 
                    value={nuevoPrecio}
                    onChange={(e) => setNuevoPrecio(e.target.value)}
                    style={{ flex: 1, backgroundColor: '#1a1a1a', border: '1px solid #FF8C00', borderRadius: '10px', padding: '10px', color: '#fff' }}
                  />
                  <button onClick={() => guardarPrecio(p.id)} style={{ backgroundColor: '#FF8C00', color: '#000', padding: '10px 15px', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>💾</button>
                  <button onClick={() => setEditandoId(null)} style={{ backgroundColor: '#333', color: '#fff', padding: '10px 15px', borderRadius: '10px', border: 'none' }}>✕</button>
                </>
              ) : (
                <button 
                  onClick={() => { setEditandoId(p.id); setNuevoPrecio(p.precio); }}
                  style={{ width: '100%', background: 'none', border: '1px solid #333', color: '#777', padding: '8px', borderRadius: '10px', fontSize: '13px' }}
                >
                  ✏️ Cambiar precio
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}