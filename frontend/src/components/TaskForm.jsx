import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import axios from "axios";
import TaskMapPicker from "./TaskMapPicker";
import styles from "./modules/TaskForm.module.css";
import {showAlert} from "./ui/alert.jsx";
import CustomSelect from "./ui/CustomSelect.jsx";
import CustomInput from "./ui/CustomInput.jsx";
import CustomTextArea from "./ui/CustomTextArea.jsx";

const TaskForm = forwardRef(function TaskForm({ onTaskAdded, task = null }, ref) {
    const [name, setName] = useState(task?.name || { pl: "", en: "" });
    const [description, setDescription] = useState(task?.description || { pl: "", en: "" });
    const [lat, setLat] = useState(task?.location?.lat || "");
    const [lng, setLng] = useState(task?.location?.lng || "");
    const [score, setScore] = useState(task?.score || 0);
    const [type, setType] = useState(task?.type || "text");
    const [polish, setPolish] = useState(true);

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
        console.log('task: ',task);
        try {
            const taskData = {
                name,
                description,
                location: { lat: parseFloat(lat), lng: parseFloat(lng) },
                score: parseInt(score),
                type,
            };

            if (task && task._id) {
                await axios.put(`/api/tasks/${task._id}`, taskData);
                showAlert("Task dodany");
            } else {
                console.log(taskData);
                await axios.post("/api/tasks", taskData);
                showAlert("Task dodany");
            }

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

    const handleToggle = () => {
        setPolish(!polish);
    };

    return (
        <div className={styles.formContainer}>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <div className={styles.toggleContainer}>
                    <div
                        className={`${styles.toggleButton} ${polish ? styles.active : ""}`}
                        onClick={() => setPolish(true)}
                    >
                        PL
                    </div>
                    <div
                        className={`${styles.toggleButton} ${!polish ? styles.active : ""}`}
                        onClick={() => setPolish(false)}
                    >
                        EN
                    </div>
                </div>

                {polish ? (
                    <>
                        <CustomInput
                            type="text"
                            placeholder="Nazwa (PL)"
                            value={name.pl}
                            onChange={(e) => setName({ ...name, pl: e.target.value })}
                            required
                            className={styles.input}
                        />
                    </>
                ) : (
                    <>
                        <CustomInput
                            type="text"
                            placeholder="Nazwa (EN)"
                            value={name.en}
                            onChange={(e) => setName({ ...name, en: e.target.value })}
                            required
                            className={styles.input}
                        />
                    </>
                )}
            </div>

            {polish ? (
                <>
                    <CustomTextArea
                        type="text"
                        placeholder="Opis (PL)"
                        textColor={"var(--text-color)"}
                        value={description.pl}
                        onChange={(e) => setDescription({ ...description, pl: e.target.value })}
                        required
                        className={styles.input}
                    />
                </>
            ) : (
                <>
                    <CustomTextArea
                        type="text"
                        placeholder="Opis (EN)"
                        textColor={"var(--text-color)"}
                        value={description.en}
                        onChange={(e) => setDescription({ ...description, en: e.target.value })}
                        required
                        className={styles.input}
                    />
                </>
            )}
            <div style={{ display: 'flex', gap: '1rem' }}>
                <CustomInput
                    type="number"
                    placeholder="Punkty za zadanie"
                    value={score}
                    width={"50%"}
                    onChange={(e) => setScore(e.target.value)}
                    required
                    className={styles.input}
                />
                <CustomSelect
                    options={options}
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                />
                <CustomInput
                    type="file"
                    name="file"
                    accept="image/*"
                />
            </div>

            <div className={styles.mapWrapper}>
                <TaskMapPicker setLat={setLat} setLng={setLng}/>
            </div>
        </div>
    );
});

export default TaskForm;