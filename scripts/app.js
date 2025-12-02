/* variables principales - Tableau complet - Base de travail */
const allRecipes = recipes.slice();

/* Tableau après recherche + tags */
let filteredRecipes = allRecipes.slice();

/* Tableaux liste tags actifs */
let selectedIngredients = [];
let selectedAppliances = [];
let selectedUstensils = [];

/* raccourcis DOM */
const grid            = document.getElementById("recipes-grid");           // Zone affichage cards
const searchInput     = document.getElementById("search");                 // Champ de recherche (prioritaire)
const searchForm      = document.querySelector("form.search");             // Formulaire
const ingredientsPanel = document.getElementById("ingredients-options");   // Tag ingrédients
const appliancesPanel  = document.getElementById("appliances-options");    // Tag appareils
const ustensilsPanel   = document.getElementById("ustensils-options");     // Tag ustensiles
const tagsContainer    = document.querySelector(".tags");                  // Tag pastille
const filterButtons = document.querySelectorAll(".filter-button");         // Bouton ouverture filtres
const filterPanels = document.querySelectorAll(".filter-panel");           // Selection all listes


/* Vérification texte appelé par applySearch() + suppression pastille */
function recipeMatchesQuery(recipe, query) {
    const term = query.toLowerCase(); // normalisation
    if (recipe.name.toLowerCase().includes(term)) return true; // Nom de recette
    if (recipe.description.toLowerCase().includes(term)) return true; // Description
    if (recipe.appliance && recipe.appliance.toLowerCase().includes(term)) return true; // Appareil
    const hasIng = recipe.ingredients.some(ing =>
        ing.ingredient.toLowerCase().includes(term)
    );
    if (hasIng) return true; // Ingrédients
    const hasUst = recipe.ustensils.some(ust =>
        ust.toLowerCase().includes(term)
    );
    if (hasUst) return true; // Ustensiles
    return false; // Si no critère alors rejet
}


/* Recherche Texte (prioritaire) reset tags + filtrage texte */
function applySearch(query) {
    const q = query.trim().toLowerCase(); // Reset des tags à chaque recherche
    selectedIngredients = [];
    selectedAppliances  = [];
    selectedUstensils   = [];
    renderTags(); // Affichage direct
    // mini 3 caractères
    if (q.length < 3) {
        filteredRecipes = allRecipes.slice();
    }
    // Sinon filtrage textuel
    else {
        filteredRecipes = allRecipes.filter(recipe =>
            recipeMatchesQuery(recipe, q)
        );
    }
    updateUI(); // Mise à jour globale
}


/* Filtrage par tags x3 basé sur applySearch() */
function applyFilters() {
    let temp = filteredRecipes.slice(); // Base = filtrage texte
    // Filtres par Ingrédients
    if (selectedIngredients.length) {
        temp = temp.filter(recipe =>
            selectedIngredients.every(tag =>
                recipe.ingredients.some(ing => ing.ingredient.toLowerCase() === tag)
            )
        );
    }
    // Filtres par Appareils
    if (selectedAppliances.length) {
        temp = temp.filter(recipe =>
            selectedAppliances.every(tag =>
                recipe.appliance.toLowerCase() === tag
            )
        );
    }
    // Filtres par Ustensiles
    if (selectedUstensils.length) {
        temp = temp.filter(recipe =>
            selectedUstensils.every(tag =>
                recipe.ustensils.map(u => u.toLowerCase()).includes(tag)
            )
        );
    }

    filteredRecipes = temp;
    updateUI(); // update instant
}


/* fermeture des panneaux filtres */
filterPanels.forEach(panel => {
    panel.addEventListener("click", (e) => {
        if (e.target.classList.contains("filter-option")) {
            // Fermer le panneau parent
            const parentFilter = panel.closest(".filter");
            if (parentFilter) {
                parentFilter.classList.remove("filter--open");
            }
        }
    });
});


/* affichage des cartes recettes */
function renderAllRecipes(list) {
    grid.innerHTML = ""; // Reset visuel
    list.forEach(recipe => {
        const article = document.createElement("article");
        article.className = "card";
        article.innerHTML = `
            <div class="card-media">
                <img src="assets/Recipes/${recipe.image}" alt="${recipe.name}" loading="lazy"/>
                <span class="badge-time">${recipe.time}min</span>
            </div>
            <div class="card-body">
                <h3 class="card-title">${recipe.name}</h3>
                <h4 class="block-title">Recette</h4>
                <p class="card-text">${recipe.description}</p>
                <h4 class="block-title">Ingrédients</h4>
                <dl class="ingredients">
                    ${recipe.ingredients.map(ing => `
                        <div class="ing">
                            <dt>${ing.ingredient}</dt>
                            <dd>${ing.quantity ? (ing.quantity + (ing.unit ? " " + ing.unit : "")) : "–"}</dd>
                        </div>
                    `).join("")}
                </dl>
            </div>
        `;
        grid.append(article);
    });

    // Mise à jour compteur
    const counter = document.querySelector(".counter");
    if (counter) {
        const c = list.length;
        counter.textContent = `${c} recette${c > 1 ? "s" : ""}`;
    }
}


/* extraction des listes pour les filtres */
const getIngredients = list => {
    const set = new Set();
    list.forEach(r => r.ingredients.forEach(i => set.add(i.ingredient.toLowerCase())));
    return [...set].sort();
};

const getAppliances = list => {
    const set = new Set();
    list.forEach(r => set.add(r.appliance.toLowerCase()));
    return [...set].sort();
};

const getUstensils = list => {
    const set = new Set();
    list.forEach(r => r.ustensils.forEach(u => set.add(u.toLowerCase())));
    return [...set].sort();
};


/* remplissage dynamique des panneaux filtres */
function fillPanel(container, values, selectedArray) {
    container.innerHTML = ""; // reset
    values.forEach(v => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "filter-option";
        btn.textContent = v.charAt(0).toUpperCase() + v.slice(1);
        btn.dataset.value = v;
        // Clic item = création pastille + 
        btn.onclick = () => {
            if (!selectedArray.includes(v)) {
                selectedArray.push(v);
                applyFilters();
            }
        };

        li.append(btn);
        container.append(li);
    });
}


/* recherche interne dans les panneaux filtres */
function setupFilterSearch() {
    document.querySelectorAll(".filter").forEach(filter => {
        const input = filter.querySelector(".filter-input");
        const clearBtn = filter.querySelector(".filter-clear");
        const panel = filter.querySelector(".filter-panel");
        
        if (!input || !clearBtn) return;
        
        // Recherche au fur et à mesure de la frappe
        input.addEventListener("input", () => {
            if (input.value.trim().length > 0) {
                clearBtn.classList.add("visible");
            } else {
                clearBtn.classList.remove("visible");
            }
            const query = input.value.toLowerCase();
            const options = panel.querySelectorAll(".filter-option");
            
            options.forEach(option => {
                const text = option.dataset.value || option.textContent.toLowerCase();
                if (text.includes(query)) {
                    option.parentElement.style.display = "";
                } else {
                    option.parentElement.style.display = "none";
                }
            });
        });
        
        // Croix champs recherche
        clearBtn.addEventListener("click", () => {
            input.value = "";
            clearBtn.classList.remove("visible"); // Visible uniquement quand texte
            const options = panel.querySelectorAll(".filter-option");
            options.forEach(option => {
                option.parentElement.style.display = "";
            });
        });
    });
}


/* pastilles de tags */
function renderTags() {
    tagsContainer.innerHTML = ""; // reset visuel
    function addPill(type, text) {
        const pill = document.createElement("div");
        pill.className = "pill"
        pill.innerHTML = `
            <span>${text}</span>
            <button data-type="${type}" data-value="${text}">✕</button>
        `;
        tagsContainer.append(pill);
    }
    // Pastilles selon type
    selectedIngredients.forEach(t => addPill("ingredient", t));
    selectedAppliances.forEach(t => addPill("appliance", t));
    selectedUstensils.forEach(t => addPill("ustensil", t));
    // suppression + update
    tagsContainer.querySelectorAll("button").forEach(btn => {
        btn.onclick = () => {
            const type = btn.dataset.type;
            const val  = btn.dataset.value;
            // Retrait du tag dans le tableau correspondant
            if (type === "ingredient") selectedIngredients = selectedIngredients.filter(t => t !== val);
            if (type === "appliance") selectedAppliances   = selectedAppliances.filter(t => t !== val);
            if (type === "ustensil")  selectedUstensils    = selectedUstensils.filter(t => t !== val);
            //reset from recherche texte
            const q = searchInput.value.trim().toLowerCase();
            // Pas de recherche = allRecipes
            if (q.length < 3) {
                filteredRecipes = allRecipes.slice();
            }
            // Recipes correspondant à la recherche texte
            else {
                filteredRecipes = allRecipes.filter(r =>
                    recipeMatchesQuery(r, q)
                );
            }
            applyFilters();
        };
    });
}


/* mise à jour globale de l'interface */
function updateUI() {
    // Affichage des cartes
    renderAllRecipes(filteredRecipes);
    // Update des 3 tags en fonction des recettes présentes
    fillPanel(ingredientsPanel, getIngredients(filteredRecipes), selectedIngredients);
    fillPanel(appliancesPanel,  getAppliances(filteredRecipes),  selectedAppliances);
    fillPanel(ustensilsPanel,   getUstensils(filteredRecipes),   selectedUstensils);
    renderTags();
    // Réinitialiser la recherche dans les panneaux
    setupFilterSearch();
}


/* initialisation au chargement */
document.addEventListener("DOMContentLoaded", () => {
    updateUI(); // First affichage all recipes
    // Gestion du bouton recherche
    if (searchForm) {
        searchForm.addEventListener("submit", e => {
            e.preventDefault();
            applySearch(searchInput.value);
        });
    }
    // Ouverture/fermeture des 3 panneaux filtres
    document.querySelectorAll(".filter").forEach(f => {
        const toggle = f.querySelector(".filter-toggle");
        if (toggle) {
            toggle.onclick = () => {
                // Fermer tous les autres filtres
                document.querySelectorAll(".filter").forEach(otherFilter => {
                    if (otherFilter !== f) {
                        otherFilter.classList.remove("filter--open");
                    }
                });
                // Toggle le filtre actuel
                f.classList.toggle("filter--open");
            };
        }
    });
});
