import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./modules/AdminPanel.module.css";

// Define the backend URL based on the environment
const BACKEND_URL = "http://localhost:5000";

function VerificationView() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [submissions, setSubmissions] = useState([]);

  const fetchPendingSubmissions = async () => {
    try {
      const res = await axios.get("/api/submissions/pending");
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = () => {
    if (password === "admin123") {
      setIsLoggedIn(true);
      fetchPendingSubmissions();
    } else {
      alert("Złe hasło");
    }
  };

  const handleVerify = async (submissionId, status) => {
    try {
      await axios.post(`/api/submissions/${submissionId}/verify`, { status });
      fetchPendingSubmissions();
    } catch (err) {
      console.error(err);
      alert("Error verifying submission");
    }
  };

  return (
    <div className={styles.adminContainer}>
      {!isLoggedIn ? (
        <div className={styles.adminForm}>
          <h2>Admin Login</h2>
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            className={styles.input}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className={styles.button} onClick={handleLogin}>
            Zaloguj
          </button>
        </div>
      ) : (
        <div className={styles.adminForm}>
          <h2 className={styles.taskHeader}>Verification Panel</h2>
          <div className={styles.rightColumn}>
            <h3 className={styles.taskHeader}>Pending Submissions</h3>
            {submissions.length === 0 ? (
              <p>No pending submissions</p>
            ) : (
              submissions.map((sub) => (
                <div key={sub._id} className={styles.adminTaskCard}>
                  <div className={styles.taskHeader}>
                    <strong>{sub.task.name} - {sub.group.name}</strong>
                  </div>
                  <div className={styles.taskDetails}>
                    <p>Type: {sub.type}</p>
                    {sub.type === "text" && <p>Submission: {sub.submissionData}</p>}
                    {sub.type === "photo" && (
                      <img
                        src={`${BACKEND_URL}/${sub.submissionData}`}
                        alt="Submission"
                        style={{ maxWidth: "200px" }}
                      />
                    )}
                    {sub.type === "video" && (
                      <video
                        src={`${BACKEND_URL}/${sub.submissionData}`}
                        controls
                        style={{ maxWidth: "200px" }}
                      />
                    )}
                    <button
                      className={styles.button}
                      onClick={() => handleVerify(sub._id, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      className={styles.button}
                      onClick={() => handleVerify(sub._id, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VerificationView;