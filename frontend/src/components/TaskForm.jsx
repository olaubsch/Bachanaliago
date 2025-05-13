import {forwardRef, useImperativeHandle, useState} from "react";
import axios from "axios";
import TaskMapPicker from "./TaskMapPicker";
import styles from "./modules/TaskForm.module.css";

const TaskForm = forwardRef(function TaskForm({ onTaskAdded }, ref) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [score, setScore] = useState(0);
  const [type, setType] = useState("qr");

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!lat || !lng) {
      alert("Please select a location on the map");
      return false;
    }
    try {
      await axios.post("/api/tasks", {
        name,
        description,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        score: parseInt(score),
        type,
      });
      alert("Task dodany");
      setName("");
      setDescription("");
      setLat("");
      setLng("");
      setScore(0);
      setType("qr");

      onTaskAdded();
      return true;
    } catch (err) {
      console.error(err);
      alert("Błąd");
      return false;
    }
  };

    useImperativeHandle(ref, () => ({
        submit: handleSubmit,
    }));

  return (
    <div className={styles.formContainer}>
      <input
        type="text"
        placeholder="Nazwa"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className={styles.input}
      />
      <input
        type="text"
        placeholder="Opis"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className={styles.input}
      />
      <input
        type="number"
        placeholder="Punkty za zadanie"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        required
        className={styles.input}
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className={styles.input}
      >
        <option value="qr">QR Code</option>
        <option value="text">Text Input</option>
        <option value="photo">Photo Upload</option>
        <option value="video">Video Upload</option>
      </select>
      <div className={styles.mapWrapper}>
        <TaskMapPicker setLat={setLat} setLng={setLng} />
      </div>
      <div className={styles.coordinatesPreview}>
        Wybrane koordynaty: {lat ? lat.toFixed(4) : "Brak"},{" "}
        {lng ? lng.toFixed(4) : "Brak"}
      </div>
    </div>
  );
});

export default TaskForm;