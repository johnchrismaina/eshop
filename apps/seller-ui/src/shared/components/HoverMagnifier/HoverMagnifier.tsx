import { useEffect, useRef, useState } from 'react';
import './hover-magnifier.css';

interface ZoomImageProps {
  src: string;
  alt?: string;
}

function ZoomImage({
  src,
  alt,
  ...rest
}: ZoomImageProps & React.HTMLProps<HTMLImageElement>) {
  const imageBoxRef = useRef<HTMLDivElement | null>(null);
  const imageDetailRef = useRef<HTMLDivElement | null>(null);
  const [overlayPos, setOverlayPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // Walmart dimensions
  const lensWidth = 213.642;
  const lensHeight = 185.256;
  const panelWidth = 819;
  const panelHeight = 709;
  const zoom = panelWidth / lensWidth; // ≈ 3.83

  function handleMouseEnter(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    updateImageDetailVisibility('block');
    updateImageDetailBackgroundImage(src);
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

    // Use overlay center for zoom panel background position
    if (imageDetailRef.current) {
      const new_x = (clampedX / rect.width) * 100;
      const new_y = (clampedY / rect.height) * 100;
      imageDetailRef.current.style.backgroundPosition = `${new_x}% ${new_y}%`;
    }
  }

  function handleMouseLeave() {
    updateImageDetailVisibility('none');
    updateImageDetailBackgroundImage('');
    setOverlayPos(null);
  }

  function updateImageDetailPosition(imageBoxRect: DOMRect) {
    if (imageDetailRef.current) {
      imageDetailRef.current.style.left =
        imageBoxRect.left + imageBoxRect.width + 'px';
      imageDetailRef.current.style.top = imageBoxRect.top - 200 + 'px'; // move panel higher by 50px
    }
  }

  function updateImageDetailVisibility(visibility: 'block' | 'none') {
    if (imageDetailRef.current) {
      imageDetailRef.current.style.display = visibility;
    }
  }

  function updateImageDetailBackgroundImage(src: string) {
    if (imageDetailRef.current) {
      imageDetailRef.current.style.backgroundImage = `url(${src})`;
      imageDetailRef.current.style.backgroundSize = `${zoom * 100}%`; // proportional zoom
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
  }, []);

  return (
    <div className="zoom-image">
      <div className="image-box bg-blue-500" ref={imageBoxRef}>
        <img src={src} alt={alt ?? ''} {...rest} />
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
