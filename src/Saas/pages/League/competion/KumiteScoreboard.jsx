import React, { useState, useEffect } from "react";

const KumiteScoreboard = () => {
  // État pour les deux combattants
  const [aka, setAka] = useState({
    name: "AKA (Rouge)",
    score: 0,
    fautes: 0,
    senshu: false,
  });
  const [ao, setAo] = useState({
    name: "AO (Bleu)",
    score: 0,
    fautes: 0,
    senshu: false,
  });
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // Noms des sanctions WKF
  const sanctions = ["-", "Chukoku", "Keikoku", "Hansoku-Chui", "Hansoku"];

  // Logique pour ajouter des points
  const addPoints = (player, points) => {
    if (gameOver) return;

    if (player === "aka") {
      const newScore = aka.score + points;
      // REGLE SENSHU : Si c'est le premier point du match et AO n'a pas marqué au même moment
      if (!aka.senshu && !ao.senshu && aka.score === 0 && ao.score === 0) {
        setAka({ ...aka, score: newScore, senshu: true });
      } else {
        setAka({ ...aka, score: newScore });
      }
    } else {
      const newScore = ao.score + points;
      if (!aka.senshu && !ao.senshu && aka.score === 0 && ao.score === 0) {
        setAo({ ...ao, score: newScore, senshu: true });
      } else {
        setAo({ ...ao, score: newScore });
      }
    }
  };

  // Logique pour les fautes (Incrémentation)
  const addFaute = (player) => {
    if (gameOver) return;

    if (player === "aka") {
      const newFautes = aka.fautes + 1;
      let hasSenshu = aka.senshu;

      // REGLE SENSHU : Perte si 3ème faute (Hansoku-Chui) dans les 15 dernières secondes
      if (newFautes === 3 && timeLeft <= 15) hasSenshu = false;

      setAka({ ...aka, fautes: newFautes, senshu: hasSenshu });

      if (newFautes >= 4) {
        setWinner("AO (Victoire par Hansoku)");
        setGameOver(true);
      }
    } else {
      const newFautes = ao.fautes + 1;
      let hasSenshu = ao.senshu;

      if (newFautes === 3 && timeLeft <= 15) hasSenshu = false;

      setAo({ ...ao, fautes: newFautes, senshu: hasSenshu });

      if (newFautes >= 4) {
        setWinner("AKA (Victoire par Hansoku)");
        setGameOver(true);
      }
    }
  };

  // Simulation d'un point simultané (AIUCHI)
  const simultaneousPoint = () => {
    if (gameOver) return;
    // On ajoute les points mais PERSONNE ne prend le Senshu
    setAka((prev) => ({ ...prev, score: prev.score + 1 }));
    setAo((prev) => ({ ...prev, score: prev.score + 1 }));
  };

  return (
    <div style={{ padding: "20px", textAlign: "center", fontFamily: "Arial" }}>
      <h1>Scoreboard Kumite WKF</h1>
      <h2>Temps restant: {timeLeft}s</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginBottom: "20px",
        }}
      >
        {/* AKA Section */}
        <div style={{ border: "2px solid red", padding: "20px", width: "40%" }}>
          <h3>
            {aka.name}{" "}
            {aka.senshu && <span style={{ color: "gold" }}>[SENSHU]</span>}
          </h3>
          <div style={{ fontSize: "48px" }}>{aka.score}</div>
          <p>
            Sanction: <b>{sanctions[aka.fautes]}</b>
          </p>
          <button onClick={() => addPoints("aka", 1)}>+1 (Yuko)</button>
          <button onClick={() => addPoints("aka", 2)}>+2 (Waza-ari)</button>
          <button onClick={() => addPoints("aka", 3)}>+3 (Ippon)</button>
          <br />
          <br />
          <button
            onClick={() => addFaute("aka")}
            style={{ backgroundColor: "#ffcccc" }}
          >
            FAUTE
          </button>
        </div>

        {/* AO Section */}
        <div
          style={{ border: "2px solid blue", padding: "20px", width: "40%" }}
        >
          <h3>
            {ao.name}{" "}
            {ao.senshu && <span style={{ color: "gold" }}>[SENSHU]</span>}
          </h3>
          <div style={{ fontSize: "48px" }}>{ao.score}</div>
          <p>
            Sanction: <b>{sanctions[ao.fautes]}</b>
          </p>
          <button onClick={() => addPoints("ao", 1)}>+1 (Yuko)</button>
          <button onClick={() => addPoints("ao", 2)}>+2 (Waza-ari)</button>
          <button onClick={() => addPoints("ao", 3)}>+3 (Ippon)</button>
          <br />
          <br />
          <button
            onClick={() => addFaute("ao")}
            style={{ backgroundColor: "#cce6ff" }}
          >
            FAUTE
          </button>
        </div>
      </div>

      <button onClick={simultaneousPoint} style={{ padding: "10px" }}>
        Point Simultané (Pas de Senshu)
      </button>

      {gameOver && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            background: "#333",
            color: "#fff",
          }}
        >
          <h2>MATCH TERMINÉ</h2>
          <h3>Vainqueur: {winner}</h3>
          <button onClick={() => window.location.reload()}>Rejouer</button>
        </div>
      )}
    </div>
  );
};

export default KumiteScoreboard;
