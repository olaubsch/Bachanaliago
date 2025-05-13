import styles from '../ui/uiModules/CustomButton.module.css';

export default function CustomButton({ onClick, children, variant = 'default' }) {
    return (
        <button
            className={`${styles.button} ${styles[variant]}`}
            onClick={onClick}>
            {children}
        </button>
    );
}
