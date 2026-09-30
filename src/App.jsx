import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import { NotificacoesProvider } from "./context/NotificacoesContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardShell from "./components/DashboardShell";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Pix from "./pages/Pix";
import Cartao from "./pages/Cartao";
import Extrato from "./pages/Extrato";
import Contatos from "./pages/Contatos";
import Webhooks from "./pages/Webhooks";
import Simulador from "./pages/Simulador";

export default function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <NotificacoesProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />

              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <DashboardShell>
                      <Dashboard />
                    </DashboardShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/pix"
                element={
                  <ProtectedRoute>
                    <DashboardShell>
                      <Pix />
                    </DashboardShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/contatos"
                element={
                  <ProtectedRoute>
                    <DashboardShell>
                      <Contatos />
                    </DashboardShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/cartao"
                element={
                  <ProtectedRoute>
                    <DashboardShell>
                      <Cartao />
                    </DashboardShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/extrato"
                element={
                  <ProtectedRoute>
                    <DashboardShell>
                      <Extrato />
                    </DashboardShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/webhooks"
                element={
                  <ProtectedRoute>
                    <DashboardShell>
                      <Webhooks />
                    </DashboardShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/simulador"
                element={
                  <ProtectedRoute>
                    <DashboardShell>
                      <Simulador />
                    </DashboardShell>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </NotificacoesProvider>
      </WalletProvider>
    </AuthProvider>
  );
}
