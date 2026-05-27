// private function traiterPenalite($combat, $data, $rotation)
// {
//     // Compter pénalités déjà validées
//     $nbPenalites = CombatAction::where('combat_id', $combat->id)
//         ->where('combattant', $data['combattant'])
//         ->where('type', 'penalite')
//         ->where('validee', true)
//         ->count();

//     $niveaux = ['chukoku', 'keikoku', 'hansoku_chui', 'hansoku'];
//     $niveau  = $niveaux[$nbPenalites] ?? 'hansoku';

//     CombatAction::create([
//         'combat_id'           => $combat->id,
//         'combattant'          => $data['combattant'],
//         'type'                => $niveau, // chukoku, keikoku...
//         'valeur'              => 0,
//         'rotation_arbitre_id' => $rotation->id,
//         'poste'               => $rotation->poste,
//         'signale_a'           => now(),
//         'validee'             => true, // direct
//     ]);

//     // Hansoku → éliminé
//     if ($niveau === 'hansoku') {
//         $vainqueur = $data['combattant'] === 'aka'
//             ? $combat->inscription_ao_id
//             : $combat->inscription_aka_id;
//         $combat->update([
//             'vainqueur_id'  => $vainqueur,
//             'type_victoire' => 'hansoku',
//             'status'        => 2,
//         ]);
//     }

//     broadcast(new TatamiUpdated($combat->config_notation_id));
// }
