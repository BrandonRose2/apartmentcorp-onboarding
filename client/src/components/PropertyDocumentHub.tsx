/**
 * PropertyDocumentHub — File drop zones organized by Region → Property → Category
 * All 41 ApartmentCorp properties across 5 regions
 * Features: Drag-and-drop upload, file list, per-property folder structure
 */

import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, ChevronDown, ChevronRight, Building2, MapPin, FolderOpen } from "lucide-react";
import { nanoid } from "nanoid";
import { toast } from "sonner";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const PROPERTY_FOLDER_CATEGORIES = [
  { id: "overview", label: "Property Overview & Compliance", icon: "📋" },
  { id: "leasing", label: "Units & Leasing", icon: "🏠" },
  { id: "maintenance", label: "Maintenance & Inspections", icon: "🔧" },
  { id: "financials", label: "Financials", icon: "💰" },
  { id: "staff", label: "Assigned Staff", icon: "👥" },
  { id: "hud", label: "HUD & Section 8 Compliance", icon: "📑" },
  { id: "communications", label: "Communications", icon: "📬" },
];

interface Property {
  id: string;
  name: string;
  units: number;
  type: string;
  note?: string;
}

interface Region {
  id: string;
  name: string;
  manager: string;
  color: string;
  properties: Property[];
}

const REGIONS: Region[] = [
  {
    id: "r1",
    name: "Region 1",
    manager: "JR & Leslie Rolon",
    color: "oklch(0.35 0.10 250)",
    properties: [
      { id: "boca-ciega", name: "Boca Ciega", units: 109, type: "Project Based Section 8 / LIHTC", note: "108 layered / 1 LIHTC" },
      { id: "jefferson-arms", name: "Jefferson Arms", units: 75, type: "Conventional" },
      { id: "opa-locka", name: "Opa Locka", units: 65, type: "Conventional" },
      { id: "macedonia", name: "Macedonia", units: 100, type: "Conventional" },
      { id: "coral-village", name: "Coral Village", units: 72, type: "Conventional" },
      { id: "holiday", name: "Holiday", units: 115, type: "Conventional" },
      { id: "cumberland", name: "Cumberland", units: 68, type: "Regional HUD / Voucher", note: "60 HUD / 8 Voucher" },
      { id: "village-green", name: "Village Green", units: 80, type: "Conventional" },
      { id: "walnut-hill", name: "Walnut Hill", units: 168, type: "Conventional" },
    ],
  },
  {
    id: "r2",
    name: "Region 2",
    manager: "Leslie Rolon",
    color: "oklch(0.40 0.12 200)",
    properties: [
      { id: "river-pointe", name: "River Pointe", units: 160, type: "Conventional" },
      { id: "breckenridge", name: "Breckenridge", units: 66, type: "Conventional" },
      { id: "lexington-arms", name: "Lexington Arms", units: 61, type: "Conventional" },
      { id: "grace-townhomes", name: "Grace Townhomes", units: 112, type: "Conventional" },
      { id: "grove-park", name: "Grove Park", units: 60, type: "Layered HUD / LIHTC" },
      { id: "la-promesa", name: "La Promesa", units: 136, type: "Layered HUD / LIHTC" },
    ],
  },
  {
    id: "r3",
    name: "Region 3",
    manager: "Ginger Positerry",
    color: "oklch(0.50 0.14 40)",
    properties: [
      { id: "gates-on-manhattan", name: "Gates on Manhattan", units: 276, type: "Conventional" },
      { id: "ruby-diamond", name: "Ruby Diamond", units: 73, type: "Conventional" },
      { id: "star-homes", name: "Star Homes", units: 48, type: "Conventional" },
      { id: "thibodaux", name: "Thibodaux", units: 107, type: "Conventional" },
      { id: "marrero-3", name: "Marrero 3", units: 173, type: "Conventional" },
      { id: "arbor-crest", name: "Arbor Crest", units: 120, type: "Conventional" },
      { id: "windsor", name: "Windsor", units: 48, type: "Conventional" },
      { id: "yorkshire", name: "Yorkshire", units: 86, type: "Conventional" },
      { id: "north-pointe", name: "North Pointe", units: 27, type: "Conventional" },
      { id: "granite-bayou-pt", name: "Granite Bayou Pt", units: 60, type: "Conventional" },
      { id: "st-charles", name: "St. Charles", units: 121, type: "Layered / LIHTC", note: "95 layered / 26 LIHTC" },
      { id: "pelican-bay", name: "Pelican Bay", units: 152, type: "Conventional" },
      { id: "howell-place", name: "Howell Place", units: 48, type: "Conventional" },
      { id: "pirates-bend", name: "Pirates Bend", units: 48, type: "Conventional" },
    ],
  },
  {
    id: "r4",
    name: "Region 4",
    manager: "Blake Weddington",
    color: "oklch(0.45 0.12 160)",
    properties: [
      { id: "nwa", name: "NWA", units: 162, type: "Conventional" },
      { id: "anaheim", name: "Anaheim", units: 80, type: "Regional HUD / Voucher", note: "75 HUD / 5 Voucher" },
      { id: "fairfax", name: "Fairfax", units: 46, type: "Regional HUD / LIHTC", note: "45 HUD / 1 Voucher" },
      { id: "urban-1-2", name: "Urban 1 & 2", units: 60, type: "Conventional" },
      { id: "midtown-manor", name: "Midtown Manor", units: 32, type: "Conventional" },
      { id: "pacific-pointe", name: "Pacific Pointe", units: 80, type: "Conventional" },
      { id: "granite-ridge", name: "Granite Ridge", units: 80, type: "Conventional" },
      { id: "columbia-village", name: "Columbia Village", units: 80, type: "Conventional" },
      { id: "forrest-view", name: "Forrest View", units: 60, type: "Conventional" },
      { id: "oak-hills", name: "Oak Hills", units: 80, type: "Conventional" },
      { id: "river-garden", name: "River Garden", units: 123, type: "Conventional" },
    ],
  },
  {
    id: "r5",
    name: "Region 5",
    manager: "Leslie Rolon",
    color: "oklch(0.42 0.11 290)",
    properties: [
      { id: "silver-springs", name: "Silver Springs", units: 100, type: "Layered / LIHTC Voucher", note: "55 Layered / 45 LIHTC Voucher" },
      { id: "thomasville", name: "Thomasville", units: 100, type: "Conventional" },
    ],
  },
];

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

type FileStore = Record<string, UploadedFile[]>;

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function PropertyDocumentHub() {
  const [fileStore, setFileStore] = useState<FileStore>({});
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set(["r1"]));
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());

  const totalFiles = Object.values(fileStore).reduce((sum, arr) => sum + arr.length, 0);

  const addFile = (key: string, file: UploadedFile) => {
    setFileStore((prev) => ({ ...prev, [key]: [...(prev[key] || []), file] }));
  };

  const removeFile = (key: string, fileId: string) => {
    setFileStore((prev) => ({ ...prev, [key]: (prev[key] || []).filter((f) => f.id !== fileId) }));
  };

  const toggleRegion = (id: string) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleProperty = (id: string) => {
    setExpandedProperties((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getPropertyFileCount = (propertyId: string) =>
    PROPERTY_FOLDER_CATEGORIES.reduce((sum, cat) => sum + (fileStore[`${propertyId}:${cat.id}`]?.length || 0), 0);

  const getRegionFileCount = (region: Region) =>
    region.properties.reduce((sum, p) => sum + getPropertyFileCount(p.id), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "oklch(0.97 0.005 220)" }}>
            Property Document Hub
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "oklch(0.65 0.04 220)" }}>
            41 properties · 5 regions · {totalFiles} files uploaded
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg" style={{ backgroundColor: "oklch(0.22 0.08 256)", color: "oklch(0.72 0.12 220)" }}>
          <Building2 className="w-3.5 h-3.5" />
          3,726 Total Units
        </div>
      </div>

      {/* Regions */}
      <div className="space-y-3">
        {REGIONS.map((region) => {
          const isRegionOpen = expandedRegions.has(region.id);
          const regionFileCount = getRegionFileCount(region);

          return (
            <div key={region.id} className="rounded-xl overflow-hidden border" style={{ borderColor: "oklch(0.28 0.08 256)" }}>
              {/* Region Header */}
              <button
                onClick={() => toggleRegion(region.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left transition-all"
                style={{ backgroundColor: region.color }}
              >
                <div className="flex-1 flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-white opacity-80 flex-shrink-0" />
                  <div>
                    <div className="text-white font-bold text-sm" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1rem" }}>
                      {region.name}
                    </div>
                    <div className="text-xs opacity-75 text-white">
                      Regional Manager: {region.manager} · {region.properties.length} properties
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {regionFileCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "oklch(1 0 0 / 0.2)", color: "white" }}>
                      {regionFileCount} files
                    </span>
                  )}
                  {isRegionOpen ? (
                    <ChevronDown className="w-4 h-4 text-white" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white" />
                  )}
                </div>
              </button>

              {/* Properties */}
              {isRegionOpen && (
                <div className="divide-y" style={{ backgroundColor: "oklch(0.17 0.07 258)", borderColor: "oklch(0.28 0.08 256)" }}>
                  {region.properties.map((property) => {
                    const isPropOpen = expandedProperties.has(property.id);
                    const propFileCount = getPropertyFileCount(property.id);

                    return (
                      <div key={property.id}>
                        {/* Property Row */}
                        <button
                          onClick={() => toggleProperty(property.id)}
                          className="w-full flex items-center gap-3 px-6 py-3 text-left transition-all hover:opacity-90"
                          style={{ backgroundColor: isPropOpen ? "oklch(0.20 0.08 256)" : "transparent" }}
                        >
                          <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.72 0.12 220)" }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold" style={{ color: "oklch(0.95 0.005 220)" }}>
                              {property.name}
                              <span className="ml-2 text-xs font-normal opacity-60">({property.units} units)</span>
                            </div>
                            <div className="text-xs opacity-50" style={{ color: "oklch(0.72 0.12 220)" }}>
                              {property.type}{property.note ? ` · ${property.note}` : ""}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {propFileCount > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "oklch(0.72 0.12 220 / 0.2)", color: "oklch(0.72 0.12 220)" }}>
                                {propFileCount}
                              </span>
                            )}
                            {isPropOpen ? (
                              <ChevronDown className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.04 220)" }} />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.04 220)" }} />
                            )}
                          </div>
                        </button>

                        {/* Property Folder Categories */}
                        {isPropOpen && (
                          <div className="px-6 pb-4 pt-2" style={{ backgroundColor: "oklch(0.14 0.06 258)" }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                              {PROPERTY_FOLDER_CATEGORIES.map((cat) => {
                                const key = `${property.id}:${cat.id}`;
                                const files = fileStore[key] || [];
                                return (
                                  <FolderDropZone
                                    key={key}
                                    label={cat.label}
                                    icon={cat.icon}
                                    files={files}
                                    onAddFile={(file) => addFile(key, file)}
                                    onRemoveFile={(fileId) => removeFile(key, fileId)}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── FOLDER DROP ZONE ─────────────────────────────────────────────────────────

function FolderDropZone({
  label,
  icon,
  files,
  onAddFile,
  onRemoveFile,
}: {
  label: string;
  icon: string;
  files: UploadedFile[];
  onAddFile: (file: UploadedFile) => void;
  onRemoveFile: (fileId: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (fileList: FileList) => {
      Array.from(fileList).forEach((file) => {
        const newFile: UploadedFile = {
          id: nanoid(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        };
        onAddFile(newFile);
        toast.success(`"${file.name}" filed under ${label}`);
      });
    },
    [onAddFile, label]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const hasFiled = files.length > 0;

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        borderColor: hasFiled ? "oklch(0.72 0.12 220 / 0.4)" : "oklch(0.28 0.08 256)",
        backgroundColor: "oklch(0.17 0.07 258)",
      }}
    >
      {/* Folder Tab Header */}
      <div
        className="px-3 py-2 border-b flex items-center gap-2"
        style={{
          backgroundColor: hasFiled ? "oklch(0.72 0.12 220 / 0.08)" : "oklch(0.20 0.08 256)",
          borderColor: hasFiled ? "oklch(0.72 0.12 220 / 0.25)" : "oklch(0.28 0.08 256)",
        }}
      >
        <span className="text-base flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold leading-tight truncate" style={{ color: "oklch(0.90 0.005 220)" }}>
            {label}
          </div>
        </div>
        {hasFiled && (
          <span className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: "oklch(0.72 0.12 220)", color: "oklch(0.13 0.06 258)" }}>
            {files.length}
          </span>
        )}
      </div>

      {/* Drop Zone */}
      <div className="p-2">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-dashed flex flex-col items-center justify-center py-3 cursor-pointer transition-all"
          style={{
            borderColor: isDragging ? "oklch(0.72 0.12 220)" : "oklch(0.32 0.08 256)",
            backgroundColor: isDragging ? "oklch(0.72 0.12 220 / 0.06)" : "transparent",
          }}
        >
          <Upload className="w-4 h-4 mb-1" style={{ color: isDragging ? "oklch(0.72 0.12 220)" : "oklch(0.50 0.06 220)" }} />
          <span className="text-xs" style={{ color: "oklch(0.55 0.04 220)" }}>
            Drop files here
          </span>
          <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) { processFiles(e.target.files); e.target.value = ""; } }} />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded group"
                style={{ backgroundColor: "oklch(0.20 0.08 256)" }}
              >
                <FileText className="w-3 h-3 flex-shrink-0" style={{ color: "oklch(0.72 0.12 220)" }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: "oklch(0.88 0.005 220)" }}>
                    {file.name}
                  </div>
                  <div className="text-xs" style={{ color: "oklch(0.55 0.04 220)" }}>
                    {formatFileSize(file.size)}
                  </div>
                </div>
                <button
                  onClick={() => onRemoveFile(file.id)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "oklch(0.65 0.20 27)" }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
