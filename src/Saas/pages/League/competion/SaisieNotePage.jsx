import KataArbitre from "./KataArbitre";
import KumiteArbitre from "./KumiteArbitre";

function SaisieNotePage({ config }) {
  const estKata = config?.subDiscipline?.toLowerCase() === "kata";

  return estKata ? (
    <KataArbitre config={config} />
  ) : (
    <KumiteArbitre config={config} />
  );
}

export default SaisieNotePage;
