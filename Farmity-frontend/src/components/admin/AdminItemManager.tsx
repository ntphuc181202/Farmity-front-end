import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import Swal from "sweetalert2";
import itemApi from "../../api/itemApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

/* ───────── constants ───────── */

const ITEM_TYPE_LABELS: Record<number, string> = {
  0: "Tool",
  1: "Seed",
  2: "Crop",
  3: "Pollen",
  4: "Consumable",
  5: "Material",
  6: "Weapon",
  7: "Fish",
  8: "Cooking",
  9: "Forage",
  10: "Resource",
  11: "Gift",
  12: "Quest",
};

const ITEM_CATEGORY_LABELS: Record<number, string> = {
  0: "Farming",
  1: "Mining",
  2: "Fishing",
  3: "Cooking",
};

const TOOL_TYPE_LABELS: Record<number, string> = {
  0: "Hoe",
  1: "WateringCan",
  2: "Pickaxe",
  3: "Axe",
  4: "FishingRod",
};

const MATERIAL_LABELS: Record<number, string> = {
  0: "Basic",
  1: "Copper",
  2: "Steel",
  3: "Gold",
  4: "Diamond",
};

/* ───────── types ───────── */

interface CrossResult {
  targetPlantId: string;
  resultPlantId: string;
}

interface ItemDoc {
  _id?: string;
  itemID: string;
  itemName: string;
  description: string;
  iconUrl?: string;
  itemType: number;
  itemCategory: number;
  maxStack: number;
  isStackable: boolean;
  basePrice: number;
  buyPrice: number;
  canBeSold: boolean;
  canBeBought: boolean;
  isQuestItem: boolean;
  isArtifact: boolean;
  isRareItem: boolean;
  npcPreferenceNames?: string[];
  npcPreferenceReactions?: number[];
  // type-specific
  toolType?: number;
  toolLevel?: number;
  toolPower?: number;
  toolMaterial?: number;
  plantId?: string;
  sourcePlantId?: string;
  pollinationSuccessChance?: number;
  viabilityDays?: number;
  crossResults?: CrossResult[];
  energyRestore?: number;
  healthRestore?: number;
  bufferDuration?: number;
  damage?: number;
  critChance?: number;
  attackSpeed?: number;
  weaponMaterial?: number;
  difficulty?: number;
  fishingSeasons?: number[];
  isLegendary?: boolean;
  foragingSeasons?: number[];
  isOre?: boolean;
  requiresSmelting?: boolean;
  smeltedResultId?: string;
  isUniversalLike?: boolean;
  isUniversalLove?: boolean;
  relatedQuestID?: string;
  autoConsume?: boolean;
}

const EMPTY: ItemDoc = {
  itemID: "",
  itemName: "",
  description: "",
  itemType: 0,
  itemCategory: 0,
  maxStack: 1,
  isStackable: false,
  basePrice: 0,
  buyPrice: 0,
  canBeSold: true,
  canBeBought: false,
  isQuestItem: false,
  isArtifact: false,
  isRareItem: false,
  npcPreferenceNames: [],
  npcPreferenceReactions: [],
};

/* ───────── helper: build FormData ───────── */

function buildFormData(form: ItemDoc, iconFile: File | null): FormData {
  const fd = new FormData();

  if (iconFile) fd.append("icon", iconFile);

  // base scalars
  const scalars: (keyof ItemDoc)[] = [
    "itemID", "itemName", "description", "itemType", "itemCategory",
    "maxStack", "isStackable", "basePrice", "buyPrice",
    "canBeSold", "canBeBought", "isQuestItem", "isArtifact", "isRareItem",
  ];
  for (const k of scalars) {
    const v = form[k];
    if (v !== undefined && v !== null && v !== "") fd.append(k, String(v));
  }

  // npc preferences
  if (form.npcPreferenceNames && form.npcPreferenceNames.length > 0) {
    form.npcPreferenceNames.forEach((n) => fd.append("npcPreferenceNames", n));
  }
  if (form.npcPreferenceReactions && form.npcPreferenceReactions.length > 0) {
    form.npcPreferenceReactions.forEach((r) => fd.append("npcPreferenceReactions", String(r)));
  }

  // type-specific
  const t = Number(form.itemType);
  if (t === 0) {
    appendIfDefined(fd, "toolType", form.toolType);
    appendIfDefined(fd, "toolLevel", form.toolLevel);
    appendIfDefined(fd, "toolPower", form.toolPower);
    appendIfDefined(fd, "toolMaterial", form.toolMaterial);
  } else if (t === 1) {
    appendIfDefined(fd, "plantId", form.plantId);
  } else if (t === 3) {
    appendIfDefined(fd, "sourcePlantId", form.sourcePlantId);
    appendIfDefined(fd, "pollinationSuccessChance", form.pollinationSuccessChance);
    appendIfDefined(fd, "viabilityDays", form.viabilityDays);
    if (form.crossResults && form.crossResults.length > 0) {
      fd.append("crossResults", JSON.stringify(form.crossResults));
    }
  } else if (t === 4 || t === 8) {
    appendIfDefined(fd, "energyRestore", form.energyRestore);
    appendIfDefined(fd, "healthRestore", form.healthRestore);
    appendIfDefined(fd, "bufferDuration", form.bufferDuration);
  } else if (t === 6) {
    appendIfDefined(fd, "damage", form.damage);
    appendIfDefined(fd, "critChance", form.critChance);
    appendIfDefined(fd, "attackSpeed", form.attackSpeed);
    appendIfDefined(fd, "weaponMaterial", form.weaponMaterial);
  } else if (t === 7) {
    appendIfDefined(fd, "difficulty", form.difficulty);
    if (form.fishingSeasons && form.fishingSeasons.length > 0) {
      form.fishingSeasons.forEach((s) => fd.append("fishingSeasons", String(s)));
    }
    appendIfDefined(fd, "isLegendary", form.isLegendary);
  } else if (t === 9) {
    if (form.foragingSeasons && form.foragingSeasons.length > 0) {
      form.foragingSeasons.forEach((s) => fd.append("foragingSeasons", String(s)));
    }
    appendIfDefined(fd, "energyRestore", form.energyRestore);
  } else if (t === 10) {
    appendIfDefined(fd, "isOre", form.isOre);
    appendIfDefined(fd, "requiresSmelting", form.requiresSmelting);
    appendIfDefined(fd, "smeltedResultId", form.smeltedResultId);
  } else if (t === 11) {
    appendIfDefined(fd, "isUniversalLike", form.isUniversalLike);
    appendIfDefined(fd, "isUniversalLove", form.isUniversalLove);
  } else if (t === 12) {
    appendIfDefined(fd, "relatedQuestID", form.relatedQuestID);
    appendIfDefined(fd, "autoConsume", form.autoConsume);
  }

  return fd;
}

function appendIfDefined(fd: FormData, key: string, v: unknown) {
  if (v !== undefined && v !== null && v !== "") fd.append(key, String(v));
}

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

function AdminItemManager() {
  const [items, setItems] = useState<ItemDoc[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemID, setEditingItemID] = useState<string | null>(null);
  const [form, setForm] = useState<ItemDoc>({ ...EMPTY });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── fetch ── */
  const fetchItems = async () => {
    try {
      const res = await itemApi.getAllItems();
      setItems(res.data || []);
    } catch (err) {
      console.error("Failed to load items:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  /* ── helpers ── */
  const resetForm = () => {
    setForm({ ...EMPTY });
    setIconFile(null);
    setIconPreview("");
    setEditingItemID(null);
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (item: ItemDoc) => {
    setForm({ ...item });
    setIconPreview(item.iconUrl || "");
    setEditingItemID(item.itemID);
    setIsModalOpen(true);
  };

  /* ── field updaters ── */
  const set = <K extends keyof ItemDoc>(key: K, value: ItemDoc[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setNum = (key: keyof ItemDoc, raw: string) =>
    set(key, raw === "" ? ("" as never) : (Number(raw) as never));

  const setBool = (key: keyof ItemDoc, checked: boolean) =>
    set(key, checked as never);

  /* ── icon pick ── */
  const handleIconPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  /* ── submit ── */
  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!form.itemID.trim() || !form.itemName.trim()) {
      Swal.fire({ icon: "warning", title: "Item ID and Name are required", background: "#020617", color: "#e5e7eb" });
      return;
    }
    if (!editingItemID && !iconFile) {
      Swal.fire({ icon: "warning", title: "Icon image is required for new items", background: "#020617", color: "#e5e7eb" });
      return;
    }

    try {
      setLoading(true);
      const fd = buildFormData(form, iconFile);

      if (editingItemID) {
        await itemApi.updateItem(editingItemID, fd);
        Swal.fire({ toast: true, icon: "success", title: "Item updated", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      } else {
        await itemApi.createItem(fd);
        Swal.fire({ toast: true, icon: "success", title: "Item created", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      }

      resetForm();
      setIsModalOpen(false);
      await fetchItems();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to save item.";
      Swal.fire({ icon: "error", title: "Error", text: msg, background: "#020617", color: "#e5e7eb" });
    } finally {
      setLoading(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async (itemID: string) => {
    const result = await Swal.fire({
      title: "Delete this item?",
      text: `Item "${itemID}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it",
      background: "#020617",
      color: "#e5e7eb",
    });
    if (!result.isConfirmed) return;

    try {
      await itemApi.deleteItem(itemID);
      setItems((prev) => prev.filter((i) => i.itemID !== itemID));
      Swal.fire({ toast: true, icon: "success", title: "Item deleted", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to delete item.", background: "#020617", color: "#e5e7eb" });
    }
  };

  /* ── filter + paginate ── */
  const filtered = items.filter((i) => {
    const t = search.toLowerCase();
    return (
      i.itemID.toLowerCase().includes(t) ||
      i.itemName.toLowerCase().includes(t) ||
      (i.description || "").toLowerCase().includes(t)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  /* ── NPC prefs helpers ── */
  const addNpcPref = () => {
    setForm((prev) => ({
      ...prev,
      npcPreferenceNames: [...(prev.npcPreferenceNames || []), ""],
      npcPreferenceReactions: [...(prev.npcPreferenceReactions || []), 0],
    }));
  };
  const removeNpcPref = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      npcPreferenceNames: (prev.npcPreferenceNames || []).filter((_, i) => i !== idx),
      npcPreferenceReactions: (prev.npcPreferenceReactions || []).filter((_, i) => i !== idx),
    }));
  };
  const setNpcName = (idx: number, val: string) => {
    setForm((prev) => {
      const names = [...(prev.npcPreferenceNames || [])];
      names[idx] = val;
      return { ...prev, npcPreferenceNames: names };
    });
  };
  const setNpcReaction = (idx: number, val: number) => {
    setForm((prev) => {
      const reactions = [...(prev.npcPreferenceReactions || [])];
      reactions[idx] = val;
      return { ...prev, npcPreferenceReactions: reactions };
    });
  };

  /* ── cross results helpers ── */
  const addCrossResult = () => {
    setForm((prev) => ({
      ...prev,
      crossResults: [...(prev.crossResults || []), { targetPlantId: "", resultPlantId: "" }],
    }));
  };
  const removeCrossResult = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      crossResults: (prev.crossResults || []).filter((_, i) => i !== idx),
    }));
  };
  const setCrossField = (idx: number, field: keyof CrossResult, val: string) => {
    setForm((prev) => {
      const arr = [...(prev.crossResults || [])];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...prev, crossResults: arr };
    });
  };

  /* ── seasons toggle helper ── */
  const toggleSeason = (key: "fishingSeasons" | "foragingSeasons", val: number) => {
    setForm((prev) => {
      const arr = [...(prev[key] as number[] || [])];
      const idx = arr.indexOf(val);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(val);
      return { ...prev, [key]: arr };
    });
  };

  /* ─────────────────────────────────────────────
     RENDER
     ───────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Items Catalog</h1>
          <p className="text-sm text-slate-400 mt-0.5">{items.length} items total</p>
        </div>
        <Button onClick={openCreate}>+ New Item</Button>
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
            <p className="text-slate-500 text-sm text-center py-8">No items found.</p>
          )}
          {visible.map((item) => (
            <div key={item.itemID} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-800/40 transition-colors">
              {item.iconUrl ? (
                <img src={item.iconUrl} alt={item.itemName} className="w-10 h-10 rounded-md object-cover bg-slate-800 shrink-0 pixel-art" />
              ) : (
                <div className="w-10 h-10 rounded-md bg-slate-800 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{item.itemName}</p>
                <p className="text-xs text-slate-400 truncate">{item.itemID} · {ITEM_TYPE_LABELS[item.itemType] ?? "Unknown"}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={() => openEdit(item)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item.itemID)}>Delete</Button>
              </div>
            </div>
          ))}
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
              <CardTitle>{editingItemID ? `Edit — ${editingItemID}` : "Create New Item"}</CardTitle>
            </CardHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* ─── Base Fields ─── */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Base Fields</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Item ID *">
                      <Input value={form.itemID} onChange={(e) => set("itemID", e.target.value)} placeholder="e.g. tool_hoe_basic" disabled={!!editingItemID} />
                    </Field>
                    <Field label="Item Name *">
                      <Input value={form.itemName} onChange={(e) => set("itemName", e.target.value)} placeholder="Display name" />
                    </Field>
                  </div>

                  <Field label="Description">
                    <textarea
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Flavour text…"
                      rows={2}
                      className="flex w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    />
                  </Field>

                  {/* Icon upload */}
                  <Field label={editingItemID ? "Icon (optional, replaces current)" : "Icon *"}>
                    <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-slate-500 transition bg-slate-900">
                      <span className="text-sm text-slate-400">{iconFile ? iconFile.name : "Click to select icon image"}</span>
                      <input type="file" accept="image/*" onChange={handleIconPick} className="hidden" />
                    </label>
                    {iconPreview && <img src={iconPreview} alt="preview" className="w-16 h-16 mt-2 rounded-md object-cover bg-slate-800 pixel-art" />}
                  </Field>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Field label="Item Type">
                      <select
                        value={form.itemType}
                        onChange={(e) => set("itemType", Number(e.target.value))}
                        className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        {Object.entries(ITEM_TYPE_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v} ({k})</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Category">
                      <select
                        value={form.itemCategory}
                        onChange={(e) => set("itemCategory", Number(e.target.value))}
                        className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        {Object.entries(ITEM_CATEGORY_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v} ({k})</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Max Stack">
                      <Input type="number" value={form.maxStack} onChange={(e) => setNum("maxStack", e.target.value)} min={1} />
                    </Field>
                    <Field label="Base Price">
                      <Input type="number" value={form.basePrice} onChange={(e) => setNum("basePrice", e.target.value)} min={0} />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Field label="Buy Price">
                      <Input type="number" value={form.buyPrice} onChange={(e) => setNum("buyPrice", e.target.value)} min={0} />
                    </Field>
                  </div>

                  {/* Booleans */}
                  <div className="flex flex-wrap gap-4 pt-1">
                    <Toggle label="Stackable" checked={form.isStackable} onChange={(c) => setBool("isStackable", c)} />
                    <Toggle label="Can Be Sold" checked={form.canBeSold} onChange={(c) => setBool("canBeSold", c)} />
                    <Toggle label="Can Be Bought" checked={form.canBeBought} onChange={(c) => setBool("canBeBought", c)} />
                    <Toggle label="Quest Item" checked={form.isQuestItem} onChange={(c) => setBool("isQuestItem", c)} />
                    <Toggle label="Artifact" checked={form.isArtifact} onChange={(c) => setBool("isArtifact", c)} />
                    <Toggle label="Rare Item" checked={form.isRareItem} onChange={(c) => setBool("isRareItem", c)} />
                  </div>
                </section>

                {/* ─── NPC Preferences ─── */}
                <section className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">NPC Preferences</h3>
                    <Button type="button" size="sm" variant="outline" onClick={addNpcPref}>+ Add</Button>
                  </div>
                  {(form.npcPreferenceNames || []).map((name, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input className="flex-1" placeholder="NPC name" value={name} onChange={(e) => setNpcName(idx, e.target.value)} />
                      <select
                        value={(form.npcPreferenceReactions || [])[idx] ?? 0}
                        onChange={(e) => setNpcReaction(idx, Number(e.target.value))}
                        className="h-9 rounded-md border border-slate-700 bg-slate-900 px-2 text-sm text-slate-50"
                      >
                        {[-2, -1, 0, 1, 2].map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      <Button type="button" size="icon" variant="destructive" className="h-8 w-8 shrink-0" onClick={() => removeNpcPref(idx)}>×</Button>
                    </div>
                  ))}
                </section>

                {/* ─── Type-Specific Fields ─── */}
                <TypeFields
                  itemType={Number(form.itemType)}
                  form={form}
                  set={set}
                  setNum={setNum}
                  setBool={setBool}
                  toggleSeason={toggleSeason}
                  addCrossResult={addCrossResult}
                  removeCrossResult={removeCrossResult}
                  setCrossField={setCrossField}
                />
              </form>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-800 p-4 flex justify-end gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving…" : editingItemID ? "Save Changes" : "Create Item"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════ */

/* Labelled field wrapper */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

/* Checkbox toggle */
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-emerald-500 w-4 h-4 rounded" />
      {label}
    </label>
  );
}

/* Dynamic type-specific fields */
function TypeFields({
  itemType,
  form,
  set,
  setNum,
  setBool,
  toggleSeason,
  addCrossResult,
  removeCrossResult,
  setCrossField,
}: {
  itemType: number;
  form: ItemDoc;
  set: <K extends keyof ItemDoc>(key: K, value: ItemDoc[K]) => void;
  setNum: (key: keyof ItemDoc, raw: string) => void;
  setBool: (key: keyof ItemDoc, checked: boolean) => void;
  toggleSeason: (key: "fishingSeasons" | "foragingSeasons", val: number) => void;
  addCrossResult: () => void;
  removeCrossResult: (idx: number) => void;
  setCrossField: (idx: number, field: "targetPlantId" | "resultPlantId", val: string) => void;
}) {
  const selectClass = "flex h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500";

  const sectionHeader = ITEM_TYPE_LABELS[itemType]
    ? `${ITEM_TYPE_LABELS[itemType]} Fields`
    : "Extra Fields";

  // Hide section for types with no extra fields
  if (itemType === 2 || itemType === 5) return null;

  return (
    <section className="space-y-3 pt-2 border-t border-slate-800">
      <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">{sectionHeader}</h3>

      {/* 0 – Tool */}
      {itemType === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Tool Type">
            <select value={form.toolType ?? 0} onChange={(e) => set("toolType", Number(e.target.value))} className={selectClass}>
              {Object.entries(TOOL_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Tool Level">
            <Input type="number" value={form.toolLevel ?? 1} onChange={(e) => setNum("toolLevel", e.target.value)} min={1} />
          </Field>
          <Field label="Tool Power">
            <Input type="number" value={form.toolPower ?? 1} onChange={(e) => setNum("toolPower", e.target.value)} min={1} />
          </Field>
          <Field label="Material">
            <select value={form.toolMaterial ?? 0} onChange={(e) => set("toolMaterial", Number(e.target.value))} className={selectClass}>
              {Object.entries(MATERIAL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
        </div>
      )}

      {/* 1 – Seed */}
      {itemType === 1 && (
        <Field label="Plant ID">
          <Input value={form.plantId ?? ""} onChange={(e) => set("plantId", e.target.value)} placeholder="e.g. plant_corn" />
        </Field>
      )}

      {/* 3 – Pollen */}
      {itemType === 3 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Source Plant ID">
              <Input value={form.sourcePlantId ?? ""} onChange={(e) => set("sourcePlantId", e.target.value)} placeholder="e.g. plant_corn" />
            </Field>
            <Field label="Pollination Success %">
              <Input type="number" step="0.01" value={form.pollinationSuccessChance ?? 0.5} onChange={(e) => setNum("pollinationSuccessChance", e.target.value)} min={0} max={1} />
            </Field>
            <Field label="Viability Days">
              <Input type="number" value={form.viabilityDays ?? 3} onChange={(e) => setNum("viabilityDays", e.target.value)} min={0} />
            </Field>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Cross Results</Label>
              <Button type="button" size="sm" variant="outline" onClick={addCrossResult}>+ Add</Button>
            </div>
            {(form.crossResults || []).map((cr, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input className="flex-1" placeholder="Target Plant ID" value={cr.targetPlantId} onChange={(e) => setCrossField(idx, "targetPlantId", e.target.value)} />
                <Input className="flex-1" placeholder="Result Plant ID" value={cr.resultPlantId} onChange={(e) => setCrossField(idx, "resultPlantId", e.target.value)} />
                <Button type="button" size="icon" variant="destructive" className="h-8 w-8 shrink-0" onClick={() => removeCrossResult(idx)}>×</Button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 4 – Consumable / 8 – Cooking */}
      {(itemType === 4 || itemType === 8) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Energy Restore">
            <Input type="number" value={form.energyRestore ?? 0} onChange={(e) => setNum("energyRestore", e.target.value)} />
          </Field>
          <Field label="Health Restore">
            <Input type="number" value={form.healthRestore ?? 0} onChange={(e) => setNum("healthRestore", e.target.value)} />
          </Field>
          <Field label="Buffer Duration">
            <Input type="number" step="0.1" value={form.bufferDuration ?? 0} onChange={(e) => setNum("bufferDuration", e.target.value)} min={0} />
          </Field>
        </div>
      )}

      {/* 6 – Weapon */}
      {itemType === 6 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Damage">
            <Input type="number" value={form.damage ?? 10} onChange={(e) => setNum("damage", e.target.value)} min={0} />
          </Field>
          <Field label="Crit Chance %">
            <Input type="number" value={form.critChance ?? 5} onChange={(e) => setNum("critChance", e.target.value)} min={0} max={100} />
          </Field>
          <Field label="Attack Speed">
            <Input type="number" step="0.1" value={form.attackSpeed ?? 1.0} onChange={(e) => setNum("attackSpeed", e.target.value)} min={0} />
          </Field>
          <Field label="Material">
            <select value={form.weaponMaterial ?? 0} onChange={(e) => set("weaponMaterial", Number(e.target.value))} className={selectClass}>
              {Object.entries(MATERIAL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
        </div>
      )}

      {/* 7 – Fish */}
      {itemType === 7 && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Difficulty">
              <Input type="number" value={form.difficulty ?? 1} onChange={(e) => setNum("difficulty", e.target.value)} min={0} />
            </Field>
            <div className="flex items-end pb-1">
              <Toggle label="Legendary" checked={form.isLegendary ?? false} onChange={(c) => setBool("isLegendary", c)} />
            </div>
          </div>
          <Field label="Fishing Seasons">
            <div className="flex gap-4">
              <Toggle label="Sunny (0)" checked={(form.fishingSeasons || []).includes(0)} onChange={() => toggleSeason("fishingSeasons", 0)} />
              <Toggle label="Rainy (1)" checked={(form.fishingSeasons || []).includes(1)} onChange={() => toggleSeason("fishingSeasons", 1)} />
            </div>
          </Field>
        </div>
      )}

      {/* 9 – Forage */}
      {itemType === 9 && (
        <div className="space-y-3">
          <Field label="Foraging Seasons">
            <div className="flex gap-4">
              <Toggle label="Sunny (0)" checked={(form.foragingSeasons || []).includes(0)} onChange={() => toggleSeason("foragingSeasons", 0)} />
              <Toggle label="Rainy (1)" checked={(form.foragingSeasons || []).includes(1)} onChange={() => toggleSeason("foragingSeasons", 1)} />
            </div>
          </Field>
          <Field label="Energy Restore">
            <Input type="number" value={form.energyRestore ?? 5} onChange={(e) => setNum("energyRestore", e.target.value)} />
          </Field>
        </div>
      )}

      {/* 10 – Resource */}
      {itemType === 10 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4">
            <Toggle label="Is Ore" checked={form.isOre ?? false} onChange={(c) => setBool("isOre", c)} />
            <Toggle label="Requires Smelting" checked={form.requiresSmelting ?? false} onChange={(c) => setBool("requiresSmelting", c)} />
          </div>
          <Field label="Smelted Result ID">
            <Input value={form.smeltedResultId ?? ""} onChange={(e) => set("smeltedResultId", e.target.value)} placeholder="Item ID of smelted output" />
          </Field>
        </div>
      )}

      {/* 11 – Gift */}
      {itemType === 11 && (
        <div className="flex flex-wrap gap-4">
          <Toggle label="Universal Like" checked={form.isUniversalLike ?? false} onChange={(c) => setBool("isUniversalLike", c)} />
          <Toggle label="Universal Love" checked={form.isUniversalLove ?? false} onChange={(c) => setBool("isUniversalLove", c)} />
        </div>
      )}

      {/* 12 – Quest */}
      {itemType === 12 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Related Quest ID">
            <Input value={form.relatedQuestID ?? ""} onChange={(e) => set("relatedQuestID", e.target.value)} placeholder="e.g. quest_goblins_01" />
          </Field>
          <div className="flex items-end pb-1">
            <Toggle label="Auto Consume" checked={form.autoConsume ?? false} onChange={(c) => setBool("autoConsume", c)} />
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminItemManager;
