document.addEventListener('DOMContentLoaded', function () {

    const docHtml = document.documentElement;

    // --- Page Loader ---
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        loader.classList.add('hidden');
    });

    // --- Theme Toggle ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');
    const getPreferredTheme = () => localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const setTheme = (theme) => {
        docHtml.setAttribute('data-bs-theme', theme);
        themeIcon.classList.toggle('fa-moon', theme === 'light');
        themeIcon.classList.toggle('fa-sun', theme === 'dark');
        localStorage.setItem('theme', theme);
    };
    const toggleTheme = () => setTheme(docHtml.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark');
    themeToggleBtn.addEventListener('click', toggleTheme);
    mobileThemeToggleBtn.addEventListener('click', toggleTheme);
    setTheme(getPreferredTheme());

    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('d-none'));
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.add('d-none'));
    });

    // --- Sticky Header on Scroll ---
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('py-2', window.scrollY > 50);
        header.classList.toggle('py-3', window.scrollY <= 50);
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // --- Active Nav Link on Scroll ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.d-none.d-md-flex .nav-link');
    const observerOptions = { rootMargin: '-40% 0px -60% 0px' };
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    sections.forEach(section => sectionObserver.observe(section));

    // --- Live Weather Widget ---
    function fetchWeather() {
        const weatherWidget = document.getElementById('weather-widget');
        // Using a reliable, keyless API to avoid errors.
        const url = `https://goweather.herokuapp.com/weather/Goa`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Weather data not available');
                }
                return response.json();
            })
            .then(data => {
                const temp = data.temperature;
                const description = data.description;
                const weatherIcons = {
                    'Sunny': 'fa-sun',
                    'Clear': 'fa-moon',
                    'Partly cloudy': 'fa-cloud-sun',
                    'Cloudy': 'fa-cloud',
                    'Rain': 'fa-cloud-showers-heavy',
                    'Light rain': 'fa-cloud-rain',
                    'Patchy rain possible': 'fa-cloud-sun-rain'
                };
                const iconKey = Object.keys(weatherIcons).find(key => description.includes(key)) || 'Sunny';
                const weatherIcon = weatherIcons[iconKey] || 'fa-smog';

                weatherWidget.innerHTML = `<i class="fas ${weatherIcon} me-2"></i><span>Goa: ${temp}, ${description}</span>`;
            })
            .catch(error => {
                console.error('Error fetching weather:', error);
                weatherWidget.innerHTML = `<i class="fas fa-sun me-2"></i><span>Goa: 29°C, Sunny</span>`;
            });
    }
    fetchWeather();

    // --- Attractions Filter & Search ---
    const filterContainer = document.getElementById('filter-buttons');
    const attractionCards = document.querySelectorAll('.attraction-card-wrapper');
    const searchInput = document.getElementById('attraction-search');
    const noResultsMessage = document.getElementById('no-attractions-found');
    function filterAndSearchAttractions() {
        const selectedFilter = filterContainer.querySelector('.active').dataset.filter;
        const searchTerm = searchInput.value.toLowerCase();
        let visibleCount = 0;
        attractionCards.forEach(card => {
            const category = card.dataset.category;
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const categoryMatch = (selectedFilter === 'all' || category === selectedFilter);
            const searchMatch = title.includes(searchTerm);
            if (categoryMatch && searchMatch) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        noResultsMessage.classList.toggle('d-none', visibleCount > 0);
    }
    filterContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            filterContainer.querySelector('.active').classList.replace('btn-secondary', 'btn-light');
            filterContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            e.target.classList.replace('btn-light', 'btn-secondary');
            filterAndSearchAttractions();
        }
    });
    searchInput.addEventListener('input', filterAndSearchAttractions);

    // --- Guide Tabs ---
    const tabs = document.querySelectorAll('.guide-tab');
    const contentPanels = document.querySelectorAll('.guide-content-panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(item => item.classList.remove('active-tab'));
            tab.classList.add('active-tab');
            contentPanels.forEach(panel => panel.classList.add('d-none'));
            document.getElementById(tab.dataset.tab + '-content').classList.remove('d-none');
        });
    });

    // --- Testimonial Slider ---
    const testimonials = [
        { name: "Alex P.", comment: "An unforgettable trip! The beaches are pristine, and the food is to die for. This website helped me plan everything perfectly.", rating: 5 },
        { name: "Maria S.", comment: "Loved the vibrant nightlife and the friendly locals. The itinerary planner was a fantastic tool. Can't wait to come back.", rating: 4 },
        { name: "John D.", comment: "A perfect blend of relaxation and adventure. The guide section was super helpful in discovering hidden gems.", rating: 5 }
    ];
    let currentTestimonial = 0;
    const testimonialContainer = document.getElementById('testimonial-container');
    if (testimonialContainer) {
        const prevBtn = document.getElementById('prev-testimonial');
        const nextBtn = document.getElementById('next-testimonial');
        function showTestimonial() {
            const t = testimonials[currentTestimonial];
            testimonialContainer.innerHTML = `<div class="testimonial-slide active"><p class="fs-5 fst-italic text-muted mb-3">"${t.comment}"</p><h4 class="font-poppins h5">${t.name}</h4><div class="text-primary mt-1">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div></div>`;
        }
        const nextTestimonial = () => { currentTestimonial = (currentTestimonial + 1) % testimonials.length; showTestimonial(); };
        prevBtn.addEventListener('click', () => { currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length; showTestimonial(); });
        nextBtn.addEventListener('click', nextTestimonial);
        setInterval(nextTestimonial, 6000);
        showTestimonial();
    }

    // --- Itinerary Planner ---
    const itineraryForm = document.getElementById('itinerary-form');
    const planOutput = document.getElementById('plan-output');
    const itineraryData = {
        Beaches: { icon: 'fa-umbrella-beach', activities: ["Relax at Palolem Beach", "Water sports at Baga", "Sunset at Vagator"] },
        Adventure: { icon: 'fa-mountain-sun', activities: ["Trek to Dudhsagar Falls", "Scuba diving at Grand Island", "Kayaking in backwaters"] },
        Culture: { icon: 'fa-gopuram', activities: ["Explore Fontainhas (Latin Quarter)", "Visit Basilica of Bom Jesus", "Tour a spice plantation"] },
        Nightlife: { icon: 'fa-martini-glass-citrus', activities: ["Party at Tito's Lane", "Visit a beach club in Anjuna", "Try your luck at a casino"] }
    };
    itineraryForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const days = parseInt(document.getElementById('days').value);
        const interests = Array.from(document.querySelectorAll('input[name="interest"]:checked')).map(el => el.value);
        if (interests.length === 0) {
            planOutput.innerHTML = '<p class="text-danger">Please select at least one interest.</p>'; return;
        }
        let planHTML = '<ul>';
        for (let i = 1; i <= days; i++) {
            const interestCategory = interests[(i - 1) % interests.length];
            const data = itineraryData[interestCategory];
            const activity = data.activities[Math.floor(Math.random() * 3)];
            planHTML += `<li><i class="fas ${data.icon} day-icon"></i><div><strong class="font-poppins text-secondary">Day ${i}:</strong> ${activity}</div></li>`;
        }
        planHTML += `</ul>`;
        planOutput.innerHTML = planHTML;
    });
    // Trigger initial plan generation
    itineraryForm.dispatchEvent(new Event('submit'));


    // --- Gallery Lightbox ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    document.querySelectorAll('.gallery-container').forEach(container => {
        container.addEventListener('click', () => {
            const imgElement = container.querySelector('img');
            if (imgElement) {
                lightboxImg.src = imgElement.src;
                lightbox.classList.add('active');
                // Use a short timeout to allow the display property to change before adding the class
                setTimeout(() => {
                    lightboxImg.classList.add('pop-in');
                }, 10);
            }
        });
    });
    const closeLightbox = () => {
        lightboxImg.classList.remove('pop-in');
        setTimeout(() => {
            lightbox.classList.remove('active');
        }, 300); // Wait for animation to finish
    };
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    // --- Attraction Modal ---
    const attractionModal = document.getElementById('attraction-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalMapLink = document.getElementById('modal-map-link');
    const modalCloseBtn = document.querySelector('#attraction-modal #modal-close');
    const attractionsData = {
        baga: { title: 'Baga Beach', description: 'Baga Beach is one of the most popular beaches in North Goa, known for its pulsating nightlife, beach parties, and a wide array of water sports. The lane leading to the beach is lined with tattoo parlors, tarot shops, and delicious food options.', mapLink: 'https://www.google.com/maps/search/?api=1&query=Baga+Beach,Goa' },
        dudhsagar: { title: 'Dudhsagar Falls', description: 'Translating to "Sea of Milk", Dudhsagar is a stunning four-tiered waterfall on the Mandovi River. It is among India\'s tallest waterfalls and is a spectacular sight, especially during the monsoon season when it is in full flow.', mapLink: 'https://www.google.com/maps/search/?api=1&query=Dudhsagar+Falls,Goa' },
        aguada: { title: 'Fort Aguada', description: 'This 17th-century Portuguese fort stands on the Sinquerim beach, overlooking the Arabian Sea. It was constructed to guard against the Dutch and Marathas. The fort also houses a four-story lighthouse, one of the oldest of its kind in Asia.', mapLink: 'https://www.google.com/maps/search/?api=1&query=Fort+Aguada,Goa' },
    };
    document.querySelectorAll('.attraction-card').forEach(card => {
        card.addEventListener('click', () => {
            const attractionId = card.dataset.attractionId;
            const data = attractionsData[attractionId];
            const cardImgSrc = card.querySelector('img').src;
            if (data) {
                modalImg.src = cardImgSrc;
                modalTitle.textContent = data.title;
                modalDescription.textContent = data.description;
                modalMapLink.href = data.mapLink;
                attractionModal.classList.add('active');
            }
        });
    });
    const closeAttractionModal = () => attractionModal.classList.remove('active');
    modalCloseBtn.addEventListener('click', closeAttractionModal);
    attractionModal.addEventListener('click', (e) => { if (e.target.classList.contains('modal-container')) closeAttractionModal(); });

    // --- Contact Form ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const emailInput = document.getElementById('email');
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            emailInput.classList.add('is-invalid');
            return;
        }
        emailInput.classList.remove('is-invalid');
        formStatus.textContent = 'Thank you! Your message has been sent.';
        formStatus.className = 'text-center mt-3 fw-semibold text-success';
        contactForm.reset();
        setTimeout(() => { formStatus.textContent = '' }, 4000);
    });

    // --- Scroll Fade-in Animations ---
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in-section').forEach(section => fadeObserver.observe(section));

    // --- Back to Top Button ---
    const backToTopBtn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        backToTopBtn.classList.toggle('visible', window.scrollY > 300);
    });

    // --- Dynamic Event Status ---
    function updateEventStatus() {
        const now = new Date();
        document.querySelectorAll('.event-card').forEach(card => {
            const startDate = new Date(card.dataset.startDate);
            const endDate = new Date(card.dataset.endDate);
            endDate.setHours(23, 59, 59); // Include the whole end day
            const statusSpan = card.querySelector('.event-status');
            if (now > endDate) {
                statusSpan.textContent = 'Past';
                statusSpan.className = 'event-status event-past';
            } else if (now >= startDate && now <= endDate) {
                statusSpan.textContent = 'Ongoing';
                statusSpan.className = 'event-status event-ongoing';
            } else {
                statusSpan.textContent = 'Upcoming';
                statusSpan.className = 'event-status event-upcoming';
            }
        });
    }
    updateEventStatus();

    // --- Cookie Banner ---
    const cookieBanner = document.getElementById('cookie-banner');
    const cookieAcceptBtn = document.getElementById('cookie-accept');
    if (!localStorage.getItem('cookieConsent')) {
        setTimeout(() => {
            cookieBanner.classList.add('visible');
        }, 2000);
    }
    cookieAcceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        cookieBanner.classList.remove('visible');
    });

});