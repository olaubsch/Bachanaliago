import React, { useState, useRef, useEffect } from 'react';
import styles from './uiModules/CustomSelect.module.css';

export default function CustomSelect({ options, value, onChange, placeholder = "Select…" }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (option) => {
        onChange({ target: { value: option.value } }); // emulate native select
        setOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={styles.selectWrapper} ref={ref}>
            <button
                className={styles.selectButton}
                onClick={() => setOpen(prev => !prev)}
                type="button"
            >
                {selectedOption ? selectedOption.label : placeholder}
                <span className={styles.arrow}>▾</span>
            </button>
            {open && (
                <ul className={styles.dropdown}>
                    {options.map(option => (
                        <li
                            key={option.value}
                            className={styles.option}
                            onClick={() => handleSelect(option)}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

