#!/usr/bin/env node
/**
 * Script de prueba para verificar el Backend Warmer
 * Ejecutar con: node test-warmer.js
 */

const https = require('https');
const http = require('http');

// Configuración
const BACKEND_URL = process.env.BACKEND_HEALTH || 'http://localhost:8000/healthz';
const VERCEL_FUNCTION_URL = process.env.VERCEL_FUNCTION_URL || 'http://localhost:3000/api/warm';

/**
 * Realiza una petición HTTP/HTTPS
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

/**
 * Prueba el endpoint de health check del backend
 */
async function testBackendHealth() {
  console.log('\n🔍 Probando Backend Health Check...');
  console.log(`URL: ${BACKEND_URL}`);
  
  try {
    const result = await makeRequest(BACKEND_URL);
    
    if (result.status === 200) {
      console.log('✅ Backend Health Check: OK');
      console.log('📊 Respuesta:', JSON.stringify(result.data, null, 2));
      return true;
    } else {
      console.log(`❌ Backend Health Check: HTTP ${result.status}`);
      console.log('📊 Respuesta:', result.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend Health Check: Error');
    console.log('🚨 Error:', error.message);
    return false;
  }
}

/**
 * Prueba la Vercel Function
 */
async function testVercelFunction() {
  console.log('\n🔍 Probando Vercel Function...');
  console.log(`URL: ${VERCEL_FUNCTION_URL}`);
  
  try {
    const result = await makeRequest(VERCEL_FUNCTION_URL);
    
    if (result.status === 200) {
      console.log('✅ Vercel Function: OK');
      console.log('📊 Respuesta:', JSON.stringify(result.data, null, 2));
      
      // Verificar estructura de respuesta
      if (result.data.ok !== undefined) {
        console.log('✅ Estructura de respuesta: Válida');
        
        if (result.data.skipped) {
          console.log('ℹ️  Ping omitido (fuera de horario laboral)');
        } else if (result.data.status === 'healthy') {
          console.log('✅ Backend reportado como saludable');
        } else {
          console.log('⚠️  Backend reportado como no saludable');
        }
      } else {
        console.log('❌ Estructura de respuesta: Inválida');
      }
      
      return true;
    } else {
      console.log(`❌ Vercel Function: HTTP ${result.status}`);
      console.log('📊 Respuesta:', result.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Vercel Function: Error');
    console.log('🚨 Error:', error.message);
    return false;
  }
}

/**
 * Muestra información de horario actual
 */
function showTimeInfo() {
  console.log('\n🕐 Información de Horario:');
  
  const now = new Date();
  console.log(`UTC: ${now.toISOString()}`);
  
  // Simular la lógica de zona horaria de la función
  try {
    const chileTime = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(now);

    const year = parseInt(chileTime.find(part => part.type === 'year')?.value || '0');
    const month = parseInt(chileTime.find(part => part.type === 'month')?.value || '0') - 1;
    const day = parseInt(chileTime.find(part => part.type === 'day')?.value || '0');
    const hour = parseInt(chileTime.find(part => part.type === 'hour')?.value || '0');
    const minute = parseInt(chileTime.find(part => part.type === 'minute')?.value || '0');

    const chileDate = new Date(year, month, day, hour, minute);
    const dayOfWeek = chileDate.getDay();
    
    console.log(`Chile (America/Santiago): ${chileDate.toLocaleString('es-CL')}`);
    
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    console.log(`Día de la semana: ${dayNames[dayOfWeek]} (${dayOfWeek})`);
    
    const isWorkDay = dayOfWeek >= 1 && dayOfWeek <= 5;
    const currentMinutes = hour * 60 + minute;
    const startMinutes = 8 * 60; // 08:00
    const endMinutes = 17 * 60 + 30; // 17:30
    const isWorkHour = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    
    console.log(`¿Día hábil? ${isWorkDay ? '✅ Sí' : '❌ No'}`);
    console.log(`¿Horario laboral? ${isWorkHour ? '✅ Sí' : '❌ No'} (08:00-17:30)`);
    console.log(`¿Debería hacer ping? ${isWorkDay && isWorkHour ? '✅ Sí' : '❌ No'}`);
    
  } catch (error) {
    console.log('❌ Error calculando horario de Chile:', error.message);
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Backend Warmer - Script de Prueba');
  console.log('=====================================');
  
  showTimeInfo();
  
  const backendOk = await testBackendHealth();
  const vercelOk = await testVercelFunction();
  
  console.log('\n📋 Resumen:');
  console.log(`Backend Health: ${backendOk ? '✅' : '❌'}`);
  console.log(`Vercel Function: ${vercelOk ? '✅' : '❌'}`);
  
  if (backendOk && vercelOk) {
    console.log('\n🎉 ¡Todo funcionando correctamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Configurar BACKEND_HEALTH en Vercel');
    console.log('2. Desplegar a producción');
    console.log('3. Verificar logs en Vercel Dashboard');
    process.exit(0);
  } else {
    console.log('\n🚨 Hay problemas que resolver antes del despliegue');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testBackendHealth, testVercelFunction, showTimeInfo };