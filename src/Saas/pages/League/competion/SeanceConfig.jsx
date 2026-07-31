import KumiteSupervisor from "./KumiteSupervisor";
import SeanceAdminPanel from "./SeanceAdminPanel";
import SeanceAdminPanelKata from "./SeanceAdminPanelKata";
import SeanceAdminPanelKumite from "./SeanceAdminPanelKumite";

function SeanceConfig({
  config,
  success,
  error,
  handleLaunchSeance,
  initSeance,
  onAthleteSuivant,
  loading,
}) {
  const estKata = config?.subDiscipline?.toLowerCase() === "kata";
  return estKata ? (
    <SeanceAdminPanel
      config={config}
      error={error}
      success={success}
      initSeance={initSeance}
      loading={loading}
      handleLaunchSeance={handleLaunchSeance}
      onAthleteSuivant={onAthleteSuivant}
    />
  ) : (
    <KumiteSupervisor
      config={config}
      error={error}
      success={success}
      initSeance={initSeance}
      loading={loading}
      handleLaunchSeance={handleLaunchSeance}
      onAthleteSuivant={onAthleteSuivant}
    />
  );
}

export default SeanceConfig;
