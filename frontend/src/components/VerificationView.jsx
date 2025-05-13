import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./modules/AdminPanel.module.css";
import CustomButton from "./ui/CustomButton.jsx";

// Define the backend URL based on the environment
const BACKEND_URL = "http://localhost:5000";

function VerificationView() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  const fetchPendingSubmissions = async () => {
    try {
      const res = await axios.get("/api/submissions/pending");
      setSubmissions(res.data);
      console.log('Kutas: ',res.data);
    } catch (err) {
      console.error(err);
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
      <div className={styles.adminForm}>
        <h2 className={styles.taskHeader}>Verification Panel</h2>
        <div className={styles.contentContainer}>
          <div className={styles.headerControls} style={{ height: "3rem" }}>
            <h2>Pending Submissions</h2>
          </div>
          <div className={styles.pendingTaskList}>
          {submissions.length === 0 ? (
                <p>No pending submissions</p>
            ) : (
                mockData.map((sub) => (
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
                                style={{maxWidth: "200px"}}
                            />
                        )}
                        {sub.type === "video" && (
                            <video
                                src={`${BACKEND_URL}/${sub.submissionData}`}
                                controls
                                style={{maxWidth: "200px"}}
                            />
                        )}
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <CustomButton
                              className={styles.button}
                              onClick={() => handleVerify(sub._id, "approved")}
                          >
                            Approve
                          </CustomButton>
                          <CustomButton
                              className={styles.button}
                              onClick={() => handleVerify(sub._id, "rejected")}
                          >
                            Reject
                          </CustomButton>
                        </div>
                      </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
  );
}

export default VerificationView;