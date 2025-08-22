import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { seedInitialMaterials } from '@/seed/seedMaterials'

async function bootstrap() {
  try {
    await seedInitialMaterials();
  } catch {}
}

bootstrap();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
