import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import newsApi from "../../../api/newsApi";
import he from "he";
import ImageLightbox from "../../../components/ui/ImageLightbox";

function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await newsApi.getNewsById(id);
        setNews(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  if (loading) return <p className="text-center text-[#fdf6b3]">Loading...</p>;

  if (!news) return <p className="text-center text-red-200">News not found</p>;

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

          {news.thumbnailUrl && (
            <button
              type="button"
              className="block w-full cursor-zoom-in"
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={news.thumbnailUrl}
                className="w-full h-72 object-cover rounded-t-md"
              />
            </button>
          )}

          <div className="px-4 py-4">

            <h1 className="text-2xl font-bold text-[#5a3b19] mb-2">
              {news.title}
            </h1>

            {news.publishDate && (
              <p className="text-xs text-[#5a3b19] mb-4">
                {new Date(news.publishDate).toLocaleDateString()}
              </p>
            )}

            {news.content && (
              <div
                className="prose max-w-none text-[#5a3b19]"
                dangerouslySetInnerHTML={{
                  __html: he.decode(news.content),
                }}
              />
            )}
          </div>
        </article>
      </div>

      {isLightboxOpen && news?.thumbnailUrl && (
        <ImageLightbox
          src={news.thumbnailUrl}
          alt={news.title || "News image"}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
}

export default NewsDetailPage;