import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import mediaApi from "../../../api/mediaApi";

function MediaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await mediaApi.getMediaById(id);
        setMedia(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [id]);

  if (loading) return <p className="text-center text-[#fdf6b3]">Loading...</p>;

  if (!media) return <p className="text-center text-red-200">Media not found</p>;

  return (
    <div className="blog-page-bg min-h-screen py-4">
      <div className="max-w-[900px] mx-auto px-4">

        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-[#fdf6b3]"
        >
          ← Back
        </button>

        <article className="blog-article-frame">

          {media.file_url && (
            <img
              src={media.file_url}
              className="w-full h-72 object-cover rounded-t-md"
            />
          )}

          <div className="px-4 py-4">

            {media.createdAt && (
              <p className="text-xs text-[#5a3b19] mb-4">
                {new Date(media.createdAt).toLocaleDateString()}
              </p>
            )}

            {media.description && (
              <p className="text-[#5a3b19] leading-relaxed">
                {media.description}
              </p>
            )}

          </div>
        </article>

      </div>
    </div>
  );
}

export default MediaDetailPage;