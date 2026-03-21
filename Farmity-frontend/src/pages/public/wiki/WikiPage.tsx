import { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import itemApi from "../../../api/itemApi";
import plantApi from "../../../api/plantApi";
import recipeApi from "../../../api/recipeApi";
import materialApi from "../../../api/materialApi";
import resourceConfigApi from "../../../api/resourceConfigApi";

interface Item {
  _id: string;
  itemID: string;
  itemName: string;
  iconUrl?: string;
  itemType: number;
  itemCategory: number;
}

interface GrowthStage {
  stageNum: number;
  growthDurationMinutes: number;
  stageIconUrl?: string;
}

interface Plant {
  _id: string;
  plantId: string;
  plantName: string;
  growthStages: GrowthStage[];
  isHybrid?: boolean;
  hybridFlowerIconUrl?: string;
  hybridMatureIconUrl?: string;
}

interface Ingredient {
  itemId: string;
  quantity: number;
}

interface Recipe {
  _id: string;
  recipeID: string;
  recipeName: string;
  description?: string;
  category: number;
  resultItemId: string;
  resultQuantity: number;
  ingredients: Ingredient[];
}

interface Material {
  _id: string;
  materialId: string;
  materialName: string;
  spriteSheetUrl?: string;
}

interface DropEntry {
  itemId: string;
  minAmount: number;
  maxAmount: number;
  dropChance: number;
}

interface ResourceConfig {
  _id: string;
  resourceId: string;
  name: string;
  maxHp: number;
  resourceType?: string;
  requiredToolType?: string;
  minToolPower?: number;
  spriteUrl?: string;
  dropTable: DropEntry[];
}

const ITEM_TYPE_LABELS: Record<number, string> = {
  0: "Tools",
  1: "Seeds",
  2: "Crops",
  3: "Pollen",
  4: "Consumables",
  5: "Materials",
  6: "Weapons",
  7: "Fish",
  8: "Cooking",
  9: "Forage",
  10: "Resources",
  11: "Gifts",
  12: "Quest Items",
  13: "Structures",
  14: "Fertilizers",
};

const STATIC_CATEGORIES = [
  {
    title: "Basics",
    items: [
      "Getting Started",
      "The Player",
      "Controls",
      "Energy",
      "Health",
      "Skills",
      "Day Cycle",
      "Inventory",
      "Farm Maps",
    ],
  },
  {
    title: "Environment",
    items: [
      "Weather",
      "Seasons",
      "Spring",
      "Summer",
      "Fall",
      "Winter",
      "Festivals",
      "Monsters",
      "Television",
    ],
  },
  {
    title: "Gameplay",
    items: [
      "Villagers",
      "Friendship",
      "Marriage",
      "Children",
      "Quests",
      "Bundles",
      "Achievements",
      "Multiplayer",
      "Modding",
    ],
  },
];

const STATIC_PLACES = [
  "Pelican Town",
  "Cindersap Forest",
  "The Desert",
  "Ginger Island",
  "The Mines",
];

function WikiPage() {
  const base = import.meta.env.BASE_URL ?? "/";

  const [items, setItems] = useState<Item[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  // const [materials, setMaterials] = useState<Material[]>([]);
  const [resources, setResources] = useState<ResourceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [itemsRes, plantsRes, recipesRes, resourcesRes] =
          await Promise.all([
            itemApi.getAllItems(),
            plantApi.getAllPlants(),
            recipeApi.getAllRecipes(),
            resourceConfigApi.getCatalog(),
            // materialApi.getAllMaterials(),
          ]);
        if (!mounted) return;
        setItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
        setPlants(Array.isArray(plantsRes.data) ? plantsRes.data : []);
        setRecipes(Array.isArray(recipesRes.data) ? recipesRes.data : []);
        const rawRes =
          resourcesRes?.data?.resources ?? resourcesRes?.data ?? [];
        setResources(Array.isArray(rawRes) ? rawRes : []);
        // setMaterials(Array.isArray(materialsRes.data) ? materialsRes.data : []);
      } catch (err) {
        console.error("Failed to load wiki data:", err);
        if (mounted) setError("Failed to load wiki data.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  // Group items by itemType
  const groupedItems = useMemo(() => {
    const groups: Record<number, Item[]> = {};
    items.forEach((item) => {
      (groups[item.itemType] ||= []).push(item);
    });
    return Object.entries(groups)
      .map(([type, list]) => ({
        title: ITEM_TYPE_LABELS[Number(type)] || `Type ${type}`,
        items: list,
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [items]);

  // Group recipes by category
  const RECIPE_CAT_LABELS: Record<number, string> = {
    0: "General",
    1: "Tool",
    2: "Food",
    3: "Materials",
    4: "Furniture",
    5: "Equipment",
  };
  const groupedRecipes = useMemo(() => {
    const groups: Record<number, Recipe[]> = {};
    recipes.forEach((r) => {
      (groups[r.category] ||= []).push(r);
    });
    return Object.entries(groups).map(([cat, list]) => ({
      title: RECIPE_CAT_LABELS[Number(cat)] || `Category ${cat}`,
      recipes: list,
    }));
  }, [recipes]);

  return (
    <div className="blog-page-bg min-h-screen py-4">
      <div className="max-w-[900px] mx-auto px-4">
        {/* HEADER */}
        <header className="mb-10 flex flex-col items-center">
          <img
            src={`${base}img/logo.png`}
            alt="Game Logo"
            className="h-24 sm:h-32 md:h-[200px] mb-6"
          />
        </header>

        <article className="blog-article-frame">
          {/* ABOUT */}
          <div className="container mt-3">
            <div className="row">
              <div className="col-md-12">
                <div className="card border-success">
                  <div className="card-header bg-success text-white fw-bold text-center">
                    About
                  </div>
                  <div className="card-body d-flex">
                    {/* <img
                      src="/mediawiki/images/a/af/Horse_rider.png"
                      alt="horse"
                      style={{ width: 80, height: "auto", marginRight: 15 }}
                    /> */}
                    <p className="mb-0">
                      "Farm game: The Peaceful Farmstead" is a magical farming
                      simulation set in a mysterious, enchanted world, where
                      players are transported from their stressful modern lives
                      to inherit the garden of a legendary wizard. The game
                      offers a peaceful escape from everyday work pressures,
                      inviting players into a relaxing adventure in a
                      fantastical realm filled with ancient magic and hidden
                      mysteries. Players can choose their own path—becoming a
                      master of mystical agriculture, a skilled gatherer of rare
                      resources, or a brave explorer uncovering the wizard's
                      hidden legacy while restoring the garden's ancient power
                      and discovering the secrets of this enchanted land.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STATIC CATEGORIES (Basics, Environment, Gameplay) */}
          {/* <div className="container-fluid mt-3">
            <div className="row">
              {STATIC_CATEGORIES.map((col, index) => (
                <div className="col-md-4 mb-3" key={index}>
                  <div className="card border-success h-100">
                    <div className="card-header bg-success text-white fw-bold text-center">
                      {col.title}
                    </div>
                    <div className="card-body">
                      <ul className="list-unstyled mb-0">
                        {col.items.map((item, i) => (
                          <li
                            key={i}
                            className="d-flex align-items-center mb-2"
                          >
                            <a href="#" className="text-decoration-none">
                              {item}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* LOADING / ERROR */}
          {loading && (
            <div className="container-fluid mt-3 text-center">
              <p>Loading game data...</p>
            </div>
          )}
          {error && (
            <div className="container-fluid mt-3 text-center">
              <p className="text-danger">{error}</p>
            </div>
          )}

          {/* DYNAMIC ITEMS - grouped by itemType */}
          {!loading && !error && groupedItems.length > 0 && (
            <div className="container-fluid mt-3">
              <div className="row">
                {groupedItems.map((group) => (
                  <div className="col-md-4 mb-3" key={group.title}>
                    <div className="card border-success h-100">
                      <div className="card-header bg-success text-white fw-bold text-center">
                        {group.title} ({group.items.length})
                      </div>
                      <div className="card-body">
                        <ul className="list-unstyled mb-0">
                          {group.items.map((item) => (
                            <li
                              key={item._id}
                              className="d-flex align-items-center mb-2"
                            >
                              {item.iconUrl && (
                                <img
                                  src={item.iconUrl}
                                  alt={item.itemName}
                                  style={{ width: 24, marginRight: 10 }}
                                />
                              )}
                              <span>{item.itemName}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC PLANTS */}
          {!loading && !error && plants.length > 0 && (
            <div className="container-fluid mt-3">
              <div className="card border-success overflow-hidden">
                <div className="card-header bg-success text-white fw-bold text-center">
                  Plants ({plants.length})
                </div>
                <div className="card-body p-0">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "25%" }}>Plant</th>
                        <th>Growth Stages</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plants.map((plant) => (
                        <tr key={plant._id}>
                          <td className="align-middle" style={{ minWidth: 140 }}>
                            <span className="fw-bold">
                              {plant.plantName}
                            </span>
                            {plant.isHybrid && (
                              <span className="badge bg-warning text-dark ms-2">
                                Hybrid
                              </span>
                            )}
                          </td>
                          <td className="align-middle">
                            <div className="d-flex align-items-center flex-wrap gap-4 gap-sm-5">
                              {plant.growthStages
                                ?.sort((a, b) => a.stageNum - b.stageNum)
                                .map((stage) => (
                                  <div
                                    key={stage.stageNum}
                                    className="text-center"
                                    title={`Stage ${stage.stageNum} (${stage.growthDurationMinutes} min)`}
                                  >
                                    {stage.stageIconUrl ? (
                                      <img
                                        src={stage.stageIconUrl}
                                        alt={`Stage ${stage.stageNum}`}
                                        style={{ width: 32, height: 32 }}
                                      />
                                    ) : (
                                      <div
                                        className="bg-light border rounded"
                                        style={{ width: 32, height: 32 }}
                                      />
                                    )}
                                    <div style={{ fontSize: 10 }}>
                                      S{stage.stageNum}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC RECIPES */}
          {!loading && !error && recipes.length > 0 && (
            <div className="container-fluid mt-3">
              {groupedRecipes.map((group) => (
                <div className="card border-success overflow-hidden mb-3" key={group.title}>
                  <div className="card-header bg-success text-white fw-bold text-center">
                    Recipes: {group.title} ({group.recipes.length})
                  </div>
                  <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "25%" }}>Recipe</th>
                          <th style={{ width: "45%" }}>Ingredients</th>
                          <th style={{ width: "30%" }}>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.recipes.map((recipe) => {
                          const resultItem = items.find(
                            (i) => i.itemID === recipe.resultItemId,
                          );
                          return (
                            <tr key={recipe._id}>
                              {/* Recipe name */}
                              <td>
                                <span className="fw-bold">
                                  {recipe.recipeName}
                                </span>
                                {recipe.description && (
                                  <div>
                                    <small className="text-muted">
                                      {recipe.description}
                                    </small>
                                  </div>
                                )}
                              </td>

                              {/* Ingredients - horizontal */}
                              <td className="align-middle">
                                <div className="d-flex flex-wrap align-items-center gap-3">
                                  {recipe.ingredients.map((ing, idx) => {
                                    const ingItem = items.find(
                                      (i) => i.itemID === ing.itemId,
                                    );
                                    return (
                                      <div
                                        key={idx}
                                        className="d-flex align-items-center"
                                      >
                                        {ingItem?.iconUrl && (
                                          <img
                                            src={ingItem.iconUrl}
                                            alt={ingItem.itemName}
                                            style={{
                                              width: 24,
                                              height: 24,
                                              marginRight: 4,
                                            }}
                                          />
                                        )}
                                        <small>
                                          {ingItem?.itemName || ing.itemId} x
                                          {ing.quantity}
                                        </small>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>

                              {/* Result */}
                              <td className="align-middle">
                                <div className="d-flex align-items-center">
                                  {resultItem?.iconUrl && (
                                    <img
                                      src={resultItem.iconUrl}
                                      alt={resultItem.itemName}
                                      style={{
                                        width: 24,
                                        height: 24,
                                        marginRight: 6,
                                      }}
                                    />
                                  )}
                                  <small className="fw-bold">
                                    {resultItem?.itemName ||
                                      recipe.resultItemId}{" "}
                                    x{recipe.resultQuantity}
                                  </small>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DYNAMIC RESOURCES */}
          {!loading && !error && resources.length > 0 && (
            <div className="container-fluid mt-3 mb-3">
              <div className="card border-success overflow-hidden">
                <div className="card-header bg-success text-white fw-bold text-center">
                  Resources ({resources.length})
                </div>
                <div className="card-body p-0">
                  {/* Table for screens >= 425px */}
                  <div className="d-none d-sm-block">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "20%" }}>Resource</th>
                          <th style={{ width: "15%" }}>Type</th>
                          <th style={{ width: "10%" }}>HP</th>
                          <th style={{ width: "15%" }}>Tool</th>
                          <th style={{ width: "40%" }}>Drops</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resources.map((res) => (
                          <tr key={res._id}>
                            <td className="align-middle">
                              <div className="d-flex align-items-center">
                                {res.spriteUrl && (
                                  <img
                                    src={res.spriteUrl}
                                    alt={res.name}
                                    style={{
                                      width: 32,
                                      height: 32,
                                      marginRight: 8,
                                    }}
                                  />
                                )}
                                <span className="fw-bold">{res.name}</span>
                              </div>
                            </td>
                            <td className="align-middle">
                              <small>{res.resourceType || "—"}</small>
                            </td>
                            <td className="align-middle">
                              <small>{res.maxHp}</small>
                            </td>
                            <td className="align-middle">
                              <small>
                                {res.requiredToolType || "Any"}
                                {res.minToolPower && res.minToolPower > 1
                                  ? ` (Lv${res.minToolPower}+)`
                                  : ""}
                              </small>
                            </td>
                            <td className="align-middle">
                              <div className="d-flex flex-wrap align-items-center gap-3">
                                {res.dropTable.map((drop, idx) => {
                                  const dropItem = items.find(
                                    (i) => i.itemID === drop.itemId,
                                  );
                                  return (
                                    <div
                                      key={idx}
                                      className="d-flex align-items-center"
                                    >
                                      {dropItem?.iconUrl && (
                                        <img
                                          src={dropItem.iconUrl}
                                          alt={dropItem.itemName}
                                          style={{
                                            width: 24,
                                            height: 24,
                                            marginRight: 4,
                                          }}
                                        />
                                      )}
                                      <small>
                                        {dropItem?.itemName || drop.itemId}{" "}
                                        {drop.minAmount === drop.maxAmount
                                          ? `x${drop.minAmount}`
                                          : `x${drop.minAmount}-${drop.maxAmount}`}
                                        <span className="text-muted ms-1">
                                          ({Math.round(drop.dropChance * 100)}%)
                                        </span>
                                      </small>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Card list for screens < 425px */}
                  <div className="d-block d-sm-none">
                    {resources.map((res) => (
                      <div key={res._id} className="p-3 border-bottom">
                        <div className="d-flex align-items-center mb-2">
                          {res.spriteUrl && (
                            <img
                              src={res.spriteUrl}
                              alt={res.name}
                              style={{ width: 32, height: 32, marginRight: 8 }}
                            />
                          )}
                          <span className="fw-bold">{res.name}</span>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">
                            {res.resourceType || "—"} · HP {res.maxHp} ·{" "}
                            {res.requiredToolType || "Any"}
                            {res.minToolPower && res.minToolPower > 1
                              ? ` (Lv${res.minToolPower}+)`
                              : ""}
                          </small>
                        </div>
                        <div>
                          <small className="text-secondary">Drops:</small>
                          <div className="d-flex flex-wrap align-items-center gap-2 mt-1">
                            {res.dropTable.map((drop, idx) => {
                              const dropItem = items.find(
                                (i) => i.itemID === drop.itemId,
                              );
                              return (
                                <div
                                  key={idx}
                                  className="d-flex align-items-center"
                                >
                                  {dropItem?.iconUrl && (
                                    <img
                                      src={dropItem.iconUrl}
                                      alt={dropItem.itemName}
                                      style={{
                                        width: 24,
                                        height: 24,
                                        marginRight: 4,
                                      }}
                                    />
                                  )}
                                  <small>
                                    {dropItem?.itemName || drop.itemId}{" "}
                                    {drop.minAmount === drop.maxAmount
                                      ? `x${drop.minAmount}`
                                      : `x${drop.minAmount}-${drop.maxAmount}`}
                                    <span className="text-muted ms-1">
                                      ({Math.round(drop.dropChance * 100)}%)
                                    </span>
                                  </small>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC MATERIALS */}
          {/* {!loading && !error && materials.length > 0 && (
            <div className="container-fluid mt-3">
              <div className="card border-success">
                <div className="card-header bg-success text-white fw-bold text-center">
                  Materials ({materials.length})
                </div>
                <div className="card-body">
                  <div className="row">
                    {materials.map((mat) => (
                      <div className="col-md-3 mb-2" key={mat._id}>
                        <div className="d-flex align-items-center">
                          {mat.spriteSheetUrl && (
                            <img
                              src={mat.spriteSheetUrl}
                              alt={mat.materialName}
                              style={{ width: 24, marginRight: 10 }}
                            />
                          )}
                          <span>{mat.materialName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )} */}

          {/* STATIC PLACES */}
          {/* <div className="container-fluid mt-3 mb-3">
            <div className="card border-success">
              <div className="card-header bg-success text-white fw-bold text-center">
                The Valley Beyond the Valley
              </div>
              <div className="card-body">
                <div className="row">
                  {STATIC_PLACES.map((place, i) => (
                    <div className="col-md-4 mb-2" key={i}>
                      <a href="#" className="text-decoration-none">
                        {place}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div> */}
        </article>
      </div>
    </div>
  );
}

export default WikiPage;
