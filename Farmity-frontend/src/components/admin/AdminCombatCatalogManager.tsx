import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import Swal from "sweetalert2";
import combatCatalogApi from "../../api/combatCatalogApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface CombatCatalogDoc {
  _id?: string;
  configId: string;
  displayName: string;
  type: string;
  cellSize: number;
  spritesheetUrl?: string;
  primaryColorHex?: string;
  secondaryColorHex?: string;
  colorIntensity?: number;
  tintAlpha?: number;
}

const TYPE_OPTIONS = ["weapon", "skill_vfx"] as const;
const SKILL_VFX_TYPE = "skill_vfx";

const EMPTY: CombatCatalogDoc = {
  configId: "",
  displayName: "",
  type: "weapon",
  cellSize: 64,
  primaryColorHex: "",
  secondaryColorHex: "",
  colorIntensity: 1,
  tintAlpha: 1,
};

const HEX_COLOR_PATTERN = /^#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;

function isSkillVfx(type?: string) {
  return (type || "weapon") === SKILL_VFX_TYPE;
}

function AdminCombatCatalogManager() {
  const [entries, setEntries] = useState<CombatCatalogDoc[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [form, setForm] = useState<CombatCatalogDoc>({ ...EMPTY });
  const [spritesheetFile, setSpritesheetFile] = useState<File | null>(null);
  const [spritesheetPreview, setSpritesheetPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchEntries = async () => {
    try {
      const res = await combatCatalogApi.getAllCombatCatalogs();
      setEntries(Array.isArray(res.data) ? res.data : res.data?.entries || []);
    } catch (err) {
      console.error("Failed to load combat catalogs:", err);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const resetForm = () => {
    setForm({ ...EMPTY });
    setSpritesheetFile(null);
    setSpritesheetPreview("");
    setEditingConfigId(null);
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (entry: CombatCatalogDoc) => {
    setForm({ ...entry });
    setSpritesheetFile(null);
    setSpritesheetPreview(entry.spritesheetUrl || "");
    setEditingConfigId(entry.configId);
    setIsModalOpen(true);
  };

  const set = <K extends keyof CombatCatalogDoc>(key: K, value: CombatCatalogDoc[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSpritesheetPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSpritesheetFile(file);
    setSpritesheetPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();

    if (!form.configId.trim() || !form.displayName.trim()) {
      Swal.fire({ icon: "warning", title: "Config ID and Display Name are required", background: "#020617", color: "#e5e7eb" });
      return;
    }

    const nextType = form.type || "weapon";
    const usingSkillVfx = isSkillVfx(nextType);
    const primaryColorHex = (form.primaryColorHex || "").trim();
    const secondaryColorHex = (form.secondaryColorHex || "").trim();

    if (!editingConfigId && !usingSkillVfx && !spritesheetFile) {
      Swal.fire({ icon: "warning", title: "Spritesheet is required for new non-skill_vfx configs", background: "#020617", color: "#e5e7eb" });
      return;
    }

    if (usingSkillVfx && !primaryColorHex) {
      Swal.fire({ icon: "warning", title: "Primary Color Hex is required for skill_vfx", background: "#020617", color: "#e5e7eb" });
      return;
    }

    if (primaryColorHex && !HEX_COLOR_PATTERN.test(primaryColorHex)) {
      Swal.fire({ icon: "warning", title: "Primary Color Hex is invalid", text: "Use hex format like #FF7A00.", background: "#020617", color: "#e5e7eb" });
      return;
    }

    if (secondaryColorHex && !HEX_COLOR_PATTERN.test(secondaryColorHex)) {
      Swal.fire({ icon: "warning", title: "Secondary Color Hex is invalid", text: "Use hex format like #4CC9F0.", background: "#020617", color: "#e5e7eb" });
      return;
    }

    const tintAlpha = Number(form.tintAlpha ?? 1);
    if (!Number.isFinite(tintAlpha) || tintAlpha < 0 || tintAlpha > 1) {
      Swal.fire({ icon: "warning", title: "Tint Alpha must be between 0 and 1", background: "#020617", color: "#e5e7eb" });
      return;
    }

    const colorIntensity = Number(form.colorIntensity ?? 1);
    if (!Number.isFinite(colorIntensity) || colorIntensity < 0) {
      Swal.fire({ icon: "warning", title: "Color Intensity must be a non-negative number", background: "#020617", color: "#e5e7eb" });
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();
      if (spritesheetFile) fd.append("spritesheet", spritesheetFile);
      if (!editingConfigId) {
        fd.append("configId", form.configId.trim());
      }
      fd.append("displayName", form.displayName.trim());
      fd.append("type", nextType);
      fd.append("cellSize", String(form.cellSize || 64));
      if (primaryColorHex) fd.append("primaryColorHex", primaryColorHex);
      if (secondaryColorHex) fd.append("secondaryColorHex", secondaryColorHex);
      fd.append("colorIntensity", String(colorIntensity));
      fd.append("tintAlpha", String(tintAlpha));

      if (editingConfigId) {
        await combatCatalogApi.updateCombatCatalog(editingConfigId, fd);
        Swal.fire({ toast: true, icon: "success", title: "Combat config updated", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      } else {
        await combatCatalogApi.createCombatCatalog(fd);
        Swal.fire({ toast: true, icon: "success", title: "Combat config created", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      }

      resetForm();
      setIsModalOpen(false);
      await fetchEntries();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to save combat config.";
      Swal.fire({ icon: "error", title: "Error", text: msg, background: "#020617", color: "#e5e7eb" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (configId: string) => {
    const result = await Swal.fire({
      title: "Delete this combat config?",
      text: `Config "${configId}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it",
      background: "#020617",
      color: "#e5e7eb",
    });

    if (!result.isConfirmed) return;

    try {
      await combatCatalogApi.deleteCombatCatalog(configId);
      setEntries((prev) => prev.filter((s) => s.configId !== configId));
      Swal.fire({ toast: true, icon: "success", title: "Combat config deleted", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to delete combat config.", background: "#020617", color: "#e5e7eb" });
    }
  };

  const filtered = entries.filter((entry) => {
    const t = search.toLowerCase();
    const matchText =
      entry.configId.toLowerCase().includes(t) ||
      entry.displayName.toLowerCase().includes(t) ||
      (entry.type || "").toLowerCase().includes(t);
    const matchType = typeFilter === "all" || entry.type === typeFilter;
    return matchText && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const isSkillVfxForm = isSkillVfx(form.type);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="font-semibold text-white text-2xl">Combat Configs</h1>
          <p className="mt-0.5 text-slate-400 text-sm">{entries.length} entries total</p>
        </div>
        <Button onClick={openCreate}>+ New Combat Config</Button>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search by configId, name or type..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1 min-w-[180px]"
            />
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 px-3 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 h-9 text-slate-50 text-sm"
            >
              <option value="all">All Types</option>
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>

        <CardContent className="divide-y divide-slate-800">
          {visible.length === 0 && (
            <p className="py-8 text-slate-500 text-sm text-center">No combat configs found.</p>
          )}
          {visible.map((entry) => (
            <div key={entry.configId} className="flex items-center gap-4 hover:bg-slate-800/40 px-6 py-3 transition-colors">
              {entry.spritesheetUrl ? (
                <img src={entry.spritesheetUrl} alt={entry.displayName} className="bg-slate-800 rounded-md w-10 h-10 object-contain shrink-0 pixel-art" />
              ) : isSkillVfx(entry.type) ? (
                <div
                  className="border border-slate-700 rounded-md w-10 h-10 shrink-0"
                  style={{ backgroundColor: entry.primaryColorHex || "#334155" }}
                  title={entry.primaryColorHex || "No primary color"}
                />
              ) : (
                <div className="bg-slate-800 rounded-md w-10 h-10 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{entry.displayName}</p>
                <p className="text-slate-400 text-xs truncate">
                  {entry.configId} · {entry.type || "weapon"}
                  {!isSkillVfx(entry.type) ? ` · ${entry.cellSize ?? 64}px` : ""}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={() => openEdit(entry)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(entry.configId)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span className="text-slate-400 text-sm">{currentPage} / {totalPages}</span>
          <Button size="sm" variant="outline" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      {isModalOpen && (
        <div className="z-50 fixed inset-0 flex justify-center items-start bg-black/70 p-4 overflow-y-auto">
          <Card className="flex flex-col bg-slate-950 my-8 border border-slate-800 w-full max-w-xl">
            <CardHeader className="border-slate-800 border-b shrink-0">
              <CardTitle>{editingConfigId ? `Edit - ${editingConfigId}` : "Create New Combat Config"}</CardTitle>
            </CardHeader>

            <div className="flex-1 p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                <section className="space-y-3">
                  <h3 className="font-semibold text-emerald-400 text-sm uppercase tracking-wider">Base Fields</h3>
                  <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                    <Field label="Config ID *">
                      <Input value={form.configId} onChange={(e) => set("configId", e.target.value)} placeholder="e.g. weapon_sword_iron" disabled={!!editingConfigId} />
                    </Field>
                    <Field label="Display Name *">
                      <Input value={form.displayName} onChange={(e) => set("displayName", e.target.value)} placeholder="Display name" />
                    </Field>
                  </div>

                  <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                    <Field label="Type">
                      <select
                        value={form.type || "weapon"}
                        onChange={(e) => {
                          const nextType = e.target.value;
                          set("type", nextType);
                          if (nextType !== SKILL_VFX_TYPE) {
                            set("primaryColorHex", "");
                            set("secondaryColorHex", "");
                            set("colorIntensity", 1);
                            set("tintAlpha", 1);
                          }
                        }}
                        className="flex bg-slate-900 px-3 py-1 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full h-9 text-slate-50 text-sm"
                      >
                        {TYPE_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Cell Size">
                      <Input type="number" min={1} value={form.cellSize ?? 64} onChange={(e) => set("cellSize", Number(e.target.value) || 64)} disabled={isSkillVfxForm} />
                    </Field>
                  </div>

                  {!isSkillVfxForm ? (
                    <Field label={editingConfigId ? "Spritesheet (optional, replaces current)" : "Spritesheet *"}>
                      <label className="flex justify-center items-center bg-slate-900 border-2 border-slate-700 hover:border-slate-500 border-dashed rounded-lg w-full h-24 transition cursor-pointer">
                        <span className="text-slate-400 text-sm">{spritesheetFile ? spritesheetFile.name : "Click to select spritesheet image"}</span>
                        <input type="file" accept="image/png,image/*" onChange={handleSpritesheetPick} className="hidden" />
                      </label>
                      {spritesheetPreview && <img src={spritesheetPreview} alt="spritesheet preview" className="bg-slate-800 mt-2 rounded-md w-16 h-16 object-contain pixel-art" />}
                    </Field>
                  ) : (
                    <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                      <Field label="Primary Color Hex *">
                        <Input value={form.primaryColorHex || ""} onChange={(e) => set("primaryColorHex", e.target.value)} placeholder="#FF7A00" />
                      </Field>
                      <Field label="Secondary Color Hex">
                        <Input value={form.secondaryColorHex || ""} onChange={(e) => set("secondaryColorHex", e.target.value)} placeholder="#4CC9F0" />
                      </Field>
                      <Field label="Color Intensity">
                        <Input type="number" min={0} step="0.01" value={form.colorIntensity ?? 1} onChange={(e) => set("colorIntensity", Number(e.target.value) || 0)} />
                      </Field>
                      <Field label="Tint Alpha (0..1)">
                        <Input type="number" min={0} max={1} step="0.01" value={form.tintAlpha ?? 1} onChange={(e) => set("tintAlpha", Number(e.target.value))} />
                      </Field>
                    </div>
                  )}
                </section>
              </form>
            </div>

            <div className="flex justify-end gap-2 p-4 border-slate-800 border-t shrink-0">
              <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : editingConfigId ? "Save Changes" : "Create Config"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export default AdminCombatCatalogManager;
