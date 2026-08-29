<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $notifications = [];
        $unreadCount = 0;

        if ($request->user()) {
            $user = $request->user();
            $notifQuery = $user->notifications()->orderByDesc('created_at')->take(20)->get();
            $notifications = $notifQuery->map(function ($n) {
                $data = $n->data;
                return [
                    'id'        => $n->id,
                    'title'     => $data['title'] ?? '',
                    'message'   => $data['message'] ?? '',
                    'link'      => $data['link'] ?? '#',
                    'icon'      => $data['icon'] ?? 'bell',
                    'severity'  => $data['severity'] ?? 'info',
                    'is_read'   => $n->read_at !== null,
                    'time_ago'  => $n->created_at->diffForHumans(),
                ];
            });
            $unreadCount = $user->unreadNotifications()->count();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'notifications' => [
                'data'          => $notifications,
                'unread_count'  => $unreadCount,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
        ];
    }
}
