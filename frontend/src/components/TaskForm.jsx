import { useState } from "react";
import axios from "axios";
import TaskMapPicker from "./TaskMapPicker";

function TaskForm({ onTaskAdded }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lat || !lng) {
      alert("Please select a location on the map");
      return;
    }
    try {
      await axios.post("/api/tasks", {
        name,
        description,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      });
      alert("Task dodany");
      setName("");
      setDescription("");
      setLat("");
      setLng("");
      onTaskAdded();
    } catch (err) {
      console.error(err);
      alert("Błąd");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Dodaj Taska</h3>
      <input
        type="text"
        placeholder="Nazwa"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Opis"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <TaskMapPicker setLat={setLat} setLng={setLng} />
      <div>
        Selected Coordinates: {lat ? lat.toFixed(4) : "Not selected"},{" "}
        {lng ? lng.toFixed(4) : "Not selected"}
      </div>
      <button type="submit">Dodaj Taska</button>
    </form>
  );
}

export default TaskForm;