import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { exec } from 'child_process'

const killPort = (port: number) => {
  const command = process.platform === 'win32' 
    ? `netstat -ano | findstr :${port} | findstr LISTENING` 
    : `lsof -i :${port} | grep LISTEN | awk '{print $2}'`;
  
  exec(command, (err, stdout) => {
    if (stdout) {
      const lines = stdout.trim().split('\n');
      const pid = lines[0]?.trim().split(/\s+/).pop();
      if (pid) {
        const killCommand = process.platform === 'win32' 
          ? `taskkill /F /PID ${pid}`
          : `kill -9 ${pid}`;
        exec(killCommand, (killErr) => {
          if (killErr) {
            console.error(`Failed to kill process on port ${port}:`, killErr);
          } else {
            console.log(`Successfully killed process ${pid} on port ${port}`);
          }
        });
      }
    }
  });
};

// Kill port 5180 on startup to prevent conflicts
killPort(5180);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: false, // Allow fallback to another port if 5180 is busy
    host: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})