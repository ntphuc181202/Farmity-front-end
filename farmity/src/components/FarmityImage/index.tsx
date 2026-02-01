import { useState, forwardRef } from "react";
import NoImage from "../../assets/images/no-image.png";
import classNames from "classnames";

import styles from "./FarmityImage.module.scss";

type FarmityImageProps = {
  src: string;
  alt: string;
  className: string;
  fallback: string;
};

const FarmityImage = (
  {
    src,
    alt,
    className,
    fallback: customFallback = NoImage,
    ...props
  }: FarmityImageProps,
  ref: React.LegacyRef<HTMLImageElement>,
) => {
  const [fallback, setFallBack] = useState("");

  const handleError = () => {
    setFallBack(customFallback);
  };

  return (
    <img
      className={classNames(styles.wrapper, className)}
      ref={ref}
      src={fallback || src}
      alt={alt}
      {...props}
      onError={handleError}
    />
  );
};

export default forwardRef(FarmityImage);
