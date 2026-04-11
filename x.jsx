// //listes federales
// //nom president club
// //lieu d'entrainnement
// //passage de grade
// //les coachs
// //federation
// //le style (style karate)
// //nbre des licencier par clubs
// //bres des coachs par clubs
// //nbres des coachs par grade
// //les eleves avec leurs grades
// // nombres d'arbitres par grade
// //fiche des notations
// //membres du bureau et role
// //programme d'activires de la ligue
// //clubs affilé et non
// //gestion register pour les competition (conditionnel)
// //licence delivrer par la ligue
// //les cotisations annueles par les clubs

//  $activeId = $user->current_club_id ?? $user->current_league_id ?? $user->current_federation_id;
//             $relation = $user->current_club_id
//                 ? 'clubs'
//                 : ($user->current_league_id
//                     ? 'leagues'
//                     : 'federations');

//             if (!$activeId) {
//                 return response()->json(['message' => 'Aucune organisation active'], 400);
//             }
//             $allRoles =  Role::all()->keyBy('id');
//             $orgData = $user->$relation->firstWhere('id', $activeId);

//             if (!$orgData || !$orgData->pivot) {
//                 $currentRole = null;
//             } else {
//                 $roleId = $orgData->pivot->role_id;
//                 $roleObj = $allRoles->get($roleId);
//                 $currentRole = $roleObj ? $roleObj->name : 'Membre';
//             }

//             $user->load([$relation]);

//             $roleSuperAdmin = $user->globalRole?->name;
//             return response()->json([
//                 'success' => true,
//                 'user' => $user,
//                 'token' => $token,
//                 'roleSuperAdmin' => $roleSuperAdmin ? [$roleSuperAdmin] : [],
//                 //'memberships' => $members,
//                 'role' => $currentRole ? [$currentRole] : [],
//             ]);
//

//Schema::create('poules', function (Blueprint $table) {
//     $table->uuid('id')->primary();
//     $table->foreignUuid('config_notation_id')
//         ->constrained('config_notations')
//         ->cascadeOnDelete();
//     $table->string('nom'); // "Groupe A", "Groupe B"
//     $table->timestamps();
// });
//   Schema::create('poule_inscriptions', function (Blueprint $table) {
//         $table->uuid('id')->primary();
//         $table->foreignUuid('poule_id')
//             ->constrained('poules')
//             ->cascadeOnDelete();
//         $table->foreignUuid('inscription_id')
//             ->constrained('inscriptions')
//             ->cascadeOnDelete();
//         $table->unique(['poule_id', 'inscription_id']);
//         $table->timestamps();
//     });
