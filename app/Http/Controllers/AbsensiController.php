<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;

class AbsensiController extends Controller
{
    public function store(Request $request)
{
    $validated = $request->validate([
        'user_id'   => 'required',
        'outlet_id' => 'required',
        'date'      => 'required',
        'clock_in'  => 'required',
        'status'    => 'required',
    ]);

    try {

        Attendance::create($validated);

        return redirect()->back()->with([
    'success' => 'Absensi berhasil disimpan'
]);

    } catch (\Exception $e) {

        dd($e->getMessage());

    }
}
public function clockOut(Attendance $attendance)
{
    $attendance->update([
        'clock_out' => now()->format('H:i:s'),
        'status' => 'Sudah Pulang'
    ]);

    return redirect()->back();
}
}
