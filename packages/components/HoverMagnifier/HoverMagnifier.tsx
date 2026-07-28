import { useEffect, useRef, useState } from 'react';
import './hover-magnifier.css';

interface ZoomImageProps {
  src: string;
  alt?: string;
  aspect: 'square' | 'portrait';
}

function ZoomImage({
  src,
  alt = 'Product image',
  aspect,
  ...rest
}: ZoomImageProps & React.HTMLProps<HTMLImageElement>) {
  const imageBoxRef = useRef<HTMLDivElement | null>(null);
  const imageDetailRef = useRef<HTMLDivElement | null>(null);
  const [overlayPos, setOverlayPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // Dimensions for 3× zoom
  const lensWidth = 234;
  const lensHeight = 186;
  const panelWidth = 702;
  const panelHeight = 558;
  const zoom = 3;

  function handleMouseEnter(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    updateImageDetailVisibility('block');
    updateImageDetailBackgroundImage(src, rect);
    updateImageDetailPosition(rect);
  }

  function handleMouseMove(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.offsetX;
    const y = event.offsetY;

    // Clamp overlay inside image
    const clampedX = Math.max(
      lensWidth / 2,
      Math.min(x, rect.width - lensWidth / 2)
    );
    const clampedY = Math.max(
      lensHeight / 2,
      Math.min(y, rect.height - lensHeight / 2)
    );

    setOverlayPos({ x: clampedX, y: clampedY });

    // Overlay top-left corner
    const overlayLeft = clampedX - lensWidth / 2;
    const overlayTop = clampedY - lensHeight / 2;

    if (imageDetailRef.current) {
      // Background offset in pixels (not percentages)
      const bgX = -(overlayLeft * zoom);
      const bgY = -(overlayTop * zoom);
      imageDetailRef.current.style.backgroundPosition = `${bgX}px ${bgY}px`;
    }
  }

  function handleMouseLeave() {
    updateImageDetailVisibility('none');
    updateImageDetailBackgroundImage('', null);
    setOverlayPos(null);
  }

  function updateImageDetailPosition(imageBoxRect: DOMRect) {
    if (imageDetailRef.current) {
      imageDetailRef.current.style.left =
        imageBoxRect.left + imageBoxRect.width + 'px';
      imageDetailRef.current.style.top = imageBoxRect.top - 50 + 'px'; // adjust vertical offset
    }
  }

  function updateImageDetailVisibility(visibility: 'block' | 'none') {
    if (imageDetailRef.current) {
      imageDetailRef.current.style.display = visibility;
    }
  }

  function updateImageDetailBackgroundImage(src: string, rect: DOMRect | null) {
    if (imageDetailRef.current && src) {
      imageDetailRef.current.style.backgroundImage = `url(${src})`;
      if (rect) {
        // Scale background to actual image size × zoom
        imageDetailRef.current.style.backgroundSize = `${rect.width * zoom}px ${
          rect.height * zoom
        }px`;
      }
    }
  }

  useEffect(() => {
    const box = imageBoxRef.current;
    if (!box) return;

    box.addEventListener('mouseenter', handleMouseEnter);
    box.addEventListener('mousemove', handleMouseMove);
    box.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      box.removeEventListener('mouseenter', handleMouseEnter);
      box.removeEventListener('mousemove', handleMouseMove);
      box.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [src]);

  return (
    <div className="zoom-image">
      <div
        className={`relative overflow-hidden ${
          aspect === 'square' ? 'w-[500px] h-[500px]' : 'w-[503px] h-[670px]'
        }`}
        ref={imageBoxRef}
      >
        <img
          src={src}
          alt={alt}
          {...rest}
          className="w-full h-full object-cover rounded-none"
        />
        {overlayPos && (
          <div
            className="lens-overlay"
            style={{
              width: lensWidth,
              height: lensHeight,
              left: overlayPos.x - lensWidth / 2,
              top: overlayPos.y - lensHeight / 2,
            }}
          />
        )}
      </div>
      <div
        className="image-detail"
        ref={imageDetailRef}
        style={{ width: panelWidth, height: panelHeight }}
      ></div>
    </div>
  );
}

export default ZoomImage;
