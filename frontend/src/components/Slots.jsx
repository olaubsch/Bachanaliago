import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './modules/Slots.module.css';

const Reel = ({ basicSymbols, currentSymbol, isSpinning, finalSymbol, spinningTime, symbolHeight }) => {
  const [position, setPosition] = useState(0);
  const [transition, setTransition] = useState('none');

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
      setTransition('none');
    }
  }, [isSpinning, currentSymbol, finalSymbol, spinningTime, symbolHeight, basicSymbols]);

  const symbols = Array(20).fill(basicSymbols).flat();

  return (
    <div className={styles.reel} style={{ height: `${symbolHeight}px` }}>
      <div
        className={styles.symbols}
        style={{
          transform: `translateY(-${position}px)`,
          transition: transition
        }}
      >
        {symbols.map((symbol, index) => (
          <div key={index} className={styles.symbol} style={{ height: `${symbolHeight}px` }}>
            {symbol}
          </div>
        ))}
      </div>
    </div>
  );
};

const Slots = ({ groupScore, groupCode, onSpinComplete }) => {
  const basicSymbols = ['🍒', '🍋', '🔔', '7️⃣', '🍫'];
  const [reel1Symbol, setReel1Symbol] = useState(basicSymbols[0]);
  const [reel2Symbol, setReel2Symbol] = useState(basicSymbols[0]);
  const [reel3Symbol, setReel3Symbol] = useState(basicSymbols[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [finalSymbols, setFinalSymbols] = useState(null);
  const [message, setMessage] = useState('');
  const [hasSpun, setHasSpun] = useState(false);
  const [betAmount, setBetAmount] = useState(1);

  const multipliers = {
    '🍒': 1.5,
    '🍋': 1.75,
    '🔔': 2,
    '7️⃣': 4,
    '🍫': 3
  };

  const spin = () => {
    if (hasSpun || betAmount <= 0 || betAmount > groupScore) {
      if (betAmount > groupScore) setMessage("Not enough points to bet!");
      return;
    }

    setHasSpun(true);
    setMessage('');

    const r = Math.random();
    let final1, final2, final3;
    if (r < 0.3) {
      final1 = final2 = final3 = '🍒';
    } else if (r < 0.4) {
      final1 = final2 = final3 = '🍋';
    } else if (r < 0.45) {
      final1 = final2 = final3 = '🔔';
    } else if (r < 0.47) {
      final1 = final2 = final3 = '7️⃣';
    } else if (r < 0.5) {
      final1 = final2 = final3 = '🍫';
    } else {
      const shuffled = [...basicSymbols].sort(() => 0.5 - Math.random());
      final1 = shuffled[0];
      final2 = shuffled[1];
      final3 = shuffled[2];
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
        await axios.post(`/api/groups/${groupCode}/update-score`, { newScore });
        setTimeout(() => {
          onSpinComplete(newScore);
        }, 2000);
      } catch (err) {
        console.error(err);
        setMessage("Error updating score");
      }
    }, 3000);
  };

  return (
    <div className={styles['slots-container']}>
      <div className={styles['points-display']}>Group Score: {groupScore}</div>
      <div>
        <label>Bet Amount: </label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Math.floor(Number(e.target.value)))}
          min="1"
          max={groupScore}
          step="1"
          disabled={isSpinning || hasSpun}
        />
      </div>
      <div className={styles.reels}>
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
      <button onClick={spin} disabled={isSpinning || hasSpun || betAmount <= 0 || betAmount > groupScore}>
        Spin
      </button>
      <div className={styles.message}>{message}</div>
      <div className={styles.paytable}>
        <h3>Paytable</h3>
        <p>Bet amount: 1 to {groupScore} points</p>
        <p>Three 🍒: x1.5 (win {Math.floor(betAmount * 1.5)} points)</p>
        <p>Three 🍋: x1.75 (win {Math.floor(betAmount * 1.75)} points)</p>
        <p>Three 🔔: x2 (win {Math.floor(betAmount * 2)} points)</p>
        <p>Three 7️⃣: x4 (win {Math.floor(betAmount * 4)} points)</p>
        <p>Three 🍫: x3 (win {Math.floor(betAmount * 3)} points)</p>
      </div>
    </div>
  );
};

export default Slots;