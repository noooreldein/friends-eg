(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const mq = window.matchMedia("(max-width: 600px)");
  const compactAt = 140;
  const expandAt = 60;
  const minDelta = 6;
  let lastY = window.scrollY;
  let isCompact = false;
  let ticking = false;

  const setCompact = (value) => {
    if (isCompact === value) return;
    isCompact = value;
    header.classList.toggle("is-compact", value);
  };

  const updateHeader = () => {
    const y = window.scrollY;
    const delta = y - lastY;

    if (!mq.matches) {
      setCompact(false);
      lastY = y;
      ticking = false;
      return;
    }

    if (!isCompact && y > compactAt && delta > minDelta) {
      setCompact(true);
    } else if (isCompact && y < expandAt) {
      setCompact(false);
    }

    lastY = y;
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateHeader);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateHeader);
  updateHeader();
})();
