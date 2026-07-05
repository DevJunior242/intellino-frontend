import KumiteArbitre from "./KumiteArbitre";
import KataArbitre from "./KataArbitre";

function SaisieConfig({ config, competitionId }) {
  const estKata = config?.discipline?.toLowerCase() === "kata";
  return estKata ? (
    <KataArbitre config={config} competitionId={competitionId} />
  ) : (
    <KumiteArbitre config={config} competitionId={competitionId} />
  );
}

export default SaisieConfig;
