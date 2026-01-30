"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminPanel() {
  const [productos, setProductos] = useState([]);
  const [ventasReales, setVentasReales] = useState([]);
  const [datosGrafica, setDatosGrafica] = useState([]);
  const [autorizado, setAutorizado] = useState(false);
  const [abiertoManual, setAbiertoManual] = useState(true);
  const [tipoGrafica, setTipoGrafica] = useState('lineas');
  const [filtroTiempo, setFiltroTiempo] = useState('semana'); // 'dia', 'semana', 'mes'
  const [password, setPassword] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoPrecio, setNuevoPrecio] = useState("");

  const PASSWORD_CORRECTA = "Fifi2026";

  useEffect(() => {
    if (autorizado) {
      cargarDatos();
      cargarVentas();
    }
  }, [autorizado, filtroTiempo]);

  const cargarDatos = async () => {
    const { data: prodData } = await supabase.from('productos').select('*').order('id', { ascending: true });
    setProductos(prodData || []);
    const { data: ajustData } = await supabase.from('ajustes').select('abierto_manual').eq('id', 1).single();
    if (ajustData) setAbiertoManual(ajustData.abierto_manual);
  };

  const cargarVentas = async () => {
    // Traemos las ventas de Supabase
    const { data, error } = await supabase.from('ventas').select('*').order('created_at', { ascending: true });
    
    if (data) {
      procesarDatosGrafica(data);
    }
  };

  const procesarDatosGrafica = (ventas) => {
    const ahora = new Date();
    const mapaDatos = {};

    ventas.forEach(v => {
      const fechaVenta = new Date(v.created_at);
      let clave = "";

      if (filtroTiempo === 'dia') {
        clave = fechaVenta.toLocaleTimeString([], { hour: '2-digit', minute: '00' });
      } else if (filtroTiempo === 'semana') {
        clave = fechaVenta.toLocaleDateString('es-NI', { weekday: 'short' });
      } else {
        clave = fechaVenta.toLocaleDateString('es-NI', { day: '2-digit', month: 'short' });
      }

      mapaDatos[clave] = (mapaDatos[clave] || 0) + v.monto;
    });

    const formateados = Object.keys(mapaDatos).map(key => ({ name: key, ventas: mapaDatos[key] }));
    setDatosGrafica(formateados);
  };

  const ventaTotalHoy = datosGrafica.reduce((acc, curr) => acc + curr.ventas, 0);

  if (!autorizado) {
    return (
      <main style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#111', padding: '40px', borderRadius: '30px', border: '1px solid #222' }}>
          <h2 style={{ color: '#FF8C00', textAlign: 'center' }}>Admin Fifi's</h2>
          <form onSubmit={(e) => { e.preventDefault(); if (password === PASSWORD_CORRECTA) setAutorizado(true); }}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '10px', marginBottom: '10px' }} />
            <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#FF8C00', borderRadius: '10px' }}>ENTRAR</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px' }}>
      
      {/* SELECTOR DE TIEMPO ESTILO TRADING */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto' }}>
        {['dia', 'semana', 'mes'].map(t => (
          <button 
            key={t} 
            onClick={() => setFiltroTiempo(t)}
            style={{ 
              flex: 1, 
              padding: '10px', 
              borderRadius: '12px', 
              border: 'none', 
              backgroundColor: filtroTiempo === t ? '#FF8C00' : '#111',
              color: filtroTiempo === t ? '#000' : '#fff',
              fontWeight: 'bold',
              textTransform: 'capitalize'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* MÉTRICAS DINÁMICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '20px', border: '1px solid #222' }}>
          <p style={{ fontSize: '12px', color: '#777', margin: 0 }}>Venta Periodo</p>
          <h3 style={{ margin: '5px 0 0 0', color: '#00c853' }}>C$ {ventaTotalHoy}</h3>
        </div>
        <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '20px', border: '1px solid #222' }}>
          <p style={{ fontSize: '12px', color: '#777', margin: 0 }}>Tipo Gráfica</p>
          <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
             <button onClick={() => setTipoGrafica('lineas')} style={{ background: tipoGrafica === 'lineas' ? '#FF8C00' : '#222', border: 'none', borderRadius: '5px', flex: 1 }}>📈</button>
             <button onClick={() => setTipoGrafica('barras')} style={{ background: tipoGrafica === 'barras' ? '#FF8C00' : '#222', border: 'none', borderRadius: '5px', flex: 1 }}>📊</button>
          </div>
        </div>
      </div>

      {/* GRÁFICA REAL */}
      <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '25px', border: '1px solid #222', marginBottom: '20px' }}>
        <div style={{ width: '100%', height: 220 }}>
          {datosGrafica.length > 0 ? (
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
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Sin ventas registradas</div>
          )}
        </div>
      </div>

      {/* ... El resto del código de productos (Switch y Lista) se mantiene igual ... */}
    </div>
  );
}