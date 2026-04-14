import { useEffect } from "react";

interface ImageLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-4 top-4 rounded-md border border-white/40 bg-black/40 px-3 py-1 text-sm font-semibold text-white hover:bg-black/70"
        onClick={onClose}
      >
        Close
      </button>

      <img
        src={src}
        alt={alt || "Preview image"}
        className="max-h-[90vh] max-w-[92vw] rounded-lg object-contain shadow-[0_20px_55px_rgba(0,0,0,0.6)]"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

export default ImageLightbox;