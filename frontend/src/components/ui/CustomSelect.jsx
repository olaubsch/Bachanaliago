import React, {useState, useRef, useEffect, useMemo} from 'react';
import styles from './uiModules/CustomSelect.module.css';

export default function CustomSelect({ options, value, onChange, placeholder = "Select…", variant = 'default', width }) {
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

    const longestLabel = useMemo(() => {
        return options.reduce((longest, option) => (
            option.label.length > longest.length ? option.label : longest
        ), placeholder);
    }, [options, placeholder]);

    return (
        <div className={
            variant === 'small'
                ? styles.selectWrapperSmall
                : styles.selectWrapperDefault
        } ref={ref}>
            {variant === 'small' && (
                <span className={styles.sizingHelper}>{longestLabel}</span>
            )}
            <button
                className={`${styles.selectButton} ${styles[variant]}`}
                onClick={() => setOpen(prev => !prev)}
                type="button"
            >
                {selectedOption ? selectedOption.label : placeholder}
                {variant !== 'small' && <span className={styles.arrow}>▾</span>}
            </button>
            {open && (
                <ul
                    className={
                        variant === 'small'
                            ? styles.smallDropdown
                            : styles.dropdown
                    }>
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

