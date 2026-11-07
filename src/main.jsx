import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import EventPage from './pages/EventPage.jsx';
import Passes from './pages/Passes.jsx';
import Calendar from './pages/Calendar.jsx';
import Cities from './pages/Cities.jsx';
import City from './pages/City.jsx';
import Host from './pages/Host.jsx';
import About from './pages/About.jsx';
import NotFound from './pages/NotFound.jsx';
import './styles/base.css';

// Hash URLs (#/events/…) work on any static host, including GitHub Pages, with no server config.
const router = createHashRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'events/:id', Component: EventPage },
      { path: 'passes', Component: Passes },
      { path: 'calendar', Component: Calendar },
      { path: 'cities', Component: Cities },
      { path: 'cities/:slug', Component: City },
      { path: 'host', Component: Host },
      { path: 'about', Component: About },
      { path: '*', Component: NotFound },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
