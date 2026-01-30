"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminPanel() {
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [password, setPassword] = useState('');
  const [autorizado, setAutorizado] = useState(false);
  const [abiertoManual, setAbiertoManual] = useState(true);
  const [tipoGrafica, setTipoGrafica] = useState('lineas');
  const [filtroTiempo, setFiltroTiempo] = useState('semana');

  // ESTADOS PARA EDICIÓN DE PRECIO
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoPrecio, setNuevoPrecio] = useState("");

  const PASSWORD_CORRECTA = "Fifi2026";

  // Datos de ejemplo estilo Trading
  const datosGrafica = [
    { name: 'Lun', ventas: 1200 },
    { name: 'Mar', ventas: 1800 },
    { name: 'Mie', ventas: 1100 },
    { name: 'Jue', ventas: 2500 },
    { name: 'Vie', ventas: 3800 },
    { name: 'Sab', ventas: 4500 },
    { name: 'Dom', ventas: 3200 },
  ];

  useEffect(() => {
    if (autorizado) cargarDatos();
  }, [autorizado]);

  const cargarDatos = async () => {
    const { data: prodData } = await supabase.from('productos').select('*').order('id', { ascending: true });
    setProductos(prodData || []);
    const { data: ajustData } = await supabase.from('ajustes').select('abierto_manual').eq('id', 1).single();
    if (ajustData) setAbiertoManual(ajustData.abierto_manual);
  };

  const toggleEstadoLocal = async () => {
    const nuevoEstado = !abiertoManual;
    const { error } = await supabase.from('ajustes').update({ abierto_manual: nuevoEstado }).eq('id', 1);
    if (!error) {
      setAbiertoManual(nuevoEstado);
      setMensaje(nuevoEstado ? "🟢 ABIERTO" : "🔴 CERRADO");
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

  const guardarPrecio = async (id) => {
    const { error } = await supabase.from('productos').update({ precio: parseInt(nuevoPrecio) }).eq('id', id);
    if (!error) {
      setProductos(productos.map(p => p.id === id ? { ...p, precio: parseInt(nuevoPrecio) } : p));
      setEditandoId(null);
      setMensaje("✅ Precio actualizado");
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  if (!autorizado) {
    return (
      <main style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#111', padding: '40px', borderRadius: '30px', border: '1px solid #222', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2 style={{ color: '#FF8C00', fontSize: '28px', fontWeight: '900', marginBottom: '30px' }}>Admin Fifi's</h2>
          <form onSubmit={(e) => { e.preventDefault(); if (password === PASSWORD_CORRECTA) setAutorizado(true); else alert("Error"); }}>
            <input type="password" placeholder="Código" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '15px', padding: '15px', color: '#fff', textAlign: 'center', outline: 'none', marginBottom: '20px' }} />
            <button type="submit" style={{ width: '100%', backgroundColor: '#FF8C00', color: '#000', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: 'bold' }}>ENTRAR</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px', paddingBottom: '100px' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#FF8C00', fontSize: '20px', fontWeight: '900' }}>DASHBOARD FIFI'S</h1>
        <button onClick={() => setAutorizado(false)} style={{ background: 'none', border: 'none', color: '#555', textDecoration: 'underline', fontSize: '12px' }}>Cerrar</button>
      </header>

      {/* MÉTRICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '20px', border: '1px solid #222' }}>
          <p style={{ fontSize: '12px', color: '#777', margin: 0 }}>Venta Hoy</p>
          <h3 style={{ margin: '5px 0 0 0', color: '#00c853' }}>C$ 3,200</h3>
        </div>
        <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '20px', border: '1px solid #222' }}>
          <p style={{ fontSize: '12px', color: '#777', margin: 0 }}>Pedidos</p>
          <h3 style={{ margin: '5px 0 0 0', color: '#FF8C00' }}>14</h3>
        </div>
      </div>

      {/* GRÁFICA */}
      <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '25px', border: '1px solid #222', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button onClick={() => setTipoGrafica('lineas')} style={{ background: tipoGrafica === 'lineas' ? '#FF8C00' : '#222', border: 'none', borderRadius: '8px', padding: '5px 12px' }}>📈</button>
            <button onClick={() => setTipoGrafica('barras')} style={{ background: tipoGrafica === 'barras' ? '#FF8C00' : '#222', border: 'none', borderRadius: '8px', padding: '5px 12px' }}>📊</button>
          </div>
        </div>
        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer>
            {tipoGrafica === 'lineas' ? (
              <LineChart data={datosGrafica}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#555" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                <Line type="monotone" dataKey="ventas" stroke="#FF8C00" strokeWidth={3} dot={{ fill: '#FF8C00' }} />
              </LineChart>
            ) : (
              <BarChart data={datosGrafica}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#555" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                <Bar dataKey="ventas" fill="#FF8C00" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* SWITCH MAESTRO */}
      <div style={{ backgroundColor: '#111', padding: '20px', borderRadius: '25px', border: '2px solid #222', marginBottom: '20px', textAlign: 'center' }}>
        <button onClick={toggleEstadoLocal} style={{ width: '100%', backgroundColor: abiertoManual ? '#28a745' : '#d50000', color: '#fff', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: '900' }}>
          {abiertoManual ? '🟢 LOCAL ABIERTO' : '🔴 LOCAL CERRADO'}
        </button>
      </div>

      {mensaje && <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#333', padding: '10px 20px', borderRadius: '10px', zIndex: 1000 }}>{mensaje}</div>}

      {/* LISTA DE PRODUCTOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {productos.map(p => (
          <div key={p.id} style={{ backgroundColor: '#111', padding: '15px', borderRadius: '20px', border: `1px solid ${p.agotado ? '#ff4444' : '#222'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px' }}>{p.nombre}</h3>
                <p style={{ margin: 0, color: '#FF8C00', fontWeight: 'bold', fontSize: '14px' }}>C$ {p.precio}</p>
              </div>
              <button onClick={() => cambiarEstadoProducto(p.id, p.agotado)} style={{ backgroundColor: p.agotado ? '#28a745' : '#ff4444', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                {p.agotado ? 'Activar' : 'Agotar'}
              </button>
            </div>
            <div style={{ marginTop: '10px', borderTop: '1px solid #222', paddingTop: '10px' }}>
              {editandoId === p.id ? (
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input type="number" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} style={{ flex: 1, backgroundColor: '#000', border: '1px solid #FF8C00', borderRadius: '8px', padding: '8px', color: '#fff' }} />
                  <button onClick={() => guardarPrecio(p.id)} style={{ backgroundColor: '#FF8C00', color: '#000', padding: '8px', borderRadius: '8px', border: 'none' }}>💾</button>
                  <button onClick={() => setEditandoId(null)} style={{ backgroundColor: '#333', color: '#fff', padding: '8px', borderRadius: '8px', border: 'none' }}>✕</button>
                </div>
              ) : (
                <button onClick={() => { setEditandoId(p.id); setNuevoPrecio(p.precio); }} style={{ width: '100%', background: 'none', border: '1px solid #222', color: '#555', padding: '5px', borderRadius: '8px', fontSize: '12px' }}>✏️ Editar Precio</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}