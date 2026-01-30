"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
// Importamos una librería ligera para gráficas (asegurate de correr: npm install recharts)
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminPanel() {
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [password, setPassword] = useState('');
  const [autorizado, setAutorizado] = useState(false);
  const [abiertoManual, setAbiertoManual] = useState(true);
  const [tipoGrafica, setTipoGrafica] = useState('lineas'); // 'lineas' o 'barras'
  const [filtroTiempo, setFiltroTiempo] = useState('dia'); // 'dia', 'semana', 'mes'

  // Datos de ejemplo estilo Trading (Esto se conectará a tu tabla 'ventas')
  const datosGrafica = [
    { name: 'Lun', ventas: 1200 },
    { name: 'Mar', ventas: 1800 },
    { name: 'Mie', ventas: 1100 },
    { name: 'Jue', ventas: 2500 },
    { name: 'Vie', ventas: 3800 },
    { name: 'Sab', ventas: 4500 },
    { name: 'Dom', ventas: 3200 },
  ];

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
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#FF8C00', fontSize: '24px', fontWeight: '900' }}>DASHBOARD FIFI'S</h1>
      </header>

      {/* TARJETAS DE MÉTRICAS RÁPIDAS */}
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

      {/* GRÁFICA ESTILO TRADING */}
      <div style={{ backgroundColor: '#111', padding: '20px', borderRadius: '25px', border: '1px solid #222', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <select 
            value={filtroTiempo} 
            onChange={(e) => setFiltroTiempo(e.target.value)}
            style={{ backgroundColor: '#000', color: '#fff', border: '1px solid #333', padding: '5px', borderRadius: '10px', fontSize: '12px' }}
          >
            <option value="dia">Día</option>
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
          </select>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button onClick={() => setTipoGrafica('lineas')} style={{ backgroundColor: tipoGrafica === 'lineas' ? '#FF8C00' : '#222', border: 'none', borderRadius: '5px', padding: '5px 10px', color: '#000', fontWeight: 'bold' }}>📈</button>
            <button onClick={() => setTipoGrafica('barras')} style={{ backgroundColor: tipoGrafica === 'barras' ? '#FF8C00' : '#222', border: 'none', borderRadius: '5px', padding: '5px 10px', color: '#000', fontWeight: 'bold' }}>📊</button>
          </div>
        </div>

        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            {tipoGrafica === 'lineas' ? (
              <LineChart data={datosGrafica}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#555" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                <Line type="monotone" dataKey="ventas" stroke="#FF8C00" strokeWidth={3} dot={{ fill: '#FF8C00' }} />
              </LineChart>
            ) : (
              <BarChart data={datosGrafica}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#555" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                <Bar dataKey="ventas" fill="#FF8C00" radius={[5, 5, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* El resto de tu código de productos sigue aquí abajo... */}
    </div>
  );
}