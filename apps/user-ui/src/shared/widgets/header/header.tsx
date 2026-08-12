'use client';

import React, { useLayoutEffect, useRef } from 'react';
import HeaderBottom from './header-bottom';
import HeaderContent from './HeaderContent';

const Header = () => {
  function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  function useDraggableHeader({ hideDistance = 60 } = {}) {
    const headerRef = useRef<HTMLElement | null>(null);
    const offset = useRef(0); // 0 = fully visible, -headerHeight = fully hidden
    const lastScrollY = useRef(0);
    const headerHeight = useRef(0);
    const ticking = useRef(false);

    useLayoutEffect(() => {
      if (!headerRef.current) return;
      headerHeight.current = headerRef.current.offsetHeight;
      lastScrollY.current = Math.max(window.scrollY, 0);

      // Start hidden if already scrolled down, visible if at top
      offset.current = lastScrollY.current <= 0 ? 0 : -headerHeight.current;
      headerRef.current.style.transform = `translateY(${offset.current}px)`;

      const applyTransform = () => {
        if (headerRef.current) {
          headerRef.current.style.transform = `translateY(${offset.current}px)`;
        }
      };

      const update = () => {
        const currentScrollY = Math.max(window.scrollY, 0);
        const delta = currentScrollY - lastScrollY.current;
        lastScrollY.current = currentScrollY;

        if (currentScrollY <= 0) {
          // Snap fully visible/landed at the very top
          offset.current = 0;
        } else if (delta > 0) {
          // Scrolling down -- push up 1:1, but only after the first
          // hideDistance px of slack (so a small down-nudge near the
          // top doesn't instantly yank it away)
          const pastSlack = Math.max(0, currentScrollY - hideDistance);
          offset.current = clamp(
            offset.current - delta,
            -headerHeight.current,
            0
          );
        } else if (delta < 0) {
          // Scrolling up -- pull down 1:1, immediately, no hesitation
          offset.current = clamp(
            offset.current - delta, // delta is negative, so this adds
            -headerHeight.current,
            0
          );
        }

        applyTransform();
        ticking.current = false;
      };

      const onScroll = () => {
        if (!ticking.current) {
          window.requestAnimationFrame(update);
          ticking.current = true;
        }
      };

      const onResize = () => {
        if (headerRef.current)
          headerHeight.current = headerRef.current.offsetHeight;
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
      };
    }, [hideDistance]);

    return headerRef;
  }

  const headerRef = useDraggableHeader();

  return (
    <>
      {/* HEADER 1 — logo / search / account / cart */}
      {/* IN-FLOW HEADER — lives in normal document flow, scrolls away with the page */}
      <header className="relative z-50 bg-white ">
        <HeaderContent />
      </header>

      {/* FLOATING HEADER — fixed, off-screen by default, slides down on scroll-up */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-white "
        style={{ willChange: 'transform' }}
      >
        <HeaderContent />
      </header>

      {/* HEADER 2 — categories — normal flow, not sticky, no shadow */}
      <div className="">
        <HeaderBottom />
      </div>
    </>
  );
};

export default Header;
