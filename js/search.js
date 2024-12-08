document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    let searchIndex = [];
    let uniqueCategories = new Set();
    let uniqueTags = new Set();

    if (!searchInput || !searchResults) {
        console.error('Search elements not found');
        return;
    }

    console.log('Search functionality initialized');

    // Fetch all courses data
    fetch('/index.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            searchIndex = data;
            // Extract unique categories and tags
            searchIndex.forEach(item => {
                if (item.categories) {
                    item.categories.forEach(cat => uniqueCategories.add(cat));
                }
                if (item.tags) {
                    item.tags.forEach(tag => uniqueTags.add(tag));
                }
            });
            console.log('Search index loaded:', searchIndex.length, 'items');
        })
        .catch(error => {
            console.error('Error loading search index:', error);
            // Try alternative path
            fetch('/hugo-lms/index.json')
                .then(response => response.json())
                .then(data => {
                    searchIndex = data;
                    // Extract unique categories and tags
                    searchIndex.forEach(item => {
                        if (item.categories) {
                            item.categories.forEach(cat => uniqueCategories.add(cat));
                        }
                        if (item.tags) {
                            item.tags.forEach(tag => uniqueTags.add(tag));
                        }
                    });
                    console.log('Search index loaded from alternative path:', searchIndex.length, 'items');
                })
                .catch(error => console.error('Error loading alternative search index:', error));
        });

    // Debounce function to limit API calls
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Function to get matching categories and tags
    function getMatchingMetadata(query) {
        const matchingCategories = Array.from(uniqueCategories)
            .filter(cat => cat.toLowerCase().includes(query.toLowerCase()))
            .map(cat => ({
                type: 'category',
                value: cat,
                relatedCourses: searchIndex.filter(course => 
                    course.categories && course.categories.includes(cat)
                ).length
            }));

        const matchingTags = Array.from(uniqueTags)
            .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
            .map(tag => ({
                type: 'tag',
                value: tag,
                relatedCourses: searchIndex.filter(course => 
                    course.tags && course.tags.includes(tag)
                ).length
            }));

        return [...matchingCategories, ...matchingTags];
    }

    // Function to format taxonomy term for URL
    function formatTaxonomyURL(term) {
        return term.toLowerCase()
                  .replace(/\s+/g, '-')     // Replace spaces with hyphens
                  .replace(/[^a-z0-9-]/g, '') // Remove special characters
                  .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
                  .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }

    // Function to create a metadata badge
    function createMetadataBadge(text, type) {
        return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            type === 'category' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
        }">${text}</span>`;
    }

    // Function to display metadata (categories and tags)
    function displayMetadata(categories = [], tags = []) {
        const metadataItems = [];
        
        if (categories && categories.length > 0) {
            metadataItems.push(...categories.map(cat => 
                `<a href="/categories/${formatTaxonomyURL(cat)}/" class="hover:opacity-75 transition-opacity">
                    ${createMetadataBadge(cat, 'category')}
                </a>`
            ));
        }
        
        if (tags && tags.length > 0) {
            metadataItems.push(...tags.map(tag => 
                `<a href="/tags/${formatTaxonomyURL(tag)}/" class="hover:opacity-75 transition-opacity">
                    ${createMetadataBadge(tag, 'tag')}
                </a>`
            ));
        }
        
        return metadataItems.length > 0 
            ? `<div class="flex flex-wrap gap-1 mt-1">${metadataItems.join('')}</div>`
            : '';
    }

    // Function to perform search
    function performSearch(query) {
        console.log('Performing search for:', query);
        
        if (!query) {
            searchResults.style.display = 'none';
            return;
        }

        if (!searchIndex || searchIndex.length === 0) {
            console.log('Search index is empty');
            return;
        }

        // Get matching metadata
        const metadataResults = getMatchingMetadata(query);

        // Get matching courses
        const courseResults = searchIndex.filter(item => {
            if (!item || !item.title) {
                console.log('Invalid item in search index:', item);
                return false;
            }
            const titleMatch = item.title.toLowerCase().includes(query.toLowerCase());
            const descriptionMatch = item.description && item.description.toLowerCase().includes(query.toLowerCase());
            const categoryMatch = item.categories && item.categories.some(cat => 
                cat.toLowerCase().includes(query.toLowerCase())
            );
            const tagMatch = item.tags && item.tags.some(tag => 
                tag.toLowerCase().includes(query.toLowerCase())
            );
            return titleMatch || descriptionMatch || categoryMatch || tagMatch;
        }).slice(0, 5); // Limit to 5 course results

        console.log('Search results:', { metadata: metadataResults, courses: courseResults });
        displayResults(metadataResults, courseResults);
    }

    // Function to display results
    function displayResults(metadataResults, courseResults) {
        if (metadataResults.length === 0 && courseResults.length === 0) {
            searchResults.innerHTML = '<div class="px-4 py-2 text-sm text-gray-500">No results found</div>';
            searchResults.style.display = 'block';
            return;
        }

        let resultsHTML = '';

        // Add metadata section if there are matches
        if (metadataResults.length > 0) {
            resultsHTML += `
                <div class="px-4 py-2 bg-gray-50">
                    <h4 class="text-xs font-semibold text-gray-500 uppercase">Categories & Tags</h4>
                </div>
                ${metadataResults.map(item => `
                    <a href="${item.type === 'category' ? '/categories/' : '/tags/'}${formatTaxonomyURL(item.value)}/" 
                       class="block px-4 py-2 hover:bg-gray-100 transition-colors duration-150">
                        <div class="flex items-center justify-between">
                            <span class="inline-flex items-center">
                                ${createMetadataBadge(item.value, item.type)}
                            </span>
                            <span class="text-xs text-gray-500">${item.relatedCourses} course${item.relatedCourses !== 1 ? 's' : ''}</span>
                        </div>
                    </a>
                `).join('')}
            `;
        }

        // Add courses section if there are matches
        if (courseResults.length > 0) {
            resultsHTML += `
                <div class="px-4 py-2 bg-gray-50 ${metadataResults.length > 0 ? 'border-t' : ''}">
                    <h4 class="text-xs font-semibold text-gray-500 uppercase">Courses</h4>
                </div>
                ${courseResults.map(result => `
                    <a href="${result.permalink}" class="block px-4 py-2 hover:bg-gray-100 transition-colors duration-150">
                        <div class="flex items-start">
                            ${result.thumbnail ? 
                                `<img src="${result.thumbnail}" alt="${result.title}" class="w-12 h-12 object-cover rounded mr-3">` :
                                ''
                            }
                            <div class="flex-1 min-w-0">
                                <h3 class="text-sm font-medium text-gray-900 truncate">${result.title}</h3>
                                ${result.description ? 
                                    `<p class="text-xs text-gray-500 mt-1 line-clamp-2">${result.description}</p>` :
                                    ''
                                }
                                ${displayMetadata(result.categories, result.tags)}
                            </div>
                        </div>
                    </a>
                `).join('')}
            `;
        }

        searchResults.innerHTML = resultsHTML;
        searchResults.style.display = 'block';
    }

    // Handle input changes
    searchInput.addEventListener('input', debounce(function(e) {
        performSearch(e.target.value);
    }, 300));

    // Handle click outside to close results
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // Handle focus to show results again
    searchInput.addEventListener('focus', function(e) {
        if (this.value) {
            performSearch(this.value);
        }
    });
});
