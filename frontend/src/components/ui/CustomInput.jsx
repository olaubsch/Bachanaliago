import React from 'react';
import styles from './uiModules/CustomInput.module.css';

export default function CustomInput({
                                  type = 'text',
                                  value,
                                  onChange,
                                  placeholder = '',
                                  required = false,
                                  className = '',
                                  ...props
                              }) {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`${styles.input} ${className}`}
            {...props}
        />
    );
}
