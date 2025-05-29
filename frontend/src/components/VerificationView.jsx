import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./modules/AdminPanel.module.css";
import CustomButton from "./ui/CustomButton.jsx";
import { io } from "socket.io-client";
import { showAlert } from "./ui/alert.jsx";

const socket = io("/", {
  transports: ["websocket", "polling"],
  secure: true,
  withCredentials: false,
});

function VerificationView() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [imageData, setImageData] = useState({}); // State to store media data URLs

  const fetchPendingSubmissions = async () => {
    try {
      const res = await axios.get("/api/submissions/pending");
      setSubmissions(res.data);
      console.log("Kutas: ", res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Socket event handlers
    const handleImageData = (data) => {
      setImageData((prev) => ({ ...prev, [data.submissionId]: data.dataUrl }));
    };

    const handleImageError = (data) => {
      console.error(
        `Error fetching media for submission ${data.submissionId}: ${data.error}`
      );
    };

    socket.on("imageData", handleImageData);
    socket.on("imageError", handleImageError);

    // Fetch submissions on mount
    fetchPendingSubmissions();

    // Listen for new pending submissions
    socket.on("pendingSubmission", () => {
      console.log("Received new pending submission");
      fetchPendingSubmissions();
    });

    return () => {
      socket.off("imageData", handleImageData);
      socket.off("imageError", handleImageError);
      socket.off("pendingSubmission");
    };
  }, []);

  // Effect to request media data when submissions change
  useEffect(() => {
    submissions.forEach((sub) => {
      if (
        (sub.type === "photo" || sub.type === "video") &&
        !imageData[sub._id]
      ) {
        socket.emit("getImage", { submissionId: sub._id });
      }
    });
  }, [submissions, imageData]);

  const handleVerify = async (submissionId, status) => {
    try {
      await axios.post(`/api/submissions/${submissionId}/verify`, { status });
      fetchPendingSubmissions(); // Refresh submissions after verification
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
                  <strong>
                    {sub.task?.name} - {sub.group?.name}
                  </strong>
                </div>
                <div className={styles.taskDetails}>
                  {sub.type === "text" && (
                    <p>Submission: {sub.submissionData}</p>
                  )}
                  {sub.type === "photo" &&
                    (imageData[sub._id] ? (
                      <img
                        src={imageData[sub._id]}
                        alt="Submission"
                        style={{ borderRadius: "0.5rem" }}
                      />
                    ) : (
                      <p>Loading image...</p>
                    ))}
                  {sub.type === "video" &&
                    (imageData[sub._id] ? (
                      <video
                        src={imageData[sub._id]}
                        controls
                        style={{ borderRadius: "0.5rem" }}
                      />
                    ) : (
                      <p>Loading video...</p>
                    ))}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      justifyContent: "flex-end",
                    }}
                  >
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
