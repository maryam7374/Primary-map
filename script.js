// Salzburg Dining Guide Map JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map centered on Salzburg
    const map = L.map('map').setView([47.8000, 13.0400], 14);

    // Add tile layer
    L.tileLayer('https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=E1MkBYN2ExP7HxidRw8c', {
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
                     '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
    }).addTo(map);

    // Define color schemes for different cuisine categories
    const cuisineColors = {
        "Asian": "#FF6B6B",
        "European": "#4ECDC4",
        "Vegan/Vegetarian": "#82C91E",
        "Latin American/Mexican": "#FF922B",
        "Middle Eastern": "#F06595",
        "International": "#748FFC"
    };

    // Restaurant data
    const restaurants = [
        {coordinates: [47.8002674, 13.045302], name: "Spice Garden", cuisine: "indian;thai;international", category: "Asian", veg: "yes"},
        {coordinates: [47.8031766, 13.0467797], name: "Bamboo House", cuisine: "asian", category: "Asian", veg: "yes"},
        {coordinates: [47.8036863, 13.0449625], name: "Pasta e Basta", cuisine: "italian_pizza", category: "European", veg: "no"},
        {coordinates: [47.8034423, 13.045115], name: "Taco Fiesta", cuisine: "mexican", category: "Latin American/Mexican", veg: "no"},
        {coordinates: [47.7997381, 13.0392385], name: "Alpine Delight", cuisine: "austrian", category: "European", veg: "yes"},
        {coordinates: [47.8071885, 13.0015493], name: "Dragon Palace", cuisine: "east_asian", category: "Asian", veg: "no"},
        {coordinates: [47.7979803, 13.0488221], name: "Trattoria Romana", cuisine: "italian", category: "European", veg: "no"},
        {coordinates: [47.7980147, 13.0302833], name: "Aegean Breeze", cuisine: "greek", category: "Middle Eastern", veg: "yes"},
        {coordinates: [47.7731812, 13.0707202], name: "Golden Wok", cuisine: "chinese", category: "Asian", veg: "no"},
        {coordinates: [47.7889688, 13.0367412], name: "Thai Orchid", cuisine: "thai", category: "Asian", veg: "no"},
        {coordinates: [47.8114551, 13.0595557], name: "Pasta Pronto", cuisine: "italian", category: "European", veg: "yes"},
        {coordinates: [47.8032461, 13.0468322], name: "Sakura Sushi", cuisine: "japanese", category: "Asian", veg: "no"},
        {coordinates: [47.7748653, 13.0678221], name: "Pizza Napoli", cuisine: "italian", category: "European", veg: "yes"},
        {coordinates: [47.7974646, 13.0325585], name: "Ristorante Venezia", cuisine: "italian", category: "European", veg: "yes"},
        {coordinates: [47.8003489, 13.0423762], name: "Panda Express", cuisine: "chinese", category: "Asian", veg: "yes"},
        {coordinates: [47.8001529, 13.0429729], name: "Gelato Paradiso", cuisine: "italian", category: "European", veg: "yes"},
        {coordinates: [47.8009881, 13.0389575], name: "Pasta Amore", cuisine: "italian", category: "European", veg: "yes"},
        {coordinates: [47.8031478, 13.0465494], name: "Pizza Express", cuisine: "italian;pizza", category: "European", veg: "no"},
        {coordinates: [47.802277, 13.0666072], name: "Ocean Sushi", cuisine: "asian;sushi;seafood", category: "Asian", veg: "no"},
        {coordinates: [47.80382, 13.047351], name: "Global Bites", cuisine: "burger;italian;chinese", category: "International", veg: "no"}
    ];

    // Create layer groups for each cuisine category
    const layerGroups = {};
    Object.keys(cuisineColors).forEach(function(category) {
        layerGroups[category] = L.layerGroup();
    });

    // Store all markers for filtering
    const allMarkers = [];

    // Function to create custom marker icon
    function createMarkerIcon(color, isVeg) {
        const iconHtml = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                         <circle cx="12" cy="12" r="10" fill="${color}" stroke="#000" stroke-width="1"/>
                         ${isVeg ? '<text x="12" y="15" font-size="10" text-anchor="middle" fill="white" font-weight="bold">V</text>' : ''}
                         </svg>`;
        
        return L.divIcon({
            html: iconHtml,
            className: 'custom-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    }

    // Function to create popup content
    function createPopupContent(restaurant) {
        return `<div class='restaurant-info'>${restaurant.name}</div>
                <div class='restaurant-info'>Cuisine: ${restaurant.cuisine}</div>
                <div class='cuisine-type'>Category: ${restaurant.category}</div>
                ${restaurant.veg === "yes" ? '<div class="veg-info">✓ Vegan/Vegetarian options</div>' : ''}`;
    }

    // Add markers to the map
    restaurants.forEach(function(restaurant) {
        const color = cuisineColors[restaurant.category];
        const icon = createMarkerIcon(color, restaurant.veg === "yes");
        const marker = L.marker(restaurant.coordinates, {icon: icon});
        
        marker.bindPopup(createPopupContent(restaurant));
        marker.restaurantData = restaurant;
        allMarkers.push(marker);
        
        // Add to vegan layer if applicable
        if (restaurant.veg === "yes") {
            layerGroups["Vegan/Vegetarian"].addLayer(marker);
        }
        
        // Add to main category layer
        layerGroups[restaurant.category].addLayer(marker);
    });

    // Prepare overlay layers for control
    const overlayMaps = {};
    Object.keys(cuisineColors).forEach(function(category) {
        overlayMaps[category] = layerGroups[category];
        if (category !== "Vegan/Vegetarian") {
            layerGroups[category].addTo(map); // Add all layers except vegan by default
        }
    });

    // Add layer control
    L.control.layers(null, overlayMaps, {
        collapsed: false,
        position: 'topright'
    }).addTo(map);

    // Add legend
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'info legend');
        
        Object.keys(cuisineColors).forEach(category => {
            const color = cuisineColors[category];
            const legendIcon = `<span class="legend-icon" style="background:${color}">
                               ${category === "Vegan/Vegetarian" ? 'V' : ''}
                               </span>`;
            
            div.innerHTML += `<div style="margin: 5px 0; display: flex; align-items: center;">
                             ${legendIcon}
                             <span>${category}</span>
                             </div>`;
        });
        
        return div;
    };
    legend.addTo(map);

    // Filter Control
    class FilterControl extends L.Control {
        constructor() {
            super({position: 'topleft'});
        }
        
        onAdd() {
            const container = L.DomUtil.create('div', 'filter-control');
            container.innerHTML = `
                <label for="cuisine-filter">Filter by Cuisine:</label>
                <select id="cuisine-filter">
                    <option value="all">All Cuisines</option>
                    <option value="indian">Indian</option>
                    <option value="thai">Thai</option>
                    <option value="italian">Italian</option>
                    <option value="pizza">Pizza</option>
                    <option value="mexican">Mexican</option>
                    <option value="austrian">Austrian</option>
                    <option value="chinese">Chinese</option>
                    <option value="japanese">Japanese</option>
                    <option value="sushi">Sushi</option>
                    <option value="greek">Greek</option>
                    <option value="burger">Burger</option>
                    <option value="seafood">Seafood</option>
                </select>
                <button id="apply-filter">Apply Filter</button>
                <button id="reset-filter">Reset</button>
            `;
            
            L.DomEvent.on(container.querySelector('#apply-filter'), 'click', this.applyFilter);
            L.DomEvent.on(container.querySelector('#reset-filter'), 'click', this.resetFilter);
            
            return container;
        }
        
        applyFilter() {
            const selectedCuisine = document.getElementById('cuisine-filter').value;
            
            allMarkers.forEach(marker => map.removeLayer(marker));
            
            if (selectedCuisine === "all") {
                allMarkers.forEach(marker => map.addLayer(marker));
            } else {
                allMarkers.forEach(marker => {
                    if (marker.restaurantData.cuisine.includes(selectedCuisine)) {
                        map.addLayer(marker);
                    }
                });
            }
        }
        
        resetFilter() {
            document.getElementById('cuisine-filter').value = "all";
            this.applyFilter();
        }
    }
    
    // Add filter control to map
    map.addControl(new FilterControl());
});