// Simple include loader + main initialization
function loadIncludes() {
    const nodes = Array.from(document.querySelectorAll('[data-include]'));
    if (!nodes.length) return Promise.resolve();
    const promises = nodes.map(el => {
        const src = el.getAttribute('data-include');
        return fetch(src).then(r => r.text()).then(html => {
            el.innerHTML = html;
            el.removeAttribute('data-include');
        });
    });
    return Promise.all(promises).then(() => loadIncludes());
}

function initSite() {
    /* ==============================
       Timeline Horizontal Scroll
    ============================== */
    const timeline = document.querySelector('.timeline');
    if (timeline) {
        timeline.addEventListener('wheel', (e) => {
            e.preventDefault();
            timeline.scrollLeft += e.deltaY;
        });
    }
    
    initTimelineProofs();

    /* ==============================
       Flower Boy Flip Logic
    ============================== */
    const flowerBoy = document.querySelector('.hero-flowerboy-image');
    if (flowerBoy) {
        const container = document.createElement('div');
        // Transfer existing classes (positioning, etc.) to the container
        container.className = flowerBoy.className;
        container.classList.add('flowerboy-flip-container');
        
        const inner = document.createElement('div');
        inner.className = 'flowerboy-flip-inner';
        
        const front = document.createElement('div');
        front.className = 'flowerboy-flip-front';
        
        const back = document.createElement('div');
        back.className = 'flowerboy-flip-back';
        
        const backImg = document.createElement('img');
        backImg.src = 'partials/cat-holding-flower-bouquet-smiling.png';
        backImg.alt = 'Cat holding flowers';
        
        flowerBoy.parentNode.insertBefore(container, flowerBoy);
        container.appendChild(inner);
        inner.appendChild(front);
        inner.appendChild(back);
        
        front.appendChild(flowerBoy);
        back.appendChild(backImg);
        
        flowerBoy.className = ''; // Remove classes from inner image to avoid double positioning
        
        container.addEventListener('click', () => {
            container.classList.toggle('flipped');
        });
    }


    /* ==============================
       Valentine Question Logic
    ============================== */

    window.showValentineQuestion = function () {
        const trickScreen = document.getElementById('trickScreen');
        const valentineQuestion = document.getElementById('valentineQuestion');

        if (trickScreen) trickScreen.classList.add('hidden');

        setTimeout(() => {
            if (valentineQuestion) {
                valentineQuestion.classList.add('show');
                positionNoButton();
            }
        }, 500);
    };

    // Backwards-compatible alias for older markup that calls `revealTruth()`
    window.revealTruth = window.showValentineQuestion;

    // Reposition No button on resize to ensure it doesn't overlap Yes
    window.addEventListener('resize', function () {
        try { positionNoButton(); } catch (e) { /* ignore */ }
    });

    function positionNoButton() {
        const noBtn = document.getElementById('noBtn');
        const yesBtn = document.querySelector('.valentine-btn.yes');

        if (!noBtn || !yesBtn) return;

        const yesBtnRect = yesBtn.getBoundingClientRect();
        noBtn.style.position = 'fixed';

        // helper to check overlap with padding
        function rectsOverlap(a, b, padding = 20) {
            return !(a.right + padding < b.left || a.left - padding > b.right || a.bottom + padding < b.top || a.top - padding > b.bottom);
        }

        const noW = noBtn.offsetWidth;
        const noH = noBtn.offsetHeight;
        const viewport = { minX: 20, minY: 20, maxX: window.innerWidth - noW - 20, maxY: window.innerHeight - noH - 20 };

        function isInsideViewport(x, y) {
            return x >= viewport.minX && x <= viewport.maxX && y >= viewport.minY && y <= viewport.maxY;
        }

        function testPosition(x, y) {
            const cand = { left: x, top: y, right: x + noW, bottom: y + noH };
            return isInsideViewport(x, y) && !rectsOverlap(yesBtnRect, cand, 12);
        }

        // Try preferred positions: right, left, below, above
        const preferred = [
            { x: Math.round(yesBtnRect.right + 20), y: Math.round(yesBtnRect.top) },
            { x: Math.round(yesBtnRect.left - noW - 20), y: Math.round(yesBtnRect.top) },
            { x: Math.round(yesBtnRect.left), y: Math.round(yesBtnRect.bottom + 20) },
            { x: Math.round(yesBtnRect.left), y: Math.round(yesBtnRect.top - noH - 20) }
        ];

        let placed = false;
        for (const p of preferred) {
            if (testPosition(p.x, p.y)) {
                noBtn.style.left = p.x + 'px';
                noBtn.style.top = p.y + 'px';
                placed = true;
                break;
            }
        }

        // If none of the preferred positions work, try random positions until we find a non-overlapping one
        if (!placed) {
            let attempts = 0;
            while (attempts < 200) {
                const rx = Math.round(viewport.minX + Math.random() * (viewport.maxX - viewport.minX));
                const ry = Math.round(viewport.minY + Math.random() * (viewport.maxY - viewport.minY));
                if (testPosition(rx, ry)) {
                    noBtn.style.left = rx + 'px';
                    noBtn.style.top = ry + 'px';
                    placed = true;
                    break;
                }
                attempts++;
            }
        }

        // Fallback: place in corner farthest from the Yes button
        if (!placed) {
            const farX = (yesBtnRect.left < window.innerWidth / 2) ? viewport.maxX : viewport.minX;
            const farY = (yesBtnRect.top < window.innerHeight / 2) ? viewport.maxY : viewport.minY;
            noBtn.style.left = farX + 'px';
            noBtn.style.top = farY + 'px';
        }
    }
    

    window.runAwayNo = function () {
        const noBtn = document.getElementById('noBtn');
        const yesBtn = document.querySelector('.valentine-btn.yes');

        if (!noBtn || !yesBtn) return;

        const yesBtnRect = yesBtn.getBoundingClientRect();
        noBtn.style.position = 'fixed';

        const noW = noBtn.offsetWidth;
        const noH = noBtn.offsetHeight;
        const viewport = { minX: 20, minY: 20, maxX: window.innerWidth - noW - 20, maxY: window.innerHeight - noH - 20 };

        function rectsOverlap(a, b, padding = 20) {
            return !(a.right + padding < b.left || a.left - padding > b.right || a.bottom + padding < b.top || a.top - padding > b.bottom);
        }

        function isInsideViewport(x, y) {
            return x >= viewport.minX && x <= viewport.maxX && y >= viewport.minY && y <= viewport.maxY;
        }

        // Try to find a random non-overlapping position
        let attempts = 0;
        let placed = false;
        while (attempts < 200) {
            const rx = Math.round(viewport.minX + Math.random() * (viewport.maxX - viewport.minX));
            const ry = Math.round(viewport.minY + Math.random() * (viewport.maxY - viewport.minY));
            const cand = { left: rx, top: ry, right: rx + noW, bottom: ry + noH };
            if (isInsideViewport(rx, ry) && !rectsOverlap(yesBtnRect, cand, 12)) {
                noBtn.style.left = rx + 'px';
                noBtn.style.top = ry + 'px';
                placed = true;
                break;
            }
            attempts++;
        }

        if (!placed) {
            // fallback to a corner farthest from the Yes button
            const farX = (yesBtnRect.left < window.innerWidth / 2) ? viewport.maxX : viewport.minX;
            const farY = (yesBtnRect.top < window.innerHeight / 2) ? viewport.maxY : viewport.minY;
            noBtn.style.left = farX + 'px';
            noBtn.style.top = farY + 'px';
        }
    };

    window.acceptValentine = function () {
        const valentineQuestion = document.getElementById('valentineQuestion');
        const revealedContent = document.getElementById('revealedContent');
        const body = document.body;

        if (!valentineQuestion) return;

        valentineQuestion.style.opacity = '0';

        setTimeout(() => {
            // Ensure page is scrolled to the very top so revealed content is visible
            try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch (e) { window.scrollTo(0, 0); }

            valentineQuestion.style.display = 'none';
            body.classList.add('revealed');
            if (revealedContent) {
                revealedContent.classList.add('show');
                try { revealedContent.scrollIntoView({ behavior: 'auto', block: 'start' }); } catch (e) { }
            }
        }, 1000);
    };

    
    // Timeline animation on scroll
    const observerOptions = { threshold: 0.2, rootMargin: '0px 0px -100px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, observerOptions);
    document.querySelectorAll('.timeline-item').forEach(item => observer.observe(item));

    // Quiz functionality
    let currentQuestion = 1;
    let score = 0;
    const totalQuestions = 5;
    let answers = {};

    function attachQuizHandlers() {
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', function() {
                const question = this.closest('.quiz-question');
                question.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                answers[currentQuestion] = this.dataset.answer;
            });
        });

        window.nextQuestion = function() {
            if (!answers[currentQuestion]) { alert('Please select an answer before continuing! 💕'); return; }
            if (currentQuestion < totalQuestions) {
                document.querySelector(`[data-question="${currentQuestion}"]`).classList.remove('active');
                currentQuestion++;
                document.querySelector(`[data-question="${currentQuestion}"]`).classList.add('active');
                if (currentQuestion === totalQuestions) {
                    const nb = document.getElementById('next-btn');
                    if (nb) { nb.textContent = 'See Results'; nb.onclick = showResults; }
                }
            }
        };

        window.showResults = function() {
            if (!answers[currentQuestion]) { alert('Please select an answer before continuing! 💕'); return; }
            score = totalQuestions;
            const quizQuestions = document.getElementById('quiz-questions');
            if (quizQuestions) quizQuestions.style.display = 'none';
            const quizNav = document.querySelector('.quiz-nav');
            if (quizNav) quizNav.style.display = 'none';
            const quizResult = document.querySelector('.quiz-result');
            if (quizResult) quizResult.classList.add('show');
            const scoreEl = document.getElementById('score'); if (scoreEl) scoreEl.textContent = score;
            createConfetti();
        };

        window.resetQuiz = function() {
            currentQuestion = 1; score = 0; answers = {};
            const quizQuestions = document.getElementById('quiz-questions'); if (quizQuestions) quizQuestions.style.display = 'block';
            const quizNav = document.querySelector('.quiz-nav'); if (quizNav) quizNav.style.display = 'block';
            const quizResult = document.querySelector('.quiz-result'); if (quizResult) quizResult.classList.remove('show');
            const nb = document.getElementById('next-btn'); if (nb) { nb.textContent = 'Next'; nb.onclick = nextQuestion; }
            document.querySelectorAll('.quiz-question').forEach(q => q.classList.remove('active'));
            const first = document.querySelector('[data-question="1"]'); if (first) first.classList.add('active');
            document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
        };
    }

    attachQuizHandlers();

    // Confetti
    function createConfetti() {
        const colors = ['#ff9eb4', '#ffc4d6', '#e5d4ff', '#d4ffe5'];
        const confettiCount = 60;
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 3000);
            }, i * 30);
        }
    }

    // Candlelight functionality
    window.toggleCandle = function(candleElement) {
        candleElement.classList.toggle('lit');
        checkAllCandles();
    };

    window.lightAllCandles = function() { document.querySelectorAll('.candle').forEach(c => c.classList.add('lit')); showCandleMessage(); };
    window.blowOutAllCandles = function() { document.querySelectorAll('.candle').forEach(c => c.classList.remove('lit')); hideCandleMessage(); };

    function checkAllCandles() {
        const candles = document.querySelectorAll('.candle');
        const litCandles = document.querySelectorAll('.candle.lit');
        if (litCandles.length === candles.length) showCandleMessage(); else hideCandleMessage();
    }

    function showCandleMessage() { const message = document.getElementById('candleMessage'); if (message) message.classList.add('visible'); }
    function hideCandleMessage() { const message = document.getElementById('candleMessage'); if (message) message.classList.remove('visible'); }

    // Smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    /* ==============================
       Love Meter Logic
    ============================== */
    const sliderContainer = document.getElementById('sliderContainer');
    const sliderTrack = document.getElementById('sliderTrack');
    const sliderThumb = document.getElementById('sliderThumb');
    const percentage = document.getElementById('percentage');
    const finalMessage = document.getElementById('finalMessage');
    const meterSection = document.getElementById('loveMeterSection');

    // Auto-center love-meter when 60% visible with 40px gap at top
    if (meterSection) {
        (function(){
            let centered = false;
            const centerObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.intersectionRatio >= 0.6 && !centered) {
                        centered = true;
                        try {
                            const rect = meterSection.getBoundingClientRect();
                            const gapSize = 40;
                            const targetScroll = window.scrollY + rect.top - gapSize - (window.innerHeight / 2 - rect.height / 2);
                            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
                        } catch (e) {
                            meterSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    } else if (entry.intersectionRatio < 0.6) {
                        centered = false;
                    }
                });
            }, { threshold: [0, 0.6, 1] });
            centerObserver.observe(meterSection);
        })();
    }

    if (sliderContainer && sliderThumb) {
        let isDragging = false;
        let hasExploded = false;
        let currentValue = 0;
        let dragStartX = 0;
        let thumbStartLeft = 0;
        let containerRect = null;

        function initSlider() {
            containerRect = sliderContainer.getBoundingClientRect();
            updateThumbPosition(0);
        }

        function updateThumbPosition(value) {
            currentValue = value;
            const containerWidth = sliderContainer.offsetWidth;
            
            // Update percentage display
            if (percentage) percentage.textContent = Math.round(value) + '%';

            // Stretch the track and adjust thumb position if beyond 100%
            if (value > 100) {
                const excessValue = value - 100;
                const ballPositionRatio = value / 100;
                const stretchFactor = ballPositionRatio;
                sliderTrack.style.transform = `scaleX(${stretchFactor})`;
                sliderTrack.classList.add('stretching');
                
                const thumbLeft = containerWidth * stretchFactor;
                sliderThumb.style.left = thumbLeft + 'px';
                
                // Progressive shaking based on how far past 100%
                document.body.classList.remove('shake-light', 'shake-medium', 'shake-intense');
                if (excessValue > 20) {
                    document.body.classList.add('shake-intense');
                } else if (excessValue > 10) {
                    document.body.classList.add('shake-medium');
                } else {
                    document.body.classList.add('shake-light');
                }
            } else {
                sliderTrack.style.transform = 'scaleX(1)';
                sliderTrack.classList.remove('stretching');
                const thumbLeft = (value / 100) * containerWidth;
                sliderThumb.style.left = thumbLeft + 'px';
                document.body.classList.remove('shake-light', 'shake-medium', 'shake-intense');
            }
        }

        function handleDragStart(e) {
            if (hasExploded) return;
            
            isDragging = true;
            containerRect = sliderContainer.getBoundingClientRect();
            
            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            dragStartX = clientX;
            thumbStartLeft = sliderThumb.offsetLeft;
            
            document.body.style.userSelect = 'none';
        }

        function handleDragMove(e) {
            if (!isDragging || hasExploded) return;
            
            e.preventDefault();
            
            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const deltaX = clientX - dragStartX;
            const newLeft = thumbStartLeft + deltaX;
            
            const containerWidth = sliderContainer.offsetWidth;
            const newValue = (newLeft / containerWidth) * 100;
            
            // Allow dragging beyond 100%
            const clampedValue = Math.max(0, Math.min(newValue, 250));
            updateThumbPosition(clampedValue);
            
            // Trigger explosion if dragged beyond 200%
            if (clampedValue >= 200 && !hasExploded) {
                triggerExplosion();
            }
        }

        function handleDragEnd() {
            if (!isDragging) return;
            
            isDragging = false;
            document.body.style.userSelect = '';
            
            // Snap back if not exploded and beyond 100%
            if (!hasExploded && currentValue > 100) {
                setTimeout(() => {
                    updateThumbPosition(100);
                }, 100);
            } else if (!hasExploded) {
                // Remove shake classes if under 100%
                document.body.classList.remove('shake-light', 'shake-medium', 'shake-intense');
            }
        }

        function triggerExplosion() {
            if (hasExploded) return;
            hasExploded = true;

            // Remove progressive shake classes and add final intense shake
            document.body.classList.remove('shake-light', 'shake-medium');
            document.body.classList.add('shake-intense');

            // Slider escapes
            sliderTrack.classList.add('escaped');
            sliderThumb.style.display = 'none';

            // Escalate percentage
            if (percentage) {
                percentage.classList.add('explode');
            }
            
            setTimeout(() => {
                if (percentage) percentage.textContent = '1000%';
                createHeartBurst(8);
            }, 300);

            setTimeout(() => {
                if (percentage) percentage.textContent = '10,000%';
                createHeartBurst(12);
            }, 800);

            setTimeout(() => {
                if (percentage) percentage.textContent = '∞';
                createHeartBurst(20);
            }, 1500);

            // Show final message
            setTimeout(() => {
                document.body.classList.remove('shake-intense');
                if (finalMessage) finalMessage.classList.add('visible');
            }, 2500);
        }

        function createHeartBurst(count) {
            const section = document.getElementById('loveMeterSection');
            if (!section) return;
            
            const rect = section.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            for (let i = 0; i < count; i++) {
                const heart = document.createElement('div');
                heart.className = 'heart';
                heart.textContent = '❤️';
                
                // Random direction
                const angle = (Math.PI * 2 * i) / count;
                const distance = 200 + Math.random() * 200;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                const rotate = Math.random() * 720 - 360;

                heart.style.left = centerX + 'px';
                heart.style.top = centerY + 'px';
                heart.style.setProperty('--tx', tx + 'px');
                heart.style.setProperty('--ty', ty + 'px');
                heart.style.setProperty('--rotate', rotate + 'deg');
                heart.style.animationDelay = Math.random() * 0.2 + 's';

                document.body.appendChild(heart);

                // Remove heart after animation
                setTimeout(() => {
                    heart.remove();
                }, 2200);
            }
        }

        // Mouse events
        sliderThumb.addEventListener('mousedown', handleDragStart);
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);

        // Touch events
        sliderThumb.addEventListener('touchstart', handleDragStart, { passive: false });
        document.addEventListener('touchmove', handleDragMove, { passive: false });
        document.addEventListener('touchend', handleDragEnd);

        // Initialize
        window.addEventListener('load', initSlider);
        window.addEventListener('resize', initSlider);
    }

    /* ==============================
       Virtual Hug Logic
    ============================== */
    const hugButton = document.getElementById('hugButton');
    if (hugButton) {
        (function initEnhancedHug() {
            const button = document.getElementById('hugButton');
            const buttonWrapper = document.getElementById('buttonWrapper');
            const progress = document.getElementById('hugProgress');
            const meter = document.getElementById('tightnessMeter');
            const meterFill = document.getElementById('meterFill');
            const reveal = document.getElementById('hugReveal');
            const hugAgainBtn = document.getElementById('hugAgainBtn');

            let holdTimer = null;
            let holdStart = 0;
            const HOLD_TIME = 2000; // 2 seconds for a fuller experience



            // Start hold interaction
            function startHold(e) {
                e.preventDefault();
                holdStart = Date.now();
                progress.style.width = '0%';
                meterFill.style.width = '0%';
                
                button.classList.add('holding');
                meter.classList.add('visible');
                
                holdTimer = setInterval(() => {
                    const elapsed = Date.now() - holdStart;
                    const percent = Math.min((elapsed / HOLD_TIME) * 100, 100);
                    
                    progress.style.width = percent + '%';
                    meterFill.style.width = percent + '%';
                    
                    // Add more hearts as pressure increases
                    if (percent > 50 && Math.random() > 0.92) {
                        createTemporaryHeart();
                    }
                    
                    if (percent >= 100) {
                        completeHug();
                    }
                }, 16);
            }

            // Cancel hold
            function cancelHold() {
                if (!holdTimer) return;
                
                clearInterval(holdTimer);
                button.classList.remove('holding');
                
                setTimeout(() => {
                    progress.style.width = '0%';
                    meterFill.style.width = '0%';
                    meter.classList.remove('visible');
                }, 300);
            }

            // Complete hug sequence
            function completeHug() {
                clearInterval(holdTimer);
                button.classList.remove('holding');
                
                // Hide button and meter
                setTimeout(() => {
                    buttonWrapper.classList.add('hidden');
                }, 200);
                
                // Show hug reveal with delay
                setTimeout(() => {
                    reveal.classList.add('show');
                    createHeartBurst();
                }, 600);
            }

            // Create temporary heart on squeeze
            function createTemporaryHeart() {
                const heart = document.createElement('div');
                heart.textContent = '💖';
                heart.style.position = 'fixed';
                heart.style.fontSize = '1.2rem';
                heart.style.left = (30 + Math.random() * 40) + '%';
                heart.style.top = '50%';
                heart.style.pointerEvents = 'none';
                heart.style.animation = 'float-up 2s ease-out forwards';
                heart.style.opacity = '0';
                heart.style.zIndex = '1';
                
                document.body.appendChild(heart);
                
                setTimeout(() => heart.remove(), 2000);
            }

            // Create heart burst on completion
            function createHeartBurst() {
                for (let i = 0; i < 8; i++) {
                    setTimeout(() => {
                        const heart = document.createElement('div');
                        heart.textContent = '💞';
                        
                        const randomX = Math.random() * 200 - 100;
                        const randomY = Math.random() * 200 - 100;
                        const randomRotate = Math.random() * 360;
                        
                        heart.style.position = 'fixed';
                        heart.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
                        heart.style.left = (20 + Math.random() * 60) + '%';
                        heart.style.top = (20 + Math.random() * 60) + '%';
                        heart.style.pointerEvents = 'none';
                        heart.style.opacity = '0';
                        heart.style.zIndex = '1';
                        heart.style.animation = 'burst-fade 3s ease-out forwards';
                        heart.style.setProperty('--random-x', randomX + 'px');
                        heart.style.setProperty('--random-y', randomY + 'px');
                        heart.style.setProperty('--random-rotate', randomRotate + 'deg');
                        
                        // Update the animation dynamically
                        heart.style.transform = `translate(0, 0) scale(0.5) rotate(0deg)`;
                        
                        setTimeout(() => {
                            heart.style.transition = 'all 3s ease-out';
                            heart.style.opacity = '1';
                            setTimeout(() => {
                                heart.style.opacity = '0';
                                heart.style.transform = `translate(${randomX}px, ${randomY}px) scale(1.5) rotate(${randomRotate}deg)`;
                            }, 50);
                        }, 50);
                        
                        document.body.appendChild(heart);
                        setTimeout(() => heart.remove(), 3000);
                    }, i * 100);
                   }
            }

            // Reset hug
            function resetHug() {
                reveal.classList.remove('show');
                setTimeout(() => {
                    buttonWrapper.classList.remove('hidden');
                    progress.style.width = '0%';
                    meterFill.style.width = '0%';
                }, 500);
            }

            // Event listeners
            button.addEventListener('mousedown', startHold);
            button.addEventListener('touchstart', startHold, { passive: false });
            
            document.addEventListener('mouseup', cancelHold);
            document.addEventListener('touchend', cancelHold);
            
            hugAgainBtn.addEventListener('click', resetHug);

            // Initialize
        })();
    }
}

function initTimelineProofs() {
    const items = document.querySelectorAll('.timeline-item');
    
    // Create a shared popup element if it doesn't exist
    let popup = document.querySelector('.timeline-proof-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.className = 'timeline-proof-popup';
        document.body.appendChild(popup);
        
        // Allow interacting with popup without it closing immediately
        popup.addEventListener('mouseenter', () => {
            popup.dataset.hovered = 'true';
        });
        popup.addEventListener('mouseleave', () => {
            popup.dataset.hovered = 'false';
            clearPopup();
        });
    }

    // Helper to clear popup
    const clearPopup = () => {
        // Delay clearing to check if user moved to popup
        setTimeout(() => {
            if (popup.dataset.hovered === 'true') return;
            popup.style.opacity = '0';
            popup.style.transform = 'translate(-50%, -50%) scale(0.9)';
            popup.style.pointerEvents = 'none';
            // Clear content after transition to stop videos playing
            setTimeout(() => {
                if (popup.style.opacity === '0') popup.innerHTML = '';
            }, 300);
        }, 100);
    };

    items.forEach((item, index) => {
        const badge = item.querySelector('.timeline-proof-badge');
        if (badge) {
            // Try to get number from comment, fallback to index + 1
            let entryNumber = index + 1;
            let node = item.previousSibling;
            while (node) {
                if (node.nodeType === 8) { // Comment
                    const match = node.textContent.trim().match(/^(\d+)$/);
                    if (match) entryNumber = parseInt(match[1], 10);
                    break;
                }
                if (node.nodeType === 1) break;
                node = node.previousSibling;
            }
            let cachedMedia = null;
            
            badge.addEventListener('mouseenter', () => {
                popup.dataset.hovered = 'true'; // Temporarily mark as hovered to prevent race conditions
                
                if (cachedMedia) {
                    showMedia(cachedMedia);
                    return;
                }

                findAllMedia(entryNumber).then(results => {
                    if (popup.dataset.hovered !== 'true') return;
                    if (results && results.length > 0) {
                        cachedMedia = results;
                        showMedia(cachedMedia);
                    }
                });
            });
            
            badge.addEventListener('mouseleave', () => {
                popup.dataset.hovered = 'false';
                clearPopup();
            });
        }
    });

    function showMedia(mediaList) {
        popup.innerHTML = '';
        
        mediaList.forEach(media => {
            let el;
            if (media.type === 'video') {
                el = document.createElement('video');
                el.src = media.src;
                el.autoplay = true;
                el.loop = true;
                el.muted = true;
                el.playsInline = true;
                el.controls = true; // Add controls since it's a big popup now
            } else {
                el = document.createElement('img');
                el.src = media.src;
            }
            popup.appendChild(el);
        });
        
        requestAnimationFrame(() => {
            popup.style.opacity = '1';
            popup.style.transform = 'translate(-50%, -50%) scale(1)';
            popup.style.pointerEvents = 'all';
        });
    }

    async function findAllMedia(id) {
        const found = [];
        const extensions = ['mp4', 'jpg', 'png', 'jpeg', 'gif', 'webp'];
        // Check base ID (e.g., 1.jpg) and suffixes (e.g., 1a.jpg, 1b.jpg)
        const suffixes = ['', 'a', 'b', 'c', 'd', 'e']; 

        // Generate all possible candidates
        const candidates = [];
        
        suffixes.forEach(suffix => {
            extensions.forEach(ext => {
                const type = ext === 'mp4' ? 'video' : 'img';
                // Check {id}{suffix}.{ext} (e.g. 1.jpg, 1a.jpg)
                candidates.push({ src: `timeline-pics/${id}${suffix}.${ext}`, type });
            });
        });

        // Check them all (in parallel for speed)
        const checks = candidates.map(async (cand) => {
            const exists = await checkLoad(cand.src, cand.type);
            if (exists) return cand;
            return null;
        });

        const results = await Promise.all(checks);
        return results.filter(r => r !== null);
    }

    function checkLoad(src, type) {
        return new Promise(resolve => {
            if (type === 'img') {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = src;
            } else {
                const video = document.createElement('video');
                video.onloadedmetadata = () => resolve(true);
                video.onerror = () => resolve(false);
                video.src = src;
            }
        });
    }
}

// Load partials then initialize
document.addEventListener('DOMContentLoaded', function() {
    loadIncludes().then(() => {
        initSite();
    }).catch(err => {
        console.error('Include load error:', err);
        initSite();
    });
});

// Keybind for 'P' to skip pages
document.addEventListener('keydown', function(event) {
    if (event.key === 'q') {
        // Skip terminal page
        showValentineQuestion();
        // Then skip valentine question after a short delay
        setTimeout(() => {
            acceptValentine();
        }, 600);
    }
});
