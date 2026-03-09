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
  age: number;
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
  growthStages: [{ stageNum: 0, age: 0 }],
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
        className="flex h-9 w-full items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 hover:border-slate-500 transition-colors"
      >
        {selected ? (
          <>
            {selected.iconUrl && <img src={selected.iconUrl} alt="" className="w-5 h-5 rounded object-cover shrink-0 pixel-art" />}
            <span className="truncate flex-1">{selected.itemName}</span>
            <span className="text-xs text-slate-500 shrink-0">{selected.itemID}</span>
          </>
        ) : (
          <span className="text-slate-500 flex-1">{placeholder}</span>
        )}
        <span className="text-slate-500 text-xs ml-1">▾</span>
      </button>

      {open && (
        <div className="absolute z-[60] mt-1 w-full max-h-60 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl flex flex-col">
          <div className="p-2 border-b border-slate-800">
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search items…" className="w-full rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none" />
          </div>
          <div className="flex-1 overflow-y-auto">
            <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 transition-colors">— None —</button>
            {filtered.length === 0 && <p className="text-slate-500 text-xs text-center py-3">No items match.</p>}
            {filtered.map((item) => (
              <button key={item.itemID} type="button" onClick={() => { onChange(item.itemID); setOpen(false); }} className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-800 transition-colors ${item.itemID === value ? "bg-emerald-500/10 text-emerald-300" : "text-slate-50"}`}>
                {item.iconUrl ? <img src={item.iconUrl} alt="" className="w-6 h-6 rounded object-cover shrink-0 bg-slate-800 pixel-art" /> : <div className="w-6 h-6 rounded bg-slate-800 shrink-0" />}
                <span className="truncate flex-1 text-left">{item.itemName}</span>
                <span className="text-xs text-slate-500 shrink-0">{item.itemID}</span>
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
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [form, setForm] = useState<PlantDoc>({ ...EMPTY, growthStages: [{ stageNum: 0, age: 0 }] });
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
    setForm({ ...EMPTY, growthStages: [{ stageNum: 0, age: 0 }] });
    setStageFiles([null]);
    setHybridFlowerFile(null);
    setHybridMatureFile(null);
    setEditingPlantId(null);
  };

  const openCreate = () => { resetForm(); setIsModalOpen(true); };

  const openEdit = (plant: PlantDoc) => {
    setForm({ ...plant, growthStages: plant.growthStages?.map((s) => ({ ...s })) || [{ stageNum: 0, age: 0 }] });
    setStageFiles(new Array(plant.growthStages?.length || 1).fill(null));
    setHybridFlowerFile(null);
    setHybridMatureFile(null);
    setEditingPlantId(plant.plantId);
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
      return { ...prev, growthStages: [...prev.growthStages, { stageNum: newNum, age: 0 }] };
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

  const setStageAge = (idx: number, val: string) => {
    setForm((prev) => {
      const stages = [...prev.growthStages];
      stages[idx] = { ...stages[idx], age: Number(val) || 0 };
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
    const stagesJson = form.growthStages.map((s) => ({ stageNum: s.stageNum, age: s.age }));
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
    return p.plantId.toLowerCase().includes(t) || p.plantName.toLowerCase().includes(t);
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
          <h1 className="text-2xl font-semibold text-white">Plants Catalog</h1>
          <p className="text-sm text-slate-400 mt-0.5">{plants.length} plants total</p>
        </div>
        <Button onClick={openCreate}>+ New Plant</Button>
      </header>

      {/* List */}
      <Card>
        <CardHeader>
          <Input placeholder="Search by ID or name…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </CardHeader>
        <CardContent className="divide-y divide-slate-800">
          {visible.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No plants found.</p>}
          {visible.map((plant) => {
            const harvestItem = itemMap.get(plant.harvestedItemId);
            const firstStageIcon = plant.growthStages?.[0]?.stageIconUrl;
            return (
              <div key={plant.plantId} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-800/40 transition-colors">
                {firstStageIcon ? (
                  <img src={firstStageIcon} alt={plant.plantName} className="w-10 h-10 rounded-md object-cover bg-slate-800 shrink-0 pixel-art" />
                ) : (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-green-500/10 text-green-400 text-xs font-bold shrink-0">🌱</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{plant.plantName}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {plant.plantId} · {plant.growthStages?.length ?? 0} stages · {SEASON_LABELS[plant.growingSeason] ?? "Sunny"} · Harvest → {harvestItem?.itemName || plant.harvestedItemId}
                    {plant.isHybrid && <span className="ml-1 text-amber-400">(Hybrid)</span>}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={() => openEdit(plant)}>Edit</Button>
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
          <span className="text-sm text-slate-400">{currentPage} / {totalPages}</span>
          <Button size="sm" variant="outline" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      {/* ═══════  Modal  ═══════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 overflow-y-auto">
          <Card className="w-full max-w-3xl bg-slate-950 border border-slate-800 flex flex-col my-8">
            <CardHeader className="border-b border-slate-800 shrink-0">
              <CardTitle>{editingPlantId ? `Edit — ${editingPlantId}` : "Create New Plant"}</CardTitle>
            </CardHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* ─── Basic Info ─── */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Plant Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Plant ID *">
                      <Input value={form.plantId} onChange={(e) => set("plantId", e.target.value)} placeholder="e.g. plant_corn" disabled={!!editingPlantId} />
                    </Field>
                    <Field label="Plant Name *">
                      <Input value={form.plantName} onChange={(e) => set("plantName", e.target.value)} placeholder="Display name" />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Harvested Item *">
                      <ItemPicker items={catalogItems} value={form.harvestedItemId} onChange={(id) => set("harvestedItemId", id)} placeholder="Select harvested item…" />
                    </Field>
                    <Field label="Growing Season">
                      <select
                        value={form.growingSeason}
                        onChange={(e) => set("growingSeason", Number(e.target.value))}
                        className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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
                <section className="space-y-3 pt-2 border-t border-slate-800">
                  <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Pollen Settings</h3>
                  <Toggle label="Can Produce Pollen" checked={form.canProducePollen} onChange={(c) => setBool("canProducePollen", c)} />
                  {form.canProducePollen && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <section className="space-y-3 pt-2 border-t border-slate-800">
                    <h3 className="text-sm font-semibold text-pink-400 uppercase tracking-wider">Hybrid Settings</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Receiver Plant ID">
                        <Input value={form.receiverPlantId} onChange={(e) => set("receiverPlantId", e.target.value)} placeholder="e.g. plant_tomato" />
                      </Field>
                      <Field label="Pollen Plant ID">
                        <Input value={form.pollenPlantId} onChange={(e) => set("pollenPlantId", e.target.value)} placeholder="e.g. plant_corn" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label={editingPlantId ? "Hybrid Flower Sprite (optional)" : "Hybrid Flower Sprite"}>
                        <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-slate-500 transition bg-slate-900">
                          <span className="text-sm text-slate-400">{hybridFlowerFile ? hybridFlowerFile.name : "Click to select"}</span>
                          <input type="file" accept="image/*" onChange={(e) => setHybridFlowerFile(e.target.files?.[0] || null)} className="hidden" />
                        </label>
                        {(form.hybridFlowerIconUrl && !hybridFlowerFile) && <img src={form.hybridFlowerIconUrl} alt="flower" className="w-12 h-12 mt-1 rounded object-cover bg-slate-800 pixel-art" />}
                      </Field>
                      <Field label={editingPlantId ? "Hybrid Mature Sprite (optional)" : "Hybrid Mature Sprite"}>
                        <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-slate-500 transition bg-slate-900">
                          <span className="text-sm text-slate-400">{hybridMatureFile ? hybridMatureFile.name : "Click to select"}</span>
                          <input type="file" accept="image/*" onChange={(e) => setHybridMatureFile(e.target.files?.[0] || null)} className="hidden" />
                        </label>
                        {(form.hybridMatureIconUrl && !hybridMatureFile) && <img src={form.hybridMatureIconUrl} alt="mature" className="w-12 h-12 mt-1 rounded object-cover bg-slate-800 pixel-art" />}
                      </Field>
                    </div>
                  </section>
                )}

                {/* ─── Growth Stages ─── */}
                <section className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Growth Stages</h3>
                    <Button type="button" size="sm" variant="outline" onClick={addStage}>+ Add Stage</Button>
                  </div>

                  {form.growthStages.map((stage, idx) => (
                    <div key={idx} className="flex gap-2 items-center p-3 bg-slate-900/50 rounded-lg">
                      <span className="text-xs text-slate-500 font-mono w-6 shrink-0">#{stage.stageNum}</span>

                      {/* Existing icon preview */}
                      {stage.stageIconUrl && !stageFiles[idx] && (
                        <img src={stage.stageIconUrl} alt={`Stage ${stage.stageNum}`} className="w-10 h-10 rounded object-cover bg-slate-800 shrink-0 pixel-art" />
                      )}

                      {/* File preview */}
                      {stageFiles[idx] && (
                        <img src={URL.createObjectURL(stageFiles[idx]!)} alt={`Stage ${stage.stageNum}`} className="w-10 h-10 rounded object-cover bg-slate-800 shrink-0 pixel-art" />
                      )}

                      <Field label="Age (days)">
                        <Input type="number" value={stage.age} onChange={(e) => setStageAge(idx, e.target.value)} min={0} className="w-24" />
                      </Field>

                      <Field label={editingPlantId ? "Sprite (optional)" : "Sprite *"}>
                        <label className="flex items-center justify-center h-9 px-3 border border-dashed border-slate-700 rounded-md cursor-pointer hover:border-slate-500 transition bg-slate-900 text-xs text-slate-400 whitespace-nowrap">
                          {stageFiles[idx] ? stageFiles[idx]!.name : "Choose file"}
                          <input type="file" accept="image/*" onChange={(e) => setStageFile(idx, e.target.files?.[0] || null)} className="hidden" />
                        </label>
                      </Field>

                      {form.growthStages.length > 1 && (
                        <Button type="button" size="icon" variant="destructive" className="h-8 w-8 shrink-0" onClick={() => removeStage(idx)}>×</Button>
                      )}
                    </div>
                  ))}
                </section>

              </form>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-800 p-4 flex justify-end gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading}>
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
    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-emerald-500 w-4 h-4 rounded" />
      {label}
    </label>
  );
}

export default AdminPlantManager;
