import { createBrowserRouter } from 'react-router-dom';
import { App } from '@/app/app';
import { RequireAuth, RedirectIfAuthenticated } from '@/app/guards';
import Title from '@/Dashboard/Title';
import Login from '@/Login/Login';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <RequireAuth />,
        children: [{ path: 'main', element: <Title /> }],
      },
      {
        element: <RedirectIfAuthenticated />,
        children: [{ path: 'login', element: <Login /> }],
      },
    ],
  },
]);
