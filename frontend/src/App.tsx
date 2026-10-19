import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProdutosPage from "./pages/ProdutosPage";
import PedidoPage from "./pages/PedidoPage";
import PedidosPage from "./pages/PedidosPage";
import ProducaoPage from "./pages/ProducaoPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import VendasPage from "./pages/VendasPage";
import HomePage from "./pages/HomePage";

import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function RotaInicial() {
  const token = localStorage.getItem("dgc_admin_token");

  if (token) {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/pedido" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página inicial */}
        <Route path="/" element={<HomePage />} />

        {/* Área pública */}
        <Route path="/pedido" element={<PedidoPage />} />

        {/* Login administrativo */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Área administrativa protegida */}
        <Route element={<ProtectedRoute />}>

        <Route path="/admin/vendas" element={<VendasPage />}
        />
          <Route path="/admin" element={<DashboardPage />} />

          <Route path="/admin/produtos" element={<ProdutosPage />} />

          <Route path="/admin/pedidos" element={<PedidosPage />} />

          <Route path="/admin/producao" element={<ProducaoPage />} />
        </Route>

        {/* Qualquer endereço inválido */}
        <Route path="*" element={<RotaInicial />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
