import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import MapElement from "./MapElement";
import QrScanner from "./QrScanner";
import axios from "axios";
import styles from "./modules/UserPanel.module.css";

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

  const { scrollYProgress } = useScroll({
    target: ref,
    container: containerRef,
    offset: ["start end", "start start"],
  });

  const isExpanded = expandedTaskId === task._id;
  const status = submission ? submission.status : "not started";

  const baseScale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const baseY = useTransform(scrollYProgress, [0, 1], [-40, 0]);
  const baseOpacity = useTransform(scrollYProgress, [0, 1], [0.6, 1]);

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
      alert("Error submitting task");
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
      alert("Error submitting task");
    }
  };

  return (
    <motion.div
      ref={ref}
      className={styles.taskCard}
      style={{
        scale: isExpanded ? 1 : baseScale,
        y: isExpanded ? 0 : baseY,
        opacity: isExpanded ? 1 : baseOpacity,
        zIndex: 1000 - index,
      }}
      layout
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div onClick={() => toggleTask(task._id)} className={styles.taskHeader}>
        {task.name} - {status}
      </div>

      {isExpanded && (
        <motion.div
          className={styles.taskDetails}
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div>{task.description}</div>
          <div>
            Location: ({task.location.lat}, {task.location.lng})
          </div>
          <div className={styles.taskMap}>
            <MapElement tasks={[task]} />
          </div>
          {status === "pending" ? (
            <div>Awaiting verification. Further submissions are disabled.</div>
          ) : (
            <>
              {task.type === "qr" && status !== "approved" && (
                <QrScanner onScanSuccess={(code) => handleScanResult(code, task._id)} />
              )}
              {task.type === "text" && status !== "approved" && (
                <div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter your answer"
                  />
                  <button onClick={handleTextSubmit}>Submit</button>
                </div>
              )}
              {task.type === "photo" && status !== "approved" && (
                <div>
                  <input type="file" name="file" accept="image/*" onChange={(e) => handleFileSubmit(e, "image/*")} />
                </div>
              )}
              {task.type === "video" && status !== "approved" && (
                <div>
                  <input type="file" name="file" accept="video/*" onChange={(e) => handleFileSubmit(e, "video/*")} />
                </div>
              )}
            </>
          )}
          {status === "approved" && <div>Completed!</div>}
          {status === "rejected" && <div>Rejected. Please try again.</div>}
        </motion.div>
      )}
    </motion.div>
  );
}