import { useEffect, useState } from "react";
import newsApi from "../../../api/newsApi";
import { useNavigate } from "react-router-dom";
import he from "he";

interface NewsItem {
  _id?: string;
  id?: string;
  title?: string;
  content?: string;
  thumbnailUrl?: string;
  publishDate?: string;
}

function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await newsApi.getAllNews();
        setNews(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load news.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="blog-page-bg min-h-screen py-4">
      <div className="max-w-[900px] mx-auto px-4">

        {loading && <p className="text-center text-[#fdf6b3]">Loading news...</p>}

        {error && !loading && (
          <p className="text-center text-red-200">{error}</p>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-8">
            {news.map((item) => {
              const id = item._id || item.id;

              return (
                <article
                  key={id}
                  className="blog-article-frame cursor-pointer"
                  onClick={() => navigate(`/news/${id}`)}
                >
                  {item.thumbnailUrl && (
                    <img
                      src={item.thumbnailUrl}
                      className="w-full h-60 object-cover rounded-t-md"
                    />
                  )}

                  <div className="px-4 py-4">

                    <h2 className="text-lg font-bold text-[#5a3b19] mb-2">
                      {item.title}
                    </h2>

                    {item.publishDate && (
                      <p className="text-xs text-[#5a3b19] mb-2">
                        {new Date(item.publishDate).toLocaleDateString()}
                      </p>
                    )}

                    {item.content && (
                      <div
                        className="prose prose-sm max-w-none text-[#5a3b19]"
                        dangerouslySetInnerHTML={{
                          __html: he.decode(item.content.slice(0, 250)) + "...",
                        }}
                      />
                    )}
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

export default NewsPage;