"use client";

import { useState } from "react";
import type { GalleryItem } from "./GalleryPageContent";

function formatStackIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function GalleryStackMedia({ item }: { item: GalleryItem }) {
  const stack = item.imageStack ?? [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = stack[selectedIndex] ?? stack[0];

  if (!selectedImage) {
    return null;
  }

  return (
    <div className="gallery-stack" aria-label={`${item.title} image stack`}>
      <div className="gallery-stack__stage">
        <figure className="gallery-stack__hero" key={selectedImage.imageUrl}>
          <img alt={selectedImage.altText} src={selectedImage.imageUrl} />
          <figcaption
            aria-label={`${formatStackIndex(selectedIndex)} ${selectedImage.subject}`}
            className="gallery-stack__caption"
          >
            <span className="gallery-stack__caption-number">{formatStackIndex(selectedIndex)}</span>
            <span>{selectedImage.subject}</span>
          </figcaption>
        </figure>

        <ol className="gallery-stack__rail" aria-label={`${item.title} image thumbnails`}>
          {stack.map((image, index) => {
            const isSelected = index === selectedIndex;

            return (
              <li key={image.imageUrl}>
                <button
                  aria-label={`Show ${image.subject} for ${item.title}`}
                  aria-pressed={isSelected}
                  className="gallery-stack__thumb"
                  data-active={isSelected}
                  onClick={() => setSelectedIndex(index)}
                  type="button"
                >
                  <img alt="" src={image.imageUrl} />
                  <span className="gallery-stack__thumb-label">
                    <span>{formatStackIndex(index)}</span>
                    <span>{image.subject}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <ol className="gallery-stack__subjects" aria-label={`${item.title} photo subjects`}>
        {stack.map((image, index) => {
          const isSelected = index === selectedIndex;

          return (
            <li key={image.imageUrl}>
              <button
                aria-label={`Show ${image.subject} for ${item.title}`}
                aria-current={isSelected ? "true" : undefined}
                className="gallery-stack__subject-button"
                onClick={() => setSelectedIndex(index)}
                type="button"
              >
                <span>{formatStackIndex(index)}</span>
                <span>{image.subject}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
