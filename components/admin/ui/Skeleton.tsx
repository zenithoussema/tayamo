"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "title" | "avatar" | "card" | "table-row" | "stat";
  count?: number;
}

function Skeleton({ className = "", variant = "text", count = 1 }: SkeletonProps) {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => {
        let base = "admin-shimmer";

        switch (variant) {
          case "text":
            base += " h-4 w-full rounded bg-[rgba(255,255,255,0.05)]";
            break;
          case "title":
            base += " h-6 w-1/3 rounded bg-[rgba(255,255,255,0.05)]";
            break;
          case "avatar":
            base += " h-10 w-10 rounded-full bg-[rgba(255,255,255,0.05)]";
            break;
          case "card":
            base += " h-32 rounded-2xl bg-[rgba(255,255,255,0.05)]";
            break;
          case "table-row":
            base += " h-12 w-full rounded bg-[rgba(255,255,255,0.05)]";
            break;
          case "stat":
            base += " h-24 rounded-2xl bg-[rgba(255,255,255,0.05)]";
            break;
        }

        return <div key={i} className={`${base} ${className}`} />;
      })}
    </>
  );
}

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <div className="admin-shimmer h-4 flex-[2] rounded bg-[rgba(255,255,255,0.05)]" />
      <div className="admin-shimmer h-4 flex-1 rounded bg-[rgba(255,255,255,0.05)]" />
      <div className="admin-shimmer h-4 flex-1 rounded bg-[rgba(255,255,255,0.05)]" />
      <div className="admin-shimmer h-4 flex-[0.5] rounded bg-[rgba(255,255,255,0.05)]" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
}

export function StatSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="stat" />
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton variant="text" className="w-1/4" />
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-3/4" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </div>
      <Skeleton variant="text" className="w-1/2" />
      <Skeleton variant="card" className="h-48" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 admin-animate-fade-in">
      <Skeleton variant="title" className="w-1/3" />
      <StatSkeleton count={4} />
      <div className="admin-card p-6">
        <TableSkeleton rows={5} />
      </div>
    </div>
  );
}

export default Skeleton;
