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
            1. Nie używaj aplikacji do celów niezgodnych z prawem.
            <br />
            2. Twoje działania mogą być rejestrowane w celach bezpieczeństwa i
            analizy.
            <br />
            3. Gra odbywa się na odpowiedzialność uczestników.
            <br />
            4. Wygrywa drużyna, która zrobiła wszystkie lub najwięcej zadań (dobrze) w najkrótszym czasie.
            <br />
            5. Uczestnikami mogą być tylko studenci UZ.
            <br />
            6. Korzystając z tej aplikacji, zgadzasz się na przetwarzanie danych
            potrzebnych do jej działania.
            <br />
            7. Korzystanie z aplikacji oznacza pełną akceptację powyższych
            warunków.
          </p>

          <CustomButton onClick={onAccept}>Akceptuję</CustomButton>
        </div>
      </div>
    </>
  );
}
