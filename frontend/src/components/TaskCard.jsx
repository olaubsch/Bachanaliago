import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import MapElement from "./MapElement";
import QrScanner from "./QrScanner";
import axios from "axios";
import styles from "./modules/UserPanel.module.css";
import {showAlert} from "./ui/alert.jsx";
import CustomInput from "./ui/CustomInput.jsx";
import CustomButton from "./ui/CustomButton.jsx";
import CustomTextArea from "./ui/CustomTextArea.jsx";
import { useTranslation } from 'react-i18next';

export default function TaskCard({
  task,
  index,
  expandedTaskId,
  toggleTask,
  handleScanResult,
  containerRef,
  submission,
  groupCode,
  fetchSubmissions,
}) {
  const ref = useRef();
  const [text, setText] = useState("");



  const isExpanded = expandedTaskId === task._id;
  const status = submission ? submission.status : "not started";



  const handleTextSubmit = async () => {
    try {
      await axios.post(`/api/submissions/${task._id}/submit`, {
        groupCode,
        submissionData: text,
      });
      fetchSubmissions();
      setText("");
    } catch (err) {
      console.error(err);
      showAlert("Error submitting task");
    }
  };

  const handleFileSubmit = async (e, acceptType) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("groupCode", groupCode);
    try {
      await axios.post(`/api/submissions/${task._id}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      showAlert("Error submitting task");
    }
  };

  return (
    <div>
      <div onClick={() => toggleTask(task._id)} className={styles.taskHeader}>
        <h3>{task.name}</h3>
        <p>{status}</p>
      </div>

      {isExpanded && (
        <div
        >
          <div>{task.description}</div>
          <div>
            {t('location')}: ({task.location.lat}, {task.location.lng})
          </div>
          {status === "pending" ? (
            <div>{t('awaitingVerification')}</div>
          ) : (
            <>
              {task.type === "qr" && status !== "approved" && (
                <QrScanner onScanSuccess={(code) => handleScanResult(code, task._id)} />
              )}
              {task.type === "text" && status !== "approved" && (
                <div>
                  <CustomTextArea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter your answer"
                  />
                  <CustomButton width={"100%"} onClick={handleTextSubmit}>{t('submit')}</CustomButton>
                </div>
              )}
              {task.type === "photo" && status !== "approved" && (
                <div>
                  <CustomInput type="file" name="file" accept="image/*" onChange={(e) => handleFileSubmit(e, "image/*")} />
                </div>
              )}
              {task.type === "video" && status !== "approved" && (
                <div>
                  <CustomInput type="file" name="file" accept="video/*" onChange={(e) => handleFileSubmit(e, "video/*")} />
                </div>
              )}
            </>
          )}
          {status === "approved" && <div>{t('completed')}</div>}
          {status === "rejected" && <div>{t('rejected')}</div>}
        </div>
      )}
    </div>
  );
}