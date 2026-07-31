import VuePubliqueKata from "./VuePubliqueKata";
import VuePubliqueKumite from "./VuePubliqueKumite";

function VueConfig({ config }) {
  const estKata = config?.subDiscipline?.toLowerCase() === "kata";
  return estKata ? (
    <VuePubliqueKata configId={config?.id} />
  ) : (
    <VuePubliqueKumite configId={config?.id} />
  );
}

export default VueConfig;
