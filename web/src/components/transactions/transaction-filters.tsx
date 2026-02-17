"use client";

import { Select } from "@/components/ui/select";

interface TransactionFiltersProps {
  status: string;
  direction: string;
  onStatusChange: (status: string) => void;
  onDirectionChange: (direction: string) => void;
}

export function TransactionFilters({
  status,
  direction,
  onStatusChange,
  onDirectionChange,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="w-40"
      >
        <option value="">All States</option>
        <option value="PENDING">Pending</option>
        <option value="FINALIZED">Finalized</option>
        <option value="CANCELLED">Cancelled</option>
        <option value="FROZEN">Frozen</option>
        <option value="RECOVERED">Recovered</option>
      </Select>
      <Select
        value={direction}
        onChange={(e) => onDirectionChange(e.target.value)}
        className="w-40"
      >
        <option value="">All Directions</option>
        <option value="sent">Sent</option>
        <option value="received">Received</option>
      </Select>
    </div>
  );
}
