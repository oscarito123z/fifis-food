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

  // ESTADOS PARA EDICIÓN
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
    if (data) procesarDatosGrafica(data);
  };

  const procesarDatosGrafica = (ventas) => {
    const mapaDatos = {};
    ventas.forEach(v => {
      const fechaVenta = new Date(v.created_at);
      let clave = "";
      if (filtroTiempo === 'dia') clave = fechaVenta.toLocaleTimeString([], { hour: '2-digit', minute: '00' });
      else if (filtroTiempo === 'semana') clave = fechaVenta.toLocaleDateString('es-NI', { weekday: 'short' });
      else clave = fechaVenta.toLocaleDateString('es-NI', { day: '2-digit', month: 'short' });
      mapaDatos[clave] = (mapaDatos[clave] || 0) + v.monto;
    });
    setDatosGrafica(Object.keys(mapaDatos).map(key => ({ name: key, ventas: mapaDatos[key] })));
  };

  // DESACTIVAR CATEGORÍA ENTERA
  const toggleCategoria = async (cat, estadoActual) => {
    const { error } = await supabase.from('productos').update({ agotado: !estadoActual }).eq('categoria', cat);
    if (!error) {
      setProductos(productos.map(p => p.categoria === cat ? { ...p, agotado: !estadoActual } : p));
      setMensaje(`Categoría ${cat} ${!estadoActual ? 'AGOTADA' : 'ACTIVADA'}`);
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
      setMensaje("✅ Datos actualizados");
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

  if (!autorizado) {
    return (
      <main style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#111', padding: '40px', borderRadius: '30px', border: '1px solid #222', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2 style={{ color: '#FF8C00', fontWeight: '900', marginBottom: '30px' }}>ADMIN FIFI'S</h2>
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
      <header style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ color: '#FF8C00', fontSize: '18px', fontWeight: '900' }}>FIFI'S CONTROL HUB</h1>
        <button onClick={() => setAutorizado(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: '12px' }}>Salir</button>
      </header>

      {/* DASHBOARD GRÁFICO */}
      <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '25px', border: '1px solid #222', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
          {['dia', 'semana', 'mes'].map(t => (
            <button key={t} onClick={() => setFiltroTiempo(t)} style={{ flex: 1, padding: '8px', borderRadius: '10px', border: 'none', backgroundColor: filtroTiempo === t ? '#FF8C00' : '#222', color: filtroTiempo === t ? '#000' : '#fff', fontSize: '12px', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
          ))}
        </div>
        <div style={{ width: '100%', height: 150 }}>
          <ResponsiveContainer>
            <LineChart data={datosGrafica}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="name" stroke="#555" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
              <Line type="monotone" dataKey="ventas" stroke="#FF8C00" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CONTROL DE CATEGORÍAS */}
      <h3 style={{ fontSize: '14px', color: '#777', marginBottom: '10px' }}>Apagado Rápido (Categorías)</h3>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '25px', paddingBottom: '5px' }}>
        {categorias.map(cat => (
          <button key={cat} onClick={() => toggleCategoria(cat, false)} onDoubleClick={() => toggleCategoria(cat, true)} style={{ backgroundColor: '#111', border: '1px solid #333', color: '#fff', padding: '10px 15px', borderRadius: '15px', whiteSpace: 'nowrap', fontSize: '12px' }}>
            🚫 {cat}
          </button>
        ))}
      </div>

      <button onClick={toggleEstadoLocal} style={{ width: '100%', backgroundColor: abiertoManual ? '#28a745' : '#d50000', color: '#fff', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: '900', marginBottom: '25px' }}>
        {abiertoManual ? '🟢 LOCAL ABIERTO' : '🔴 LOCAL CERRADO'}
      </button>

      {mensaje && <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FF8C00', color: '#000', padding: '10px 20px', borderRadius: '10px', zIndex: 1000, fontWeight: 'bold' }}>{mensaje}</div>}

      {/* LISTA DE PRODUCTOS CON EDITOR COMPLETO */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {productos.map(p => (
          <div key={p.id} style={{ backgroundColor: '#111', padding: '15px', borderRadius: '25px', border: `1px solid ${p.agotado ? '#ff4444' : '#222'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editandoId === p.id ? '15px' : '0' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <img src={p.imagen} style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', opacity: p.agotado ? 0.3 : 1 }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px' }}>{p.nombre}</h4>
                  <p style={{ margin: 0, color: '#FF8C00', fontSize: '12px' }}>C$ {p.precio}</p>
                </div>
              </div>
              <button onClick={() => cambiarEstadoProducto(p.id, p.agotado)} style={{ backgroundColor: p.agotado ? '#28a745' : '#333', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                {p.agotado ? 'ACTIVAR' : 'AGOTAR'}
              </button>
            </div>

            {editandoId === p.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', borderTop: '1px solid #222', paddingTop: '15px' }}>
                <input type="number" placeholder="Precio" value={formEdit.precio} onChange={(e) => setFormEdit({...formEdit, precio: e.target.value})} style={{ backgroundColor: '#000', border: '1px solid #333', padding: '10px', borderRadius: '10px', color: '#fff' }} />
                <textarea placeholder="Descripción" value={formEdit.desc} onChange={(e) => setFormEdit({...formEdit, desc: e.target.value})} style={{ backgroundColor: '#000', border: '1px solid #333', padding: '10px', borderRadius: '10px', color: '#fff', fontSize: '12px', minHeight: '60px' }} />
                <input type="text" placeholder="URL de Imagen" value={formEdit.imagen} onChange={(e) => setFormEdit({...formEdit, imagen: e.target.value})} style={{ backgroundColor: '#000', border: '1px solid #333', padding: '10px', borderRadius: '10px', color: '#fff', fontSize: '10px' }} />
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