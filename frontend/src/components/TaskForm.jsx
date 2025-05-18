import {forwardRef, useImperativeHandle, useState} from "react";
import axios from "axios";
import TaskMapPicker from "./TaskMapPicker";
import styles from "./modules/TaskForm.module.css";
import {showAlert} from "./ui/alert.jsx";
import CustomSelect from "./ui/CustomSelect.jsx";
import CustomInput from "./ui/CustomInput.jsx";

const TaskForm = forwardRef(function TaskForm({ onTaskAdded }, ref) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [score, setScore] = useState(0);
    const [type, setType] = useState("qr");

    const options = [
        {value: 'qr', label: 'QR Code'},
        {value: 'text', label: 'Text Input'},
        {value: 'photo', label: 'Photo Upload'},
        {value: 'video', label: 'Video Upload'}
    ];

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!lat || !lng) {
            showAlert("Please select a location on the map");
            return false;
        }
        try {
            await axios.post("/api/tasks", {
                name,
                description,
                location: {lat: parseFloat(lat), lng: parseFloat(lng)},
                score: parseInt(score),
                type,
            });
            showAlert("Task dodany");
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
            showAlert("Błąd");
            return false;
        }
    };

    useImperativeHandle(ref, () => ({
        submit: handleSubmit,
    }));

    return (
        <div className={styles.formContainer}>
            <CustomInput
                type="text"
                placeholder="Nazwa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={styles.input}
            />
            <CustomInput
                type="text"
                placeholder="Opis"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className={styles.input}
            />
            <CustomInput
                type="number"
                placeholder="Punkty za zadanie"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                required
                className={styles.input}
            />
            <CustomSelect
                options={options}
                value={type}
                onChange={(e) => setType(e.target.value)}
            />

            <div className={styles.mapWrapper}>
                <TaskMapPicker setLat={setLat} setLng={setLng}/>
            </div>
            <div className={styles.coordinatesPreview}>
                Wybrane koordynaty: {lat ? lat.toFixed(4) : "Brak"},{" "}
                {lng ? lng.toFixed(4) : "Brak"}
            </div>
        </div>
    );
});

export default TaskForm;