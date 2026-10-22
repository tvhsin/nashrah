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
            timeline.scrollLeft += e.deltaY * 10;
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
