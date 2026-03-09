let scrollTriggerRegistered = false;

export async function getMotionTools() {
  const { default: gsap } = await import('gsap');

  return { gsap };
}

export async function getScrollMotionTools() {
  const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);

  if (!scrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }

  return { gsap, ScrollTrigger };
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
