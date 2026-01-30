"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminPanel() {
  const [productos, setProductos] = useState([]);
  const [datosGrafica, setDatosGrafica] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [password, setPassword] = useState('');
  const [autorizado, setAutorizado] = useState(false);
  const [abiertoManual, setAbiertoManual] = useState(true);
  const [tipoGrafica, setTipoGrafica] = useState('lineas');
  const [filtroTiempo, setFiltroTiempo] = useState('semana');

  const [editandoId, setEditandoId] = useState(null);
  const [formEdit, setFormEdit] = useState({ precio: "", desc: "", imagen: "" });

  const PASSWORD_CORRECTA = "Fifi2026";
  const categorias = ['Hamburguesas', 'Pollo', 'Salchipapas', 'Antojos', 'Bebidas'];

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
    const { data } = await supabase.from('ventas').select('*').order('created_at', { ascending: true });
    if (data) {
      const mapaDatos = {};
      data.forEach(v => {
        const fechaVenta = new Date(v.created_at);
        let clave = "";
        if (filtroTiempo === 'dia') clave = fechaVenta.toLocaleTimeString([], { hour: '2-digit', minute: '00' });
        else if (filtroTiempo === 'semana') clave = fechaVenta.toLocaleDateString('es-NI', { weekday: 'short' });
        else clave = fechaVenta.toLocaleDateString('es-NI', { day: '2-digit', month: 'short' });
        mapaDatos[clave] = (mapaDatos[clave] || 0) + v.monto;
      });
      setDatosGrafica(Object.keys(mapaDatos).map(key => ({ name: key, ventas: mapaDatos[key] })));
    }
  };

  const toggleCategoriaCompleta = async (cat) => {
    const productosCat = productos.filter(p => p.categoria === cat);
    const algunoActivo = productosCat.some(p => !p.agotado);
    const nuevoEstado = algunoActivo; 

    const { error } = await supabase.from('productos').update({ agotado: nuevoEstado }).eq('categoria', cat);
    if (!error) {
      setProductos(productos.map(p => p.categoria === cat ? { ...p, agotado: nuevoEstado } : p));
      setMensaje(`${cat}: ${nuevoEstado ? '🔴 APAGADA' : '🟢 ENCENDIDA'}`);
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  const cambiarEstadoProducto = async (id, estadoActual) => {
    const { error } = await supabase.from('productos').update({ agotado: !estadoActual }).eq('id', id);
    if (!error) {
      setProductos(productos.map(p => p.id === id ? { ...p, agotado: !estadoActual } : p));
      setMensaje("Producto actualizado");
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  const guardarCambios = async (id) => {
    const { error } = await supabase.from('productos').update({ 
      precio: parseInt(formEdit.precio),
      desc: formEdit.desc,
      imagen: formEdit.imagen
    }).eq('id', id);

    if (!error) {
      setProductos(productos.map(p => p.id === id ? { ...p, ...formEdit, precio: parseInt(formEdit.precio) } : p));
      setEditandoId(null);
      setMensaje("✅ Cambios guardados");
      setTimeout(() => setMensaje(""), 2000);
    }
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

  const ventaTotalPeriodo = datosGrafica.reduce((acc, curr) => acc + curr.ventas, 0);

  if (!autorizado) {
    return (
      <main style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#111', padding: '40px', borderRadius: '30px', border: '1px solid #222', textAlign: 'center' }}>
          <h2 style={{ color: '#FF8C00', marginBottom: '20px' }}>ADMIN FIFI'S</h2>
          <form onSubmit={(e) => { e.preventDefault(); if (password === PASSWORD_CORRECTA) setAutorizado(true); }}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '15px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #333' }} placeholder="Código" />
            <button type="submit" style={{ width: '100%', marginTop: '10px', padding: '15px', borderRadius: '15px', backgroundColor: '#FF8C00', fontWeight: 'bold' }}>ENTRAR</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px', paddingBottom: '100px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ color: '#FF8C00', fontSize: '18px', fontWeight: '900' }}>FIFI'S CONTROL HUB</h1>
        <button onClick={() => setAutorizado(false)} style={{ color: '#555', border: 'none', background: 'none' }}>Salir</button>
      </header>

      {/* DASHBOARD COMPLETO RE-ESTABLECIDO */}
      <div style={{ backgroundColor: '#111', padding: '20px', borderRadius: '25px', border: '1px solid #222', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['dia', 'semana', 'mes'].map(t => (
            <button key={t} onClick={() => setFiltroTiempo(t)} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', backgroundColor: filtroTiempo === t ? '#FF8C00' : '#222', color: filtroTiempo === t ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px' }}>{t.toUpperCase()}</button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '15px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#777', margin: 0 }}>Venta Total ({filtroTiempo})</p>
            <h3 style={{ color: '#00c853', margin: 0, fontSize: '22px' }}>C$ {ventaTotalPeriodo}</h3>
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button onClick={() => setTipoGrafica('lineas')} style={{ background: tipoGrafica === 'lineas' ? '#FF8C00' : '#222', border: 'none', borderRadius: '8px', padding: '8px 12px', color: tipoGrafica === 'lineas' ? '#000' : '#fff' }}>📈</button>
            <button onClick={() => setTipoGrafica('barras')} style={{ background: tipoGrafica === 'barras' ? '#FF8C00' : '#222', border: 'none', borderRadius: '8px', padding: '8px 12px', color: tipoGrafica === 'barras' ? '#000' : '#fff' }}>📊</button>
          </div>
        </div>

        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer>
            {tipoGrafica === 'lineas' ? (
              <LineChart data={datosGrafica}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#555" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                <Line type="monotone" dataKey="ventas" stroke="#FF8C00" strokeWidth={3} dot={false} />
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

      {/* CATEGORÍAS */}
      <h3 style={{ fontSize: '13px', color: '#777', marginBottom: '10px' }}>Control de Categorías</h3>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '10px' }}>
        {categorias.map(cat => {
          const estaApagada = productos.filter(p => p.categoria === cat).every(p => p.agotado);
          return (
            <button key={cat} onClick={() => toggleCategoriaCompleta(cat)} style={{ backgroundColor: estaApagada ? '#330000' : '#003300', border: `1px solid ${estaApagada ? '#ff4444' : '#00c853'}`, color: '#fff', padding: '10px 15px', borderRadius: '15px', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 'bold' }}>
              {estaApagada ? `❌ ${cat}` : `✅ ${cat}`}
            </button>
          );
        })}
      </div>

      <button onClick={toggleEstadoLocal} style={{ width: '100%', backgroundColor: abiertoManual ? '#28a745' : '#d50000', color: '#fff', padding: '15px', borderRadius: '15px', fontWeight: 'bold', border: 'none', marginBottom: '20px' }}>
        {abiertoManual ? '🟢 LOCAL ABIERTO' : '🔴 LOCAL CERRADO'}
      </button>

      {mensaje && <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FF8C00', color: '#000', padding: '10px 20px', borderRadius: '15px', fontWeight: 'bold', zIndex: 2000 }}>{mensaje}</div>}

      {/* LISTA DE PRODUCTOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {productos.map(p => (
          <div key={p.id} style={{ backgroundColor: '#111', padding: '15px', borderRadius: '25px', border: `1px solid ${p.agotado ? '#ff4444' : '#222'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <img src={p.imagen} style={{ width: '45px', height: '45px', borderRadius: '10px', objectFit: 'cover', opacity: p.agotado ? 0.3 : 1 }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px' }}>{p.nombre}</h4>
                  <p style={{ margin: 0, color: '#FF8C00', fontSize: '12px', fontWeight: 'bold' }}>C$ {p.precio}</p>
                </div>
              </div>
              <button onClick={() => cambiarEstadoProducto(p.id, p.agotado)} style={{ backgroundColor: p.agotado ? '#28a745' : '#333', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                {p.agotado ? 'ACTIVAR' : 'AGOTAR'}
              </button>
            </div>

            {editandoId === p.id ? (
              <div style={{ marginTop: '15px', borderTop: '1px solid #222', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="number" value={formEdit.precio} onChange={(e) => setFormEdit({...formEdit, precio: e.target.value})} style={{ backgroundColor: '#000', border: '1px solid #333', padding: '10px', borderRadius: '10px', color: '#fff' }} placeholder="Precio" />
                <textarea value={formEdit.desc} onChange={(e) => setFormEdit({...formEdit, desc: e.target.value})} style={{ backgroundColor: '#000', border: '1px solid #333', padding: '10px', borderRadius: '10px', color: '#fff', minHeight: '60px' }} placeholder="Descripción" />
                <input type="text" value={formEdit.imagen} onChange={(e) => setFormEdit({...formEdit, imagen: e.target.value})} style={{ backgroundColor: '#000', border: '1px solid #333', padding: '10px', borderRadius: '10px', color: '#fff' }} placeholder="URL Imagen" />
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => guardarCambios(p.id)} style={{ flex: 1, backgroundColor: '#FF8C00', color: '#000', padding: '10px', borderRadius: '10px', fontWeight: 'bold' }}>GUARDAR</button>
                  <button onClick={() => setEditandoId(null)} style={{ flex: 1, backgroundColor: '#222', color: '#fff', padding: '10px', borderRadius: '10px' }}>CANCELAR</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setEditandoId(p.id); setFormEdit({ precio: p.precio, desc: p.desc, imagen: p.imagen }); }} style={{ width: '100%', background: 'none', border: '1px solid #222', color: '#555', padding: '8px', borderRadius: '10px', fontSize: '11px', marginTop: '10px' }}>
                ⚙️ EDITAR DETALLES
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}