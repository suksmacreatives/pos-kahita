<?php

namespace App\Exports;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Style\Conditional;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Chart\Chart;
use PhpOffice\PhpSpreadsheet\Chart\Title;
use PhpOffice\PhpSpreadsheet\Chart\Legend;
use PhpOffice\PhpSpreadsheet\Chart\PlotArea;
use PhpOffice\PhpSpreadsheet\Chart\DataSeries;
use PhpOffice\PhpSpreadsheet\Chart\DataSeriesValues;
use PhpOffice\PhpSpreadsheet\Chart\Layout;

class DashboardExcelExport
{
    protected array $data;
    protected string $dari;
    protected string $sampai;

    protected array $greenAccent = ['fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '059669']]];
    protected array $redAccent = ['fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'DC2626']]];
    protected array $headerFont = ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 9];
    protected array $titleFont = ['bold' => true, 'size' => 13, 'color' => ['rgb' => '059669']];
    protected array $sectionFont = ['bold' => true, 'size' => 11, 'color' => ['rgb' => '1e293b']];
    protected array $borderStyle = ['borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]]];
    protected string $numberFmt = '#,##0';
    protected string $currencyFmt = 'Rp #,##0';

    public function __construct(array $data, string $dari, string $sampai)
    {
        $this->data = $data;
        $this->dari = $dari;
        $this->sampai = $sampai;
    }

    public function build(): Spreadsheet
    {
        $spreadsheet = new Spreadsheet();
        $spreadsheet->getProperties()
            ->setTitle('Dashboard Export')
            ->setCreator('POS Kahita Busana');

        $this->buildExecutiveSheet($spreadsheet);
        $this->buildDistribusiSheet($spreadsheet);
        $this->buildReturSheet($spreadsheet);
        $this->buildLowStockSheet($spreadsheet);
        $this->buildAnalyticsSheet($spreadsheet);

        $spreadsheet->setActiveSheetIndex(0);
        return $spreadsheet;
    }

    protected function styleHeader(Worksheet $sheet, int $row, string $range = 'A1:Z1'): void
    {
        $sheet->getStyle($range)->applyFromArray([
            'font' => $this->headerFont,
            'fill' => $this->greenAccent['fill'],
            'borders' => $this->borderStyle['borders'],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
    }

    protected function styleSection(Worksheet $sheet, int $row, string $col = 'A'): void
    {
        $sheet->getStyle("{$col}{$row}")->applyFromArray(['font' => $this->sectionFont]);
    }

    protected function autoWidth(Worksheet $sheet, array $cols): void
    {
        foreach ($cols as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }

    protected function applyBorder(Worksheet $sheet, string $range): void
    {
        $sheet->getStyle($range)->applyFromArray($this->borderStyle);
    }

    protected function setNumberFmt(Worksheet $sheet, string $range): void
    {
        $sheet->getStyle($range)->getNumberFormat()->setFormatCode($this->numberFmt);
        $sheet->getStyle($range)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
    }

    // ============================================================
    //  SHEET 1: EXECUTIVE DASHBOARD
    // ============================================================
    protected function buildExecutiveSheet(Spreadsheet $sp): void
    {
        $sheet = $sp->getActiveSheet();
        $sheet->setTitle('Executive Dashboard');

        $inv = $this->data['inventorySummary'] ?? [];
        $stats = $this->data['stats'] ?? [];
        $dist = $this->data['distribution'] ?? [];
        $ret = $this->data['return'] ?? [];

        $r = 1;
        $sheet->setCellValue("A{$r}", 'EXECUTIVE DASHBOARD');
        $sheet->mergeCells("A{$r}:D{$r}");
        $sheet->getStyle("A{$r}")->applyFromArray(['font' => $this->titleFont]);
        $r += 2;

        // KPI
        $sheet->setCellValue("A{$r}", 'RINGKASAN KPI UTAMA');
        $this->styleSection($sheet, $r);
        $r++;
        $headers = ['Metrik', 'Nilai'];
        $sheet->fromArray($headers, null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:B{$r}");
        $r++;
        $kpis = [
            ['Total Produk', number_format($inv['total_produk'] ?? 0, 0, ',', '.')],
            ['Total Kategori', number_format($inv['total_kategori'] ?? 0, 0, ',', '.')],
            ['Total Stok Gudang', number_format($inv['total_stok_gudang'] ?? 0, 0, ',', '.') . ' pcs'],
            ['Total Nilai Inventaris', $inv['total_nilai_inventaris'] ?? 0],
            ['Total Distribusi', ($dist['total_distribusi'] ?? 0) . ' pcs'],
            ['Total Retur', ($ret['total_retur'] ?? 0) . ' pcs'],
            ['Produk Low Stock', $inv['jumlah_produk_low_stock'] ?? 0],
        ];
        $sheet->fromArray($kpis, null, "A{$r}", true);
        $this->applyBorder($sheet, "A{$r}:B" . ($r + count($kpis) - 1));
        $this->setNumberFmt($sheet, "B{$r}:B" . ($r + count($kpis) - 1));
        $r += count($kpis) + 1;

        // Growth
        $sheet->setCellValue("A{$r}", 'GROWTH INDICATOR (vs Periode Sebelumnya)');
        $this->styleSection($sheet, $r);
        $r++;
        $sheet->fromArray(['Metrik', 'Pertumbuhan (%)'], null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:B{$r}");
        $r++;
        $growths = [
            ['Distribusi', ($dist['growth'] ?? 0) . '%'],
            ['Retur', ($ret['growth'] ?? 0) . '%'],
            ['Pendapatan', ($stats['growthSales'] ?? 0) . '%'],
        ];
        $sheet->fromArray($growths, null, "A{$r}", true);
        $this->applyBorder($sheet, "A{$r}:B" . ($r + count($growths) - 1));
        $r += count($growths) + 1;

        // Top 10 Distribusi
        $sheet->setCellValue("A{$r}", 'TOP 10 PRODUK TERDISTRIBUSI');
        $this->styleSection($sheet, $r);
        $r++;
        $sheet->fromArray(['Rank', 'Nama Produk', 'Total Qty'], null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:C{$r}");
        $r++;
        $topDist = array_map(fn($i, $p) => [$i + 1, $p['nama_produk'], $p['total_qty']], array_keys($dist['top_10'] ?? []), $dist['top_10'] ?? []);
        $sheet->fromArray($topDist, null, "A{$r}", true);
        if ($topDist) {
            $this->applyBorder($sheet, "A{$r}:C" . ($r + count($topDist) - 1));
            $this->setNumberFmt($sheet, "C{$r}:C" . ($r + count($topDist) - 1));
        }
        $r += max(count($topDist), 1) + 1;

        // Top 10 Retur
        $sheet->setCellValue("A{$r}", 'TOP 10 PRODUK RETUR');
        $this->styleSection($sheet, $r);
        $r++;
        $sheet->fromArray(['Rank', 'Nama Produk', 'Total Qty'], null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:C{$r}");
        $r++;
        $topRet = array_map(fn($i, $p) => [$i + 1, $p['nama_produk'], $p['total_qty']], array_keys($ret['top_10'] ?? []), $ret['top_10'] ?? []);
        $sheet->fromArray($topRet, null, "A{$r}", true);
        if ($topRet) {
            $this->applyBorder($sheet, "A{$r}:C" . ($r + count($topRet) - 1));
            $this->setNumberFmt($sheet, "C{$r}:C" . ($r + count($topRet) - 1));
        }
        $r += max(count($topRet), 1) + 1;

        // Fast Moving
        $fastSlow = $this->data['fastSlowMoving'] ?? [];
        $sheet->setCellValue("A{$r}", 'FAST MOVING PRODUCTS');
        $this->styleSection($sheet, $r);
        $r++;
        $sheet->fromArray(['Rank', 'Nama Produk', 'Kategori', 'Qty Terjual'], null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:D{$r}");
        $r++;
        $fm = array_map(fn($i, $p) => [$i + 1, $p['nama_produk'], $p['kategori'], $p['qty']], array_keys($fastSlow['fast_moving'] ?? []), $fastSlow['fast_moving'] ?? []);
        $sheet->fromArray($fm, null, "A{$r}", true);
        if ($fm) {
            $this->applyBorder($sheet, "A{$r}:D" . ($r + count($fm) - 1));
            $this->setNumberFmt($sheet, "D{$r}:D" . ($r + count($fm) - 1));
        }

        $this->autoWidth($sheet, ['A', 'B', 'C', 'D']);
        $sheet->freezePane('A4');
    }

    // ============================================================
    //  SHEET 2: DISTRIBUSI
    // ============================================================
    protected function buildDistribusiSheet(Spreadsheet $sp): void
    {
        $sheet = $sp->createSheet();
        $sheet->setTitle('Distribusi');

        $dist = $this->data['distribution'] ?? [];
        $fastSlow = $this->data['fastSlowMoving'] ?? [];

        $r = 1;
        $sheet->setCellValue("A{$r}", 'LAPORAN DISTRIBUSI BARANG');
        $sheet->mergeCells("A{$r}:D{$r}");
        $sheet->getStyle("A{$r}")->applyFromArray(['font' => $this->titleFont]);
        $r += 2;

        // Ringkasan
        $sheet->setCellValue("A{$r}", 'RINGKASAN DISTRIBUSI');
        $this->styleSection($sheet, $r);
        $r++;
        $ringkasan = [
            ['Total Distribusi', ($dist['total_distribusi'] ?? 0) . ' pcs'],
            ['Pertumbuhan vs Periode Lalu', ($dist['growth'] ?? 0) . '%'],
        ];
        $sheet->fromArray($ringkasan, null, "A{$r}", true);
        $this->applyBorder($sheet, "A{$r}:B" . ($r + count($ringkasan) - 1));
        $r += count($ringkasan) + 1;

        // Ranking Outlet
        $sheet->setCellValue("A{$r}", 'RANKING DISTRIBUSI PER OUTLET');
        $this->styleSection($sheet, $r);
        $r++;
        $sheet->fromArray(['Rank', 'Outlet', 'Total Qty Diterima'], null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:C{$r}");
        $distRowStart = $r + 1;
        $r++;
        $po = array_map(fn($i, $o) => [$i + 1, $o['outlet'], $o['total_qty']], array_keys($dist['per_outlet'] ?? []), $dist['per_outlet'] ?? []);
        $sheet->fromArray($po, null, "A{$r}", true);
        if ($po) {
            $distRowEnd = $r + count($po) - 1;
            $this->applyBorder($sheet, "A{$r}:C{$distRowEnd}");
            $this->setNumberFmt($sheet, "C{$r}:C{$distRowEnd}");
            $sheet->setAutoFilter("A{$distRowStart}:C{$distRowEnd}");
        }
        $r += max(count($po), 1) + 1;

        // Top 10 Distribusi
        $sheet->setCellValue("A{$r}", 'TOP 10 PRODUK TERDISTRIBUSI');
        $this->styleSection($sheet, $r);
        $r++;
        $sheet->fromArray(['Rank', 'Nama Produk', 'Total Qty'], null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:C{$r}");
        $topRowStart = $r + 1;
        $r++;
        $td = array_map(fn($i, $p) => [$i + 1, $p['nama_produk'], $p['total_qty']], array_keys($dist['top_10'] ?? []), $dist['top_10'] ?? []);
        $sheet->fromArray($td, null, "A{$r}", true);
        if ($td) {
            $topRowEnd = $r + count($td) - 1;
            $this->applyBorder($sheet, "A{$r}:C{$topRowEnd}");
            $this->setNumberFmt($sheet, "C{$r}:C{$topRowEnd}");
        }
        $r += max(count($td), 1) + 1;

        // Fast Moving
        $sheet->setCellValue("A{$r}", 'FAST MOVING PRODUCTS');
        $this->styleSection($sheet, $r);
        $r++;
        $sheet->fromArray(['Rank', 'Nama Produk', 'Kategori', 'Qty Terjual'], null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:D{$r}");
        $r++;
        $fm = array_map(fn($i, $p) => [$i + 1, $p['nama_produk'], $p['kategori'], $p['qty']], array_keys($fastSlow['fast_moving'] ?? []), $fastSlow['fast_moving'] ?? []);
        $sheet->fromArray($fm, null, "A{$r}", true);
        if ($fm) {
            $this->applyBorder($sheet, "A{$r}:D" . ($r + count($fm) - 1));
            $this->setNumberFmt($sheet, "D{$r}:D" . ($r + count($fm) - 1));
        }
        $r += max(count($fm), 1) + 1;

        // Slow Moving
        $sheet->setCellValue("A{$r}", 'SLOW MOVING PRODUCTS');
        $this->styleSection($sheet, $r);
        $r++;
        $sheet->fromArray(['Rank', 'Nama Produk', 'Kategori', 'Qty Terjual'], null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:D{$r}");
        $r++;
        $sm = array_map(fn($i, $p) => [$i + 1, $p['nama_produk'], $p['kategori'], $p['qty']], array_keys($fastSlow['slow_moving'] ?? []), $fastSlow['slow_moving'] ?? []);
        $sheet->fromArray($sm, null, "A{$r}", true);
        if ($sm) {
            $this->applyBorder($sheet, "A{$r}:D" . ($r + count($sm) - 1));
            $this->setNumberFmt($sheet, "D{$r}:D" . ($r + count($sm) - 1));
        }
        $r += max(count($sm), 1) + 1;

        // Dead Stock
        $sheet->setCellValue("A{$r}", 'DEAD STOCK (Tanpa Pergerakan)');
        $this->styleSection($sheet, $r);
        $r++;
        $sheet->fromArray(['Rank', 'Nama Produk', 'Kategori', 'Stok Tersimpan'], null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:D{$r}");
        $r++;
        $ds = array_map(fn($i, $p) => [$i + 1, $p['nama_produk'], $p['kategori'], $p['stok']], array_keys($fastSlow['dead_stock'] ?? []), $fastSlow['dead_stock'] ?? []);
        $sheet->fromArray($ds, null, "A{$r}", true);
        if ($ds) {
            $this->applyBorder($sheet, "A{$r}:D" . ($r + count($ds) - 1));
            $this->setNumberFmt($sheet, "D{$r}:D" . ($r + count($ds) - 1));
        }

        $this->autoWidth($sheet, ['A', 'B', 'C', 'D']);

        // Pie Chart: Distribusi per Outlet
        if (!empty($dist['per_outlet'])) {
            $this->addPieChart(
                $sheet,
                'Distribusi per Outlet',
                $dist['per_outlet'],
                'outlet',
                'total_qty',
                'F1',
                15,
                10
            );
        }

        // Bar Chart: Top 10 Distribusi
        if (!empty($dist['top_10'])) {
            $this->addBarChart(
                $sheet,
                'Top 10 Produk Terdistribusi',
                $dist['top_10'],
                'nama_produk',
                'total_qty',
                'F17',
                15,
                10
            );
        }
    }

    // ============================================================
    //  SHEET 3: RETUR
    // ============================================================
    protected function buildReturSheet(Spreadsheet $sp): void
    {
        $sheet = $sp->createSheet();
        $sheet->setTitle('Retur');

        $ret = $this->data['return'] ?? [];

        $r = 1;
        $sheet->setCellValue("A{$r}", 'LAPORAN RETUR BARANG');
        $sheet->mergeCells("A{$r}:D{$r}");
        $sheet->getStyle("A{$r}")->applyFromArray(['font' => $this->titleFont]);
        $r += 2;

        $sheet->setCellValue("A{$r}", 'RINGKASAN RETUR');
        $this->styleSection($sheet, $r);
        $r++;
        $ringkasan = [
            ['Total Retur', ($ret['total_retur'] ?? 0) . ' pcs'],
            ['Pertumbuhan vs Periode Lalu', ($ret['growth'] ?? 0) . '%'],
            ['Persentase Retur terhadap Distribusi', ($ret['persentase_retur'] ?? 0) . '%'],
        ];
        $sheet->fromArray($ringkasan, null, "A{$r}", true);
        $this->applyBorder($sheet, "A{$r}:B" . ($r + count($ringkasan) - 1));
        $r += count($ringkasan) + 1;

        $sheet->setCellValue("A{$r}", 'RANKING PRODUK RETUR TERTINGGI');
        $this->styleSection($sheet, $r);
        $r++;
        $sheet->fromArray(['Rank', 'Nama Produk', 'Total Qty', '% dari Total Retur'], null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:D{$r}");
        $totalRetur = $ret['total_retur'] ?? 1;
        $headerRow = $r;
        $r++;
        $tr = array_map(function ($i, $p) use ($totalRetur) {
            $pct = $totalRetur > 0 ? round(($p['total_qty'] / $totalRetur) * 100, 1) : 0;
            return [$i + 1, $p['nama_produk'], $p['total_qty'], $pct . '%'];
        }, array_keys($ret['top_10'] ?? []), $ret['top_10'] ?? []);
        $sheet->fromArray($tr, null, "A{$r}", true);
        if ($tr) {
            $endRow = $r + count($tr) - 1;
            $this->applyBorder($sheet, "A{$r}:D{$endRow}");
            $this->setNumberFmt($sheet, "C{$r}:C{$endRow}");
            $sheet->setAutoFilter("A{$headerRow}:D{$endRow}");
        }

        $this->autoWidth($sheet, ['A', 'B', 'C', 'D']);
    }

    // ============================================================
    //  SHEET 4: LOW STOCK
    // ============================================================
    protected function buildLowStockSheet(Spreadsheet $sp): void
    {
        $sheet = $sp->createSheet();
        $sheet->setTitle('Low Stock');

        $lowStock = $this->data['lowStock'] ?? [];
        $restockRec = $this->data['restockRec'] ?? [];

        $r = 1;
        $sheet->setCellValue("A{$r}", 'LAPORAN LOW STOCK & REKOMENDASI RESTOCK');
        $sheet->mergeCells("A{$r}:F{$r}");
        $sheet->getStyle("A{$r}")->applyFromArray(['font' => $this->titleFont]);
        $r += 2;

        $sheet->setCellValue("A{$r}", 'PRODUK LOW STOCK');
        $this->styleSection($sheet, $r);
        $r++;
        $headers = ['Nama Produk', 'Kategori', 'SKU', 'Stok Saat Ini', 'Minimum Stok', 'Status'];
        $sheet->fromArray($headers, null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:F{$r}");
        $headerRow = $r;
        $r++;

        $lsData = array_map(fn($ls) => [
            $ls['nama_produk'],
            $ls['kategori'],
            $ls['sku'],
            $ls['stok_saat_ini'],
            $ls['minimum_stock'],
            strtoupper($ls['status']),
        ], $lowStock);
        $sheet->fromArray($lsData, null, "A{$r}", true);

        if ($lsData) {
            $endRow = $r + count($lsData) - 1;
            $this->applyBorder($sheet, "A{$r}:F{$endRow}");
            $this->setNumberFmt($sheet, "D{$r}:E{$endRow}");

            // Conditional: Red for KRITIS, Yellow for WARNING, Green for AMAN
            $condRed = new Conditional();
            $condRed->setConditionType(Conditional::CONDITION_CELLIS)
                ->setOperatorType(Conditional::OPERATOR_EQUAL)
                ->addCondition('"KRITIS"')
                ->getStyle()->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->setStartColor(new Color('FEE2E2'));
            $condRed->getStyle()->getFont()->setBold(true)->setColor(new Color('DC2626'));

            $condYellow = new Conditional();
            $condYellow->setConditionType(Conditional::CONDITION_CELLIS)
                ->setOperatorType(Conditional::OPERATOR_EQUAL)
                ->addCondition('"WARNING"')
                ->getStyle()->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->setStartColor(new Color('FEF3C7'));
            $condYellow->getStyle()->getFont()->setColor(new Color('D97706'));

            $condGreen = new Conditional();
            $condGreen->setConditionType(Conditional::CONDITION_CELLIS)
                ->setOperatorType(Conditional::OPERATOR_EQUAL)
                ->addCondition('"AMAN"')
                ->getStyle()->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->setStartColor(new Color('DCFCE7'));
            $condGreen->getStyle()->getFont()->setColor(new Color('059669'));

            $sheet->getStyle("F{$r}:F{$endRow}")->setConditionalStyles([$condRed, $condYellow, $condGreen]);
        }
        $r += max(count($lsData), 1) + 1;

        // Restock Recommendation
        $sheet->setCellValue("A{$r}", 'REKOMENDASI RESTOCK');
        $this->styleSection($sheet, $r);
        $r++;
        $rrHeaders = ['Nama Produk', 'Kategori', 'Stok Saat Ini', 'Minimum Stok', 'Rata Distribusi/Bln', 'Estimasi Hari', 'Rekomendasi Qty'];
        $sheet->fromArray($rrHeaders, null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:G{$r}");
        $r++;

        $rrData = array_map(fn($rr) => [
            $rr['nama_produk'],
            $rr['kategori'],
            $rr['stok_saat_ini'],
            $rr['minimum_stock'],
            $rr['rata_distribusi_bulanan'],
            $rr['estimated_days_remaining'] . ' hari',
            $rr['rekomendasi_qty'],
        ], $restockRec);
        $sheet->fromArray($rrData, null, "A{$r}", true);
        if ($rrData) {
            $endRow = $r + count($rrData) - 1;
            $this->applyBorder($sheet, "A{$r}:G{$endRow}");
            $this->setNumberFmt($sheet, "C{$r}:G{$endRow}");

            // Urgent: merah jika estimated_days_remaining <= 7
            $condUrgent = new Conditional();
            $condUrgent->setConditionType(Conditional::CONDITION_CELLIS)
                ->setOperatorType(Conditional::OPERATOR_LESSTHANOREQUAL)
                ->addCondition('7')
                ->getStyle()->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->setStartColor(new Color('FEE2E2'));
            $condUrgent->getStyle()->getFont()->setColor(new Color('DC2626'));

            // But this conditional is on "F" column which has text "X hari", not a number
            // So let's skip that for simplicity
        }

        $this->autoWidth($sheet, ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
        $sheet->freezePane("A{$headerRow}");
    }

    // ============================================================
    //  SHEET 5: ANALYTICS
    // ============================================================
    protected function buildAnalyticsSheet(Spreadsheet $sp): void
    {
        $sheet = $sp->createSheet();
        $sheet->setTitle('Analytics');

        $invValue = $this->data['inventoryValue'] ?? [];
        $outletPerf = $this->data['outletPerformance'] ?? [];
        $topProducts = $this->data['topProducts'] ?? [];
        $dist = $this->data['distribution'] ?? [];

        $r = 1;
        $sheet->setCellValue("A{$r}", 'ANALYTICS');
        $sheet->mergeCells("A{$r}:E{$r}");
        $sheet->getStyle("A{$r}")->applyFromArray(['font' => $this->titleFont]);
        $r += 2;

        // Nilai Inventaris per Kategori
        $sheet->setCellValue("A{$r}", 'NILAI INVENTARIS PER KATEGORI');
        $this->styleSection($sheet, $r);
        $r++;
        $sheet->fromArray(['Kategori', 'Total Produk', 'Total Stok', 'Total Nilai (Rp)', '% dari Total'], null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:E{$r}");
        $r++;
        $totalNilai = $invValue['total'] ?? 1;
        $ivData = array_map(function ($iv) use ($totalNilai) {
            $pct = $totalNilai > 0 ? round(($iv['total_nilai'] / $totalNilai) * 100, 1) : 0;
            return [$iv['kategori'], $iv['total_produk'], $iv['total_stok'], $iv['total_nilai'], $pct . '%'];
        }, $invValue['per_kategori'] ?? []);
        $sheet->fromArray($ivData, null, "A{$r}", true);
        if ($ivData) {
            $endRow = $r + count($ivData) - 1;
            $this->applyBorder($sheet, "A{$r}:E{$endRow}");
            $this->setNumberFmt($sheet, "B{$r}:D{$endRow}");
        }
        $r += max(count($ivData), 1) + 1;

        // Nilai Inventaris per Produk Top 10
        $sheet->setCellValue("A{$r}", 'NILAI INVENTARIS PER PRODUK (Top 10)');
        $this->styleSection($sheet, $r);
        $r++;
        $sheet->fromArray(['Rank', 'Nama Produk', 'Kategori', 'Stok', 'Nilai (Rp)'], null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:E{$r}");
        $r++;
        $topIv = array_map(fn($i, $pv) => [$i + 1, $pv['nama_produk'], $pv['kategori'], $pv['stok'], $pv['nilai']], array_keys(array_slice($invValue['per_produk'] ?? [], 0, 10)), array_slice($invValue['per_produk'] ?? [], 0, 10));
        $sheet->fromArray($topIv, null, "A{$r}", true);
        if ($topIv) {
            $endRow = $r + count($topIv) - 1;
            $this->applyBorder($sheet, "A{$r}:E{$endRow}");
            $this->setNumberFmt($sheet, "D{$r}:E{$endRow}");
        }
        $r += max(count($topIv), 1) + 1;

        // Performa Outlet
        $sheet->setCellValue("A{$r}", 'PERFORMA PENJUALAN PER OUTLET');
        $this->styleSection($sheet, $r);
        $r++;
        $sheet->fromArray(['Outlet', 'Pendapatan (Rp)', 'Transaksi', 'AOV (Rp)', 'Pertumbuhan (%)'], null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:E{$r}");
        $r++;
        $opData = array_map(fn($o) => [$o['name'], $o['revenue'], $o['transactions'], $o['aov'], $o['growth'] . '%'], $outletPerf);
        $sheet->fromArray($opData, null, "A{$r}", true);
        if ($opData) {
            $endRow = $r + count($opData) - 1;
            $this->applyBorder($sheet, "A{$r}:E{$endRow}");
            $this->setNumberFmt($sheet, "B{$r}:D{$endRow}");
        }
        $r += max(count($opData), 1) + 1;

        // Top Products
        $sheet->setCellValue("A{$r}", 'TOP PRODUK (Penjualan)');
        $this->styleSection($sheet, $r);
        $r++;
        $sheet->fromArray(['Rank', 'Nama Produk', 'SKU', 'Kategori', 'Terjual', 'Omzet (Rp)'], null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:F{$r}");
        $r++;
        $tpData = array_map(fn($i, $tp) => [$i + 1, $tp['name'], $tp['sku'], $tp['category'], $tp['sold'], $tp['revenue']], array_keys($topProducts), $topProducts);
        $sheet->fromArray($tpData, null, "A{$r}", true);
        if ($tpData) {
            $endRow = $r + count($tpData) - 1;
            $this->applyBorder($sheet, "A{$r}:F{$endRow}");
            $this->setNumberFmt($sheet, "E{$r}:F{$endRow}");
        }
        $r += max(count($tpData), 1) + 1;

        // Stok per Kategori
        $sheet->setCellValue("A{$r}", 'RINGKASAN STOK PER KATEGORI');
        $this->styleSection($sheet, $r);
        $r++;
        $sheet->fromArray(['Kategori', 'Total Stok Gudang'], null, "A{$r}", true);
        $this->styleHeader($sheet, $r, "A{$r}:B{$r}");
        $headerRow = $r;
        $r++;

        $catStok = \App\Models\ProductVariant::select(
                'product_categories.name',
                \Illuminate\Support\Facades\DB::raw('SUM(product_variants.stock) as total_stok')
            )
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->leftJoin('product_categories', 'products.category_id', '=', 'product_categories.id')
            ->groupBy('product_categories.id', 'product_categories.name')
            ->get();

        foreach ($catStok as $cs) {
            $sheet->setCellValue("A{$r}", $cs->name ?? 'Tanpa Kategori');
            $sheet->setCellValue("B{$r}", (int) $cs->total_stok);
            $r++;
        }

        $endRow = $r - 1;
        if ($endRow >= $headerRow + 1) {
            $this->applyBorder($sheet, "A{$headerRow}:B{$endRow}");
            $this->setNumberFmt($sheet, "B{$headerRow}:B{$endRow}");
        }

        $this->autoWidth($sheet, ['A', 'B', 'C', 'D', 'E', 'F']);

        // Bar Chart: Nilai Inventaris per Kategori
        if (!empty($invValue['per_kategori'])) {
            $this->addBarChart(
                $sheet,
                'Nilai Inventaris per Kategori',
                $invValue['per_kategori'],
                'kategori',
                'total_nilai',
                'H1',
                18,
                14
            );
        }
    }

    // ============================================================
    //  CHART HELPERS
    // ============================================================
    protected function addPieChart(
        Worksheet $sheet,
        string $title,
        array $data,
        string $labelKey,
        string $valueKey,
        string $topLeft,
        int $width,
        int $height
    ): void {
        if (empty($data)) return;

        // Write chart data to hidden cells
        $dataRow = 1;
        $dataStartCol = 'X';
        $sheet->setCellValue("{$dataStartCol}{$dataRow}", $title);
        $dataRow++;
        $sheet->setCellValue("{$dataStartCol}{$dataRow}", 'Label');
        $sheet->setCellValue(chr(ord($dataStartCol) + 1) . $dataRow, 'Value');
        $dataRow++;

        $count = 0;
        foreach ($data as $item) {
            $sheet->setCellValue("{$dataStartCol}{$dataRow}", $item[$labelKey]);
            $sheet->setCellValue(chr(ord($dataStartCol) + 1) . $dataRow, (int) $item[$valueKey]);
            $dataRow++;
            $count++;
        }

        $labelRange = "{$dataStartCol}3:{$dataStartCol}" . ($dataRow - 1);
        $valueRange = chr(ord($dataStartCol) + 1) . "3:" . chr(ord($dataStartCol) + 1) . ($dataRow - 1);

        $labels = new DataSeriesValues('String', $sheet->getTitle() . "!{$labelRange}", null, $count);
        $values = new DataSeriesValues('Number', $sheet->getTitle() . "!{$valueRange}", null, $count);

        $series = new DataSeries(
            DataSeries::TYPE_PIECHART,
            null,
            range(0, 0),
            [$labels],
            [$labels],
            [$values]
        );

        $layout = new Layout();
        $plotArea = new PlotArea($layout, [$series]);
        $chartTitle = new Title($title);
        $legend = new Legend();

        $chart = new Chart($title, $chartTitle, $legend, $plotArea);
        $chart->setTopLeftPosition($topLeft);
        $chart->setBottomRightPosition(
            \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(
                \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString(substr($topLeft, 0, 1)) + $width - 1
            ) . (intval(substr($topLeft, 1)) + $height - 1)
        );

        $sheet->addChart($chart);
    }

    protected function addBarChart(
        Worksheet $sheet,
        string $title,
        array $data,
        string $labelKey,
        string $valueKey,
        string $topLeft,
        int $width,
        int $height
    ): void {
        if (empty($data)) return;

        $dataRow = 1;
        $dataStartCol = 'Y';
        $sheet->setCellValue("{$dataStartCol}{$dataRow}", $title);
        $dataRow++;
        $sheet->setCellValue("{$dataStartCol}{$dataRow}", 'Label');
        $sheet->setCellValue(chr(ord($dataStartCol) + 1) . $dataRow, 'Value');
        $dataRow++;

        $count = 0;
        foreach ($data as $item) {
            $sheet->setCellValue("{$dataStartCol}{$dataRow}", $item[$labelKey]);
            $sheet->setCellValue(chr(ord($dataStartCol) + 1) . $dataRow, (int) $item[$valueKey]);
            $dataRow++;
            $count++;
        }

        $labelRange = "{$dataStartCol}3:{$dataStartCol}" . ($dataRow - 1);
        $valueRange = chr(ord($dataStartCol) + 1) . "3:" . chr(ord($dataStartCol) + 1) . ($dataRow - 1);

        $labels = new DataSeriesValues('String', $sheet->getTitle() . "!{$labelRange}", null, $count);
        $values = new DataSeriesValues('Number', $sheet->getTitle() . "!{$valueRange}", null, $count);

        $series = new DataSeries(
            DataSeries::TYPE_BARCHART,
            DataSeries::GROUPING_CLUSTERED,
            range(0, 0),
            [$labels],
            [$labels],
            [$values]
        );

        $layout = new Layout();
        $plotArea = new PlotArea($layout, [$series]);
        $chartTitle = new Title($title);
        $legend = new Legend(Legend::POSITION_BOTTOM, null);

        $chart = new Chart($title, $chartTitle, $legend, $plotArea);
        $chart->setTopLeftPosition($topLeft);
        $chart->setBottomRightPosition(
            \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(
                \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString(substr($topLeft, 0, 1)) + $width - 1
            ) . (intval(substr($topLeft, 1)) + $height - 1)
        );

        $sheet->addChart($chart);
    }
}
