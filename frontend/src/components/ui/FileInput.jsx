import React, { useRef, useState } from 'react';
import styles from '../ui/uiModules/FileInput.module.css';
import CustomButton from "./CustomButton.jsx";
import ImagePlusIcon from "../../utils/icons/imagePlusIcon.jsx";
import VideoPlusIcon from "../../utils/icons/VideoPlusIcon.jsx";
import {useTranslation} from "react-i18next";

export default function FileInput({
                                      onChange,
                                      label = 'Click to add file',
                                      onSubmit,
                                      accept = 'image/*,video/*',
                                      mobile = true,
                                      fileType = 'image',
                                      ...props
                                  }) {
    const inputRef = useRef();
    const { t } = useTranslation();
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setSelectedFile(file);
            onChange?.(e);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setSelectedFile(file);
            onChange?.({ target: { files: [file] } });
        }
    };

    const handleClick = () => inputRef.current.click();

    const handleReset = () => {
        setPreviewUrl(null);
        setSelectedFile(null);
        inputRef.current.value = null;
    };

    return (
        mobile ? (
            <div className={styles.wrapper}>
                <div
                    className={styles.dropzone}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={!previewUrl ? handleClick : undefined}
                >
                    {!previewUrl ? (
                        fileType === 'image' ? (
                            <div style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "0.5rem"
                            }}>
                                <ImagePlusIcon/>
                                <h3 className={styles.label}>{t('clickToAddImage')}</h3>
                            </div>
                        ) : (
                            <div style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "0.5rem"
                            }}>
                                <VideoPlusIcon/>
                                <h3 className={styles.label}>{t('clickToAddVideo')}</h3>
                            </div>
                        )
                    ) : selectedFile?.type.startsWith('video/') ? (
                        <video
                            src={previewUrl}
                            className={styles.preview}
                            controls
                            autoPlay
                            muted
                        />
                    ) : (
                        <img src={previewUrl} alt="Preview" className={styles.preview}/>
                    )}

                    <input
                        type="file"
                        accept={accept}
                        ref={inputRef}
                        className={styles.hiddenInput}
                        onChange={handleFileChange}
                        {...props}
                    />
                </div>

                {previewUrl && (
                    <div className={styles.buttonGroup}>
                        <CustomButton width={'100%'} type="button" variant={"outline-dark"} onClick={handleReset}>
                            {t('remove')}
                        </CustomButton>
                        <CustomButton width={'100%'} type="button" onClick={() => onSubmit?.(selectedFile)}>
                            {t('submit')}
                        </CustomButton>
                    </div>
                )}
            </div>
        ) : (
            <div className={styles.wrapperDesktop}>
                <div
                    className={styles.dropzoneDesktop}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={!previewUrl ? handleClick : undefined}
                >
                    {!previewUrl ? (
                        fileType === 'image' ? (
                            <div style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "0.5rem",
                                margin: "0.85rem"
                            }}>
                                <ImagePlusIcon/>
                                <p>{t('supporterLogo')}</p>
                            </div>
                        ) : (
                            <VideoPlusIcon/>
                        )
                    ) : selectedFile?.type.startsWith('video/') ? (
                        <video
                            src={previewUrl}
                            className={styles.previewDesktop}
                            controls
                            autoPlay
                            muted
                        />
                    ) : (
                        <img src={previewUrl} alt="Preview" className={styles.previewDesktop}/>
                    )}

                    {previewUrl && (
                        <div className={styles.buttonGroupDesktop}>
                            <button className={styles.buttonDesktop} onClick={handleReset}>
                                {t('remove')}
                            </button>
                        </div>
                    )}

                    <input
                        type="file"
                        accept={accept}
                        ref={inputRef}
                        className={styles.hiddenInput}
                        onChange={handleFileChange}
                        {...props}
                    />
                </div>
            </div>
        )
    );
}
