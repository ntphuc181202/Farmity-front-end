import { useEffect, useState, useRef, FormEvent, ChangeEvent } from "react";
import Swal from "sweetalert2";
import plantApi from "../../api/plantApi";
import itemApi from "../../api/itemApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

/* ───────── constants ───────── */

const SEASON_LABELS: Record<number, string> = { 0: "Sunny", 1: "Rainy" };

/* ───────── types ───────── */

interface GrowthStage {
  stageNum: number;
  growthDurationMinutes: number;
  stageIconUrl?: string;
}

interface PlantDoc {
  _id?: string;
  plantId: string;
  plantName: string;
  growthStages: GrowthStage[];
  harvestedItemId: string;
  canProducePollen: boolean;
  pollenStage: number;
  pollenItemId: string;
  maxPollenHarvestsPerStage: number;
  growingSeason: number;
  isHybrid: boolean;
  receiverPlantId: string;
  pollenPlantId: string;
  hybridFlowerIconUrl?: string;
  hybridMatureIconUrl?: string;
  dropSeeds: boolean;
}

interface CatalogItem {
  itemID: string;
  itemName: string;
  iconUrl?: string;
}

const EMPTY: PlantDoc = {
  plantId: "",
  plantName: "",
  growthStages: [{ stageNum: 0, growthDurationMinutes: 0 }],
  harvestedItemId: "",
  canProducePollen: false,
  pollenStage: 3,
  pollenItemId: "",
  maxPollenHarvestsPerStage: 1,
  growingSeason: 0,
  isHybrid: false,
  receiverPlantId: "",
  pollenPlantId: "",
  dropSeeds: false,
};

/* ═══════════════════════════════════════════════
   ITEM PICKER — searchable dropdown with icon
   ═══════════════════════════════════════════════ */

function ItemPicker({
  items,
  value,
  onChange,
  placeholder = "Select item…",
}: {
  items: CatalogItem[];
  value: string;
  onChange: (itemId: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = items.find((i) => i.itemID === value);
  const filtered = items.filter((i) => {
    const q = query.toLowerCase();
    return i.itemID.toLowerCase().includes(q) || i.itemName.toLowerCase().includes(q);
  });

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setQuery(""); }}
        className="flex items-center gap-2 bg-slate-900 px-3 border border-slate-700 hover:border-slate-500 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full h-9 text-slate-50 text-sm text-left transition-colors"
      >
        {selected ? (
          <>
            {selected.iconUrl && <img src={selected.iconUrl} alt="" className="rounded w-5 h-5 object-cover shrink-0 pixel-art" />}
            <span className="flex-1 truncate">{selected.itemName}</span>
            <span className="text-slate-500 text-xs shrink-0">{selected.itemID}</span>
          </>
        ) : (
          <span className="flex-1 text-slate-500">{placeholder}</span>
        )}
        <span className="ml-1 text-slate-500 text-xs">▾</span>
      </button>

      {open && (
        <div className="z-[60] absolute flex flex-col bg-slate-900 shadow-xl mt-1 border border-slate-700 rounded-lg w-full max-h-60 overflow-hidden">
          <div className="p-2 border-slate-800 border-b">
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search items…" className="bg-slate-800 px-2.5 py-1.5 border border-slate-700 rounded-md focus:outline-none w-full text-slate-50 placeholder:text-slate-500 text-sm" />
          </div>
          <div className="flex-1 overflow-y-auto">
            <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="flex items-center gap-2 hover:bg-slate-800 px-3 py-2 w-full text-slate-400 text-sm transition-colors">— None —</button>
            {filtered.length === 0 && <p className="py-3 text-slate-500 text-xs text-center">No items match.</p>}
            {filtered.map((item) => (
              <button key={item.itemID} type="button" onClick={() => { onChange(item.itemID); setOpen(false); }} className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-800 transition-colors ${item.itemID === value ? "bg-emerald-500/10 text-emerald-300" : "text-slate-50"}`}>
                {item.iconUrl ? <img src={item.iconUrl} alt="" className="bg-slate-800 rounded w-6 h-6 object-cover shrink-0 pixel-art" /> : <div className="bg-slate-800 rounded w-6 h-6 shrink-0" />}
                <span className="flex-1 text-left truncate">{item.itemName}</span>
                <span className="text-slate-500 text-xs shrink-0">{item.itemID}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

function AdminPlantManager() {
  const [plants, setPlants] = useState<PlantDoc[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [search, setSearch] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [hybridFilter, setHybridFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [form, setForm] = useState<PlantDoc>({ ...EMPTY, growthStages: [{ stageNum: 0, growthDurationMinutes: 0 }] });
  const [stageFiles, setStageFiles] = useState<(File | null)[]>([null]);
  const [hybridFlowerFile, setHybridFlowerFile] = useState<File | null>(null);
  const [hybridMatureFile, setHybridMatureFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const itemMap = new Map(catalogItems.map((i) => [i.itemID, i]));

  /* ── fetch ── */
  const fetchPlants = async () => {
    try {
      const res = await plantApi.getAllPlants();
      setPlants(res.data || []);
    } catch (err) {
      console.error("Failed to load plants:", err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await itemApi.getAllItems();
      setCatalogItems((res.data || []).map((i: any) => ({ itemID: i.itemID, itemName: i.itemName, iconUrl: i.iconUrl })));
    } catch (err) {
      console.error("Failed to load items:", err);
    }
  };

  useEffect(() => {
    fetchPlants();
    fetchItems();
  }, []);

  /* ── helpers ── */
  const resetForm = () => {
    setForm({ ...EMPTY, growthStages: [{ stageNum: 0, growthDurationMinutes: 0 }] });
    setStageFiles([null]);
    setHybridFlowerFile(null);
    setHybridMatureFile(null);
    setEditingPlantId(null);
    setIsDetailMode(false);
  };

  const openCreate = () => { resetForm(); setIsDetailMode(false); setIsModalOpen(true); };

  const openEdit = (plant: PlantDoc) => {
    setForm({ ...plant, growthStages: plant.growthStages?.map((s) => ({ ...s })) || [{ stageNum: 0, growthDurationMinutes: 0 }] });
    setStageFiles(new Array(plant.growthStages?.length || 1).fill(null));
    setHybridFlowerFile(null);
    setHybridMatureFile(null);
    setEditingPlantId(plant.plantId);
    setIsDetailMode(true);
    setIsModalOpen(true);
  };

  /* ── field updaters ── */
  const set = <K extends keyof PlantDoc>(key: K, value: PlantDoc[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setNum = (key: keyof PlantDoc, raw: string) =>
    set(key, raw === "" ? ("" as never) : (Number(raw) as never));

  const setBool = (key: keyof PlantDoc, checked: boolean) =>
    set(key, checked as never);

  /* ── growth stages ── */
  const addStage = () => {
    setForm((prev) => {
      const newNum = prev.growthStages.length;
      return { ...prev, growthStages: [...prev.growthStages, { stageNum: newNum, growthDurationMinutes: 0 }] };
    });
    setStageFiles((prev) => [...prev, null]);
  };

  const removeStage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      growthStages: prev.growthStages.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stageNum: i })),
    }));
    setStageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const setStageDuration = (idx: number, val: string) => {
    setForm((prev) => {
      const stages = [...prev.growthStages];
      stages[idx] = { ...stages[idx], growthDurationMinutes: Number(val) || 0 };
      return { ...prev, growthStages: stages };
    });
  };

  const setStageFile = (idx: number, file: File | null) => {
    setStageFiles((prev) => {
      const arr = [...prev];
      arr[idx] = file;
      return arr;
    });
  };

  /* ── build FormData ── */
  const buildFormData = (): FormData => {
    const fd = new FormData();

    fd.append("plantId", form.plantId.trim());
    fd.append("plantName", form.plantName.trim());
    fd.append("harvestedItemId", form.harvestedItemId.trim());
    fd.append("canProducePollen", String(form.canProducePollen));
    fd.append("pollenStage", String(form.pollenStage));
    if (form.pollenItemId) fd.append("pollenItemId", form.pollenItemId.trim());
    fd.append("maxPollenHarvestsPerStage", String(form.maxPollenHarvestsPerStage));
    fd.append("growingSeason", String(form.growingSeason));
    fd.append("isHybrid", String(form.isHybrid));
    fd.append("dropSeeds", String(form.dropSeeds));

    if (form.isHybrid) {
      if (form.receiverPlantId) fd.append("receiverPlantId", form.receiverPlantId.trim());
      if (form.pollenPlantId) fd.append("pollenPlantId", form.pollenPlantId.trim());
    }

    // growthStages as JSON string
    // On update without new sprites, include existing stageIconUrl (Mongoose requires it)
    const stagesJson = form.growthStages.map((s, idx) => {
      const entry: Record<string, unknown> = { stageNum: s.stageNum, growthDurationMinutes: s.growthDurationMinutes };
      if (editingPlantId && !stageFiles[idx] && s.stageIconUrl) {
        entry.stageIconUrl = s.stageIconUrl;
      }
      return entry;
    });
    fd.append("growthStages", JSON.stringify(stagesJson));

    // stage sprite files — filenames must end with _<stageIndex>
    stageFiles.forEach((file, idx) => {
      if (file) {
        const ext = file.name.split(".").pop() || "png";
        const renamedFile = new File([file], `${form.plantId}_${idx}.${ext}`, { type: file.type });
        fd.append("stageSprites", renamedFile);
      }
    });

    if (hybridFlowerFile) fd.append("hybridFlowerSprite", hybridFlowerFile);
    if (hybridMatureFile) fd.append("hybridMatureSprite", hybridMatureFile);

    return fd;
  };

  /* ── submit ── */
  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!form.plantId.trim() || !form.plantName.trim()) {
      Swal.fire({ icon: "warning", title: "Plant ID and Name are required", background: "#020617", color: "#e5e7eb" });
      return;
    }
    if (!form.harvestedItemId.trim()) {
      Swal.fire({ icon: "warning", title: "Harvested Item is required", background: "#020617", color: "#e5e7eb" });
      return;
    }
    if (!editingPlantId) {
      // For create, all stage sprites are required
      const hasAllFiles = stageFiles.every((f) => f !== null);
      if (!hasAllFiles) {
        Swal.fire({ icon: "warning", title: "All stage sprite images are required for new plants", background: "#020617", color: "#e5e7eb" });
        return;
      }
    }

    try {
      setLoading(true);
      const fd = buildFormData();

      if (editingPlantId) {
        await plantApi.updatePlant(editingPlantId, fd);
        Swal.fire({ toast: true, icon: "success", title: "Plant updated", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      } else {
        await plantApi.createPlant(fd);
        Swal.fire({ toast: true, icon: "success", title: "Plant created", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      }

      resetForm();
      setIsModalOpen(false);
      await fetchPlants();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to save plant.";
      Swal.fire({ icon: "error", title: "Error", text: msg, background: "#020617", color: "#e5e7eb" });
    } finally {
      setLoading(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async (plantId: string) => {
    const result = await Swal.fire({
      title: "Delete this plant?",
      text: `Plant "${plantId}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it",
      background: "#020617",
      color: "#e5e7eb",
    });
    if (!result.isConfirmed) return;

    try {
      await plantApi.deletePlant(plantId);
      setPlants((prev) => prev.filter((p) => p.plantId !== plantId));
      Swal.fire({ toast: true, icon: "success", title: "Plant deleted", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to delete plant.", background: "#020617", color: "#e5e7eb" });
    }
  };

  /* ── filter + paginate ── */
  const filtered = plants.filter((p) => {
    const t = search.toLowerCase();
    const matchText = p.plantId.toLowerCase().includes(t) || p.plantName.toLowerCase().includes(t);
    const matchSeason = seasonFilter === "all" || String(p.growingSeason) === seasonFilter;
    const matchHybrid =
      hybridFilter === "all" ||
      (hybridFilter === "yes" ? p.isHybrid : !p.isHybrid);
    return matchText && matchSeason && matchHybrid;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  /* ─────────────────────────────────────────────
     RENDER
     ───────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="font-semibold text-white text-2xl">Plants Catalog</h1>
          <p className="mt-0.5 text-slate-400 text-sm">{plants.length} plants total</p>
        </div>
        <Button onClick={openCreate}>+ New Plant</Button>
      </header>

      {/* List */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search by ID or name…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 min-w-[180px]"
            />
            <select
              value={seasonFilter}
              onChange={(e) => { setSeasonFilter(e.target.value); setPage(1); }}
              className="bg-slate-900 px-3 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 h-9 text-slate-50 text-sm"
            >
              <option value="all">All Seasons</option>
              {Object.entries(SEASON_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              value={hybridFilter}
              onChange={(e) => { setHybridFilter(e.target.value); setPage(1); }}
              className="bg-slate-900 px-3 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 h-9 text-slate-50 text-sm"
            >
              <option value="all">All Plants</option>
              <option value="yes">Hybrid Only</option>
              <option value="no">Non-Hybrid Only</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-slate-800">
          {visible.length === 0 && <p className="py-8 text-slate-500 text-sm text-center">No plants found.</p>}
          {visible.map((plant) => {
            const harvestItem = itemMap.get(plant.harvestedItemId);
            const firstStageIcon = plant.growthStages?.[0]?.stageIconUrl;
            return (
              <div key={plant.plantId} className="flex items-center gap-4 hover:bg-slate-800/40 px-6 py-3 transition-colors">
                {firstStageIcon ? (
                  <img src={firstStageIcon} alt={plant.plantName} className="bg-slate-800 rounded-md w-10 h-10 object-cover shrink-0 pixel-art" />
                ) : (
                  <span className="inline-flex justify-center items-center bg-green-500/10 rounded-md w-10 h-10 font-bold text-green-400 text-xs shrink-0">🌱</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{plant.plantName}</p>
                  <p className="text-slate-400 text-xs truncate">
                    {plant.plantId} · {plant.growthStages?.length ?? 0} stages · {SEASON_LABELS[plant.growingSeason] ?? "Sunny"} · Harvest → {harvestItem?.itemName || plant.harvestedItemId}
                    {plant.isHybrid && <span className="ml-1 text-amber-400">(Hybrid)</span>}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={() => openEdit(plant)}>Detail</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(plant.plantId)}>Delete</Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span className="text-slate-400 text-sm">{currentPage} / {totalPages}</span>
          <Button size="sm" variant="outline" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      {/* ═══════  Modal  ═══════ */}
      {isModalOpen && (
        <div className="z-50 fixed inset-0 flex justify-center items-start bg-black/70 p-4 overflow-y-auto">
          <Card className="flex flex-col bg-slate-950 my-8 border border-slate-800 w-full max-w-3xl">
            <CardHeader className="border-slate-800 border-b shrink-0">
              <CardTitle>{editingPlantId ? `${isDetailMode ? "Detail" : "Edit"} — ${editingPlantId}` : "Create New Plant"}</CardTitle>
            </CardHeader>

            <div className="flex-1 p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                <fieldset disabled={!!editingPlantId && isDetailMode} className="space-y-5">

                {/* ─── Basic Info ─── */}
                <section className="space-y-3">
                  <h3 className="font-semibold text-emerald-400 text-sm uppercase tracking-wider">Plant Info</h3>
                  <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                    <Field label="Plant ID *">
                      <Input value={form.plantId} onChange={(e) => set("plantId", e.target.value)} placeholder="e.g. plant_corn" disabled={!!editingPlantId} />
                    </Field>
                    <Field label="Plant Name *">
                      <Input value={form.plantName} onChange={(e) => set("plantName", e.target.value)} placeholder="Display name" />
                    </Field>
                  </div>

                  <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                    <Field label="Harvested Item *">
                      <ItemPicker items={catalogItems} value={form.harvestedItemId} onChange={(id) => set("harvestedItemId", id)} placeholder="Select harvested item…" />
                    </Field>
                    <Field label="Growing Season">
                      <select
                        value={form.growingSeason}
                        onChange={(e) => set("growingSeason", Number(e.target.value))}
                        className="flex bg-slate-900 px-3 py-1 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full h-9 text-slate-50 text-sm"
                      >
                        {Object.entries(SEASON_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </Field>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <Toggle label="Is Hybrid" checked={form.isHybrid} onChange={(c) => setBool("isHybrid", c)} />
                    <Toggle label="Drop Seeds" checked={form.dropSeeds} onChange={(c) => setBool("dropSeeds", c)} />
                  </div>
                </section>

                {/* ─── Pollen Settings ─── */}
                <section className="space-y-3 pt-2 border-slate-800 border-t">
                  <h3 className="font-semibold text-amber-400 text-sm uppercase tracking-wider">Pollen Settings</h3>
                  <Toggle label="Can Produce Pollen" checked={form.canProducePollen} onChange={(c) => setBool("canProducePollen", c)} />
                  {form.canProducePollen && (
                    <div className="gap-3 grid grid-cols-1 sm:grid-cols-3">
                      <Field label="Pollen Stage">
                        <Input type="number" value={form.pollenStage} onChange={(e) => setNum("pollenStage", e.target.value)} min={0} />
                      </Field>
                      <Field label="Pollen Item">
                        <ItemPicker items={catalogItems} value={form.pollenItemId} onChange={(id) => set("pollenItemId", id)} placeholder="Select pollen item…" />
                      </Field>
                      <Field label="Max Harvests/Stage">
                        <Input type="number" value={form.maxPollenHarvestsPerStage} onChange={(e) => setNum("maxPollenHarvestsPerStage", e.target.value)} min={0} />
                      </Field>
                    </div>
                  )}
                </section>

                {/* ─── Hybrid Fields ─── */}
                {form.isHybrid && (
                  <section className="space-y-3 pt-2 border-slate-800 border-t">
                    <h3 className="font-semibold text-pink-400 text-sm uppercase tracking-wider">Hybrid Settings</h3>
                    <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                      <Field label="Receiver Plant ID">
                        <Input value={form.receiverPlantId} onChange={(e) => set("receiverPlantId", e.target.value)} placeholder="e.g. plant_tomato" />
                      </Field>
                      <Field label="Pollen Plant ID">
                        <Input value={form.pollenPlantId} onChange={(e) => set("pollenPlantId", e.target.value)} placeholder="e.g. plant_corn" />
                      </Field>
                    </div>
                    <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                      <Field label={editingPlantId ? "Hybrid Flower Sprite (optional)" : "Hybrid Flower Sprite"}>
                        <label className="flex justify-center items-center bg-slate-900 border-2 border-slate-700 hover:border-slate-500 border-dashed rounded-lg w-full h-16 transition cursor-pointer">
                          <span className="text-slate-400 text-sm">{hybridFlowerFile ? hybridFlowerFile.name : "Click to select"}</span>
                          <input type="file" accept="image/*" onChange={(e) => setHybridFlowerFile(e.target.files?.[0] || null)} className="hidden" />
                        </label>
                        {(form.hybridFlowerIconUrl && !hybridFlowerFile) && <img src={form.hybridFlowerIconUrl} alt="flower" className="bg-slate-800 mt-1 rounded w-12 h-12 object-cover pixel-art" />}
                      </Field>
                      <Field label={editingPlantId ? "Hybrid Mature Sprite (optional)" : "Hybrid Mature Sprite"}>
                        <label className="flex justify-center items-center bg-slate-900 border-2 border-slate-700 hover:border-slate-500 border-dashed rounded-lg w-full h-16 transition cursor-pointer">
                          <span className="text-slate-400 text-sm">{hybridMatureFile ? hybridMatureFile.name : "Click to select"}</span>
                          <input type="file" accept="image/*" onChange={(e) => setHybridMatureFile(e.target.files?.[0] || null)} className="hidden" />
                        </label>
                        {(form.hybridMatureIconUrl && !hybridMatureFile) && <img src={form.hybridMatureIconUrl} alt="mature" className="bg-slate-800 mt-1 rounded w-12 h-12 object-cover pixel-art" />}
                      </Field>
                    </div>
                  </section>
                )}

                {/* ─── Growth Stages ─── */}
                <section className="space-y-3 pt-2 border-slate-800 border-t">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-cyan-400 text-sm uppercase tracking-wider">Growth Stages</h3>
                    <Button type="button" size="sm" variant="outline" onClick={addStage}>+ Add Stage</Button>
                  </div>

                  {form.growthStages.map((stage, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-900/50 p-3 rounded-lg">
                      <span className="w-6 font-mono text-slate-500 text-xs shrink-0">#{stage.stageNum}</span>

                      {/* Existing icon preview */}
                      {stage.stageIconUrl && !stageFiles[idx] && (
                        <img src={stage.stageIconUrl} alt={`Stage ${stage.stageNum}`} className="bg-slate-800 rounded w-10 h-10 object-cover shrink-0 pixel-art" />
                      )}

                      {/* File preview */}
                      {stageFiles[idx] && (
                        <img src={URL.createObjectURL(stageFiles[idx]!)} alt={`Stage ${stage.stageNum}`} className="bg-slate-800 rounded w-10 h-10 object-cover shrink-0 pixel-art" />
                      )}

                      <Field label="Duration (min)">
                        <Input type="number" value={stage.growthDurationMinutes} onChange={(e) => setStageDuration(idx, e.target.value)} min={0} className="w-24" />
                      </Field>

                      <Field label={editingPlantId ? "Sprite (optional)" : "Sprite *"}>
                        <label className="flex justify-center items-center bg-slate-900 px-3 border border-slate-700 hover:border-slate-500 border-dashed rounded-md h-9 text-slate-400 text-xs whitespace-nowrap transition cursor-pointer">
                          {stageFiles[idx] ? stageFiles[idx]!.name : "Choose file"}
                          <input type="file" accept="image/*" onChange={(e) => setStageFile(idx, e.target.files?.[0] || null)} className="hidden" />
                        </label>
                      </Field>

                      {form.growthStages.length > 1 && (
                        <Button type="button" size="icon" variant="destructive" className="w-8 h-8 shrink-0" onClick={() => removeStage(idx)}>×</Button>
                      )}
                    </div>
                  ))}
                </section>
                </fieldset>

              </form>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-slate-800 border-t shrink-0">
              <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</Button>
              {editingPlantId && isDetailMode && (
                <Button type="button" onClick={() => setIsDetailMode(false)}>
                  Edit
                </Button>
              )}
              <Button onClick={handleSubmit} disabled={loading || (!!editingPlantId && isDetailMode)}>
                {loading ? "Saving…" : editingPlantId ? "Save Changes" : "Create Plant"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded w-4 h-4 accent-emerald-500" />
      {label}
    </label>
  );
}

export default AdminPlantManager;
