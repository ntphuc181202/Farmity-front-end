import { useCallback, useEffect, useState } from "react";
import mediaApi from "../../../api/mediaApi";
import { useNavigate } from "react-router-dom";
import useAutoRefresh from "../../../hooks/useAutoRefresh";

interface MediaItem {
  _id?: string;
  id?: string;
  file_url?: string;
  description?: string;
  createdAt?: string;
}

function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const base = import.meta.env.BASE_URL || "/";

  const fetchMedia = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    }

    try {
      const res = await mediaApi.getAllMedia();
      setMedia(res.data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load media.");
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchMedia(true);
  }, [fetchMedia]);

  useAutoRefresh(fetchMedia, 12000);

  return (
    <div className="blog-page-bg min-h-screen py-4">
      <div className="max-w-[900px] mx-auto px-4">
        <header className="mb-10 flex flex-col items-center justify-center gap-2">
          <img
            src={`${base}img/media.png`}
            alt="Media artwork"
            className="w-full max-w-[360px] max-h-[180px] h-auto object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
          />
        </header>

        {loading && (
          <p className="text-center text-[#fdf6b3]">Loading media...</p>
        )}

        {error && !loading && (
          <p className="text-center text-red-200">{error}</p>
        )}

        {!loading && !error && (
          <div className="blog-article-frame p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {media.map((item) => {
                const id = item._id || item.id;
                if (!id) return null;

                return (
                  <button
                    key={id}
                    type="button"
                    className="overflow-hidden rounded-xl border-2 border-[#7f925f] bg-[#fffdf4] text-left shadow-[0_8px_20px_rgba(28,44,20,0.2)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(28,44,20,0.28)] cursor-pointer"
                    onClick={() => navigate(`/media/${id}`)}
                  >
                    <div className="relative aspect-[4/3] w-full bg-[#e5e7eb]">
                      {item.file_url ? (
                        <img
                          src={item.file_url}
                          alt={item.description || "Media image"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-[#6b7280]">
                          No image
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>

                    <div className="px-3 py-3 bg-[#fffaea] border-t border-[#d9cfad]">
                      <p className="text-sm font-medium text-[#2f2515] line-clamp-2">
                        {item.description || "View image"}
                      </p>
                      {item.createdAt && (
                        <p className="mt-1 text-xs text-[#4a5d35]">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}

              {media.length === 0 && (
                <p className="col-span-full py-8 text-center text-[#5a4a2f] text-sm">
                  No media uploaded yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaPage;