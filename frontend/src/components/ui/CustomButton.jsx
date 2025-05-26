import styles from '../ui/uiModules/CustomButton.module.css';

export default function CustomButton({ onClick, children, variant = 'default', width }) {
    return (
        <button
            className={`${styles.button} ${styles[variant]}`}
            style={{ width: width }}
            onClick={onClick}>
            {children}
        </button>
    );
}
