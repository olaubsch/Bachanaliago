import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./modules/Slots.module.css";
import { useTranslation } from 'react-i18next';
import CustomButton from "./ui/CustomButton.jsx";

const Reel = ({
  basicSymbols,
  currentSymbol,
  isSpinning,
  finalSymbol,
  spinningTime,
  symbolHeight,
}) => {
  const [position, setPosition] = useState(0);
  const [transition, setTransition] = useState("none");

  useEffect(() => {
    if (isSpinning) {
      const j = basicSymbols.indexOf(finalSymbol);
      const k = 5; // Number of cycles for animation
      const stoppingIndex = k * basicSymbols.length + j;
      const stoppingPosition = stoppingIndex * symbolHeight;
      setTransition(`transform ${spinningTime}s ease-out`);
      setPosition(stoppingPosition);
    } else {
      const j = basicSymbols.indexOf(currentSymbol);
      setPosition(j * symbolHeight);
      setTransition("none");
    }
  }, [
    isSpinning,
    currentSymbol,
    finalSymbol,
    spinningTime,
    symbolHeight,
    basicSymbols,
  ]);

  const symbols = Array(20).fill(basicSymbols).flat();

  return (
    <>
      <div className={styles.reel} style={{ height: `${symbolHeight}px` }}>
        <div
          className={styles.symbols}
          style={{
            transform: `translateY(-${position}px)`,
            transition: transition,
          }}
        >
          {symbols.map((symbol, index) => (
            <div
              key={index}
              className={styles.symbol}
              style={{ height: `${symbolHeight}px` }}
            >
              {symbol}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const Slots = ({ groupScore, groupCode, onSpinComplete, hasPlayedSlots }) => { // Added hasPlayedSlots prop
  const basicSymbols = ["🍒", "🍋", "🔔", "7️⃣", "🍫"];
  const [reel1Symbol, setReel1Symbol] = useState(basicSymbols[0]);
  const [reel2Symbol, setReel2Symbol] = useState(basicSymbols[0]);
  const [reel3Symbol, setReel3Symbol] = useState(basicSymbols[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [finalSymbols, setFinalSymbols] = useState(null);
  const [message, setMessage] = useState("");
  const [hasSpun, setHasSpun] = useState(false);
  const [betAmount, setBetAmount] = useState(1);
  const { t } = useTranslation();

  const multipliers = {
    "🍒": 1.25,
    "🍋": 1.5,
    "🔔": 1.75,
    "7️⃣": 2,
    "🍫": 2.5,
  };

  const spin = () => {
    if (hasSpun || betAmount <= 0 || betAmount > groupScore) {
      if (betAmount > groupScore) setMessage("Not enough points to bet!");
      return;
    }

    setHasSpun(true);
    setMessage("");

    const r = Math.random();
    let final1, final2, final3;
    if (r < 0.2) {
      final1 = final2 = final3 = "🍒";
    } else if (r < 0.3) {
      final1 = final2 = final3 = "🍋";
    } else if (r < 0.35) {
      final1 = final2 = final3 = "🔔";
    } else if (r < 0.38) {
      final1 = final2 = final3 = "7️⃣";
    } else if (r < 0.4) {
      final1 = final2 = final3 = "🍫";
    } else {
      do {
        final1 = basicSymbols[Math.floor(Math.random() * basicSymbols.length)];
        final2 = basicSymbols[Math.floor(Math.random() * basicSymbols.length)];
        final3 = basicSymbols[Math.floor(Math.random() * basicSymbols.length)];
      } while (final1 === final2 && final2 === final3);
    }

    setFinalSymbols([final1, final2, final3]);
    setIsSpinning(true);

    setTimeout(() => setReel1Symbol(final1), 2000);
    setTimeout(() => setReel2Symbol(final2), 2500);
    setTimeout(async () => {
      setReel3Symbol(final3);
      setIsSpinning(false);
      let newScore;
      if (final1 === final2 && final2 === final3) {
        const multiplier = multipliers[final1];
        const winAmount = Math.floor(betAmount * multiplier);
        newScore = groupScore - betAmount + winAmount;
        setMessage(`You win ${winAmount} points! New score: ${newScore}`);
      } else {
        newScore = groupScore - betAmount;
        setMessage(`You lose ${betAmount} points. New score: ${newScore}`);
      }
      try {
        await axios.post(`/api/groups/${groupCode}/update-score`, { newScore, fromSlots: true });
        setTimeout(() => {
          onSpinComplete(newScore);
        }, 2000);
      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 403) { // Handle 403 error
          setMessage("Your group has already played the slots.");
        } else {
          setMessage("Error updating score");
        }
      }
    }, 3000);
  };

  return (
    <>
      <div className={ styles.slotsContainer }>
        <div className={ styles.pointsDisplay }>
          {t('groupScore')}: {groupScore}
        </div>
        <div>
          <label>{t('betAmount')}: </label>
          <input
            className={ styles.pointInput }
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Math.floor(Number(e.target.value)))}
            min="1"
            max={groupScore}
            step="1"
            disabled={isSpinning || hasSpun}
          />
        </div>
        <div className={ styles.reels }>
          <Reel
            basicSymbols={basicSymbols}
            currentSymbol={reel1Symbol}
            isSpinning={isSpinning}
            finalSymbol={finalSymbols ? finalSymbols[0] : null}
            spinningTime={2}
            symbolHeight={100}
          />
          <Reel
            basicSymbols={basicSymbols}
            currentSymbol={reel2Symbol}
            isSpinning={isSpinning}
            finalSymbol={finalSymbols ? finalSymbols[1] : null}
            spinningTime={2.5}
            symbolHeight={100}
          />
          <Reel
            basicSymbols={basicSymbols}
            currentSymbol={reel3Symbol}
            isSpinning={isSpinning}
            finalSymbol={finalSymbols ? finalSymbols[2] : null}
            spinningTime={3}
            symbolHeight={100}
          />
        </div>
        <button
          className={ styles.spinButton }
          onClick={spin}
          disabled={
            isSpinning || hasSpun || betAmount <= 0 || betAmount > groupScore || hasPlayedSlots // Disable if hasPlayedSlots is true
          }
        >
          Spin
        </button>
        <div className={ styles.message }>{message}</div>
        <div className={ styles.paytable }>
          <h3>{t('paytable')}</h3>
          <p>{t('betAmount')}: 1 to {groupScore} points</p>
          <p>Three 🍒: x1.25 (win {Math.floor(betAmount * 1.25)} points)</p>
          <p>Three 🍋: x1.5 (win {Math.floor(betAmount * 1.5)} points)</p>
          <p>Three 🔔: x1.75 (win {Math.floor(betAmount * 1.75)} points)</p>
          <p>Three 7️⃣: x2 (win {Math.floor(betAmount * 2)} points)</p>
          <p>Three 🍫: x2.5 (win {Math.floor(betAmount * 2.5)} points)</p>
        </div>
      </div>
    </>
  );
};

export default Slots;