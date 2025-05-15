

    document.addEventListener('DOMContentLoaded', function () {
        // --- Global State (Example) ---
        let currentSelectedColor = 'Steel Blue';
        let currentSelectedSize = 'Medium';
        const MAX_COMPARE_COLORS = 3;
        let colorsForComparison = [];

        // --- DOM Elements ---
        const mainProductImage = document.getElementById('mainProductImage');
        const mainProductImageZoom = document.getElementById('mainProductImageZoom');
        const thumbnailGallery = document.querySelector('.thumbnail-gallery');
        const colorOptionButtons = document.querySelectorAll('#colorOptions .color-swatch');
        const sizeOptionButtons = document.querySelectorAll('#sizeOptions .size-button');
        const selectedColorName = document.getElementById('selectedColorName');
        const selectedSizeName = document.getElementById('selectedSizeName');
        const productStateColor = document.getElementById('productStateColor');
        const productStateSize = document.getElementById('productStateSize');

        const sizeChartButton = document.getElementById('sizeChartButton');
        const sizeChartModal = document.getElementById('sizeChartModal');
        const closeSizeChartModal = document.getElementById('closeSizeChartModal');
        const closeSizeChartModalBottom = document.getElementById('closeSizeChartModalBottom');

        const compareColorsButton = document.getElementById('compareColorsButton');
        const compareColorsModal = document.getElementById('compareColorsModal');
        const closeCompareColorsModal = document.getElementById('closeCompareColorsModal');
        const closeCompareColorsModalBottom = document.getElementById('closeCompareColorsModalBottom');
        const compareColorSwatchesContainer = document.getElementById('compareColorSwatchesContainer');
        const comparisonArea = document.getElementById('comparisonArea');
        const comparisonPlaceholder = document.getElementById('comparisonPlaceholder');
        const resetComparisonButton = document.getElementById('resetComparisonButton');

        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        const mobileMenuButton = document.getElementById('mobileMenuButton');
        const mobileMenu = document.getElementById('mobileMenu');
        
        const currentYearSpan = document.getElementById('currentYear');
        if(currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

        // --- Helper Functions ---
        function openModal(modalElement) {
            modalElement.classList.remove('hidden', 'opacity-0', 'visibility-hidden');
            modalElement.classList.add('opacity-100', 'visibility-visible');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }

        function closeModal(modalElement) {
            modalElement.classList.add('opacity-0', 'visibility-hidden');
            modalElement.classList.remove('opacity-100', 'visibility-visible');
             // Small delay to allow animation before removing 'hidden' which might cause flicker
            setTimeout(() => {
                modalElement.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }, 300); // Match transition duration
        }

        function updateProductStateDisplay() {
            if (selectedColorName) selectedColorName.textContent = currentSelectedColor;
            if (selectedSizeName) selectedSizeName.textContent = currentSelectedSize;
            if (productStateColor) productStateColor.textContent = currentSelectedColor;
            if (productStateSize) productStateSize.textContent = currentSelectedSize;
            // Persist to localStorage (Bonus)
            localStorage.setItem('selectedProductColor', currentSelectedColor);
            localStorage.setItem('selectedProductSize', currentSelectedSize);
        }

        // --- 1. Product Image Gallery ---
        if (thumbnailGallery && mainProductImage) {
            const thumbnails = thumbnailGallery.querySelectorAll('img');
            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', function () {
                    const fullImageSrc = this.dataset.fullimage;
                    mainProductImage.src = fullImageSrc;
                    mainProductImage.alt = this.alt.replace('Thumbnail', 'Main Product Image');
                    
                    // For Zoom
                    if (mainProductImageZoom) {
                        mainProductImageZoom.src = fullImageSrc;
                        mainProductImageZoom.alt = this.alt.replace('Thumbnail', 'Main Product Image Zoom');
                    }

                    // Update active thumbnail style
                    thumbnails.forEach(t => t.classList.remove('active-thumbnail'));
                    this.classList.add('active-thumbnail');
                });
            });
        }

        // --- Bonus: Image Zoom on Hover ---
        const mainImageContainer = document.querySelector('.main-image-container');
        if (mainImageContainer && mainProductImage && mainProductImageZoom) {
            mainImageContainer.addEventListener('mousemove', function(e) {
                const rect = mainImageContainer.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const xPercent = (x / rect.width) * 100;
                const yPercent = (y / rect.height) * 100;

                mainProductImageZoom.style.transformOrigin = `${xPercent}% ${yPercent}%`;
                mainProductImageZoom.style.transform = 'scale(2)'; // Zoom factor
                mainProductImageZoom.style.opacity = '1';
                mainProductImage.style.opacity = '0';
            });

            mainImageContainer.addEventListener('mouseleave', function() {
                mainProductImageZoom.style.transform = 'scale(1)';
                mainProductImageZoom.style.opacity = '0';
                mainProductImage.style.opacity = '1';
            });
        }


        // --- 2. Size Chart Modal ---
        if (sizeChartButton && sizeChartModal && closeSizeChartModal && closeSizeChartModalBottom) {
            sizeChartButton.addEventListener('click', () => openModal(sizeChartModal));
            closeSizeChartModal.addEventListener('click', () => closeModal(sizeChartModal));
            closeSizeChartModalBottom.addEventListener('click', () => closeModal(sizeChartModal));
            sizeChartModal.addEventListener('click', (event) => { // Close on overlay click
                if (event.target === sizeChartModal) closeModal(sizeChartModal);
            });
        }

        // --- 3. Product Variants (Color & Size) ---
        if (colorOptionButtons.length > 0) {
            colorOptionButtons.forEach(button => {
                button.addEventListener('click', function () {
                    currentSelectedColor = this.dataset.color;
                    const newImage = this.dataset.image;
                    if (newImage && mainProductImage) {
                         mainProductImage.src = newImage;
                         mainProductImage.alt = `Main Product Image - ${currentSelectedColor}`;
                         if (mainProductImageZoom) mainProductImageZoom.src = newImage; // Update zoom image too
                    }
                    // Update styles
                    colorOptionButtons.forEach(btn => btn.classList.remove('selected-swatch'));
                    this.classList.add('selected-swatch');
                    updateProductStateDisplay();
                });
            });
        }

        if (sizeOptionButtons.length > 0) {
            sizeOptionButtons.forEach(button => {
                button.addEventListener('click', function () {
                    currentSelectedSize = this.dataset.size;
                    // Update styles
                    sizeOptionButtons.forEach(btn => {
                        btn.classList.remove('bg-blue-500', 'text-white');
                        btn.classList.add('hover:bg-gray-100');
                    });
                    this.classList.add('bg-blue-500', 'text-white');
                    this.classList.remove('hover:bg-gray-100');
                    updateProductStateDisplay();
                });
            });
        }

        // --- 4. Compare Colours Modal ---
        function populateCompareColorSwatches() {
            if (!compareColorSwatchesContainer) return;
            compareColorSwatchesContainer.innerHTML = ''; // Clear existing
            colorOptionButtons.forEach(originalSwatch => {
                const newSwatch = document.createElement('button');
                newSwatch.className = 'compare-color-swatch w-12 h-12 rounded-full border-2 border-gray-300 focus:outline-none transition-all duration-150 ease-in-out';
                newSwatch.style.backgroundColor = originalSwatch.style.backgroundColor;
                newSwatch.dataset.color = originalSwatch.dataset.color;
                newSwatch.title = originalSwatch.dataset.color;
                newSwatch.setAttribute('aria-label', `Select ${originalSwatch.dataset.color} for comparison`);

                if (colorsForComparison.find(c => c.color === newSwatch.dataset.color)) {
                    newSwatch.classList.add('selected-for-compare');
                }

                newSwatch.addEventListener('click', function() {
                    toggleColorForComparison(this.dataset.color, this.style.backgroundColor, this);
                });
                compareColorSwatchesContainer.appendChild(newSwatch);
            });
        }

        function toggleColorForComparison(colorName, bgColor, swatchElement) {
            const existingIndex = colorsForComparison.findIndex(c => c.color === colorName);
            if (existingIndex > -1) {
                colorsForComparison.splice(existingIndex, 1);
                swatchElement.classList.remove('selected-for-compare');
            } else {
                if (colorsForComparison.length < MAX_COMPARE_COLORS) {
                    colorsForComparison.push({ color: colorName, bgColor: bgColor });
                    swatchElement.classList.add('selected-for-compare');
                } else {
                    // Optional: Provide feedback that max is reached
                    alert(`You can select a maximum of ${MAX_COMPARE_COLORS} colors to compare.`);
                }
            }
            renderComparisonArea();
        }

        function renderComparisonArea() {
            if (!comparisonArea || !comparisonPlaceholder) return;
            comparisonArea.innerHTML = '';
            if (colorsForComparison.length === 0) {
                comparisonArea.appendChild(comparisonPlaceholder);
            } else {
                colorsForComparison.forEach(item => {
                    const colorBlock = document.createElement('div');
                    colorBlock.className = 'h-32 rounded-md flex items-center justify-center text-white font-semibold text-sm p-2 shadow-inner';
                    colorBlock.style.backgroundColor = item.bgColor;
                    // Make text color readable against background
                    const rgb = item.bgColor.match(/\d+/g);
                    if (rgb) {
                        const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
                        colorBlock.style.color = brightness > 125 ? 'black' : 'white';
                    }
                    colorBlock.textContent = item.color;
                    comparisonArea.appendChild(colorBlock);
                });
            }
        }
        
        if (resetComparisonButton) {
            resetComparisonButton.addEventListener('click', () => {
                colorsForComparison = [];
                populateCompareColorSwatches(); // Re-render swatches to remove selection styles
                renderComparisonArea();
            });
        }


        if (compareColorsButton && compareColorsModal && closeCompareColorsModal && closeCompareColorsModalBottom) {
            compareColorsButton.addEventListener('click', () => {
                populateCompareColorSwatches();
                renderComparisonArea(); // Ensure it's initially correct
                openModal(compareColorsModal);
            });
            closeCompareColorsModal.addEventListener('click', () => closeModal(compareColorsModal));
            closeCompareColorsModalBottom.addEventListener('click', () => closeModal(compareColorsModal));
            compareColorsModal.addEventListener('click', (event) => {
                if (event.target === compareColorsModal) closeModal(compareColorsModal);
            });
        }

        // --- 7. Tabs for Product Info ---
        if (tabButtons.length > 0 && tabContents.length > 0) {
            tabButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const tabId = this.dataset.tab;

                    // Update button active states
                    tabButtons.forEach(btn => btn.classList.remove('active-tab', 'border-blue-500', 'text-blue-600'));
                    tabButtons.forEach(btn => btn.classList.add('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300'));
                    
                    this.classList.add('active-tab', 'border-blue-500', 'text-blue-600');
                    this.classList.remove('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');


                    // Update content visibility
                    tabContents.forEach(content => content.classList.remove('active-tab-content'));
                    const activeContent = document.getElementById(tabId + 'Content');
                    if (activeContent) activeContent.classList.add('active-tab-content');
                });
            });
        }

        // --- ESC Key to close modals ---
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                if (!sizeChartModal.classList.contains('hidden')) closeModal(sizeChartModal);
                if (!compareColorsModal.classList.contains('hidden')) closeModal(compareColorsModal);
            }
        });

        // --- Mobile Menu Toggle ---
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // --- Bonus: Persist selected color/size using localStorage (Load on init) ---
        const savedColor = localStorage.getItem('selectedProductColor');
        const savedSize = localStorage.getItem('selectedProductSize');

        if (savedColor) {
            const colorButtonToSelect = Array.from(colorOptionButtons).find(btn => btn.dataset.color === savedColor);
            if (colorButtonToSelect) colorButtonToSelect.click();
        }
        if (savedSize) {
            const sizeButtonToSelect = Array.from(sizeOptionButtons).find(btn => btn.dataset.size === savedSize);
            if (sizeButtonToSelect) sizeButtonToSelect.click();
        }
        // Initial update if nothing was loaded from localStorage
        updateProductStateDisplay();


    }); // End DOMContentLoaded
