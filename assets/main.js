// Domain Canonicalization
if (
  window.location.protocol !== "file:" &&
  window.location.hostname &&
  window.location.hostname !== "calendar.whu.sb" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1" &&
  !window.location.hostname.endsWith(".local")
) {
  console.log("Protocol:", window.location.protocol);
  console.log("Hostname:", window.location.hostname);
  window.location.href =
    "https://calendar.whu.sb" +
    window.location.pathname +
    window.location.search;
}

// 动态获取可用学年的函数
async function getAvailableYears() {
  try {
    const response = await fetch("./years.json");
    if (response.ok) {
      const data = await response.json();
      return data.years || [];
    }
  } catch (error) {
    console.error("无法获取 years.json:", error);
  }
  return [];
}

// 生成单学年校历链接
function generateIndividualYearLinks(years) {
  const container = document.getElementById("individual-years");
  container.innerHTML = "";

  years.forEach((yearRange) => {
    const link = document.createElement("a");
    link.href = `./${yearRange}.ics`;
    link.download = `whu-calendar-${yearRange}.ics`;
    link.className = "download-card secondary";
    link.innerHTML = `
            <div>
              <div class="download-title">${yearRange} 学年</div>
              <div class="download-description">单学年校历文件</div>
            </div>
            <i class="fas fa-arrow-down"></i>
          `;
    container.appendChild(link);
  });
}

// 生成自定义跨年合集选择器
function setupCustomRangeSelectors(years) {
  if (years.length === 0) return;

  const startSelect = document.getElementById("start-year-select");
  const endSelect = document.getElementById("end-year-select");
  const downloadBtn = document.getElementById("custom-download-btn");
  const downloadDesc = document.getElementById("custom-download-desc");

  if (!startSelect || !endSelect || !downloadBtn || !downloadDesc) return;

  // 提取单纯的起始年份（例如 "2012-2013" 提取出 "2012"）
  const startYears = years.map(y => y.split("-")[0]);
  // 提取单纯的结束年份（例如 "2012-2013" 提取出 "2013"）
  const endYears = years.map(y => y.split("-")[1]);

  // 去重并排序
  const uniqueStartYears = [...new Set(startYears)].sort();
  const uniqueEndYears = [...new Set(endYears)].sort();

  // 填充下拉框
  uniqueStartYears.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year + " 年";
    startSelect.appendChild(option);
  });

  uniqueEndYears.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year + " 年";
    endSelect.appendChild(option);
  });

  // 默认选中第一项和最后一项
  if (startSelect.options.length > 0) startSelect.selectedIndex = 0;
  if (endSelect.options.length > 0) endSelect.selectedIndex = endSelect.options.length - 1;

  // 更新下载链接的函数
  const updateDownloadLink = () => {
    const sYear = parseInt(startSelect.value, 10);
    const eYear = parseInt(endSelect.value, 10);

    if (sYear >= eYear) {
      downloadBtn.classList.add("disabled");
      downloadBtn.style.pointerEvents = "none";
      downloadBtn.style.opacity = "0.5";
      downloadDesc.textContent = "起始年份必须小于结束年份";
      downloadBtn.href = "#";
      return;
    }

    downloadBtn.classList.remove("disabled");
    downloadBtn.style.pointerEvents = "auto";
    downloadBtn.style.opacity = "1";
    downloadDesc.textContent = `包含 ${sYear} 至 ${eYear} 数据`;
    downloadBtn.href = `./api/${sYear}-${eYear}.ics`;
    downloadBtn.download = `whu-calendar-${sYear}-${eYear}.ics`;
  };

  startSelect.addEventListener("change", updateDownloadLink);
  endSelect.addEventListener("change", updateDownloadLink);

  // 初始化链接
  updateDownloadLink();
}

function setupReveal() {
  const blocks = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) {
    blocks.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  blocks.forEach((el) => observer.observe(el));
}

function setupParallax() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  const hero = document.querySelector("[data-parallax]");
  if (!hero) {
    return;
  }

  const update = () => {
    const y = Math.max(window.scrollY, 0);
    hero.style.backgroundPosition = `center ${y * 0.22}px`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupSakura() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const hero = document.querySelector(".hero");
  const canvas = document.getElementById("sakura-canvas");
  if (!hero || !canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const petals = [];
  const mouse = { x: 0, y: 0, active: false };
  let width = 0;
  let height = 0;
  let rafId = null;

  const petalCount = Math.max(
    18,
    Math.min(52, Math.round(window.innerWidth / 28)),
  );
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    const rect = hero.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createPetal(spawnTop) {
    return {
      x: Math.random() * width,
      y: spawnTop ? -Math.random() * height * 0.6 : Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0.35 + Math.random() * 0.75,
      size: 6 + Math.random() * 8,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.02,
      wobble: Math.random() * Math.PI * 2,
      wobbleV: 0.01 + Math.random() * 0.02,
      hueShift: Math.random() * 10 - 5,
    };
  }

  function drawPetal(petal) {
    ctx.save();
    ctx.translate(petal.x, petal.y);
    ctx.rotate(petal.rot);
    ctx.scale(1, 0.72);

    const baseColor = `hsla(${340 + petal.hueShift}, 74%, 86%, 0.88)`;
    const centerColor = `hsla(${345 + petal.hueShift}, 68%, 72%, 0.62)`;

    ctx.beginPath();
    ctx.moveTo(0, -petal.size);
    ctx.bezierCurveTo(
      petal.size * 0.95,
      -petal.size * 0.78,
      petal.size * 0.9,
      petal.size * 0.62,
      0,
      petal.size,
    );
    ctx.bezierCurveTo(
      -petal.size * 0.9,
      petal.size * 0.62,
      -petal.size * 0.95,
      -petal.size * 0.78,
      0,
      -petal.size,
    );
    ctx.closePath();
    ctx.fillStyle = baseColor;
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(
      0,
      petal.size * 0.18,
      petal.size * 0.24,
      petal.size * 0.2,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = centerColor;
    ctx.fill();
    ctx.restore();
  }

  function updatePetal(petal, t) {
    petal.wobble += petal.wobbleV;
    petal.x += petal.vx + Math.sin(petal.wobble + t * 0.00025) * 0.55;
    petal.y += petal.vy;
    petal.rot += petal.rotV;

    if (mouse.active) {
      const dx = petal.x - mouse.x;
      const dy = petal.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      const influence = 130;
      if (dist < influence && dist > 0.01) {
        const force = (influence - dist) / influence;
        const nx = dx / dist;
        const ny = dy / dist;
        petal.x += nx * force * 3.2;
        petal.y += ny * force * 2.6;
        petal.rot += force * 0.06;
      }
    }

    if (petal.y > height + 20 || petal.x < -30 || petal.x > width + 30) {
      Object.assign(petal, createPetal(true));
    }
  }

  function tick(t) {
    ctx.clearRect(0, 0, width, height);
    for (const petal of petals) {
      updatePetal(petal, t);
      drawPetal(petal);
    }
    rafId = window.requestAnimationFrame(tick);
  }

  function handleMove(event) {
    const rect = hero.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
    mouse.active = true;
  }

  function handleLeave() {
    mouse.active = false;
  }

  resize();
  petals.length = 0;
  for (let i = 0; i < petalCount; i++) {
    petals.push(createPetal(false));
  }

  hero.addEventListener("pointermove", handleMove);
  hero.addEventListener("pointerleave", handleLeave);
  window.addEventListener("resize", resize, { passive: true });
  rafId = window.requestAnimationFrame(tick);

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else if (!rafId) {
        rafId = window.requestAnimationFrame(tick);
      }
    },
    { passive: true },
  );
}

function checkGoogleConnectivity() {
  const container = document.querySelector(".calendar-embed-container");
  if (!container) return;

  const img = new Image();
  const timeoutId = setTimeout(() => {
    container.classList.add("is-offline");
  }, 3500);

  img.onload = () => {
    clearTimeout(timeoutId);
    document.body.classList.add("is-online");
  };

  img.onerror = () => {
    clearTimeout(timeoutId);
    container.classList.add("is-offline");
  };

  img.src = "https://www.google.com/favicon.ico?" + new Date().getTime();
}

// 初始化页面
async function initializePage() {
  try {
    const years = await getAvailableYears();

    if (years.length > 0) {
      generateIndividualYearLinks(years);
      setupCustomRangeSelectors(years);
    } else {
      // 如果没有找到年份，显示默认硬编码年份
      const defaultYears = [
        "2021-2022",
        "2022-2023",
        "2023-2024",
        "2024-2025",
        "2025-2026",
      ];
      generateIndividualYearLinks(defaultYears);
      setupCustomRangeSelectors(defaultYears);
    }
  } catch (error) {
    console.error("初始化页面时出错:", error);
    // 显示默认年份作为后备
    const defaultYears = [
      "2021-2022",
      "2022-2023",
      "2023-2024",
      "2024-2025",
      "2025-2026",
    ];
    generateIndividualYearLinks(defaultYears);
    setupCustomRangeSelectors(defaultYears);
  }
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", async () => {
  setupReveal();
  setupParallax();
  setupSakura();
  checkGoogleConnectivity();

  const guideSection = document.getElementById("guide");
  if (guideSection && typeof lightGallery !== "undefined") {
    lightGallery(guideSection, {
      selector: ".gallery-item",
      download: false,
      counter: false,
    });
  }

  await initializePage();

  // Restore scroll position
  const savedPos = sessionStorage.getItem("scrollPos");
  if (savedPos) {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, parseInt(savedPos, 10));
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = "";
    });
  }

  window.addEventListener("beforeunload", () => {
    sessionStorage.setItem("scrollPos", window.scrollY);
  });
});

window.copyToClipboard = function (id, btn) {
  const text = document.getElementById(id).innerText.trim();
  navigator.clipboard.writeText(text).then(() => {
    const icon = btn.querySelector("i");
    if (icon) {
      icon.className = "fas fa-check";
      setTimeout(() => {
        icon.className = "far fa-copy";
      }, 2000);
    }
  });
};

let currentIosIndex = 0;
function navigateIos(dir) {
  const track = document.getElementById("ios-gallery-track");
  if (!track) return;
  const items = track.querySelectorAll(".gallery-item");
  if (!items.length) return;

  currentIosIndex += dir;
  if (currentIosIndex < 0) currentIosIndex = 0;
  if (currentIosIndex >= items.length) currentIosIndex = items.length - 1;

  track.style.transform = "translateX(-" + currentIosIndex * 100 + "%)";
  document.getElementById("ios-gallery-counter").textContent =
    currentIosIndex + 1 + " / " + items.length;

  const prevBtn = document.getElementById("ios-prev-btn");
  const nextBtn = document.getElementById("ios-next-btn");
  if (prevBtn) prevBtn.disabled = currentIosIndex === 0;
  if (nextBtn) nextBtn.disabled = currentIosIndex === items.length - 1;
}

let currentMacosIndex = 0;
function navigateMacos(dir) {
  const track = document.getElementById("macos-gallery-track");
  if (!track) return;
  const items = track.querySelectorAll(".gallery-item");
  if (!items.length) return;

  currentMacosIndex += dir;
  if (currentMacosIndex < 0) currentMacosIndex = 0;
  if (currentMacosIndex >= items.length) currentMacosIndex = items.length - 1;

  track.style.transform = "translateX(-" + currentMacosIndex * 100 + "%)";
  document.getElementById("macos-gallery-counter").textContent =
    currentMacosIndex + 1 + " / " + items.length;

  const prevBtn = document.getElementById("macos-prev-btn");
  const nextBtn = document.getElementById("macos-next-btn");
  if (prevBtn) prevBtn.disabled = currentMacosIndex === 0;
  if (nextBtn) nextBtn.disabled = currentMacosIndex === items.length - 1;
}

window.navigateIos = navigateIos;
window.navigateMacos = navigateMacos;