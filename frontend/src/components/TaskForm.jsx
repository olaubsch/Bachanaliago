import { useState } from "react";
import axios from "axios";

function TaskForm({ onTaskAdded }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/tasks", {
        name,
        description,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      });
      alert("Task dodany");
      setName();
      setDescription();
      setLat();
      setLng();
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
      <input
        type="number"
        placeholder="Lat"
        value={lat}
        onChange={(e) => setLat(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Lng"
        value={lng}
        onChange={(e) => setLng(e.target.value)}
        required
      />
      <button type="submit">Dodaj Taska</button>
    </form>
  );
}

export default TaskForm;
