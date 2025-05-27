import React, { useRef, useEffect, useState, useMemo } from 'react';
import styles from '../components/modules/TaskList.module.css';
import axios from "axios";
import {showAlert} from "./ui/alert.jsx";
import QrScanner from "./QrScanner.jsx";
import CustomTextArea from "./ui/CustomTextArea.jsx";
import CustomButton from "./ui/CustomButton.jsx";
import CustomInput from "./ui/CustomInput.jsx";
import CustomSelect from "./ui/CustomSelect.jsx";

const LIST_CONTAINER_HEIGHT_VH = 61;
const FADE_ZONE_HEIGHT_PERCENT = 25;
const FADE_ZONE_START_PERCENT = 100 - FADE_ZONE_HEIGHT_PERCENT;

function TaskList({ tasks, submissions, groupCode, fetchSubmissions }) {
    const containerRef = useRef(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerClientHeight, setContainerClientHeight] = useState(0);
    const [maxScrollTop, setMaxScrollTop] = useState(0);
    const [expandedCardIndex, setExpandedCardIndex] = useState(null);

    const itemHeight = 86; // Fixed height for each task item in pixels (collapsed)
    const itemMargin = 4; // Margin applied to each item (m-1 in Tailwind is 4px on all sides)
    const itemHeightWithMargin = itemHeight + (itemMargin * 2); // Total vertical space each collapsed item occupies

    const EXPANDED_ITEM_HEIGHT = 120; // Example expanded height in pixels
    const EXPANDED_ITEM_HEIGHT_WITH_MARGIN = EXPANDED_ITEM_HEIGHT + (itemMargin * 2);

    const [text, setText] = useState("");

    const FILTER_OPTIONS = [
        { label: "All", value: "all" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
        { label: "Not Started", value: "not started" },
        { label: "Pending", value: "pending" },
    ];

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

    const mockTasks = useMemo(() => Array.from({ length: 30 }, (_, i) => `Task ${i + 1}`), []);

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

    const handleFileSubmit = async (e, acceptType, taskId) => {
        e.preventDefault();
        const file = e.target.files[0];
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

    const len = mockTasks.length;

    return (
        <>
            <div className={styles.filter}>
                <h2>{"Taski"}</h2>
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
                            zIndex = mockTasks.length + 10;
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
                                    padding: isExpanded ? "2rem 1rem 1rem" : "2rem 1rem",
                                }}
                            >
                                <div key={index}
                                     onClick={() => handleTaskClick(index)}
                                     className={ styles.taskCardTitle }>
                                    <h3>{task.name}</h3>
                                    <h4>{status}</h4>
                                </div>
                                {isExpanded && (
                                    <div className={styles.descContainer}>
                                        <div>{task.description}</div>
                                        <div>
                                            Location: ({task.location.lat}, {task.location.lng})
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
                                                        <CustomTextArea
                                                            value={text}
                                                            onChange={(e) => setText(e.target.value)}
                                                            placeholder="Enter your answer"
                                                        />
                                                        <CustomButton width={"100%"} onClick={() => handleTextSubmit(task._id)}>Submit</CustomButton>
                                                    </div>
                                                )}
                                                {task.type === "photo" && status !== "approved" && (
                                                    <div>
                                                        <CustomInput type="file" name="file" accept="image/*" onChange={(e) => handleFileSubmit(e, "image/*", task._id)} />
                                                    </div>
                                                )}
                                                {task.type === "video" && status !== "approved" && (
                                                    <div>
                                                        <CustomInput type="file" name="file" accept="video/*" onChange={(e) => handleFileSubmit(e, "video/*", task._id)} />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {status === "approved" && <div>Completed!</div>}
                                        {status === "rejected" && <div>Rejected. Please try again.</div>}
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </div>
        </>
    );
}

export default TaskList;