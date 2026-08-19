import { useEffect, useLayoutEffect, useRef } from 'react';

const SVG_NS = 'http://www.w3.org/2000/svg';

function clamp(min, val, max) {
  return Math.max(min, Math.min(max, val));
}

function branchD(geo, p, i) {
  if (geo.mode === 'vine') {
    const dir = p.x >= geo.hubX ? 1 : -1;
    const ex = p.x - dir * (p.d / 2 + 13);
    return `M${geo.hubX} ${p.y - 46} Q${geo.hubX} ${p.y} ${ex} ${p.y}`;
  }
  const dx = p.x - geo.hubX;
  const dy = p.y - geo.hubY;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  const sx = geo.hubX + ux * (geo.hubD / 2 + 10);
  const sy = geo.hubY + uy * (geo.hubD / 2 + 10);
  const ex2 = p.x - ux * (p.d / 2 + 13);
  const ey2 = p.y - uy * (p.d / 2 + 13);
  const bend = dist * 0.16 * (i % 2 ? 1 : -1);
  const mx = (sx + ex2) / 2 + (-uy) * bend;
  const my = (sy + ey2) / 2 + ux * bend;
  return `M${sx} ${sy} Q${mx} ${my} ${ex2} ${ey2}`;
}

function paintNode(entry) {
  entry.el.style.setProperty('--x', `${Math.round(entry.pos.x)}px`);
  entry.el.style.setProperty('--y', `${Math.round(entry.pos.y)}px`);
  entry.el.style.setProperty('--d', `${Math.round(entry.pos.d)}px`);
}

export function useWishlistConstellation(items) {
  const stageRef = useRef(null);
  const hubRef = useRef(null);
  const nodesRef = useRef(null);
  const linksSvgRef = useRef(null);
  const linkLayerRef = useRef(null);
  const dustRef = useRef(null);
  const spotRef = useRef(null);
  const idsKey = items.map((p) => p.id).join('|');

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const hub = hubRef.current;
    const nodesWrap = nodesRef.current;
    const linksSvg = linksSvgRef.current;
    const linkLayer = linkLayerRef.current;
    if (!stage || !hub || !nodesWrap || !linksSvg || !linkLayer) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touchOnly = window.matchMedia('(hover: none)').matches;
    const settled = {};
    let entries = [];
    let linkFor = {};
    let pathEls = [];
    let stemEl = null;
    let linkMode = '';
    let lastSig = '';
    let tweenId = null;
    let reflowScheduled = false;

    const sizeSignature = () => `${stage.clientWidth}x${window.innerHeight}`;

    const spark = (pathId, delay) => {
      window.setTimeout(() => {
        const target = document.getElementById(pathId);
        if (!target || !linkLayer.isConnected) return;
        const dot = document.createElementNS(SVG_NS, 'circle');
        dot.setAttribute('class', 'spark');
        dot.setAttribute('r', '3.2');
        const motion = document.createElementNS(SVG_NS, 'animateMotion');
        motion.setAttribute('dur', '1s');
        motion.setAttribute('begin', '0s');
        motion.setAttribute('fill', 'remove');
        const mpath = document.createElementNS(SVG_NS, 'mpath');
        mpath.setAttribute('href', `#${pathId}`);
        mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${pathId}`);
        motion.appendChild(mpath);
        dot.appendChild(motion);
        linkLayer.appendChild(dot);
        window.setTimeout(() => dot.remove(), 1100);
      }, delay);
    };

    const drawLinks = (geo, animateFresh) => {
      linksSvg.setAttribute('viewBox', `0 0 ${geo.w} ${geo.h}`);

      if (animateFresh || pathEls.length !== entries.length || linkMode !== geo.mode) {
        linkLayer.replaceChildren();
        pathEls = [];
        stemEl = null;
        linkFor = {};
        linkMode = geo.mode;

        if (geo.mode === 'vine') {
          stemEl = document.createElementNS(SVG_NS, 'path');
          stemEl.setAttribute('class', 'link link--stem');
          linkLayer.appendChild(stemEl);
        }
        entries.forEach((entry, i) => {
          const path = document.createElementNS(SVG_NS, 'path');
          path.setAttribute('class', 'link');
          path.setAttribute('marker-end', 'url(#wishArrow)');
          path.setAttribute('id', `branch-${i}`);
          path.setAttribute('data-for', entry.item.id);
          linkLayer.appendChild(path);
          pathEls.push(path);
          linkFor[entry.item.id] = path;
        });
      }

      if (stemEl && entries.length) {
        const lastY = entries[entries.length - 1].pos.y;
        stemEl.setAttribute('d', `M${geo.hubX} ${geo.hubY + geo.hubD / 2 + 6} L${geo.hubX} ${lastY}`);
      }

      entries.forEach((entry, i) => {
        const p = entry.pos;
        const path = pathEls[i];
        if (!p || !path) return;
        path.setAttribute('d', branchD(geo, p, i));

        if (entry.fresh && animateFresh && !reduceMotion) {
          const len = path.getTotalLength();
          const delay = 260 + i * 150;
          path.style.strokeDasharray = String(len);
          path.style.strokeDashoffset = String(len);
          path.style.transitionDelay = `${delay}ms`;
          requestAnimationFrame(() => { path.style.strokeDashoffset = '0'; });
          spark(path.id, delay);
          entry.fresh = false;
        } else if (!entry.fresh) {
          path.style.strokeDasharray = 'none';
          path.style.strokeDashoffset = '0';
          path.style.transitionDelay = '0ms';
        }
      });
    };

    const collectEntries = () => {
      entries = [];
      nodesWrap.querySelectorAll('.node').forEach((el) => {
        const id = el.getAttribute('data-id');
        const item = items.find((p) => p.id === id);
        if (!item) return;
        const isNew = !settled[id];
        settled[id] = true;
        entries.push({ item, el, fresh: isNew });
      });
    };

    const layout = (opts = {}) => {
      const w = stage.clientWidth;
      const n = entries.length;
      let hubD;
      let hubX;
      let hubY;
      const positions = [];

      if (!n) {
        linkLayer.replaceChildren();
        pathEls = [];
        stemEl = null;
        linkFor = {};
        stage.style.minHeight = '';
        hub.style.top = '50%';
        const soloHub = `${Math.round(clamp(120, w * 0.2, 168))}px`;
        hub.style.setProperty('--hub', soloHub);
        stage.style.setProperty('--hub', soloHub);
        return;
      }

      const mode = (w < 760 || (touchOnly && w < 1080)) ? 'vine' : 'radial';

      if (mode === 'vine') {
        const nodeD = Math.round(clamp(72, w * 0.29, 122));
        hubD = Math.round(clamp(96, w * 0.28, 136));
        const step = nodeD + (touchOnly ? 178 : 76);
        hubX = w / 2;
        hubY = hubD / 2 + 24;
        const firstY = hubY + hubD / 2 + 74 + nodeD / 2;
        const offX = Math.min(w / 2 - nodeD / 2 - 12, nodeD / 2 + 52);
        for (let i = 0; i < n; i += 1) {
          positions.push({
            x: hubX + (i % 2 === 0 ? offX : -offX),
            y: firstY + step * i,
            d: nodeD,
            side: 'bottom',
            anchor: i % 2 === 0 ? 'end' : 'start',
          });
        }
        stage.style.minHeight = `${Math.round(firstY + step * (n - 1) + nodeD / 2 + 120)}px`;
        hub.style.top = `${hubY}px`;
      } else {
        stage.style.minHeight = '';
        hubD = Math.round(clamp(132, w * 0.11, 172));
        const nodeD = Math.round(clamp(84, (w < 880 ? 116 : (w < 1100 ? 130 : 156)) - Math.max(0, n - 6) * 5, 172));
        hubX = w / 2;

        const labelRoom = Math.min(248, w * 0.19);
        const maxRx = Math.max(150, w / 2 - nodeD / 2 - labelRoom - 16);
        const maxRy = Math.max(130, stage.clientHeight / 2 - nodeD / 2 - 24);
        const labelPad = touchOnly ? 84 : 0;
        const baseR = hubD / 2 + nodeD / 2 + 48;
        const ringGap = nodeD + 36 + labelPad;
        const rings = [];
        let placed = 0;
        let ring = 0;
        while (placed < n && ring < 8) {
          const ringR = baseR + ring * ringGap;
          const capacity = Math.max(3, Math.floor(Math.PI / Math.asin(Math.min(0.99, (nodeD / 2 + 13 + labelPad * 0.5) / ringR))));
          const take = Math.min(capacity, n - placed);
          rings.push({ r: ringR, k: take });
          placed += take;
          ring += 1;
        }

        const outerR = rings[rings.length - 1].r;
        let scaleY;
        let scaleX;
        if (outerR > maxRy) {
          stage.style.minHeight = `${Math.round(2 * (outerR + nodeD / 2 + 28))}px`;
          scaleY = 1;
        } else {
          scaleY = maxRy / outerR;
        }
        scaleX = Math.min(maxRx / outerR, scaleY * 1.9);
        if (scaleX < 1) scaleX = Math.min(1, maxRx / outerR);

        hubY = stage.clientHeight / 2;
        hub.style.top = '50%';

        rings.forEach((rd, r) => {
          const stepA = (Math.PI * 2) / rd.k;
          const startA = -Math.PI / 2 + stepA / 2 + (r % 2 ? stepA / 2 : 0) + r * 0.2;
          for (let j = 0; j < rd.k; j += 1) {
            const ang = startA + stepA * j;
            positions.push({
              x: hubX + rd.r * scaleX * Math.cos(ang),
              y: hubY + rd.r * scaleY * Math.sin(ang),
              d: nodeD,
              side: null,
            });
          }
        });
        positions.length = n;

        positions.forEach((p) => {
          const room = 234;
          const half = 122;
          const outward = p.x >= hubX ? 'right' : 'left';
          const fitsOutward = outward === 'right'
            ? (p.x + p.d / 2 + 18 + room <= w)
            : (p.x - p.d / 2 - 18 - room >= 0);
          if (fitsOutward) {
            p.side = outward;
          } else {
            p.side = 'bottom';
            p.anchor = (p.x - half < 8) ? 'start' : ((p.x + half > w - 8) ? 'end' : 'center');
          }
        });
      }

      hub.style.setProperty('--hub', `${hubD}px`);
      stage.style.setProperty('--hub', `${hubD}px`);

      const geo = {
        w,
        h: stage.clientHeight,
        hubX,
        hubY,
        hubD,
        mode,
      };

      entries.forEach((entry, i) => {
        entry.target = positions[i] || null;
        if (!entry.target) return;
        entry.el.setAttribute('data-side', entry.target.side);
        entry.el.setAttribute('data-anchor', entry.target.anchor || 'center');
      });

      if (opts.tween && !reduceMotion) {
        if (tweenId) cancelAnimationFrame(tweenId);
        const from = entries.map((e) => (
          e.pos ? { x: e.pos.x, y: e.pos.y, d: e.pos.d } : { x: e.target.x, y: e.target.y, d: e.target.d }
        ));
        const t0 = performance.now();
        const dur = 560;
        const frame = (now) => {
          const t = Math.min(1, (now - t0) / dur);
          const k = 1 - (1 - t) ** 3;
          entries.forEach((entry, i) => {
            if (!entry.target) return;
            entry.pos = {
              x: from[i].x + (entry.target.x - from[i].x) * k,
              y: from[i].y + (entry.target.y - from[i].y) * k,
              d: from[i].d + (entry.target.d - from[i].d) * k,
              side: entry.target.side,
            };
            paintNode(entry);
          });
          drawLinks(geo, false);
          if (t < 1) tweenId = requestAnimationFrame(frame);
          else tweenId = null;
        };
        tweenId = requestAnimationFrame(frame);
      } else {
        entries.forEach((entry) => {
          if (!entry.target) return;
          entry.pos = {
            x: entry.target.x,
            y: entry.target.y,
            d: entry.target.d,
            side: entry.target.side,
          };
          paintNode(entry);
        });
        drawLinks(geo, opts.fresh);
      }
    };

    collectEntries();
    layout({ fresh: true });
    lastSig = sizeSignature();

    const scheduleLayout = () => {
      if (reflowScheduled) return;
      reflowScheduled = true;
      requestAnimationFrame(() => {
        reflowScheduled = false;
        const sig = sizeSignature();
        if (sig === lastSig) return;
        lastSig = sig;
        layout({});
      });
    };

    const ro = window.ResizeObserver ? new ResizeObserver(scheduleLayout) : null;
    ro?.observe(stage);
    window.addEventListener('resize', scheduleLayout);
    window.addEventListener('orientationchange', scheduleLayout);

    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', scheduleLayout);
      window.removeEventListener('orientationchange', scheduleLayout);
      if (tweenId) cancelAnimationFrame(tweenId);
      linkLayer.replaceChildren();
    };
  }, [idsKey, items]);

  useEffect(() => {
    const canvas = dustRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canvas || reduceMotion) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    let raf = 0;
    const motes = [];

    const sizeCanvas = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeCanvas();

    for (let m = 0; m < 60; m += 1) {
      motes.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        r: Math.random() * 1.7 + 0.4,
        s: Math.random() * 0.32 + 0.06,
        a: Math.random() * 0.45 + 0.12,
      });
    }

    const drift = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      motes.forEach((p) => {
        p.y -= p.s;
        p.x += Math.sin(p.y / 46) * 0.22;
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(201,162,39,${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(drift);
    };
    drift();
    window.addEventListener('resize', sizeCanvas);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', sizeCanvas);
    };
  }, []);

  useEffect(() => {
    const spot = spotRef.current;
    const touchOnly = window.matchMedia('(hover: none)').matches;
    if (!spot || touchOnly) return undefined;
    const onMove = (e) => {
      spot.style.left = `${e.clientX}px`;
      spot.style.top = `${e.clientY}px`;
      document.body.classList.add('has-spot');
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.body.classList.remove('has-spot');
    };
  }, []);

  return { stageRef, hubRef, nodesRef, linksSvgRef, linkLayerRef, dustRef, spotRef };
}
