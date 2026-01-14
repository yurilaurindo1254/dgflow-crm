"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCorners,
} from "@dnd-kit/core";
import {
  arrayMove,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { PipelineColumn } from "./pipeline-column";
import { DealCard, Deal } from "./deal-card";
import { supabase } from "@/lib/supabase";

const STAGES = [
  { id: "new", title: "Novo Lead" },
  { id: "contact", title: "Primeiro Contato" },
  { id: "proposal", title: "Proposta Enviada" },
  { id: "negotiation", title: "Em Negociação" },
  { id: "won", title: "Fechado Ganho" },
];

interface PipelineBoardProps {
  searchQuery?: string;
  filters?: { minValues?: number; priority?: string };
  onlyMyDeals?: boolean;
}

export function PipelineBoard({ searchQuery = "", filters = {}, onlyMyDeals = false }: PipelineBoardProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  async function fetchDeals() {
    const { data } = await supabase.from('deals').select('*');
    if (data) setDeals(data as Deal[]);
    
    // Fetch current user for "My Deals" filter
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  }

  useEffect(() => {
     setMounted(true); // eslint-disable-line
     fetchDeals();
  }, []);

  const filteredDeals = deals.filter(deal => {
    // 1. Text Search
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = deal.title.toLowerCase().includes(query);
        const matchesClient = deal.client_name && deal.client_name.toLowerCase().includes(query);
        if (!matchesTitle && !matchesClient) return false;
    }

    // 2. Value Filter
    if (filters.minValues && (deal.value || 0) < filters.minValues) return false;

    // 3. Priority Filter
    if (filters.priority) {
        if (!deal.priority) return false;
        if (deal.priority.toLowerCase() !== filters.priority.toLowerCase()) return false;
    }

    // 4. My Deals Filter
    if (onlyMyDeals && currentUserId) {
        // Check both user_id (standard) and assignee object logic as fallback
        const dealUserId = deal.user_id; 
        if (dealUserId !== currentUserId) return false;
    }

    return true;
  });

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Deal") {
      setActiveDeal(event.active.data.current.deal);
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const isActiveDeal = active.data.current?.type === "Deal";
    const isOverColumn = over.data.current?.type === "Column";

    if (isActiveDeal && isOverColumn) {
        const newStage = overId as string;
        
        setDeals((prev) => {
            return prev.map(d => 
                d.id === activeId ? { ...d, stage: newStage } : d
            );
        });

        await supabase.from('deals').update({ stage: newStage }).eq('id', activeId);
    }
  }
  
  function onDragOver(event: DragOverEvent) {
      const { active, over } = event;
      if (!over) return;
      
      const activeId = active.id;
      const overId = over.id;
      
      if (activeId === overId) return;

      const isActiveDeal = active.data.current?.type === "Deal";
      const isOverDeal = over.data.current?.type === "Deal";

      if (isActiveDeal && isOverDeal) {
          setDeals((deals) => {
              const activeIndex = deals.findIndex((d) => d.id === activeId);
              const overIndex = deals.findIndex((d) => d.id === overId);
              
              if (deals[activeIndex].stage !== deals[overIndex].stage) {
                deals[activeIndex].stage = deals[overIndex].stage;
                return arrayMove(deals, activeIndex, overIndex - 1);
              }

              return arrayMove(deals, activeIndex, overIndex);
          });
      }
  }

  return (
      <div className="flex gap-6 h-full min-w-full w-max px-4 pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          {mounted && (
            <>
                {STAGES.map((stage) => (
                <PipelineColumn
                    key={stage.id}
                    id={stage.id}
                    title={stage.title}
                    deals={filteredDeals.filter((deal) => deal.stage === stage.id)}
                />
                ))}
            </>
          )}

          {mounted && createPortal(
            <DragOverlay>
              {activeDeal ? <DealCard deal={activeDeal} /> : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
  );
}
