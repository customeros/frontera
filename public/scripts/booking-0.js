window.bookingForm = (target, calendarId) => {
  const TARGET = target;
  let currentBreakpoint = 'md';
  const container = document.getElementById(TARGET);

  if (!container) {
    console.error('missing container for booking form');

    return;
  }

  const iframe = document.createElement('iframe');

  iframe.id = 'booking-iframe';
  iframe.src = `https://app.customeros.ai/book?calendarId=${calendarId}&mode=embedded`;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.display = 'block';

  container.appendChild(iframe);

  function getBreakpoint(width) {
    if (width >= 1536) return '2xl';
    if (width >= 1280) return 'xl';
    if (width >= 1024) return 'lg';
    if (width >= 768) return 'md';

    return 'sm';
  }

  const observer = new ResizeObserver(() => {
    const nextBreakpoint = getBreakpoint(window.innerWidth);

    if (nextBreakpoint !== currentBreakpoint) {
      currentBreakpoint = nextBreakpoint;

      iframe.contentWindow?.postMessage(
        {
          type: 'PARENT_BREAKPOINT',
          breakpoint: currentBreakpoint,
        },
        '*',
      );
    }
  });

  observer.observe(document.body);

  window.addEventListener('message', (event) => {
    if (event.data?.type === 'RESIZE') {
      const iframe = document.getElementById('booking-iframe');

      if (iframe) {
        iframe.style.width = `${event.data.width}px`;
        iframe.style.height = `${event.data.height}px`;
      }
    }

    if (event.data?.type === 'MOUNTED') {
      iframe.contentWindow?.postMessage(
        {
          type: 'PARENT_BREAKPOINT',
          breakpoint: currentBreakpoint,
        },
        '*',
      );
    }
  });
};
