import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, defaultSystem, Flex, Spinner } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Landing from './Landing.tsx';
import ProtectedLayout from './ProtectedLayout.tsx'

const Home = lazy(() => import('./home/Home.tsx'));
const Cards = lazy(() => import('./cards/Cards.tsx'));
const History = lazy(() => import('./history/History.tsx'));
const Login = lazy(() => import('./login/Login.tsx'));
const Register = lazy(() => import('./register/Register.tsx'));
const Groups = lazy(() => import('./groups/Groups.tsx'));
const GroupCards = lazy(() => import('./groups/GroupCards.tsx'));

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ChakraProvider value={defaultSystem}>
        <BrowserRouter>
          <Suspense fallback={
            <Flex h="100vh" alignItems="center" justifyContent="center">
              <Spinner size="xl" color="rgb(4,120,87)" />
            </Flex>
          }>
            <Routes>

              <Route path="/" element={<Landing />} />
              <Route path="/landing" element={<Landing />} />

              <Route element={<ProtectedLayout />}>
                <Route path="home" element={<Home />} />
                <Route path="/cards/:id" element={<Cards />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="history" element={<History />} />
                <Route path="groups" element={<Groups />} />
                <Route path="group-cards" element={<GroupCards />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ChakraProvider> 
    </HelmetProvider>
  </React.StrictMode>
);