import React from 'react';
import styles from './uiModules/CustomInput.module.css';

export default function CustomInput({
                                  type = 'text',
                                  value,
                                  onChange,
                                  placeholder = '',
                                  required = false,
                                  width,
                                  className = '',
                                  ...props
                              }) {
    const inputClass = type === 'file' ? styles.inputFile : styles.input;
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            style={{ width: width }}
            className={`${inputClass} ${className}`}
            {...props}
        />
    );
}
