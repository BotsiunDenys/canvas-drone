import { Link } from "react-router-dom";
import s from "./HomePage.module.css";

const HomePage = () => {
  const scoreboardInfo = localStorage.getItem("gameScoreboard");
  const scoreboard = scoreboardInfo ? JSON.parse(scoreboardInfo) : [];

  return (
    <main className={s.wrapper}>
      <div className={s.container}>
        <div className={s.scoreboardTitle}>
          <span className={`${s.titleText} ${s.block}`}>User ID</span>
          <span className={`${s.titleText} ${s.block}`}>Complexity</span>
          <span className={`${s.titleText} ${s.block}`}>Score</span>
        </div>
        {scoreboard.length === 0 ? (
          <h2 className={s.emptyScoreboard}>No existing players</h2>
        ) : (
          scoreboard.map((data) => (
            <div key={data.playerID} className={s.scoreboardInfo}>
              <span className={s.block}>{data.playerID}</span>
              <span className={s.block}>{data.complexity}</span>
              <span className={s.block}>{Math.round(data.score)}</span>
            </div>
          ))
        )}
        <Link to="/game" className={s.link}>
          Play
        </Link>
      </div>
    </main>
  );
};

export default HomePage;
