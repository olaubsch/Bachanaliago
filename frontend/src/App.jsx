import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import UserPanel from "./components/UserPanel";
import VerificationView from "./components/VerificationView";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/" element={<UserPanel />} />
        <Route path="/admin/verification" element={<VerificationView />} />
      </Routes>
    </Router>
  );
}

export default App;
