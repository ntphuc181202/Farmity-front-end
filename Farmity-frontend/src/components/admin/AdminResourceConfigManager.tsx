import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import Swal from "sweetalert2";
import resourceConfigApi from "../../api/resourceConfigApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface ResourceDrop {
  itemId: string;
  minAmount: number;
  maxAmount: number;
  dropChance: number;
}

type ResourceType = "tree" | "rock" | "ore";

const RESOURCE_TYPES: ResourceType[] = ["tree", "rock", "ore"];

const normalizeResourceType = (value: unknown): ResourceType => {
  const normalized = String(value || "tree").toLowerCase() as ResourceType;
  return RESOURCE_TYPES.includes(normalized) ? normalized : "tree";
};

interface ResourceConfigDoc {
  _id?: string;
  resourceId: string;
  name: string;
  maxHp: number;
  resourceType: ResourceType;
  spawnWeight: number;
  requiredToolType: string;
  minToolPower: number;
  spriteUrl?: string;
  dropTable: ResourceDrop[];
}

const EMPTY: ResourceConfigDoc = {
  resourceId: "",
  name: "",
  maxHp: 100,
  resourceType: "tree",
  spawnWeight: 1,
  requiredToolType: "Axe",
  minToolPower: 1,
  dropTable: [{ itemId: "", minAmount: 1, maxAmount: 1, dropChance: 1 }],
};

function AdminResourceConfigManager() {
  const [resources, setResources] = useState<ResourceConfigDoc[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [form, setForm] = useState<ResourceConfigDoc>({ ...EMPTY });
  const [spriteFile, setSpriteFile] = useState<File | null>(null);
  const [spritePreview, setSpritePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchResources = async () => {
    try {
      const res = await resourceConfigApi.getCatalog();
      const raw = res?.data?.resources ?? res?.data ?? [];
      const normalized = (raw || []).map((r: any) => ({
        ...r,
        resourceType: normalizeResourceType(r.resourceType),
        spawnWeight: Number(r.spawnWeight) > 0 ? Number(r.spawnWeight) : 1,
        requiredToolType: String(r.requiredToolType || r.requiredToolId || "Axe").trim() || "Axe",
        minToolPower: Number(r.minToolPower) > 0 ? Number(r.minToolPower) : 1,
        spriteUrl: r.spriteUrl || "",
        dropTable:
          r.dropTable?.length > 0
            ? r.dropTable.map((d: any) => ({
                itemId: d.itemId || "",
                minAmount: Number(d.minAmount) || 1,
                maxAmount: Number(d.maxAmount) || 1,
                dropChance: Number(d.dropChance) || 0,
              }))
            : [{ itemId: "", minAmount: 1, maxAmount: 1, dropChance: 1 }],
      }));
      setResources(normalized);
    } catch (err) {
      console.error("Failed to load resources:", err);
      setResources([]);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const resetForm = () => {
    setForm({ ...EMPTY, dropTable: [{ itemId: "", minAmount: 1, maxAmount: 1, dropChance: 1 }] });
    setSpriteFile(null);
    setSpritePreview("");
    setEditingResourceId(null);
    setIsDetailMode(false);
  };

  const openCreate = () => {
    resetForm();
    setIsDetailMode(false);
    setIsModalOpen(true);
  };

  const openEdit = (resource: ResourceConfigDoc) => {
    setForm({
      ...resource,
      resourceType: normalizeResourceType(resource.resourceType),
      spawnWeight: Number(resource.spawnWeight) > 0 ? Number(resource.spawnWeight) : 1,
      requiredToolType: String((resource as any).requiredToolType || (resource as any).requiredToolId || "Axe").trim() || "Axe",
      minToolPower: Number((resource as any).minToolPower) > 0 ? Number((resource as any).minToolPower) : 1,
      spriteUrl: resource.spriteUrl || "",
      dropTable:
        resource.dropTable?.length > 0
          ? resource.dropTable.map((d) => ({ ...d }))
          : [{ itemId: "", minAmount: 1, maxAmount: 1, dropChance: 1 }],
    });
    setSpriteFile(null);
    setSpritePreview(resource.spriteUrl || "");
    setEditingResourceId(resource.resourceId);
    setIsDetailMode(true);
    setIsModalOpen(true);
  };

  const set = <K extends keyof ResourceConfigDoc>(key: K, value: ResourceConfigDoc[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setNum = (key: keyof ResourceConfigDoc, raw: string) =>
    set(key, raw === "" ? ("" as never) : (Number(raw) as never));

  const handleSpritePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSpriteFile(file);
    setSpritePreview(URL.createObjectURL(file));
  };

  const updateDrop = (idx: number, patch: Partial<ResourceDrop>) => {
    setForm((prev) => {
      const next = [...prev.dropTable];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, dropTable: next };
    });
  };

  const addDrop = () => {
    setForm((prev) => ({
      ...prev,
      dropTable: [...prev.dropTable, { itemId: "", minAmount: 1, maxAmount: 1, dropChance: 1 }],
    }));
  };

  const removeDrop = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      dropTable: prev.dropTable.filter((_, i) => i !== idx),
    }));
  };

  const validateForm = (): string | null => {
    if (!form.resourceId.trim()) return "Resource ID is required";
    if (!form.name.trim()) return "Name is required";
    if (!RESOURCE_TYPES.includes(form.resourceType)) return "Resource type is invalid";
    if (!Number.isFinite(form.maxHp) || Number(form.maxHp) <= 0) return "Max HP must be greater than 0";
    if (!Number.isFinite(form.spawnWeight) || Number(form.spawnWeight) < 1) {
      return "Spawn weight must be an integer greater than or equal to 1";
    }
    if (!Number.isInteger(Number(form.spawnWeight))) {
      return "Spawn weight must be an integer greater than or equal to 1";
    }
    if (!form.requiredToolType.trim()) return "Required tool type is required";
    if (!Number.isFinite(form.minToolPower) || Number(form.minToolPower) < 1) {
      return "Min tool power must be an integer greater than or equal to 1";
    }
    if (!Number.isInteger(Number(form.minToolPower))) {
      return "Min tool power must be an integer greater than or equal to 1";
    }
    if (!form.dropTable.length) return "At least one drop table row is required";

    for (let i = 0; i < form.dropTable.length; i += 1) {
      const row = form.dropTable[i];
      if (!row.itemId.trim()) return `Drop row ${i + 1}: itemId is required`;
      if (!Number.isFinite(row.minAmount) || row.minAmount < 1) return `Drop row ${i + 1}: minAmount must be >= 1`;
      if (!Number.isFinite(row.maxAmount) || row.maxAmount < row.minAmount) {
        return `Drop row ${i + 1}: maxAmount must be >= minAmount`;
      }
      if (!Number.isFinite(row.dropChance) || row.dropChance < 0 || row.dropChance > 1) {
        return `Drop row ${i + 1}: dropChance must be between 0 and 1`;
      }
    }

    return null;
  };

  const buildFormData = () => {
    const fd = new FormData();

    if (!editingResourceId) {
      fd.append("resourceId", form.resourceId.trim());
    }

    fd.append("name", form.name.trim());
    fd.append("maxHp", String(Number(form.maxHp)));
    fd.append("resourceType", form.resourceType);
    fd.append("spawnWeight", String(Number(form.spawnWeight)));
    fd.append("requiredToolType", form.requiredToolType.trim());
    fd.append("minToolPower", String(Number(form.minToolPower)));
    fd.append(
      "dropTable",
      JSON.stringify(
        form.dropTable.map((d) => ({
          itemId: d.itemId.trim(),
          minAmount: Number(d.minAmount),
          maxAmount: Number(d.maxAmount),
          dropChance: Number(d.dropChance),
        })),
      ),
    );

    if (spriteFile) {
      fd.append("sprite", spriteFile);
    }

    return fd;
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    const errorText = validateForm();
    if (errorText) {
      Swal.fire({
        icon: "warning",
        title: errorText,
        background: "#020617",
        color: "#e5e7eb",
      });
      return;
    }

    try {
      setLoading(true);
      const formData = buildFormData();

      if (editingResourceId) {
        await resourceConfigApi.updateResourceConfig(editingResourceId, formData);
        Swal.fire({ toast: true, icon: "success", title: "Resource updated", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      } else {
        await resourceConfigApi.createResourceConfig(formData);
        Swal.fire({ toast: true, icon: "success", title: "Resource created", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      }

      resetForm();
      setIsModalOpen(false);
      await fetchResources();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to save resource config.";
      Swal.fire({ icon: "error", title: "Error", text: msg, background: "#020617", color: "#e5e7eb" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    const result = await Swal.fire({
      title: "Delete this resource config?",
      text: `Resource "${resourceId}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it",
      background: "#020617",
      color: "#e5e7eb",
    });
    if (!result.isConfirmed) return;

    try {
      await resourceConfigApi.deleteResourceConfig(resourceId);
      setResources((prev) => prev.filter((r) => r.resourceId !== resourceId));
      Swal.fire({ toast: true, icon: "success", title: "Resource deleted", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to delete resource config.";
      Swal.fire({ icon: "error", title: "Error", text: msg, background: "#020617", color: "#e5e7eb" });
    }
  };

  const filtered = resources.filter((r) => {
    const t = search.toLowerCase();
    return (
      r.resourceId.toLowerCase().includes(t) ||
      r.name.toLowerCase().includes(t) ||
      r.resourceType.toLowerCase().includes(t) ||
      (r.requiredToolType || "").toLowerCase().includes(t)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="font-semibold text-white text-2xl">Resource Config Catalog</h1>
          <p className="mt-0.5 text-slate-400 text-sm">{resources.length} resources total</p>
        </div>
        <Button onClick={openCreate}>+ New Resource</Button>
      </header>

      <Card>
        <CardHeader>
          <Input
            placeholder="Search by ID, name, type or required tool..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </CardHeader>
        <CardContent className="divide-y divide-slate-800">
          {visible.length === 0 && <p className="py-8 text-slate-500 text-sm text-center">No resource configs found.</p>}
          {visible.map((resource) => (
            <div key={resource.resourceId} className="flex items-center gap-4 hover:bg-slate-800/40 px-6 py-3 transition-colors">
              {resource.spriteUrl ? (
                <img src={resource.spriteUrl} alt={resource.name} className="bg-slate-800 rounded-md w-10 h-10 object-cover shrink-0 pixel-art" />
              ) : (
                <div className="inline-flex justify-center items-center bg-cyan-500/10 rounded-md w-10 h-10 font-bold text-cyan-300 text-xs shrink-0">
                  RC
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{resource.name}</p>
                <p className="text-slate-400 text-xs truncate">
                  {resource.resourceId} | Type {resource.resourceType} | Weight {resource.spawnWeight} | HP {resource.maxHp} | Drops {resource.dropTable?.length || 0}
                  {resource.requiredToolType ? ` | Tool ${resource.requiredToolType}` : ""}
                  {resource.minToolPower ? ` | Min Power ${resource.minToolPower}` : ""}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={() => openEdit(resource)}>Detail</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(resource.resourceId)}>Delete</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span className="text-slate-400 text-sm">{currentPage} / {totalPages}</span>
          <Button size="sm" variant="outline" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      {isModalOpen && (
        <div className="z-50 fixed inset-0 flex justify-center items-start bg-black/70 p-4 overflow-y-auto">
          <Card className="flex flex-col bg-slate-950 my-8 border border-slate-800 w-full max-w-3xl">
            <CardHeader className="border-slate-800 border-b shrink-0">
              <CardTitle>{editingResourceId ? `${isDetailMode ? "Detail" : "Edit"} - ${editingResourceId}` : "Create New Resource Config"}</CardTitle>
            </CardHeader>

            <div className="flex-1 p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset disabled={!!editingResourceId && isDetailMode} className="space-y-4">
                <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Resource ID *</Label>
                    <Input
                      value={form.resourceId}
                      onChange={(e) => set("resourceId", e.target.value)}
                      placeholder="e.g. oak_tree"
                      disabled={!!editingResourceId}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Name *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="Display name"
                    />
                  </div>
                </div>

                <div className="gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-1">
                    <Label>Max HP *</Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.maxHp}
                      onChange={(e) => setNum("maxHp", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Resource Type *</Label>
                    <select
                      value={form.resourceType}
                      onChange={(e) => set("resourceType", normalizeResourceType(e.target.value))}
                      className="bg-background px-3 py-2 border border-input rounded-md w-full h-10 text-sm"
                    >
                      {RESOURCE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Spawn Weight</Label>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={form.spawnWeight}
                      onChange={(e) => setNum("spawnWeight", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Required Tool Type</Label>
                    <Input
                      value={form.requiredToolType}
                      onChange={(e) => set("requiredToolType", e.target.value)}
                      placeholder="e.g. Axe"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Min Tool Power</Label>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={form.minToolPower}
                      onChange={(e) => setNum("minToolPower", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>{editingResourceId ? "Sprite (optional, replaces current)" : "Sprite (optional)"}</Label>
                  <label className="flex justify-center items-center bg-slate-900 border-2 border-slate-700 hover:border-slate-500 border-dashed rounded-lg w-full h-20 transition cursor-pointer">
                    <span className="text-slate-400 text-sm">
                      {spriteFile ? spriteFile.name : "Click to select PNG sprite"}
                    </span>
                    <input type="file" accept="image/png,image/*" onChange={handleSpritePick} className="hidden" />
                  </label>
                  {spritePreview && (
                    <img src={spritePreview} alt="sprite preview" className="bg-slate-800 mt-2 rounded-md h-16 object-cover pixel-art" />
                  )}
                </div>

                <section className="space-y-3 pt-2 border-slate-800 border-t">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-cyan-400 text-sm uppercase tracking-wider">Drop Table</h3>
                    <Button type="button" size="sm" variant="outline" onClick={addDrop}>+ Add Row</Button>
                  </div>

                  {form.dropTable.map((drop, idx) => (
                    <div key={idx} className="items-end gap-2 grid grid-cols-1 sm:grid-cols-12 bg-slate-900/50 p-3 rounded-lg">
                      <div className="space-y-1 sm:col-span-5">
                        <Label>Item ID *</Label>
                        <Input
                          value={drop.itemId}
                          onChange={(e) => updateDrop(idx, { itemId: e.target.value })}
                          placeholder="e.g. wood"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label>Min</Label>
                        <Input
                          type="number"
                          min={1}
                          value={drop.minAmount}
                          onChange={(e) => updateDrop(idx, { minAmount: Number(e.target.value) || 1 })}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label>Max</Label>
                        <Input
                          type="number"
                          min={1}
                          value={drop.maxAmount}
                          onChange={(e) => updateDrop(idx, { maxAmount: Number(e.target.value) || 1 })}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label>Chance</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          max={1}
                          value={drop.dropChance}
                          onChange={(e) => updateDrop(idx, { dropChance: Number(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="sm:col-span-1">
                        {form.dropTable.length > 1 && (
                          <Button type="button" variant="destructive" size="icon" className="w-9 h-9" onClick={() => removeDrop(idx)}>
                            x
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </section>
                </fieldset>
              </form>
            </div>

            <div className="flex justify-end gap-2 p-4 border-slate-800 border-t shrink-0">
              <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</Button>
              {editingResourceId && isDetailMode && (
                <Button type="button" onClick={() => setIsDetailMode(false)}>
                  Edit
                </Button>
              )}
              <Button onClick={handleSubmit} disabled={loading || (!!editingResourceId && isDetailMode)}>
                {loading ? "Saving..." : editingResourceId ? "Save Changes" : "Create Resource"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AdminResourceConfigManager;
