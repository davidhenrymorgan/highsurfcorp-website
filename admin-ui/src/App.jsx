import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import EditPost from "./pages/EditPost";

function App() {
  return (
    <Router basename="/admin">
      <Routes>
        {/* Dashboard Route (Wrapped in Sidebar Layout) */}
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        {/* Editor Route (Standalone, Full Screen) */}
        <Route path="/edit/:id" element={<EditPost />} />
      </Routes>
    </Router>
  );
}

export default App;
