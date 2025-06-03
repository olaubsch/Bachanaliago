import styles from '../ui/uiModules/CustomButton.module.css';

export default function CustomButton({ onClick, children, variant = 'default', width, zIndex }) {
    return (
        <button
            className={`${styles.button} ${styles[variant]}`}
            style={{
                width: width,
                zIndex: zIndex,
            }}
            onClick={onClick}>
            {children}
        </button>
    );
}
