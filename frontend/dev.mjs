import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

console.log('Starting DisasterSim AI Frontend Dev Server...');

async function run() {
  const server = await createServer({
    configFile: false,
    root: process.cwd(),
    plugins: [react()],
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    }
  });
  await server.listen();
  console.log('DisasterSim AI Dev Server running at http://localhost:5173/');
}

run().catch(err => {
  console.error('Server error:', err);
});
