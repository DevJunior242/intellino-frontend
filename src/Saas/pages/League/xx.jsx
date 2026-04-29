// # Donne la propriété du dossier au serveur web
// sudo chown -R www-data:www-data storage bootstrap/cache

// # Donne les bonnes permissions
// sudo chmod -R 775 storage bootstrap/cache
// php artisan storage:link


  $user = auth()->user();
            if ($user) {
                $token = $user->createToken('auth')->plainTextToken;
            }
            $user->load(['clubs', 'leagues', 'federations', 'globalRole']);
            // On détermine l'ID et le type dynamiquement
            $activeId = $user->current_club_id ?? $user->current_league_id ?? $user->current_federation_id;
            $relation = $user->current_club_id
                ? 'clubs'
                : ($user->current_league_id
                    ? 'leagues'
                    : ($user->current_federation_id
                        ? 'federations'
                        : null
                    ));
            if (!$relation) {
                return response()->json([
                    'success' => true,
                    'user' => $user,
                    'token' => $token,
                    'roleSuperAdmin' => $user->globalRole?->name ? [$user->globalRole->name] : [],
                    'memberships' => [],
                    'role' => [],
                ]);
            }
            $user->load($relation);

            $allRoles =  Role::all()->keyBy('id');

            $organizations = collect($user->$relation)->map(function ($org) use ($allRoles) {

                $roleId = $org->pivot->role_id ?? null;
                $roleObj = $allRoles->get($roleId);

                return [
                    'id' => $org->id,
                    'name' => $org->name,
                    'role' => $roleObj ? $roleObj->name : 'Membre',
                ];
            });

            // $user->load([$relation]);

            $roleSuperAdmin = $user->globalRole?->name;
            $currentRole = $organizations->first()['role'] ?? null;
            return response()->json([
                'success' => true,
                'user' => $user,
                'token' => $token,
                'roleSuperAdmin' => $roleSuperAdmin ? [$roleSuperAdmin] : [],
                'memberships' => $organizations,
                'role' => [$currentRole],
            ]);