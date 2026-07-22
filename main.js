/* -------------------------------------------------------------
 * PHOENIX MC / KYRONYX MC - MINECRAFT THUMBNAIL DESIGNER PORTFOLIO
 * Main JavaScript (Three.js 3D Canvas, GSAP Animations, Lenis Smooth Scroll, Mobile Burger Menu)
 * ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // 1. LENIS SMOOTH SCROLL
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Integrate GSAP ScrollTrigger with Lenis
  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // 2. MOBILE HAMBURGER MENU DRAWER LOGIC
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function toggleMobileMenu() {
    const isOpen = menuToggle.classList.toggle('active');
    mobileOverlay.classList.toggle('active', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  }

  function closeMobileMenu() {
    menuToggle.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  if (menuToggle && mobileOverlay) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });
  }

  // 3. THREE.JS 3D CANVAS BACKGROUND (Floating 3D Minecraft Cubes & Glowing Turquoise Particles)
  const container = document.getElementById('three-canvas-container');
  if (container && window.THREE) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08090c, 0.035);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00a896, 3, 50);
    pointLight.position.set(0, 5, 10);
    scene.add(pointLight);

    // Create 3D Minecraft Floating Wireframe Cubes & Ore Blocks
    const cubesGroup = new THREE.Group();
    scene.add(cubesGroup);

    const cubeGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x101216,
      roughness: 0.3,
      metalness: 0.8
    });
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00a896,
      wireframe: true
    });

    const cubeCount = 18;
    const cubes = [];

    for (let i = 0; i < cubeCount; i++) {
      const mesh = new THREE.Mesh(cubeGeo, cubeMat);
      const wire = new THREE.Mesh(cubeGeo, wireMat);
      wire.scale.set(1.02, 1.02, 1.02);
      mesh.add(wire);

      mesh.position.x = (Math.random() - 0.5) * 30;
      mesh.position.y = (Math.random() - 0.5) * 25;
      mesh.position.z = (Math.random() - 0.5) * 20 - 5;

      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.015,
        floatSpeed: (Math.random() + 0.5) * 0.01,
        initialY: mesh.position.y
      };

      cubesGroup.add(mesh);
      cubes.push(mesh);
    }

    // Glowing Turquoise Particle Stars
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 40;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x00a896,
      transparent: true,
      opacity: 0.7
    });

    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Mouse tilt interaction
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    let clock = new THREE.Clock();

    function animate3D() {
      requestAnimationFrame(animate3D);
      const elapsedTime = clock.getElapsedTime();

      // Rotate cubes & float softly
      cubes.forEach((cube) => {
        cube.rotation.x += cube.userData.rotSpeedX;
        cube.rotation.y += cube.userData.rotSpeedY;
        cube.position.y = cube.userData.initialY + Math.sin(elapsedTime * cube.userData.floatSpeed * 3) * 0.6;
      });

      // Particle rotation
      particles.rotation.y = elapsedTime * 0.03;

      // Parallax camera tilt
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }
    animate3D();

    // Window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // 4. CUSTOM CURSOR & HOVER EFFECTS
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  const cursorText = document.getElementById('cursor-text');

  let mousePos = { x: 0, y: 0 };
  let followerPos = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;

    if (cursor) {
      gsap.to(cursor, {
        x: mousePos.x,
        y: mousePos.y,
        duration: 0.1,
        ease: 'power2.out'
      });
    }
  });

  function updateFollower() {
    if (follower) {
      followerPos.x += (mousePos.x - followerPos.x) * 0.15;
      followerPos.y += (mousePos.y - followerPos.y) * 0.15;
      follower.style.transform = `translate(${followerPos.x - 22}px, ${followerPos.y - 22}px)`;
    }
    requestAnimationFrame(updateFollower);
  }
  updateFollower();

  // Hover states for projects
  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('mouseenter', () => {
      if (cursor && cursorText) {
        cursor.classList.add('hovering-project');
        cursorText.textContent = 'View';
      }
    });
    card.addEventListener('mouseleave', () => {
      if (cursor) cursor.classList.remove('hovering-project');
    });
  });

  // 5. GSAP SCROLL ANIMATIONS
  // Hero title text reveal
  gsap.to('.hero-title .char', {
    y: 0,
    opacity: 1,
    duration: 1.2,
    stagger: 0.05,
    ease: 'power4.out',
    delay: 0.2
  });

  // Hero portrait subtle parallax scroll
  gsap.to('.hero-background-portrait', {
    yPercent: 15,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  // Navbar scrolled effect
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      const navbar = document.getElementById('navbar');
      if (navbar) {
        if (self.direction === 1 || window.scrollY > 80) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    }
  });

  // Stats Counter Animation
  document.querySelectorAll('.stat-number').forEach((stat) => {
    const target = parseInt(stat.getAttribute('data-target'));
    const suffix = stat.textContent.replace(/[0-9.]/g, '');
    if (isNaN(target)) return;

    ScrollTrigger.create({
      trigger: stat,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        let obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            stat.textContent = Math.floor(obj.val) + suffix;
          }
        });
      }
    });
  });

  // 6. BEFORE & AFTER SLIDER INTERACTION (TOUCH & MOUSE SUPPORT)
  const sliderWrapper = document.getElementById('comparison-slider');
  const afterImg = document.getElementById('comparison-after');
  const sliderLine = document.getElementById('slider-line');

  if (sliderWrapper && afterImg && sliderLine) {
    let isDragging = false;

    function setSliderPosition(x) {
      const rect = sliderWrapper.getBoundingClientRect();
      let offsetX = x - rect.left;
      offsetX = Math.max(0, Math.min(offsetX, rect.width));

      const percentage = (offsetX / rect.width) * 100;
      afterImg.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
      sliderLine.style.left = `${percentage}%`;
    }

    sliderWrapper.addEventListener('mousedown', (e) => {
      isDragging = true;
      setSliderPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        setSliderPosition(e.clientX);
      }
    });

    // Touch events for mobile responsiveness
    sliderWrapper.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches.length > 0) setSliderPosition(e.touches[0].clientX);
    });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    sliderWrapper.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length > 0) {
        setSliderPosition(e.touches[0].clientX);
      }
    });
  }
});

// 7. PROJECT MODAL LOGIC
function openProjectModal(id) {
  const modal = document.getElementById('project-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalCat = document.getElementById('modal-category');

  const projects = {
    1: { title: 'KyroNyxMC Potion Ritual', cat: '3D Beacon & Potion Particles', img: 'assets/user_thumb1.jpg' },
    2: { title: 'KyroNyxMC Netherite Army Siege', cat: '3D Netherite Army Battalion', img: 'assets/user_thumb2.jpg' }
  };

  if (projects[id]) {
    modalImg.src = projects[id].img;
    modalTitle.textContent = projects[id].title;
    modalCat.textContent = projects[id].cat;
    modal.classList.add('active');
  }
}

function closeProjectModal() {
  document.getElementById('project-modal').classList.remove('active');
}
