<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function markAsRead(string $id)
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return redirect()->back();
    }

    public function markAllAsRead()
    {
        auth()->user()->unreadNotifications->markAsRead();

        return redirect()->back();
    }
}
