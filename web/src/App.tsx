import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CollectionProvider } from "./contexts/CollectionContext";
import { ProtectedRoute } from "./router/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import { CataloguePage } from "./pages/CataloguePage";
import { ItemDetailPage } from "./pages/ItemDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CollectionPage } from "./pages/CollectionPage";
import { StatsPage } from "./pages/StatsPage";

export default function App() {
  return (
    <AuthProvider>
      <CollectionProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<CataloguePage />} />
            <Route path="/items/:itemId" element={<ItemDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/collection"
              element={
                <ProtectedRoute>
                  <CollectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stats"
              element={
                <ProtectedRoute>
                  <StatsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </CollectionProvider>
    </AuthProvider>
  );
}
