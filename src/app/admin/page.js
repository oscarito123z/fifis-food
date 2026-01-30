"use client";
import React, { useState } from 'react';

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [autorizado, setAutorizado] = useState(false);
  
  // AQUÍ DEFINÍ TU CONTRASEÑA MAESTRA
  const PASSWORD_CORRECTA = "Fifi2026"; 

  const manejarLogin = (e) => {
    e.preventDefault();
    if (password === PASSWORD_CORRECTA) {
      setAutorizado(true);
    } else {
      alert("Código incorrecto, Oscar. Intenta de nuevo.");
    }
  };

  // SI NO ESTÁ AUTORIZADO, MUESTRA LA PANTALLA DE LOGIN
  if (!autorizado) {
    return (
      <main style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#111', padding: '40px', borderRadius: '30px', border: '1px solid #222', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2 style={{ color: '#FF8C00', fontSize: '28px', fontWeight: '900', marginBottom: '10px' }}>Admin Fifi's</h2>
          <p style={{ color: '#777', marginBottom: '30px', fontSize: '14px' }}>Ingresa el código de acceso para gestionar el menú.</p>
          
          <form onSubmit={manejarLogin}>
            <input 
              type="password" 
              placeholder="Código Maestro"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '15px', padding: '15px', color: '#fff', textAlign: 'center', outline: 'none', marginBottom: '20px' }}
            />
            <button type="submit" style={{ width: '100%', backgroundColor: '#FF8C00', color: '#000', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: 'bold' }}>
              ENTRAR AL PANEL
            </button>
          </form>
        </div>
      </main>
    );
  }

  // --- AQUÍ VA TODO EL CÓDIGO QUE YA TENÍAS DE TU ADMIN ---
  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      <h1>Bienvenido de nuevo, Oscar</h1>
      {/* Pegá aquí todo el return que tenías en tu admin antes */}
      <button onClick={() => setAutorizado(false)} style={{ color: 'red', marginTop: '20px' }}>Cerrar Sesión</button>
    </div>
  );
}