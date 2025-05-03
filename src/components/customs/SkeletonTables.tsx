import { ITEMS_PER_PAGE } from "@/api/services/api";
import React from "react";

export const StudentSkeleton = () => {
  return (
    <div className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-green-50">
      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>

      {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
        <div key={index} className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-gray-100">
          {/* Info Column */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-4/5"></div>
            <div className="h-3 bg-gray-100 rounded w-3/5"></div>
          </div>

          {/* DNI Column */}
          <div className="flex items-center">
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>

          {/* Celular Column */}
          <div className="flex items-center">
            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
          </div>

          {/* Padre/Apoderado Column */}
          <div className="flex items-center">
            <div className="h-4 bg-gray-100 rounded w-3/5"></div>
          </div>

          {/* Acciones Column */}
          <div className="flex items-center">
            <div className="h-8 bg-gray-100 rounded w-8"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const TutorSkeleton = () => {
  return (
    <div className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-green-50">
      {/* Table Header */}
      <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>

      {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
        <div key={index} className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-gray-100">
          {/* Info Column */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-4/5"></div>
            <div className="h-3 bg-gray-100 rounded w-3/5"></div>
            <div className="h-3 bg-gray-100 rounded w-3/5"></div>
          </div>

          {/* Celular Column */}
          <div className="flex items-center">
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>

          {/* Tipo Tutor Column */}
          <div className="flex items-center">
            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
          </div>

          {/* Hijos Column */}
          <div className="flex items-center">
            <div className="h-4 bg-gray-100 rounded w-3/5"></div>
          </div>

          {/* Observaciiones Column */}
          <div className="flex items-center">
            <div className="h-4 bg-gray-100 rounded w-3/5"></div>
          </div>

          {/* Acciones Column */}
          <div className="flex items-center">
            <div className="h-8 bg-gray-100 rounded w-8"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
