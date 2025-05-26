import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import UserPanel from "./components/UserPanel";
import VerificationView from "./components/VerificationView";
import TermsModal from "./components/ui/TermsModal";

function App() {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const isAccepted = localStorage.getItem("termsAccepted") === "true";
    setAccepted(isAccepted);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("termsAccepted", "true");
    setAccepted(true);
  };

  if (!accepted) {
    return <TermsModal onAccept={handleAccept} />;
  }

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
