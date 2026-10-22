// Customize the five memory captions, titles, descriptions, and image paths here.
(() => {
      const slides = Array.from(document.querySelectorAll('.slide'));
      const progressFill = document.getElementById('progress-fill');
      const pageCount = document.getElementById('page-count');
      const heartField = document.getElementById('heart-field');
      const audio = document.getElementById('ambient-audio');
      const soundToggle = document.getElementById('sound-toggle');
      const soundIcon = document.getElementById('sound-icon');
      const memoryImage = document.getElementById('memory-image');
      const memoryCaption = document.getElementById('memory-caption');
      const memoryKicker = document.getElementById('memory-kicker');
      const memoryTitle = document.getElementById('memory-title');
      const memoryDescription = document.getElementById('memory-description');
      const memoryDots = Array.from(document.querySelectorAll('.memory-dot'));
      const nextMemory = document.getElementById('next-memory');
      const memorySwipeArea = document.getElementById('memory-swipe-area');
      const yesButton = document.getElementById('yes-button');
      const noButton = document.getElementById('no-button');
      const answerStage = document.getElementById('answer-stage');
      const answerMessage = document.getElementById('answer-message');
      const proposalCard = document.getElementById('proposal-card');
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let currentSlide = 0;
      let currentMemory = 0;
      let heartsTimer;
      let swipeStartX = null;
      let soundEnabled = false;
      let hasCelebrated = false;

      const memories = [
        {
          image: 'Doodles/img%201.png',
          alt: 'Illustrated rainy-night phone call scenes from the beginning of our story',
          caption: 'the rain, the call, the beginning ♡',
          kicker: 'Memory 01 · the first chapters',
          title: 'Endrum<span class="accent">Aval</span>',
          description: 'மழை நீருக்குள் நீயும், பருவக்காற்றாக வரும் உனது பேச்சும், என்னை உன்னை உணரச் செய்தது... அது காதலா, இல்லை காதலால் வரும் ஏக்கமா?'
        },
        {
          image: 'Doodles/img%202.png',
          alt: 'Hand-drawn scenes of us meeting, talking, laughing, and sharing little moments',
          caption: 'our very own little scrapbook',
          kicker: 'Memory 02 · our kind of magic',
          title: 'All the endless <span class="accent">talks</span> & silly laughs...',
          description: 'The little conversations, the big ones, and all the laughter in between — I could stay there forever.'
        },
        {
          image: 'Doodles/img%203.png',
          alt: 'Illustrated late-night messages and shy, sweet reactions',
          caption: 'even our random chats ♡',
          kicker: 'Memory 03 · the little things',
          title: 'Every moment that made me fall <span class="accent">deeper</span> in love...',
          description: 'Somehow, every ordinary day with you becomes one I want to keep.'
        },
        {
          image: 'Doodles/img%204.png',
          alt: 'Illustrated rainy journey as we make our way to find each other',
          caption: 'every road led me to you ♡',
          kicker: 'Memory 04 · through every storm',
          title: "I'd find my way to you <span class=\"accent\">every time</span>...",
          description: 'No matter how long the road or how hard the rain, being with you is always worth it.'
        },
        {
          image: 'Doodles/img%205.png',
          alt: 'A scrapbook of our moments together, including holding hands and a warm hug',
          caption: 'and every little moment after ♡',
          kicker: 'Memory 05 · my favourite collection',
          title: 'A thousand little reasons to choose <span class="accent">you</span>...',
          description: 'Every memory brought me here — and I cannot wait for all the pages still to come.'
        }
      ];

      function showSlide(index) {
        if (index < 0 || index >= slides.length) return;
        currentSlide = index;
        slides.forEach((slide, i) => {
          const active = i === currentSlide;
          slide.classList.toggle('active', active);
          slide.setAttribute('aria-hidden', String(!active));
        });
        progressFill.style.width = `${((currentSlide + 1) / slides.length) * 100}%`;
        pageCount.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
        if (currentSlide > 0) document.body.classList.add('story-open');
        if (currentSlide === 4) noButton.classList.remove('escaped');
      }

      function renderMemory(index) {
        currentMemory = (index + memories.length) % memories.length;
        const memory = memories[currentMemory];
        memoryImage.src = memory.image;
        memoryImage.alt = memory.alt;
        memoryCaption.textContent = memory.caption;
        if (memoryKicker) memoryKicker.textContent = memory.kicker;
        memoryTitle.innerHTML = memory.title;
        memoryDescription.textContent = memory.description;
        memoryDots.forEach((dot, i) => {
          const active = i === currentMemory;
          dot.classList.toggle('active', active);
          if (active) dot.setAttribute('aria-current', 'true');
          else dot.removeAttribute('aria-current');
        });
        nextMemory.innerHTML = currentMemory === memories.length - 1
          ? 'Continue to the last page <span aria-hidden="true">✨</span>'
          : 'Next Memory <span aria-hidden="true">➡️</span>';
      }

      document.querySelectorAll('[data-next]').forEach(button => {
        button.addEventListener('click', () => {
          if (currentSlide === 1) startHearts();
          showSlide(currentSlide + 1);
        });
      });

      nextMemory.addEventListener('click', () => {
        if (currentMemory === memories.length - 1) showSlide(3);
        else renderMemory(currentMemory + 1);
      });

      memoryDots.forEach((dot, index) => dot.addEventListener('click', () => renderMemory(index)));

      memorySwipeArea.addEventListener('touchstart', event => {
        swipeStartX = event.changedTouches[0].clientX;
      }, { passive: true });
      memorySwipeArea.addEventListener('touchend', event => {
        if (swipeStartX === null) return;
        const distance = event.changedTouches[0].clientX - swipeStartX;
        if (Math.abs(distance) > 55) renderMemory(currentMemory + (distance < 0 ? 1 : -1));
        swipeStartX = null;
      }, { passive: true });
      memorySwipeArea.addEventListener('keydown', event => {
        if (event.key === 'ArrowRight') renderMemory(currentMemory + 1);
        if (event.key === 'ArrowLeft') renderMemory(currentMemory - 1);
      });
      memorySwipeArea.tabIndex = 0;
      memorySwipeArea.setAttribute('aria-label', 'Memory carousel. Use the memory buttons, arrow keys, or swipe to browse.');

      function updateSoundControl() {
        const hasAudio = Boolean(audio.currentSrc || audio.querySelector('source'));
        soundToggle.setAttribute('aria-pressed', String(soundEnabled));
        soundToggle.setAttribute('aria-label', soundEnabled ? 'Turn background music off' : (hasAudio ? 'Turn background music on' : 'Sound is off. Add an audio source to enable music.'));
        soundToggle.title = hasAudio ? (soundEnabled ? 'Turn background music off' : 'Turn background music on') : 'Optional music can be added to the audio element';
        soundIcon.innerHTML = soundEnabled
          ? '<path d="M11 5 6 9H3v6h3l5 4V5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M16 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'
          : '<path d="M11 5 6 9H3v6h3l5 4V5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m17 9 4 6m0-6-4 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>';
      }

      soundToggle.addEventListener('click', async () => {
        const hasAudio = Boolean(audio.currentSrc || audio.querySelector('source'));
        if (!hasAudio) {
          soundEnabled = false;
          updateSoundControl();
          return;
        }
        if (soundEnabled) {
          audio.pause();
          soundEnabled = false;
        } else {
          await audio.play();
          soundEnabled = true;
        }
        updateSoundControl();
      });

      function makeHeart() {
        const heart = document.createElement('span');
        heart.className = 'ambient-heart';
        heart.textContent = Math.random() > .5 ? '♡' : '♥';
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.fontSize = `${12 + Math.random() * 18}px`;
        heart.style.setProperty('--drift', `${Math.round(Math.random() * 100 - 50)}px`);
        heart.style.animationDuration = `${7 + Math.random() * 7}s`;
        heartField.appendChild(heart);
        window.setTimeout(() => heart.remove(), 15000);
      }

      function startHearts() {
        if (heartsTimer || prefersReducedMotion) return;
        for (let i = 0; i < 9; i++) window.setTimeout(makeHeart, i * 260);
        heartsTimer = window.setInterval(makeHeart, 900);
      }

      function moveNoButton(event) {
        if (event) event.preventDefault();
        const stageRect = answerStage.getBoundingClientRect();
        const buttonRect = noButton.getBoundingClientRect();
        const maxX = Math.max(0, stageRect.width - buttonRect.width);
        const maxY = Math.max(0, stageRect.height - buttonRect.height);
        const currentLeft = noButton.classList.contains('escaped') ? noButton.offsetLeft : Math.max(0, yesButton.offsetLeft + yesButton.offsetWidth + 16);
        let left = Math.random() * maxX;
        if (maxX > 120 && Math.abs(left - currentLeft) < 100) left = (left + maxX / 2) % maxX;
        noButton.classList.add('escaped');
        noButton.style.left = `${left}px`;
        noButton.style.top = `${Math.random() * maxY}px`;
        noButton.setAttribute('aria-label', 'No button, playfully moved. Try again if you can.');
      }

      noButton.addEventListener('pointerenter', moveNoButton);
      noButton.addEventListener('pointerdown', moveNoButton);
      noButton.addEventListener('focus', () => {
        if (noButton.matches(':focus-visible')) moveNoButton();
      });

      function launchConfetti() {
        if (typeof window.confetti !== 'function') return;
        const end = Date.now() + 2100;
        const colors = ['#f6c2ce', '#f4d9aa', '#e88daf', '#bda2e8', '#fff1df'];
        (function frame() {
          window.confetti({
            particleCount: 7,
            angle: 60,
            spread: 75,
            origin: { x: 0, y: .72 },
            colors,
            startVelocity: 48,
            scalar: 1.15
          });
          window.confetti({
            particleCount: 7,
            angle: 120,
            spread: 75,
            origin: { x: 1, y: .72 },
            colors,
            startVelocity: 48,
            scalar: 1.15
          });
          if (Date.now() < end) window.requestAnimationFrame(frame);
        })();
        window.confetti({ particleCount: 170, spread: 115, origin: { y: .58 }, colors, startVelocity: 48, scalar: 1.2 });
      }

      yesButton.addEventListener('click', () => {
        if (hasCelebrated) return;
        hasCelebrated = true;
        answerMessage.classList.add('visible');
        proposalCard.classList.add('celebration');
        noButton.hidden = true;
        yesButton.disabled = true;
        yesButton.textContent = 'YES, FOREVER 💖';
        if (!prefersReducedMotion) {
          startHearts();
          launchConfetti();
        }
      });

      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') return;
        if (currentSlide === 2 && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) return;
        if (event.key === 'Enter' && event.target === document.body && currentSlide < slides.length - 1) showSlide(currentSlide + 1);
      });

      updateSoundControl();
      renderMemory(0);
      showSlide(0);
    })();
