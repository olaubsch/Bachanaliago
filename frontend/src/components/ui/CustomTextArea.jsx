import React, { useRef, useEffect } from 'react';
import styles from './uiModules/CustomInput.module.css';

export default function CustomTextArea({
                                           value,
                                           onChange,
                                           placeholder = '',
                                           required = false,
                                           rows = 4,
                                           className = '',
                                           minHeight = '80px',
                                           maxHeight = '300px',
                                           ...props
                                       }) {
    const textareaRef = useRef(null);

    // Adjust height to fit content
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // reset height to shrink if needed
            const newHeight = Math.min(textarea.scrollHeight, parseInt(maxHeight));
            textarea.style.height = `${newHeight}px`;
        }
    }, [value, maxHeight]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            rows={rows}
            className={`${styles.inputTextArea} ${className}`}
            style={{ minHeight, maxHeight, resize: 'none', overflow: 'hidden' }}
            {...props}
        />
    );
}
