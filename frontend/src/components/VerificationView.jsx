import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./modules/AdminPanel.module.css";
import CustomButton from "./ui/CustomButton.jsx";
import { io } from "socket.io-client";
import { showAlert } from "./ui/alert.jsx";
import { useLanguage } from "../utils/LanguageContext.jsx";
import { useTranslation } from "react-i18next";

const socket = io("/", {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  secure: true,
  withCredentials: false,
});

function VerificationView() {
  const [submissions, setSubmissions] = useState([]);
  const [imageData, setImageData] = useState({}); // State to store media data URLs
  const { language } = useLanguage();
  const { t } = useTranslation();

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
      <h2 className={styles.taskHeader}>{t("verificationPanel")}</h2>
      <div className={styles.contentContainer}>
        <div className={styles.headerControls} style={{ height: "3rem" }}>
          <h2>{t("pendingSubmissions")}</h2>
        </div>
        <div className={styles.pendingTaskList}>
          {submissions.length === 0 ? (
            <p>{t("noPendingSubmissions")}</p>
          ) : (
            submissions.map((sub) => (
              <div key={sub._id} className={styles.adminTaskCard}>
                <div className={styles.taskHeader}>
                  <h2>
                    {sub.task?.name[language]} - {sub.group?.name}
                  </h2>
                </div>
                <div className={styles.taskDetails}>
                  <div className={styles.settInfo}>
                    {sub.type === "text" && <p>{sub.submissionData}</p>}
                  </div>
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
                </div>
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
                    {t("approve")}
                  </CustomButton>
                  <CustomButton
                    variant={"warning"}
                    onClick={() => handleVerify(sub._id, "rejected")}
                  >
                    {t("reject2")}
                  </CustomButton>
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
