import { useEffect, useState } from "react";
import mediaApi from "../../../api/mediaApi";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await mediaApi.getAllMedia();
        setMedia(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load media.");
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  return (
    <div className="blog-page-bg min-h-screen py-4">
      <div className="max-w-[900px] mx-auto px-4">

        {loading && (
          <p className="text-center text-[#fdf6b3]">Loading media...</p>
        )}

        {error && !loading && (
          <p className="text-center text-red-200">{error}</p>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-8">
            {media.map((item) => {
              const id = item._id || item.id;

              return (
                <article
                  key={id}
                  className="blog-article-frame cursor-pointer"
                  onClick={() => navigate(`/media/${id}`)}
                >
                  {item.file_url && (
                    <img
                      src={item.file_url}
                      className="w-full h-60 object-cover rounded-t-md"
                    />
                  )}

                  <div className="px-4 py-4">

                    {item.createdAt && (
                      <p className="text-xs text-[#5a3b19] mb-2">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    )}

                    <p className="text-sm text-[#5a3b19]">
                      {item.description || "View image"}
                    </p>

                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaPage;