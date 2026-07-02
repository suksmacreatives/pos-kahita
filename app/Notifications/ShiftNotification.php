<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ShiftNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected array $data
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title'    => $this->data['title'] ?? 'Shift',
            'message'  => $this->data['message'] ?? '',
            'link'     => $this->data['link'] ?? '/admin/reports?kategori=kasir&sub=performa-kasir',
            'icon'     => 'clock',
            'severity' => $this->data['severity'] ?? 'info',
        ];
    }
}
