import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import EditPost from "./pages/EditPost";
import Intelligence from "./pages/Intelligence";
import Posts from "./pages/Posts";
import Leads from "./pages/Leads";

function App() {
  return (
    <Router basename="/admin">
      <Routes>
        {/* Dashboard Route */}
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        {/* Posts Management */}
        <Route
          path="/posts"
          element={
            <Layout>
              <Posts />
            </Layout>
          }
        />

        {/* Leads Management */}
        <Route
          path="/leads"
          element={
            <Layout>
              <Leads />
            </Layout>
          }
        />

        {/* Intelligence Route */}
        <Route
          path="/intelligence"
          element={
            <Layout>
              <Intelligence />
            </Layout>
          }
        />

        {/* Editor Route (Standalone) */}
        <Route path="/edit/:id" element={<EditPost />} />
      </Routes>
    </Router>
  );
}

export default App;
