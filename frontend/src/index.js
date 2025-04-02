import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/bootstrap.custom.css';
import './assets/styles/index.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import LandingLayout from './components/LandingLayout';
import AuthWrapper from './components/AuthWrapper';
import PublicRoute from './components/PublicRoute';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import HomeScreen from './screens/HomeScreen';
import LandingScreen from './screens/LandingScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ShippingScreen from './screens/ShippingScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import ProfileScreen from './screens/ProfileScreen';
import OrderListScreen from './screens/admin/OrderListScreen';
import ProductListScreen from './screens/admin/ProductListScreen';
import ProductEditScreen from './screens/admin/ProductEditScreen';
import UserListScreen from './screens/admin/UserListScreen';
import UserEditScreen from './screens/admin/UserEditScreen';
import CollectionScreen from './screens/CollectionScreen';
import CollectionListScreen from './screens/admin/CollectionListScreen';
import CollectionEditScreen from './screens/admin/CollectionEditScreen';
import store from './store';
import { Provider } from 'react-redux';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Landing page without header and footer - only for non-authenticated users */}
      <Route path='/' element={<LandingLayout />}>
        <Route element={<PublicRoute />}>
          <Route index={true} element={<LandingScreen />} />
          <Route path='/login' element={<LoginScreen />} />
          <Route path='/register' element={<RegisterScreen />} />
        </Route>
      </Route>

      {/* Main app with header and footer - requires authentication */}
      <Route element={<App />}>
        <Route element={<AuthWrapper />}>
          <Route path='/home' element={<HomeScreen />} />
          <Route path='/search/:keyword' element={<HomeScreen />} />
          <Route path='/page/:pageNumber' element={<HomeScreen />} />
          <Route
            path='/search/:keyword/page/:pageNumber'
            element={<HomeScreen />}
          />
          <Route path='/product/:id' element={<ProductScreen />} />
          <Route path='/cart' element={<CartScreen />} />
          <Route path='/collections/:id' element={<CollectionScreen />} />

          {/* Already protected routes for registered users */}
          <Route path='' element={<PrivateRoute />}>
            <Route path='/shipping' element={<ShippingScreen />} />
            <Route path='/payment' element={<PaymentScreen />} />
            <Route path='/placeorder' element={<PlaceOrderScreen />} />
            <Route path='/order/:id' element={<OrderScreen />} />
            <Route path='/profile' element={<ProfileScreen />} />
          </Route>

          {/* Admin users */}
          <Route path='' element={<AdminRoute />}>
            <Route path='/admin/orderlist' element={<OrderListScreen />} />
            <Route path='/admin/productlist' element={<ProductListScreen />} />
            <Route
              path='/admin/productlist/:pageNumber'
              element={<ProductListScreen />}
            />
            <Route path='/admin/userlist' element={<UserListScreen />} />
            <Route
              path='/admin/product/:id/edit'
              element={<ProductEditScreen />}
            />
            <Route path='/admin/user/:id/edit' element={<UserEditScreen />} />
            <Route
              path='/admin/collectionlist'
              element={<CollectionListScreen />}
            />
            <Route
              path='/admin/collection/:id/edit'
              element={<CollectionEditScreen />}
            />
          </Route>
        </Route>
      </Route>
    </>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <PayPalScriptProvider deferLoading={true}>
          <RouterProvider router={router} />
        </PayPalScriptProvider>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);

reportWebVitals();
