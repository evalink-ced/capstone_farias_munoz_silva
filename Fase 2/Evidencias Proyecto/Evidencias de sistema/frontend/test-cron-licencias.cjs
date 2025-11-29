/**
 * Script de prueba para el cron de licencias
 * Prueba directamente contra el backend Django
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const CRON_TOKEN = process.env.CRON_TOKEN || 'test-token-123';

async function testCronLicencias() {
  console.log('🧪 Probando endpoint de cron de licencias directamente en backend...');
  console.log(`🔗 Backend: ${BACKEND_URL}`);
  console.log(`🔑 CRON_TOKEN: ${CRON_TOKEN}`);
  console.log('\n' + '='.repeat(50) + '\n');

  try {
    const backendUrl = `${BACKEND_URL}/licencia/internal/cron/enviar_correos/`;
    console.log(`📍 URL: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CRON-TOKEN': CRON_TOKEN,
      },
    });

    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Response:`);
    console.log(JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Prueba exitosa!');
    } else {
      console.log('\n⚠️ Respuesta con advertencias');
    }
    
  } catch (error) {
    console.error('\n❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testCronLicencias();

console.log('\n📝 Notas:');
console.log('- Asegúrate de que el backend esté corriendo en el puerto 8000');
console.log('- Asegúrate de que el frontend esté corriendo en el puerto 5173');
console.log('- Configura las variables de entorno CRON_TOKEN y CRON_SECRET');
console.log('- El backend validará días hábiles chilenos automáticamente');
console.log('\n🕐 Horarios programados en Vercel:');
console.log('- 12:00 UTC (9:00 AM Chile en verano, 8:00 AM en invierno)');
console.log('- 17:00 UTC (2:00 PM Chile en verano, 1:00 PM en invierno)');
console.log('- Solo lunes a viernes (1-5)');