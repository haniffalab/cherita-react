import { useState } from "react";

import { Alert } from "react-bootstrap";

export const ImageViewer = ({ src, alt, className = "img-fluid" }) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    console.error("Error loading image from src:", src);
    setError(true);
  };

  if (!error) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        onError={handleError}
      />
    );
  } else {
    return (
      <>
        <Alert variant="danger">Failed to load image</Alert>
      </>
    );
  }
};
