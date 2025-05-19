import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./modules/AdminPanel.module.css";
import CustomButton from "./ui/CustomButton.jsx";
import { io } from "socket.io-client";
import {showAlert} from "./ui/alert.jsx";

const socket = io("http://localhost:5000");

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

  useEffect(() => {
    fetchPendingSubmissions();

    socket.on("pendingSubmission", () => {
      console.log("Received new pending submission");
      fetchPendingSubmissions();
    });

    return () => {
      socket.off("pendingSubmission");
    };
  }, []);

  const handleVerify = async (submissionId, status) => {
    try {
      await axios.post(`/api/submissions/${submissionId}/verify`, { status });
      fetchPendingSubmissions();
    } catch (err) {
      console.error(err);
      showAlert("Error verifying submission");
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
              submissions.map((sub) => (
                    <div key={sub._id} className={styles.adminTaskCard}>
                      <div className={styles.taskHeader}>
                        <strong>{sub.task?.name} - {sub.group?.name}</strong>
                      </div>
                      <div className={styles.taskDetails}>
                        {sub.type === "text" && <p>Submission: {sub.submissionData}</p>}
                        {sub.type === "photo" && (
                            <img
                                src={`${BACKEND_URL}/${sub.submissionData}`}
                                alt="Submission"
                                style={{ borderRadius: "0.5rem"}}
                            />
                        )}
                        {sub.type === "video" && (
                            <video
                                src={`${BACKEND_URL}/${sub.submissionData}`}
                                controls
                                style={{ borderRadius: "0.5rem"}}
                            />
                        )}
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <CustomButton
                              variant={"outline"}
                              onClick={() => handleVerify(sub._id, "approved")}
                          >
                            Approve
                          </CustomButton>
                          <CustomButton
                              variant={"warning"}
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