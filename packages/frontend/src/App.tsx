import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Home from './pages/Home';
import './App.css';

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-xl font-bold text-gray-800">AI PowerPoint Generator</h1>
        </div>
      </Header>
      <Content className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Content>
      <Footer className="text-center">
        AI PowerPoint Generator ©2024
      </Footer>
    </Layout>
  );
}

export default App;