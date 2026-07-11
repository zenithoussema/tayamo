"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronUp, ChevronDown, Eye, Check } from "lucide-react";
import EmptyState from "./EmptyState";
import { Inbox } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (item: T) => React.ReactNode;
  hidden?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string | number;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  selectable?: boolean;
  selectedKeys?: (string | number)[];
  onSelectionChange?: (keys: (string | number)[]) => void;
  bulkActions?: React.ReactNode;
  stickyHeader?: boolean;
  compact?: boolean;
  onColumnVisibilityChange?: (hiddenColumns: string[]) => void;
}

function SortIcon({ active, order }: { active: boolean; order?: "asc" | "desc" }) {
  if (!active) {
    return (
      <div className="ml-1 flex flex-col opacity-30">
        <ChevronUp size={12} />
        <ChevronDown size={12} className="-mt-1" />
      </div>
    );
  }
  return (
    <div className="ml-1 text-[var(--admin-gold)]">
      {order === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </div>
  );
}

export default function DataTable<T>({
  columns,
  data,
  sortBy,
  sortOrder = "asc",
  onSort,
  onRowClick,
  keyExtractor,
  emptyIcon,
  emptyTitle = "Aucune donnée",
  emptyDescription,
  selectable = false,
  selectedKeys: controlledSelectedKeys,
  onSelectionChange,
  bulkActions,
  stickyHeader = false,
  compact = false,
  onColumnVisibilityChange,
}: DataTableProps<T>) {
  const [isMobile, setIsMobile] = useState(false);
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<(string | number)[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(
    columns.filter((c) => c.hidden).map((c) => c.key)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;

  const isControlled = controlledSelectedKeys !== undefined;

  const toggleSelection = useCallback(
    (key: string | number) => {
      const next = selectedKeys.includes(key)
        ? selectedKeys.filter((k) => k !== key)
        : [...selectedKeys, key];
      if (isControlled) {
        onSelectionChange?.(next);
      } else {
        setInternalSelectedKeys(next);
        onSelectionChange?.(next);
      }
    },
    [selectedKeys, isControlled, onSelectionChange]
  );

  const toggleSelectAll = useCallback(() => {
    const allKeys = data.map((item) => keyExtractor(item));
    const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedKeys.includes(k));
    const next = allSelected ? [] : allKeys;
    if (isControlled) {
      onSelectionChange?.(next);
    } else {
      setInternalSelectedKeys(next);
      onSelectionChange?.(next);
    }
  }, [data, keyExtractor, selectedKeys, isControlled, onSelectionChange]);

  const visibleColumns = columns.filter((col) => !hiddenColumns.includes(col.key));

  const toggleColumnVisibility = (key: string) => {
    setHiddenColumns((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      onColumnVisibilityChange?.(next);
      return next;
    });
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon || <Inbox size={28} className="text-[var(--admin-text-dim)]" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  const pxClass = compact ? "px-3" : "px-4";
  const pyClass = compact ? "py-2" : "py-3";
  const pyCellClass = compact ? "py-2.5" : "py-3.5";

  const allKeys = data.map((item) => keyExtractor(item));
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedKeys.includes(k));
  const someSelected = selectedKeys.length > 0 && !allSelected;
  const selectedCount = selectedKeys.length;

  const bulkBar = selectable && selectedCount > 0 && (
    <div className="flex items-center gap-4 rounded-xl border border-[var(--admin-gold)]/20 bg-[var(--admin-gold)]/5 px-4 py-3 mb-4 animate-fade-in">
      <span className="text-sm font-medium text-[var(--admin-gold)]">
        {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
      </span>
      {bulkActions && <div className="flex items-center gap-2 ml-auto">{bulkActions}</div>}
      <button
        onClick={() => {
          if (isControlled) onSelectionChange?.([]);
          else setInternalSelectedKeys([]);
        }}
        className="text-xs text-[var(--admin-text-dim)] hover:text-[var(--admin-text)] transition-colors"
      >
        Tout désélectionner
      </button>
    </div>
  );

  const columnVisibilityButton = onColumnVisibilityChange && (
    <div className="relative" ref={columnMenuRef}>
      <button
        onClick={() => setShowColumnMenu(!showColumnMenu)}
        className="rounded-lg p-2 text-[var(--admin-text-dim)] hover:bg-white/[0.03] hover:text-[var(--admin-text-muted)] transition-colors"
        title="Visibilité des colonnes"
      >
        <Eye size={16} />
      </button>
      {showColumnMenu && (
        <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-xl p-2">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-dim)]">
            Colonnes
          </p>
          {columns.map((col) => (
            <button
              key={col.key}
              onClick={() => toggleColumnVisibility(col.key)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[var(--admin-text-muted)] hover:bg-white/[0.03] transition-colors"
            >
              <div className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                hiddenColumns.includes(col.key)
                  ? "border-[var(--admin-border)] bg-transparent"
                  : "border-[var(--admin-gold)] bg-[var(--admin-gold)]"
              }`}>
                {!hiddenColumns.includes(col.key) && <Check size={10} className="text-[#0a0a0f]" />}
              </div>
              {col.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div>
        {bulkBar}
        <div className="space-y-3">
          {data.map((item) => {
            const key = keyExtractor(item);
            const isSelected = selectedKeys.includes(key);
            return (
              <div
                key={key}
                className={`admin-card p-4 space-y-2 transition-colors duration-200 ${
                  onRowClick ? "cursor-pointer" : ""
                } ${isSelected ? "ring-1 ring-[var(--admin-gold)]/30 bg-[var(--admin-gold)]/5" : ""}`}
              >
                {selectable && (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(key)}
                      className="h-4 w-4 rounded border-white/10 accent-[var(--admin-gold)]"
                    />
                    <span className="text-xs text-[var(--admin-text-dim)]">
                      Sélectionner
                    </span>
                  </div>
                )}
                {visibleColumns.map((col) => (
                  <div key={col.key} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--admin-text-dim)]">
                      {col.label}
                    </span>
                    <span className="text-sm text-[var(--admin-text)]">
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[col.key] ?? "")}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      {bulkBar}
      <div className="flex items-center justify-end mb-2">
        {columnVisibilityButton}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-[var(--admin-border)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className={stickyHeader ? "sticky top-0 z-10 bg-[var(--admin-surface)]" : ""}>
              {selectable && (
                <th className={`${pxClass} ${pyClass} border-b border-[var(--admin-border)] w-10`}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-white/10 accent-[var(--admin-gold)]"
                  />
                </th>
              )}
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort?.(col.key)}
                  style={col.width ? { width: col.width } : undefined}
                  className={`${pxClass} ${pyClass} text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-dim)] border-b border-[var(--admin-border)] ${
                    col.sortable ? "cursor-pointer select-none hover:text-[var(--admin-text-muted)]" : ""
                  } ${col.className || ""}`}
                >
                  <div className="flex items-center">
                    {col.label}
                    {col.sortable && (
                      <SortIcon active={sortBy === col.key} order={sortOrder} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const key = keyExtractor(item);
              const isSelected = selectedKeys.includes(key);
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(item)}
                  className={`transition-colors duration-200 ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${
                    isSelected
                      ? "bg-[var(--admin-gold)]/5"
                      : "hover:bg-[rgba(255,255,255,0.02)]"
                  }`}
                >
                  {selectable && (
                    <td className={`${pxClass} ${pyCellClass} border-b border-[var(--admin-border)]`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelection(key);
                        }}
                        className="h-4 w-4 rounded border-white/10 accent-[var(--admin-gold)]"
                      />
                    </td>
                  )}
                  {visibleColumns.map((col) => (
                    <td
                      key={col.key}
                      className={`${pxClass} ${pyCellClass} text-sm text-[var(--admin-text)] border-b border-[var(--admin-border)] ${
                        col.className || ""
                      }`}
                    >
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
