import React from "react";
import styles from "./uiModules/TermsModal.module.css";
import CustomButton from "./CustomButton";

export default function TermsModal({ onAccept }) {
  return (
    <>
      <div className={styles.modalOverlay}>
        <div className={styles.zigzagContainer}></div>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>Regulamin aplikacji</h2>

          <p>
            1. Korzystając z tej aplikacji, zgadzasz się na przetwarzanie danych
            potrzebnych do jej działania.
            <br />
            2. Nie używaj aplikacji do celów niezgodnych z prawem.
            <br />
            3. Twoje działania mogą być rejestrowane w celach bezpieczeństwa i
            analizy.
            <br />
            4. Aplikacja nie ponosi odpowiedzialności za działania użytkowników.
            <br />
            5. Korzystanie z aplikacji oznacza pełną akceptację powyższych
            warunków.
          </p>

          <CustomButton onClick={onAccept}>Akceptuję</CustomButton>
        </div>
      </div>
    </>
  );
}
