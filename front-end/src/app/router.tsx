import { createBrowserRouter } from 'react-router-dom';
import { App } from '@/app/app';
import Title from '@/Dashboard/Title';
import Login from '@/Login/Login';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: 'main', element: <Title /> },
      { path: 'login', element: <Login /> },
    ],
  },
]);
