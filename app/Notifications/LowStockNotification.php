<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LowStockNotification extends Notification
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
            'title'    => $this->data['title'] ?? 'Stok Menipis',
            'message'  => $this->data['message'] ?? '',
            'link'     => $this->data['link'] ?? '/admin/gudang',
            'icon'     => 'package',
            'severity' => $this->data['severity'] ?? 'danger',
        ];
    }
}
