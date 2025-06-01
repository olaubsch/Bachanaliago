import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import axios from "axios";
import TaskMapPicker from "./TaskMapPicker";
import styles from "./modules/TaskForm.module.css";
import {showAlert} from "./ui/alert.jsx";
import CustomSelect from "./ui/CustomSelect.jsx";
import CustomInput from "./ui/CustomInput.jsx";
import CustomTextArea from "./ui/CustomTextArea.jsx";
import ToggleSwitch from "./ui/ToggleSwitch.jsx";
import FileInput from "./ui/FileInput.jsx";

const TaskForm = forwardRef(function TaskForm({ onTaskAdded, task = null }, ref) {
    const [name, setName] = useState(task?.name || { pl: "", en: "" });
    const [description, setDescription] = useState(task?.description || { pl: "", en: "" });
    const [lat, setLat] = useState(task?.location?.lat || "");
    const [lng, setLng] = useState(task?.location?.lng || "");
    const [score, setScore] = useState(task?.score || 0);
    const [type, setType] = useState(task?.type || "text");
    const [imageFile, setImageFile] = useState(null);
    const [polish, setPolish] = useState(true);

    const options = [
        {value: 'qr', label: 'QR Code'},
        {value: 'text', label: 'Text Input'},
        {value: 'photo', label: 'Photo Upload'},
        {value: 'video', label: 'Video Upload'}
    ];

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("name", JSON.stringify(name));
            formData.append("description", JSON.stringify(description));
            formData.append("score", parseInt(score));
            formData.append("type", type);

            if (lat && lng) {
                const location = { lat: parseFloat(lat), lng: parseFloat(lng) };
                formData.append("location", JSON.stringify(location));
            }

            if (imageFile) {
                formData.append("image", imageFile); // Attach image file
            }

            if (task && task._id) {
                for (let pair of formData.entries()) {
                    console.log(pair[0]+ ':', pair[1]);
                }
                await axios.put(`/api/tasks/${task._id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                showAlert("Task edytowany");
            } else {
                for (let pair of formData.entries()) {
                    console.log(pair[0]+ ':', pair[1]);
                }
                await axios.post("/api/tasks", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                showAlert("Task dodany");
            }

            setName("");
            setDescription("");
            setLat("");
            setLng("");
            setScore(0);
            setType("qr");
            setImageFile(null);

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
                <ToggleSwitch
                    leftLabel="PL"
                    rightLabel="EN"
                    isLeftActive={polish}
                    onToggle={setPolish}
                />

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
            <div style={{display: 'flex', gap: '1rem'}}>
                <div style={{ width: '33%'}}>
                    <CustomInput
                        type="number"
                        placeholder="Punkty za zadanie"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>
                <div style={{ width: '33%'}}>
                    <CustomSelect
                        options={options}
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    />
                </div>
                <div style={{ width: '33%'}}>
                    <FileInput
                        fileType={'image'}
                        mobile={false}
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                    />
                </div>
            </div>

            <div className={styles.mapWrapper}>
                <TaskMapPicker setLat={setLat} setLng={setLng}/>
            </div>
        </div>
    );
});

export default TaskForm;