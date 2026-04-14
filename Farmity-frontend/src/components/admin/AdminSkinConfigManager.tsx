import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import Swal from "sweetalert2";
import skinConfigApi from "../../api/skinConfigApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

/* ───────── constants ───────── */

const LAYER_OPTIONS = ["body", "tool", "hair", "hat", "outfit"] as const;
type Layer = (typeof LAYER_OPTIONS)[number];

/* ───────── types ───────── */

interface SkinConfigDoc {
  _id?: string;
  configId: string;
  spritesheetUrl?: string;
  cellSize: number;
  displayName: string;
  layer: string;
  createdAt?: string;
  updatedAt?: string;
}

const EMPTY: SkinConfigDoc = {
  configId: "",
  displayName: "",
  cellSize: 64,
  layer: "body",
};

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

function AdminSkinConfigManager() {
  const [skinConfigs, setSkinConfigs] = useState<SkinConfigDoc[]>([]);
  const [search, setSearch] = useState("");
  const [layerFilter, setLayerFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [form, setForm] = useState<SkinConfigDoc>({ ...EMPTY });
  const [spritesheetFile, setSpritesheetFile] = useState<File | null>(null);
  const [spritesheetPreview, setSpritesheetPreview] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── fetch ── */
  const fetchSkinConfigs = async () => {
    try {
      const res = await skinConfigApi.getAllSkinConfigs();
      setSkinConfigs(res.data || []);
    } catch (err) {
      console.error("Failed to load skin configs:", err);
    }
  };

  useEffect(() => {
    fetchSkinConfigs();
  }, []);

  /* ── helpers ── */
  const resetForm = () => {
    setForm({ ...EMPTY });
    setSpritesheetFile(null);
    setSpritesheetPreview("");
    setEditingConfigId(null);
    setIsDetailMode(false);
  };

  const openCreate = () => {
    resetForm();
    setIsDetailMode(false);
    setIsModalOpen(true);
  };

  const openEdit = (sc: SkinConfigDoc) => {
    setForm({ ...sc });
    setSpritesheetPreview(sc.spritesheetUrl || "");
    setEditingConfigId(sc.configId);
    setIsDetailMode(true);
    setIsModalOpen(true);
  };

  /* ── field updaters ── */
  const set = <K extends keyof SkinConfigDoc>(key: K, value: SkinConfigDoc[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /* ── spritesheet pick ── */
  const handleSpritesheetPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSpritesheetFile(file);
    setSpritesheetPreview(URL.createObjectURL(file));
  };

  /* ── submit ── */
  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!form.configId.trim() || !form.displayName.trim()) {
      Swal.fire({ icon: "warning", title: "Config ID and Display Name are required", background: "#020617", color: "#e5e7eb" });
      return;
    }
    if (!editingConfigId && !spritesheetFile) {
      Swal.fire({ icon: "warning", title: "Spritesheet image is required for new skin configs", background: "#020617", color: "#e5e7eb" });
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();
      if (spritesheetFile) fd.append("spritesheet", spritesheetFile);
      fd.append("configId", form.configId.trim());
      fd.append("displayName", form.displayName.trim());
      fd.append("cellSize", String(form.cellSize));
      fd.append("layer", form.layer);

      if (editingConfigId) {
        await skinConfigApi.updateSkinConfig(editingConfigId, fd);
        Swal.fire({ toast: true, icon: "success", title: "Skin config updated", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      } else {
        await skinConfigApi.createSkinConfig(fd);
        Swal.fire({ toast: true, icon: "success", title: "Skin config created", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      }

      resetForm();
      setIsModalOpen(false);
      await fetchSkinConfigs();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to save skin config.";
      Swal.fire({ icon: "error", title: "Error", text: msg, background: "#020617", color: "#e5e7eb" });
    } finally {
      setLoading(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async (configId: string) => {
    const result = await Swal.fire({
      title: "Delete this skin config?",
      text: `Config "${configId}" will be permanently removed. The Cloudinary asset is NOT deleted automatically.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it",
      background: "#020617",
      color: "#e5e7eb",
    });
    if (!result.isConfirmed) return;

    try {
      await skinConfigApi.deleteSkinConfig(configId);
      setSkinConfigs((prev) => prev.filter((s) => s.configId !== configId));
      Swal.fire({ toast: true, icon: "success", title: "Skin config deleted", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to delete skin config.", background: "#020617", color: "#e5e7eb" });
    }
  };

  /* ── filter + paginate ── */
  const filtered = skinConfigs.filter((s) => {
    const t = search.toLowerCase();
    const matchText =
      s.configId.toLowerCase().includes(t) ||
      s.displayName.toLowerCase().includes(t) ||
      s.layer.toLowerCase().includes(t);
    const matchLayer = layerFilter === "all" || s.layer === layerFilter;
    return matchText && matchLayer;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  /* ─────────────────────────────────────────────
     RENDER
     ───────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="font-semibold text-white text-2xl">Skin Configs (Paper Doll)</h1>
          <p className="mt-0.5 text-slate-400 text-sm">{skinConfigs.length} entries total</p>
        </div>
        <Button onClick={openCreate}>+ New Skin Config</Button>
      </header>

      {/* List */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search by configId, name, layer…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 min-w-[180px]"
            />
            <select
              value={layerFilter}
              onChange={(e) => { setLayerFilter(e.target.value); setPage(1); }}
              className="bg-slate-900 px-3 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 h-9 text-slate-50 text-sm"
            >
              <option value="all">All Layers</option>
              {LAYER_OPTIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-slate-800">
          {visible.length === 0 && (
            <p className="py-8 text-slate-500 text-sm text-center">No skin configs found.</p>
          )}
          {visible.map((sc) => (
            <div key={sc._id ?? sc.configId} className="flex items-center gap-4 hover:bg-slate-800/40 px-6 py-3 transition-colors">
              {sc.spritesheetUrl ? (
                <img src={sc.spritesheetUrl} alt={sc.displayName} className="bg-slate-800 rounded-md w-10 h-10 object-contain shrink-0 pixel-art" />
              ) : (
                <div className="bg-slate-800 rounded-md w-10 h-10 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{sc.displayName}</p>
                <p className="text-slate-400 text-xs truncate">
                  {sc.configId}
                  <span className="mx-1">·</span>
                  <span className="inline-block bg-sky-500/10 px-1.5 py-px rounded-full text-sky-300">{sc.layer}</span>
                  <span className="mx-1">·</span>
                  {sc.cellSize}px
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={() => openEdit(sc)}>Detail</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(sc.configId)}>Delete</Button>
              </div>
            </div>
          ))}
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

      {/* ══════  Modal  ══════ */}
      {isModalOpen && (
        <div className="z-50 fixed inset-0 flex justify-center items-start bg-black/70 p-4 overflow-y-auto">
          <Card className="flex flex-col bg-slate-950 my-8 border border-slate-800 w-full max-w-lg">
            <CardHeader className="border-slate-800 border-b shrink-0">
              <CardTitle>{editingConfigId ? `${isDetailMode ? "Detail" : "Edit"} — ${editingConfigId}` : "New Skin Config"}</CardTitle>
            </CardHeader>

            <div className="flex-1 p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                <fieldset disabled={!!editingConfigId && isDetailMode} className="space-y-5">

                {/* ─── Identity ─── */}
                <section className="space-y-3">
                  <h3 className="font-semibold text-emerald-400 text-sm uppercase tracking-wider">Identity</h3>
                  <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                    <Field label="Config ID *">
                      <Input
                        value={form.configId}
                        onChange={(e) => set("configId", e.target.value)}
                        placeholder="e.g. farmer_base"
                        disabled={!!editingConfigId}
                      />
                      {editingConfigId && (
                        <p className="mt-1 text-slate-500 text-xs">Cannot be changed after creation.</p>
                      )}
                    </Field>
                    <Field label="Display Name *">
                      <Input
                        value={form.displayName}
                        onChange={(e) => set("displayName", e.target.value)}
                        placeholder="e.g. Farmer Base Body"
                      />
                    </Field>
                  </div>
                  <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                    <Field label="Layer">
                      <select
                        value={form.layer}
                        onChange={(e) => set("layer", e.target.value)}
                        className="flex bg-slate-900 px-3 py-1 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full h-9 text-slate-50 text-sm"
                      >
                        {LAYER_OPTIONS.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Cell Size (px)">
                      <Input
                        type="number"
                        min={1}
                        value={form.cellSize}
                        onChange={(e) => set("cellSize", Number(e.target.value) || 64)}
                        placeholder="64"
                      />
                    </Field>
                  </div>
                </section>

                {/* ─── Spritesheet ─── */}
                <section className="space-y-3 pt-2 border-slate-800 border-t">
                  <h3 className="font-semibold text-amber-400 text-sm uppercase tracking-wider">Spritesheet PNG</h3>
                  <Field label={editingConfigId ? "New spritesheet (leave empty to keep existing)" : "Spritesheet *"}>
                    <label className="flex justify-center items-center bg-slate-900 border-2 border-slate-700 hover:border-slate-500 border-dashed rounded-lg w-full h-24 transition cursor-pointer">
                      <span className="text-slate-400 text-sm">{spritesheetFile ? spritesheetFile.name : "Click to select PNG spritesheet"}</span>
                      <input type="file" accept="image/png,image/*" onChange={handleSpritesheetPick} className="hidden" />
                    </label>
                    {spritesheetFile && (
                      <p className="mt-1 text-slate-500 text-xs">{(spritesheetFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    )}
                  </Field>
                  {spritesheetPreview && (
                    <div className="flex justify-center items-center bg-slate-900 p-2 border border-slate-700 rounded-lg overflow-hidden">
                      <img src={spritesheetPreview} alt="Spritesheet preview" className="max-h-48 object-contain pixel-art" />
                    </div>
                  )}
                </section>
                </fieldset>

              </form>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-slate-800 border-t shrink-0">
              <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }} disabled={loading}>Cancel</Button>
              {editingConfigId && isDetailMode && (
                <Button type="button" onClick={() => setIsDetailMode(false)}>
                  Edit
                </Button>
              )}
              <Button onClick={handleSubmit} disabled={loading || (!!editingConfigId && isDetailMode)}>
                {loading ? "Saving…" : editingConfigId ? "Save Changes" : "Create"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ── Field helper ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export default AdminSkinConfigManager;
