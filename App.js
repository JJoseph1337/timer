import {useEffect, useMemo, useRef, useState} from 'react';

import {Button} from './components/Button/Button';
import {formatTimer} from './helpers/formatTimer';

import './App.css';

function App() {
  const [timer, setTimer] = useState(JSON.parse(localStorage.getItem('currentTime') || 0));
  const [timers, setTimers] = useState([]);

  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const intervalRef = useRef(null);``

  useEffect(() => {
    handleLoadTimers();

    const paused = JSON.parse(localStorage.getItem('paused') || false);
    const started = JSON.parse(localStorage.getItem('started') || false);

    setIsPaused(paused);
    setIsStarted(started);

    if (started && !paused) {
      startTimer({isOfflineMode: true});
    }

    return () => clearInterval(intervalRef.current);
  }, []);

  const startTimer = ({ isOfflineMode } = { isOfflineMode: false }) => {
    let startedDate = 0;

    if (isOfflineMode) {
      startedDate = JSON.parse(localStorage.getItem('startedDate') || 0);
    } else {
      startedDate = new Date().getTime();
      localStorage.setItem('startedDate', JSON.stringify(startedDate));
    }

    const totalTime = JSON.parse(localStorage.getItem('totalTime') || 0);

    intervalRef.current = setInterval(() => {
      const current = new Date().getTime();
      const total = Math.floor((current - startedDate) / 1000) + totalTime;

      localStorage.setItem('currentTime', JSON.stringify(total));

      setTimer(total);
    }, 1000);
  };

  const handlePause = () => {
    setIsPaused(true);

    localStorage.setItem('paused', JSON.stringify(true));
    localStorage.setItem('totalTime', JSON.stringify(timer));

    clearInterval(intervalRef.current);
  };

  const handleContinue = () => {
    setIsPaused(false);
    localStorage.setItem('paused', JSON.stringify(false));

    startTimer();
  }

  const handleStart = () => {
    setIsStarted(true);
    localStorage.setItem('started', JSON.stringify(true));

    startTimer();
  };

  const handleStop = () => {
    handleClear();

    handleSaveTimer();
  }

  const handleSaveTimer = () => {
    const _timers = [...timers, timer];

    setTimers(_timers);
    localStorage.setItem('timers', JSON.stringify(_timers));
  }

  const handleLoadTimers = () => {
    const _timers = JSON.parse(localStorage.getItem('timers') || '[]');
    setTimers(_timers);
  };

  const handleClear = () => {
    setIsPaused(false);
    setIsStarted(false);

    setTimer(0);

    localStorage.setItem('totalTime', JSON.stringify(0));
    localStorage.setItem('currentTime', JSON.stringify(0));
    localStorage.setItem('startedDate', JSON.stringify(0));
    localStorage.setItem('started', JSON.stringify(false));
    localStorage.setItem('paused', JSON.stringify(false));

    clearInterval(intervalRef.current);
  };

  // 00:00:00

  const timerList = useMemo(() =>
    timers.map((timer, index) => (
      <p key={index}>{formatTimer(timer)}</p>
    )
  ), [timers]);

  return (
    <div className="App">
      <header className="App-header">
        Timer
      </header>
      <main className='App-main'>
        <section className='App-container mt24'>
          <h2>{formatTimer(timer)}</h2>
          <div className='App-actions'>
            {isStarted && !isPaused
              ? <Button onClick={handlePause}>Pause</Button>
              : isPaused
                ? <Button onClick={handleContinue}>Continue</Button>
                : <Button onClick={handleStart}>Start</Button>
            }
            <Button onClick={handleStop}>Stop</Button>
            <Button onClick={handleClear}>Clear</Button>
          </div>
        </section>
        <section className='App-container App-container-list mt16'>
          {timerList.length === 0 ? <p>There is no timers yet</p> : timerList}
        </section>
      </main>
    </div>
  );
}

export default App;
