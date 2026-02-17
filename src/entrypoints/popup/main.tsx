import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter, createHashHistory } from '@tanstack/react-router'

import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';

import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree, history: createHashHistory() })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <MantineProvider defaultColorScheme='dark'>
        <RouterProvider router={router} />
      </MantineProvider>
    </StrictMode>,
  )
} 