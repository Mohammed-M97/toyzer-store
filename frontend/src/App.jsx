import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
import { useUserStore } from './stores/useUserStore';
import { useEffect } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import { useCartStore } from './stores/useCartStore';

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) getCartItems();
  }, [getCartItems, user]);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    <div className='min-h-screen bg-gray-100 text-gray-900 flex flex-col'>
      {/* Background gradient */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,1)_0%,rgba(229,229,229,1)_45%,rgba(200,200,200,1)_100%)]' />
        </div>
      </div>

      <div className="relative z-50 flex-grow pt-20">
        <Navbar />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/' />} />
          <Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' />} />
          <Route
            path='/secret-dashboard'
            element={user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />}
          />
          <Route
            path='/category/:category'
            element={<CategoryPage />}
          />
          <Route
            path='/cart'
            element={user ? <CartPage /> : <Navigate to='/login' />}
          />
        </Routes>
      </div>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;