import { useEffect, useState, useRef, FormEvent } from "react";
import Swal from "sweetalert2";
import recipeApi from "../../api/recipeApi";
import itemApi from "../../api/itemApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

/* ───────── constants ───────── */

const RECIPE_TYPE_LABELS: Record<number, string> = {
  0: "Default",
};

const CATEGORY_LABELS: Record<number, string> = {
  0: "General",
  1: "Tool",
  2: "Food",
  3: "Materials",
  4: "Furniture",
  5: "Equipment",
};

/* ───────── types ───────── */

interface Ingredient {
  itemId: string;
  quantity: number;
}

interface RecipeDoc {
  _id?: string;
  recipeID: string;
  recipeName: string;
  description: string;
  recipeType: number;
  category: number;
  resultItemId: string;
  resultQuantity: number;
  resultQuality: number;
  ingredients: Ingredient[];
  isUnlockedByDefault: boolean;
}

interface CatalogItem {
  itemID: string;
  itemName: string;
  iconUrl?: string;
}

const EMPTY: RecipeDoc = {
  recipeID: "",
  recipeName: "",
  description: "",
  recipeType: 0,
  category: 0,
  resultItemId: "",
  resultQuantity: 1,
  resultQuality: 0,
  ingredients: [],
  isUnlockedByDefault: false,
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

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
      {/* Trigger */}
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

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[60] mt-1 w-full max-h-60 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-slate-800">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items…"
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          {/* Options */}
          <div className="flex-1 overflow-y-auto">
            {/* Clear option */}
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 transition-colors"
            >
              — None —
            </button>
            {filtered.length === 0 && (
              <p className="text-slate-500 text-xs text-center py-3">No items match.</p>
            )}
            {filtered.map((item) => (
              <button
                key={item.itemID}
                type="button"
                onClick={() => { onChange(item.itemID); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-800 transition-colors ${item.itemID === value ? "bg-emerald-500/10 text-emerald-300" : "text-slate-50"}`}
              >
                {item.iconUrl ? (
                  <img src={item.iconUrl} alt="" className="w-6 h-6 rounded object-cover shrink-0 bg-slate-800 pixel-art" />
                ) : (
                  <div className="w-6 h-6 rounded bg-slate-800 shrink-0" />
                )}
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

function AdminRecipeManager() {
  const [recipes, setRecipes] = useState<RecipeDoc[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipeID, setEditingRecipeID] = useState<string | null>(null);
  const [form, setForm] = useState<RecipeDoc>({ ...EMPTY });
  const [loading, setLoading] = useState(false);

  /* ── build a quick lookup for item icons in the list view ── */
  const itemMap = new Map(catalogItems.map((i) => [i.itemID, i]));

  /* ── fetch ── */
  const fetchRecipes = async () => {
    try {
      const res = await recipeApi.getAllRecipes();
      setRecipes(res.data || []);
    } catch (err) {
      console.error("Failed to load recipes:", err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await itemApi.getAllItems();
      const data: CatalogItem[] = (res.data || []).map((i: any) => ({
        itemID: i.itemID,
        itemName: i.itemName,
        iconUrl: i.iconUrl,
      }));
      setCatalogItems(data);
    } catch (err) {
      console.error("Failed to load items catalog:", err);
    }
  };

  useEffect(() => {
    fetchRecipes();
    fetchItems();
  }, []);

  /* ── helpers ── */
  const resetForm = () => {
    setForm({ ...EMPTY, ingredients: [] });
    setEditingRecipeID(null);
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (recipe: RecipeDoc) => {
    setForm({ ...recipe, ingredients: recipe.ingredients?.map((i) => ({ ...i })) || [] });
    setEditingRecipeID(recipe.recipeID);
    setIsModalOpen(true);
  };

  /* ── field updaters ── */
  const set = <K extends keyof RecipeDoc>(key: K, value: RecipeDoc[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setNum = (key: keyof RecipeDoc, raw: string) =>
    set(key, raw === "" ? ("" as never) : (Number(raw) as never));

  /* ── ingredients helpers ── */
  const addIngredient = () => {
    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { itemId: "", quantity: 1 }],
    }));
  };

  const removeIngredient = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== idx),
    }));
  };

  const setIngredientItemId = (idx: number, val: string) => {
    setForm((prev) => {
      const arr = [...prev.ingredients];
      arr[idx] = { ...arr[idx], itemId: val };
      return { ...prev, ingredients: arr };
    });
  };

  const setIngredientQty = (idx: number, val: string) => {
    setForm((prev) => {
      const arr = [...prev.ingredients];
      arr[idx] = { ...arr[idx], quantity: Number(val) || 1 };
      return { ...prev, ingredients: arr };
    });
  };

  /* ── submit ── */
  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!form.recipeID.trim() || !form.recipeName.trim()) {
      Swal.fire({ icon: "warning", title: "Recipe ID and Name are required", background: "#020617", color: "#e5e7eb" });
      return;
    }
    if (!form.resultItemId.trim()) {
      Swal.fire({ icon: "warning", title: "Result Item is required", background: "#020617", color: "#e5e7eb" });
      return;
    }
    if (form.ingredients.length === 0 || form.ingredients.some((i) => !i.itemId.trim())) {
      Swal.fire({ icon: "warning", title: "All ingredients must have an item selected", background: "#020617", color: "#e5e7eb" });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        recipeID: form.recipeID.trim(),
        recipeName: form.recipeName.trim(),
        description: form.description.trim(),
        recipeType: Number(form.recipeType),
        category: Number(form.category),
        resultItemId: form.resultItemId.trim(),
        resultQuantity: Number(form.resultQuantity),
        resultQuality: Number(form.resultQuality),
        ingredients: form.ingredients.map((i) => ({
          itemId: i.itemId.trim(),
          quantity: Number(i.quantity),
        })),
        isUnlockedByDefault: form.isUnlockedByDefault,
      };

      if (editingRecipeID) {
        const { recipeID: _rid, ...updatePayload } = payload;
        await recipeApi.updateRecipe(editingRecipeID, updatePayload);
        Swal.fire({ toast: true, icon: "success", title: "Recipe updated", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      } else {
        await recipeApi.createRecipe(payload);
        Swal.fire({ toast: true, icon: "success", title: "Recipe created", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      }

      resetForm();
      setIsModalOpen(false);
      await fetchRecipes();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to save recipe.";
      Swal.fire({ icon: "error", title: "Error", text: msg, background: "#020617", color: "#e5e7eb" });
    } finally {
      setLoading(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async (recipeID: string) => {
    const result = await Swal.fire({
      title: "Delete this recipe?",
      text: `Recipe "${recipeID}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it",
      background: "#020617",
      color: "#e5e7eb",
    });
    if (!result.isConfirmed) return;

    try {
      await recipeApi.deleteRecipe(recipeID);
      setRecipes((prev) => prev.filter((r) => r.recipeID !== recipeID));
      Swal.fire({ toast: true, icon: "success", title: "Recipe deleted", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to delete recipe.", background: "#020617", color: "#e5e7eb" });
    }
  };

  /* ── filter + paginate ── */
  const filtered = recipes.filter((r) => {
    const t = search.toLowerCase();
    return (
      r.recipeID.toLowerCase().includes(t) ||
      r.recipeName.toLowerCase().includes(t) ||
      (r.description || "").toLowerCase().includes(t)
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
          <h1 className="text-2xl font-semibold text-white">Crafting Recipes</h1>
          <p className="text-sm text-slate-400 mt-0.5">{recipes.length} recipes total</p>
        </div>
        <Button onClick={openCreate}>+ New Recipe</Button>
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
            <p className="text-slate-500 text-sm text-center py-8">No recipes found.</p>
          )}
          {visible.map((recipe) => {
            const resultItem = itemMap.get(recipe.resultItemId);
            return (
              <div key={recipe.recipeID} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-800/40 transition-colors">
                {/* Result item icon instead of category badge */}
                {resultItem?.iconUrl ? (
                  <img src={resultItem.iconUrl} alt={resultItem.itemName} className="w-10 h-10 rounded-md object-cover bg-slate-800 shrink-0 pixel-art" />
                ) : (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-violet-500/10 text-violet-400 text-xs font-bold shrink-0">
                    {CATEGORY_LABELS[recipe.category]?.slice(0, 3).toUpperCase() ?? "GEN"}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{recipe.recipeName}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {recipe.recipeID} · {CATEGORY_LABELS[recipe.category] ?? "General"} · {recipe.ingredients?.length ?? 0} ingredients → {resultItem?.itemName || recipe.resultItemId} ×{recipe.resultQuantity}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={() => openEdit(recipe)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(recipe.recipeID)}>Delete</Button>
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
              <CardTitle>{editingRecipeID ? `Edit — ${editingRecipeID}` : "Create New Recipe"}</CardTitle>
            </CardHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* ─── Identity ─── */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Recipe Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Recipe ID *">
                      <Input value={form.recipeID} onChange={(e) => set("recipeID", e.target.value)} placeholder="e.g. recipe_wooden_plank" disabled={!!editingRecipeID} />
                    </Field>
                    <Field label="Recipe Name *">
                      <Input value={form.recipeName} onChange={(e) => set("recipeName", e.target.value)} placeholder="Display name" />
                    </Field>
                  </div>

                  <Field label="Description">
                    <textarea
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Recipe description…"
                      rows={2}
                      className="flex w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    />
                  </Field>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Field label="Recipe Type">
                      <select
                        value={form.recipeType}
                        onChange={(e) => set("recipeType", Number(e.target.value))}
                        className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        {Object.entries(RECIPE_TYPE_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v} ({k})</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Category">
                      <select
                        value={form.category}
                        onChange={(e) => set("category", Number(e.target.value))}
                        className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v} ({k})</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={form.isUnlockedByDefault}
                      onChange={(e) => set("isUnlockedByDefault", e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded"
                    />
                    Unlocked by Default
                  </label>
                </section>

                {/* ─── Result ─── */}
                <section className="space-y-3 pt-2 border-t border-slate-800">
                  <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Result</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="Result Item *">
                      <ItemPicker
                        items={catalogItems}
                        value={form.resultItemId}
                        onChange={(id) => set("resultItemId", id)}
                        placeholder="Select result item…"
                      />
                    </Field>
                    <Field label="Result Quantity">
                      <Input type="number" value={form.resultQuantity} onChange={(e) => setNum("resultQuantity", e.target.value)} min={1} />
                    </Field>
                    <Field label="Result Quality">
                      <Input type="number" value={form.resultQuality} onChange={(e) => setNum("resultQuality", e.target.value)} min={0} />
                    </Field>
                  </div>
                </section>

                {/* ─── Ingredients ─── */}
                <section className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Ingredients</h3>
                    <Button type="button" size="sm" variant="outline" onClick={addIngredient}>+ Add Ingredient</Button>
                  </div>

                  {form.ingredients.length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-4">No ingredients added yet.</p>
                  )}

                  {form.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <ItemPicker
                          items={catalogItems}
                          value={ing.itemId}
                          onChange={(id) => setIngredientItemId(idx, id)}
                          placeholder="Select ingredient…"
                        />
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={ing.quantity}
                          onChange={(e) => setIngredientQty(idx, e.target.value)}
                          min={1}
                        />
                      </div>
                      <Button type="button" size="icon" variant="destructive" className="h-8 w-8 shrink-0" onClick={() => removeIngredient(idx)}>×</Button>
                    </div>
                  ))}
                </section>
              </form>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-800 p-4 flex justify-end gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving…" : editingRecipeID ? "Save Changes" : "Create Recipe"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-component ─── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export default AdminRecipeManager;
