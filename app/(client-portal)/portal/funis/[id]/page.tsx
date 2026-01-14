"use client";

import { useState } from "react";
import { FunnelCanvas } from "@/components/funnel/FunnelCanvas";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Settings2, 
  ChevronRight,
  Share2
} from "lucide-react";
import Link from "next/link";
import { addDays } from "date-fns";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

const INITIAL_NODES = [
  {
    id: '1',
    type: 'ad_source',
    position: { x: 250, y: 0 },
    data: { 
      type: 'ad_source', 
      label: 'Meta Ads (Tráfego)', 
      spend: '1.250', 
      clicks: '5.200',
      sparkline: [{ v: 10 }, { v: 12 }, { v: 18 }, { v: 15 }, { v: 22 }, { v: 30 }, { v: 28 }]
    },
  },
  {
    id: '2',
    type: 'page',
    position: { x: 250, y: 250 },
    data: { 
      type: 'page', 
      label: 'Landing Page VSL', 
      visits: '4.800', 
      scroll: '65',
      sparkline: [{ v: 8 }, { v: 10 }, { v: 14 }, { v: 12 }, { v: 18 }, { v: 24 }, { v: 22 }]
    },
  },
  {
    id: '3',
    type: 'checkout',
    position: { x: 250, y: 500 },
    data: { 
      type: 'checkout', 
      label: 'Página de Pagamento', 
      checkouts: '450', 
      abandonment: '42',
      sparkline: [{ v: 4 }, { v: 5 }, { v: 7 }, { v: 6 }, { v: 8 }, { v: 10 }, { v: 9 }]
    },
  },
  {
    id: '4',
    type: 'purchase',
    position: { x: 250, y: 750 },
    data: { 
      type: 'purchase', 
      label: 'Vendas Aprovadas', 
      sales: '260', 
      aov: '297,00',
      sparkline: [{ v: 2 }, { v: 3 }, { v: 4 }, { v: 3 }, { v: 5 }, { v: 6 }, { v: 5 }]
    },
  },
];

const INITIAL_EDGES = [
  { id: 'e1-2', source: '1', target: '2', type: 'custom', data: { conversionRate: 92 } },
  { id: 'e2-3', source: '2', target: '3', type: 'custom', data: { conversionRate: 9 } },
  { id: 'e3-4', source: '3', target: '4', type: 'custom', data: { conversionRate: 58 } },
];

export default function FunnelPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date()
  });

  return (
    <div className="h-screen flex flex-col space-y-6 p-8 overflow-hidden bg-black/40 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/portal/funis">
            <Button variant="outline" size="icon" className="bg-zinc-900 border-white/5 hover:bg-zinc-800 rounded-xl">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase font-bold tracking-widest">
              <span>Performance</span>
              <ChevronRight size={10} />
              <span>Funis</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Funil de Escala - Lançamento Jan</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DateRangePicker 
            value={dateRange}
            onChange={setDateRange}
          />
          <Button variant="outline" className="bg-zinc-900 border-white/5 gap-2 hover:bg-zinc-800">
            <Settings2 size={16} /> Configurações
          </Button>
          <Button variant="outline" className="bg-zinc-900 border-white/5 gap-2 hover:bg-zinc-800">
            <Share2 size={16} /> Compartilhar
          </Button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1">
        <FunnelCanvas 
            initialNodes={INITIAL_NODES} 
            initialEdges={INITIAL_EDGES} 
        />
      </div>
    </div>
  );
}
