import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import Swal from "sweetalert2";
import materialApi from "../../api/materialApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

/* ───────── types ───────── */

interface MaterialDoc {
  _id?: string;
  materialId: string;
  materialName: string;
  materialTier: number;
  spritesheetUrl?: string;
  cellSize: number;
  description: string;
}

const EMPTY: MaterialDoc = {
  materialId: "",
  materialName: "",
  materialTier: 1,
  cellSize: 64,
  description: "",
};

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

function AdminMaterialManager() {
  const [materials, setMaterials] = useState<MaterialDoc[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [form, setForm] = useState<MaterialDoc>({ ...EMPTY });
  const [spritesheetFile, setSpritesheetFile] = useState<File | null>(null);
  const [spritesheetPreview, setSpritesheetPreview] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── fetch ── */
  const fetchMaterials = async () => {
    try {
      const res = await materialApi.getAllMaterials();
      setMaterials(res.data || []);
    } catch (err) {
      console.error("Failed to load materials:", err);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  /* ── helpers ── */
  const resetForm = () => {
    setForm({ ...EMPTY });
    setSpritesheetFile(null);
    setSpritesheetPreview("");
    setEditingMaterialId(null);
    setIsDetailMode(false);
  };

  const openCreate = () => {
    resetForm();
    setIsDetailMode(false);
    setIsModalOpen(true);
  };

  const openEdit = (mat: MaterialDoc) => {
    setForm({ ...mat });
    setSpritesheetPreview(mat.spritesheetUrl || "");
    setEditingMaterialId(mat.materialId);
    setIsDetailMode(true);
    setIsModalOpen(true);
  };

  /* ── field updaters ── */
  const set = <K extends keyof MaterialDoc>(key: K, value: MaterialDoc[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setNum = (key: keyof MaterialDoc, raw: string) =>
    set(key, raw === "" ? ("" as never) : (Number(raw) as never));

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
    if (!form.materialId.trim() || !form.materialName.trim()) {
      Swal.fire({ icon: "warning", title: "Material ID and Name are required", background: "#020617", color: "#e5e7eb" });
      return;
    }
    if (!editingMaterialId && !spritesheetFile) {
      Swal.fire({ icon: "warning", title: "Spritesheet image is required for new materials", background: "#020617", color: "#e5e7eb" });
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();
      if (spritesheetFile) fd.append("spritesheet", spritesheetFile);
      if (!editingMaterialId) fd.append("materialId", form.materialId);
      fd.append("materialName", form.materialName);
      fd.append("materialTier", String(form.materialTier));
      fd.append("cellSize", String(form.cellSize));
      if (form.description) fd.append("description", form.description);

      if (editingMaterialId) {
        await materialApi.updateMaterial(editingMaterialId, fd);
        Swal.fire({ toast: true, icon: "success", title: "Material updated", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      } else {
        await materialApi.createMaterial(fd);
        Swal.fire({ toast: true, icon: "success", title: "Material created", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      }

      resetForm();
      setIsModalOpen(false);
      await fetchMaterials();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to save material.";
      Swal.fire({ icon: "error", title: "Error", text: msg, background: "#020617", color: "#e5e7eb" });
    } finally {
      setLoading(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async (materialId: string) => {
    const result = await Swal.fire({
      title: "Delete this material?",
      text: `Material "${materialId}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it",
      background: "#020617",
      color: "#e5e7eb",
    });
    if (!result.isConfirmed) return;

    try {
      await materialApi.deleteMaterial(materialId);
      setMaterials((prev) => prev.filter((m) => m.materialId !== materialId));
      Swal.fire({ toast: true, icon: "success", title: "Material deleted", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to delete material.", background: "#020617", color: "#e5e7eb" });
    }
  };

  /* ── filter + paginate ── */
  const filtered = materials.filter((m) => {
    const t = search.toLowerCase();
    return (
      m.materialId.toLowerCase().includes(t) ||
      m.materialName.toLowerCase().includes(t) ||
      (m.description || "").toLowerCase().includes(t)
    );
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
          <h1 className="font-semibold text-white text-2xl">Material Catalog</h1>
          <p className="mt-0.5 text-slate-400 text-sm">{materials.length} materials total</p>
        </div>
        <Button onClick={openCreate}>+ New Material</Button>
      </header>

      {/* List */}
      <Card>
        <CardHeader>
          <Input
            placeholder="Search by ID, name or description…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </CardHeader>
        <CardContent className="divide-y divide-slate-800">
          {visible.length === 0 && (
            <p className="py-8 text-slate-500 text-sm text-center">No materials found.</p>
          )}
          {visible.map((mat) => (
            <div key={mat.materialId} className="flex items-center gap-4 hover:bg-slate-800/40 px-6 py-3 transition-colors">
              {mat.spritesheetUrl ? (
                <img src={mat.spritesheetUrl} alt={mat.materialName} className="bg-slate-800 rounded-md w-10 h-10 object-cover shrink-0 pixel-art" />
              ) : (
                <div className="bg-slate-800 rounded-md w-10 h-10 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{mat.materialName}</p>
                <p className="text-slate-400 text-xs truncate">{mat.materialId} · Tier {mat.materialTier} · Cell {mat.cellSize}px</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={() => openEdit(mat)}>Detail</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(mat.materialId)}>Delete</Button>
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

      {/* ═══════  Modal  ═══════ */}
      {isModalOpen && (
        <div className="z-50 fixed inset-0 flex justify-center items-start bg-black/70 p-4 overflow-y-auto">
          <Card className="flex flex-col bg-slate-950 my-8 border border-slate-800 w-full max-w-xl">
            <CardHeader className="border-slate-800 border-b shrink-0">
              <CardTitle>{editingMaterialId ? `${isDetailMode ? "Detail" : "Edit"} — ${editingMaterialId}` : "Create New Material"}</CardTitle>
            </CardHeader>

            <div className="flex-1 p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset disabled={!!editingMaterialId && isDetailMode} className="space-y-4">

                {/* Material ID */}
                <div className="space-y-1">
                  <Label>Material ID *</Label>
                  <Input
                    value={form.materialId}
                    onChange={(e) => set("materialId", e.target.value)}
                    placeholder="e.g. mat_copper"
                    disabled={!!editingMaterialId}
                  />
                </div>

                {/* Material Name */}
                <div className="space-y-1">
                  <Label>Material Name *</Label>
                  <Input
                    value={form.materialName}
                    onChange={(e) => set("materialName", e.target.value)}
                    placeholder="e.g. Copper"
                  />
                </div>

                {/* Tier + Cell Size */}
                <div className="gap-4 grid grid-cols-2">
                  <div className="space-y-1">
                    <Label>Material Tier</Label>
                    <Input
                      type="number"
                      value={form.materialTier}
                      onChange={(e) => setNum("materialTier", e.target.value)}
                      min={1}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Cell Size (px)</Label>
                    <Input
                      type="number"
                      value={form.cellSize}
                      onChange={(e) => setNum("cellSize", e.target.value)}
                      min={1}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <Label>Description</Label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Optional flavour text…"
                    rows={2}
                    className="flex bg-slate-900 px-3 py-2 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full text-slate-50 placeholder:text-slate-500 text-sm"
                  />
                </div>

                {/* Spritesheet upload */}
                <div className="space-y-1">
                  <Label>{editingMaterialId ? "Spritesheet (optional, replaces current)" : "Spritesheet *"}</Label>
                  <label className="flex justify-center items-center bg-slate-900 border-2 border-slate-700 hover:border-slate-500 border-dashed rounded-lg w-full h-24 transition cursor-pointer">
                    <span className="text-slate-400 text-sm">{spritesheetFile ? spritesheetFile.name : "Click to select PNG spritesheet"}</span>
                    <input type="file" accept="image/png,image/*" onChange={handleSpritesheetPick} className="hidden" />
                  </label>
                  {spritesheetPreview && (
                    <img src={spritesheetPreview} alt="preview" className="bg-slate-800 mt-2 rounded-md h-16 object-cover pixel-art" />
                  )}
                </div>
                </fieldset>

              </form>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-slate-800 border-t shrink-0">
              <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</Button>
              {editingMaterialId && isDetailMode && (
                <Button type="button" onClick={() => setIsDetailMode(false)}>
                  Edit
                </Button>
              )}
              <Button onClick={handleSubmit} disabled={loading || (!!editingMaterialId && isDetailMode)}>
                {loading ? "Saving…" : editingMaterialId ? "Save Changes" : "Create Material"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AdminMaterialManager;
