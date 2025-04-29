import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import MapElement from "./MapElement";
import QrScanner from "./QrScanner";
import styles from "./modules/UserPanel.module.css";

export default function TaskCard({
  task,
  index,
  expandedTaskId,
  toggleTask,
  handleScanResult,
  containerRef,
}) {
  const ref = useRef();

  const { scrollYProgress } = useScroll({
    target: ref,
    container: containerRef,
    offset: ["start end", "start start"],
  });

  const isExpanded = expandedTaskId === task._id;

  const baseScale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const baseY = useTransform(scrollYProgress, [0, 1], [-40, 0]);
  const baseOpacity = useTransform(scrollYProgress, [0, 1], [0.6, 1]);

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
        {task.name}
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
          <QrScanner taskId={task.qrcode} onScanSuccess={handleScanResult} />
        </motion.div>
      )}
    </motion.div>
  );
}
