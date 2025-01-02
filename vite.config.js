import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    hmr: {
      host: '26.195.122.104', // Reemplaza <radmin-vpn-ip> con tu IP de Radmin VPN
      port: 5173,
      protocol: 'ws',
    },
  },
})
