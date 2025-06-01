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
                                  fileVariant = 'desktop',
                                  ...props
                              }) {
    let inputClass;

    if (type === 'file') {
        inputClass = fileVariant === 'mobile' ? styles.inputMobile : styles.inputDesktop;
    } else {
        inputClass = styles.input;
    }
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
