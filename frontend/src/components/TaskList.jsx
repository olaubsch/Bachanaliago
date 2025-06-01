import React, { useRef, useEffect, useState, useMemo } from 'react';
import styles from '../components/modules/TaskList.module.css';
import axios from "axios";
import {showAlert} from "./ui/alert.jsx";
import QrScanner from "./QrScanner.jsx";
import CustomTextArea from "./ui/CustomTextArea.jsx";
import CustomButton from "./ui/CustomButton.jsx";
import CustomInput from "./ui/CustomInput.jsx";
import CustomSelect from "./ui/CustomSelect.jsx";
import LocationIcon from "../utils/icons/LocationPin.jsx";
import {useLanguage} from "../utils/LanguageContext.jsx";
import { useTranslation } from 'react-i18next';
import DragDropFileInput from "./ui/FileInput.jsx";
import FileInput from "./ui/FileInput.jsx";


const LIST_CONTAINER_HEIGHT_VH = 61;
const FADE_ZONE_HEIGHT_PERCENT = 25;
const FADE_ZONE_START_PERCENT = 100 - FADE_ZONE_HEIGHT_PERCENT;

const URL = "http://localhost:5000";

function TaskList({ tasks, submissions, groupCode, fetchSubmissions, setPosition }) {
    const containerRef = useRef(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerClientHeight, setContainerClientHeight] = useState(0);
    const [maxScrollTop, setMaxScrollTop] = useState(0);
    const [expandedCardIndex, setExpandedCardIndex] = useState(null);
    const [imageData, setImageData] = useState({});
    const { language } = useLanguage();
    const { t } = useTranslation();
    const itemHeight = 86; // Fixed height for each task item in pixels (collapsed)
    const itemMargin = 4; // Margin applied to each item (m-1 in Tailwind is 4px on all sides)
    const itemHeightWithMargin = itemHeight + (itemMargin * 2); // Total vertical space each collapsed item occupies

    const EXPANDED_ITEM_HEIGHT = 120; // Example expanded height in pixels
    const EXPANDED_ITEM_HEIGHT_WITH_MARGIN = EXPANDED_ITEM_HEIGHT + (itemMargin * 2);

    const [text, setText] = useState("");

    const FILTER_OPTIONS = [
        { label: t('all'), value: "all" },
        { label: t('approved'), value: "approved" },
        { label: t('reject'), value: "rejected" },
        { label: t('notStarted'), value: "not started" },
        { label: t('pending'), value: "pending" },
    ];

    const statusColorMap = {
        approved: "#acd8aa",      // green
        rejected: "#ff686b",      // red
        pending: "#f9dc5c",       // orange
        "not started": "#fff", // blue
    };

    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const updateScrollInfo = () => {
            if (containerRef.current) {
                setScrollTop(containerRef.current.scrollTop);
                setContainerClientHeight(containerRef.current.clientHeight);
                setMaxScrollTop(containerRef.current.scrollHeight - containerRef.current.clientHeight);
            }
        };

        updateScrollInfo();

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', updateScrollInfo, { passive: true });
        }
        window.addEventListener('resize', updateScrollInfo);

        return () => {
            if (container) {
                container.removeEventListener('scroll', updateScrollInfo);
            }
            window.removeEventListener('resize', updateScrollInfo);
        };
    }, [expandedCardIndex]);

    const { fadeZoneTopPx, fadeZoneBottomPx, fadeZoneAnimationHeightPx } = useMemo(() => {
        const topPx = (FADE_ZONE_START_PERCENT / 100) * containerClientHeight;
        const bottomPx = ((FADE_ZONE_START_PERCENT + FADE_ZONE_HEIGHT_PERCENT) / 100) * containerClientHeight;
        const heightPx = (FADE_ZONE_HEIGHT_PERCENT / 100) * containerClientHeight;
        return {
            fadeZoneTopPx: topPx,
            fadeZoneBottomPx: bottomPx,
            fadeZoneAnimationHeightPx: heightPx,
        };
    }, [containerClientHeight]);

    const scrollEndBuffer = 50;

    const handleTaskClick = (index) => {
        setExpandedCardIndex(index === expandedCardIndex ? null : index);
    };

    const handleTextSubmit = async (taskId) => {
        try {
            await axios.post(`/api/submissions/${taskId}/submit`, {
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

    const handleFileSubmit = async (file, acceptType, taskId) => {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("groupCode", groupCode);
        try {
            await axios.post(`/api/submissions/${taskId}/submit`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            fetchSubmissions();
        } catch (err) {
            console.error(err);
            showAlert("Error submitting task");
        }
    };

    const handleScanResult = async (scannedCode, taskId) => {
        try {
            const res = await axios.post(`/api/submissions/${taskId}/submit`, {
                groupCode,
                submissionData: scannedCode,
            });
            showAlert(res.data.message);
            fetchSubmissions(groupCode);
        } catch (err) {
            console.error(err);
            if (err.response) {
                showAlert(err.response.data.error);
            } else {
                showAlert("Błąd przy przetwarzaniu kodu QR");
            }
        }
    };

    let cumulativeHeight = 0;

    let len = tasks.length;

    return (
        <>
            <div className={styles.filter}>
                <h2>{t('tasks')}</h2>
                <CustomSelect
                    options={FILTER_OPTIONS}
                    variant={"small"}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
            <div
                ref={containerRef}
                className={ styles.listContainer }
                style={{
                    height: `${LIST_CONTAINER_HEIGHT_VH}vh`,
                    overflowY: 'scroll',
                    fontFamily: 'Inter, sans-serif',
                }}
            >

                {tasks
                    .filter((task) => {
                        const submission = submissions.find((sub) => sub.task?._id === task._id);
                        const status = submission ? submission.status : "not started";
                        return filter === "all" || status === filter;
                    })
                    .map((task, index) => {
                        const submission = submissions.find((sub) => sub.task?._id === task._id);
                        const status = submission ? submission.status : "not started";
                        const isExpanded = index === expandedCardIndex;
                        const currentItemHeightWithMargin = isExpanded ? EXPANDED_ITEM_HEIGHT_WITH_MARGIN : itemHeightWithMargin;

                        const itemOffsetTop = cumulativeHeight;

                        cumulativeHeight += currentItemHeightWithMargin;

                        const itemTopRelativeToVisible = itemOffsetTop - scrollTop;
                        const itemBottomRelativeToVisible = itemTopRelativeToVisible + currentItemHeightWithMargin;

                        let opacity = 1;
                        let scale = 1;
                        let translateY = 0;
                        let zIndex = 1;

                        const isAtScrollEnd = scrollTop >= maxScrollTop - scrollEndBuffer;

                        if (isExpanded) {
                            opacity = 1;
                            scale = 1;
                            translateY = 0;
                        } else if (isAtScrollEnd) {
                            opacity = 1;
                            scale = 1;
                            translateY = 0;
                            zIndex = 1;
                        } else if (itemTopRelativeToVisible >= fadeZoneTopPx && itemTopRelativeToVisible < fadeZoneBottomPx) {
                            let progress = (itemTopRelativeToVisible - fadeZoneTopPx) / fadeZoneAnimationHeightPx;
                            progress = Math.min(Math.max(progress, 0), 1);

                            opacity = 1 - progress;
                            scale = 1 - progress * 0.2;

                            const maxStackTranslateY = -60;
                            translateY = progress * maxStackTranslateY;

                            zIndex = index + 10;
                        } else if (itemBottomRelativeToVisible > fadeZoneBottomPx) {
                            opacity = 0;
                            scale = 0.8;
                            const maxStackTranslateY = -60;
                            translateY = maxStackTranslateY;
                            zIndex = 1;
                        } else {
                            opacity = 1;
                            scale = 1;
                            translateY = 0;
                            zIndex = 1;
                        }

                        return (
                            <div
                                key={index}
                                className={ styles.taskCard }
                                style={{
                                    position: 'relative',
                                    zIndex: len - index,
                                    transition: 'opacity 0.15s ease-out, transform 0.15s ease-out, height 0.3s ease-in-out',
                                    opacity,
                                    transform: `scale(${scale}) translateY(${translateY}px)`,
                                    borderLeft: isExpanded ? "none" : `5px solid ${statusColorMap[status?.toLowerCase()] || "#ccc"}`,

                                }}
                            >
                                <div key={index}
                                     onClick={() => handleTaskClick(index)}
                                     className={styles.statusInfo}>
                                    <div>
                                        <h3>{task.name[language]}</h3>
                                        <p>{status}</p>
                                    </div>
                                    {task.image && (
                                        <img
                                            src={`${URL}/${task.image}`}
                                            alt="Partner"
                                            style={{
                                                width: '59px',
                                                height: '59px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                            }}
                                        />
                                    )}
                                </div>
                                <div className={`${styles.descContainer} ${isExpanded ? styles.expanded : ''}`}>
                                    <div>{task.description[language]}</div>
                                    {task.location && task.location.lat != null && task.location.lng != null && (
                                        <div style={{marginTop: '1rem' }}>
                                            <CustomButton
                                                onClick={() => setPosition(task.location)}
                                                width={"100%"}
                                                style={{ marginTop: '0.5rem' }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <LocationIcon className={styles.icon} />
                                                    <div>{t('showLocation')}</div>
                                                </div>
                                            </CustomButton>
                                        </div>
                                    )}
                                    {status === "pending" ? (
                                        <div style={{ fontSize: "14px", marginTop: "1rem"}}>Awaiting verification. Further submissions are disabled.</div>
                                    ) : (
                                        <>
                                            {task.type === "qr" && status !== "approved" && (
                                                <QrScanner onScanSuccess={(code) => handleScanResult(code, task._id)}/>
                                            )}
                                            {task.type === "text" && status !== "approved" && (
                                                <div style={{marginTop: '1rem'}}>
                                                    <CustomTextArea
                                                        value={text}
                                                        variant={"dark"}
                                                        onChange={(e) => setText(e.target.value)}
                                                        placeholder="Enter your answer"
                                                    />
                                                    <CustomButton width={"100%"}
                                                                  onClick={() => handleTextSubmit(task._id)}>Submit</CustomButton>
                                                </div>
                                            )}
                                            {task.type === "photo" && status !== "approved" && (
                                                <div style={{marginTop: '1rem', width: '100%'}}>
                                                    <FileInput
                                                        fileType={'image'}
                                                        accept="image/*"
                                                        onSubmit={(file) => handleFileSubmit(file, "image/*", task._id)}
                                                    />
                                                </div>
                                            )}
                                            {task.type === "video" && status !== "approved" && (
                                                <div style={{marginTop: '1rem', width: '100%'}}>
                                                    <FileInput
                                                        fileType={'video'}
                                                        accept="video/mp4,video/webm"
                                                        onSubmit={(file) => handleFileSubmit(file, "video/*", task._id)}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}
                                    <div style={{ marginTop: '0.75rem' }}>
                                        {status === "approved" && <div>{t('completed')}</div>}
                                        {status === "rejected" && <div>{t('rejected')}</div>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </>
    );
}

export default TaskList;