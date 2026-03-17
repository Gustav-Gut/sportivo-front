// Este script se ejecuta ANTES del build de Angular.
// Lee las variables de entorno inyectadas por Vercel y genera el archivo environment.ts.
// Las variables deben estar configuradas en: Vercel Dashboard > Settings > Environment Variables

const fs = require('fs');
const path = require('path');

const envDir = path.resolve(__dirname, '../src/environments');
const envFile = path.join(envDir, 'environment.ts');

const content = `// ARCHIVO GENERADO AUTOMÁTICAMENTE - NO EDITAR MANUALMENTE
// Generado por scripts/set-env.js durante el proceso de build

export const environment = {
    production: true,
    apiUrl: '${process.env.API_URL || ''}',
    internalApiKey: '${process.env.INTERNAL_API_KEY || ''}'
};
`;

// Crear el directorio si no existe
fs.mkdirSync(envDir, { recursive: true });

// Escribir el archivo
fs.writeFileSync(envFile, content, { encoding: 'utf8' });

console.log('✅ environment.ts generado correctamente desde variables de entorno');

// Verificar que las variables estén presentes y avisar si no
if (!process.env.API_URL) {
    console.warn('⚠️  WARNING: La variable API_URL no está definida. El apiUrl quedará vacío.');
}
if (!process.env.INTERNAL_API_KEY) {
    console.warn('⚠️  WARNING: La variable INTERNAL_API_KEY no está definida. El internalApiKey quedará vacío.');
}
