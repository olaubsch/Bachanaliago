import {useLanguage} from "../../utils/LanguageContext.jsx";
import styles from "../ui/uiModules/LanguageToggle.module.css";


export default function LanguageToggle () {
    const { language, toggleLanguage } = useLanguage();

    return (
        <div onClick={toggleLanguage} className={ styles.iconWrapper }>
            { language  === "en" ? (
                <div className={ styles.languageIconPL } />
            ) : (
                <div className={ styles.languageIconUK } />
            )}
        </div>
    );
};