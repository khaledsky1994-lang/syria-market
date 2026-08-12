import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/listing/:id" element={<ListingDetailPage />} />
          <Route path="/create" element={<CreateListingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
