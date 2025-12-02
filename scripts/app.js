/* VARIABLES PRINCIPALES */
const allRecipes = recipes.slice();         // Tableau complet (intouchable)
let filteredRecipes = allRecipes.slice();   // Tableau filtré dynamique

/* Tags actifs */
let selectedIngredients = [];
let selectedAppliances = [];
let selectedUstensils = [];


/* ACCÈS DOM */
const grid = document.getElementById("recipes-grid");
const searchInput = document.getElementById("search");
const searchForm = document.querySelector("form.search");
const ingredientsPanel = document.getElementById("ingredients-options");
const appliancesPanel  = document.getElementById("appliances-options");
const ustensilsPanel   = document.getElementById("ustensils-options");
const tagsContainer = document.querySelector(".tags");
const filterPanels = document.querySelectorAll(".filter-panel");


/* MOTEUR : MATCH DE LA RECHERCHE TEXTE */
function recipeMatchesQuery(recipe, query){
    const term = query.toLowerCase();
    // Nom
    if (recipe.name.toLowerCase().indexOf(term) !== -1) return true;
    // Description
    if (recipe.description.toLowerCase().indexOf(term) !== -1) return true;
    // Appareil
    if (recipe.appliance && recipe.appliance.toLowerCase().indexOf(term) !== -1) return true;
    // Ingrédients
    for (let i = 0; i < recipe.ingredients.length; i++){
        const ing = recipe.ingredients[i].ingredient.toLowerCase();
        if (ing.indexOf(term) !== -1) return true;
    }
    // Ustensiles
    for (let i = 0; i < recipe.ustensils.length; i++){
        const ust = recipe.ustensils[i].toLowerCase();
        if (ust.indexOf(term) !== -1) return true;
    }
    return false;
}


/* RECHERCHE PRINCIPALE (TEXTE) */
function applySearch(query){
    const q = query.trim().toLowerCase();
    // Reset des tags
    selectedIngredients = [];
    selectedAppliances  = [];
    selectedUstensils   = [];
    renderTags();
    // Si moins de 3 lettres → reset complet
    if (q.length < 3){
        filteredRecipes = [];
        for (let i = 0; i < allRecipes.length; i++){
            filteredRecipes.push(allRecipes[i]);
        }
    }
    else {
        const result = [];
        for (let i = 0; i < allRecipes.length; i++){
            if (recipeMatchesQuery(allRecipes[i], q)){
                result.push(allRecipes[i]);
            }
        }
        filteredRecipes = result;
    }
    updateUI();
}


/* FILTRAGE PAR TAGS (ING / APP / UST) */
function applyFilters(){
    const base = [];
    for (let i = 0; i < filteredRecipes.length; i++){
        base.push(filteredRecipes[i]);
    }
    let temp = base;
    let result;
    /* Ingrédients */
    if (selectedIngredients.length > 0){
        result = [];
        for (let i = 0; i < temp.length; i++){
            const recipe = temp[i];
            let matchAll = true;
            for (let j = 0; j < selectedIngredients.length; j++){
                const tag = selectedIngredients[j];
                let found = false;
                for (let k = 0; k < recipe.ingredients.length; k++){
                    if (recipe.ingredients[k].ingredient.toLowerCase() === tag){
                        found = true;
                        break;
                    }
                }
                if (!found){
                    matchAll = false;
                    break;
                }
            }
            if (matchAll) result.push(recipe);
        }
        temp = result;
    }

    /* Appareils */
    if (selectedAppliances.length > 0){
        result = [];
        for (let i = 0; i < temp.length; i++){
            const recipe = temp[i];
            let matchAll = true;
            for (let j = 0; j < selectedAppliances.length; j++){
                if (recipe.appliance.toLowerCase() !== selectedAppliances[j]){
                    matchAll = false;
                    break;
                }
            }
            if (matchAll) result.push(recipe);
        }
        temp = result;
    }

    /* Ustensiles */
    if (selectedUstensils.length > 0){
        result = [];
        for (let i = 0; i < temp.length; i++){
            const recipe = temp[i];
            let matchAll = true;
            for (let j = 0; j < selectedUstensils.length; j++){
                const tag = selectedUstensils[j];
                let found = false;
                for (let k = 0; k < recipe.ustensils.length; k++){
                    if (recipe.ustensils[k].toLowerCase() === tag){
                        found = true;
                        break;
                    }
                }
                if (!found){
                    matchAll = false;
                    break;
                }
            }
            if (matchAll) result.push(recipe);
        }
        temp = result;
    }

    filteredRecipes = temp;
    updateUI();
}


/* FERMETURE AUTOMATIQUE DES PANNEAUX FILTRES */
(function setupPanelCloseOnClick(){
    for (let i = 0; i < filterPanels.length; i++){
        const panel = filterPanels[i];
        panel.addEventListener("click", (e)=>{
            if (e.target.classList.contains("filter-option")){
                const parent = panel.closest(".filter");
                if (parent) parent.classList.remove("filter--open");
            }
        });
    }
})();


/* AFFICHAGE DES CARTES DE RECETTES */
function renderAllRecipes(list){
    grid.innerHTML = "";
    for (let i = 0; i < list.length; i++){
        const recipe = list[i];
        let ingredientsHTML = "";
        for (let j = 0; j < recipe.ingredients.length; j++){
            const ing = recipe.ingredients[j];
            let qty = "–";
            if (ing.quantity !== undefined){
                qty = ing.quantity + (ing.unit ? " " + ing.unit : "");
            }
            ingredientsHTML += `
                <div class="ing">
                    <dt>${ing.ingredient}</dt>
                    <dd>${qty}</dd>
                </div>`;
        }
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
                <dl class="ingredients">${ingredientsHTML}</dl>
            </div>
        `;
        grid.append(article);
    }
    // Mise à jour compteur
    const counter = document.querySelector(".counter");
    if (counter){
        const c = list.length;
        counter.textContent = c + " recette" + (c > 1 ? "s" : "");
    }
}


/* EXTRACTION : LISTES */
const getIngredients = list => {
    const arr = [];
    for (let i = 0; i < list.length; i++){
        const recipe = list[i];
        for (let j = 0; j < recipe.ingredients.length; j++){
            const name = recipe.ingredients[j].ingredient.toLowerCase();
            let exists = false;
            for (let k = 0; k < arr.length; k++){
                if (arr[k] === name){
                    exists = true;
                    break;
                }
            }
            if (!exists) arr.push(name);
        }
    }

    arr.sort();
    return arr;
};

const getAppliances = list => {
    const arr = [];
    for (let i = 0; i < list.length; i++){
        const name = list[i].appliance.toLowerCase();
        let exists = false;
        for (let j = 0; j < arr.length; j++){
            if (arr[j] === name){
                exists = true;
                break;
            }
        }
        if (!exists) arr.push(name);
    }

    arr.sort();
    return arr;
};

const getUstensils = list => {
    const arr = [];
    for (let i = 0; i < list.length; i++){
        const recipe = list[i];
        for (let j = 0; j < recipe.ustensils.length; j++){
            const name = recipe.ustensils[j].toLowerCase();
            let exists = false;
            for (let k = 0; k < arr.length; k++){
                if (arr[k] === name){
                    exists = true;
                    break;
                }
            }
            if (!exists) arr.push(name);
        }
    }

    arr.sort();
    return arr;
};


/* REMPLISSAGE DES PANNEAUX FILTRES */
function fillPanel(container, values, selectedArray){
    container.innerHTML = "";
    for (let i = 0; i < values.length; i++){
        const v = values[i];
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "filter-option";
        btn.dataset.value = v;
        btn.textContent = v.charAt(0).toUpperCase() + v.slice(1);
        btn.onclick = () => {
            let exists = false;
            for (let j = 0; j < selectedArray.length; j++){
                if (selectedArray[j] === v){
                    exists = true;
                    break;
                }
            }
            if (!exists){
                selectedArray.push(v);
                applyFilters();
            }
        };
        li.append(btn);
        container.append(li);
    }
}


/* RECHERCHE À L’INTÉRIEUR DES FILTRES */
function setupFilterSearch(){
    const filters = document.querySelectorAll(".filter");
    for (let i = 0; i < filters.length; i++){
        const filter = filters[i];
        const input  = filter.querySelector(".filter-input");
        const clearBtn = filter.querySelector(".filter-clear");
        const panel = filter.querySelector(".filter-panel");
        if (!input || !clearBtn || !panel) continue;
        input.oninput = () => {
            if (input.value.trim().length > 0){
                clearBtn.classList.add("visible");
            } else {
                clearBtn.classList.remove("visible");
            }
            const q = input.value.toLowerCase();
            const options = panel.querySelectorAll(".filter-option");
            for (let j = 0; j < options.length; j++){
                const opt = options[j];
                const text = opt.dataset.value || opt.textContent.toLowerCase();
                if (text.indexOf(q) !== -1){
                    opt.parentElement.style.display = "";
                } else {
                    opt.parentElement.style.display = "none";
                }
            }
        };
        clearBtn.onclick = () => {
            input.value = "";
            clearBtn.classList.remove("visible");
            const options = panel.querySelectorAll(".filter-option");
            for (let j = 0; j < options.length; j++){
                options[j].parentElement.style.display = "";
            }
        };
    }
}


/* AFFICHAGE DES PASTILLES TAGS */
function renderTags(){
    tagsContainer.innerHTML = "";
    function addPill(type, text){
        const pill = document.createElement("div");
        pill.className = "pill";
        pill.innerHTML = `
            <span>${text}</span>
            <button data-type="${type}" data-value="${text}">✕</button>
        `;
        tagsContainer.append(pill);
    }
    for (let i = 0; i < selectedIngredients.length; i++) addPill("ingredient", selectedIngredients[i]);
    for (let i = 0; i < selectedAppliances.length; i++) addPill("appliance", selectedAppliances[i]);
    for (let i = 0; i < selectedUstensils.length; i++) addPill("ustensil", selectedUstensils[i]);
    const buttons = tagsContainer.querySelectorAll("button");
    for (let i = 0; i < buttons.length; i++){
        const btn = buttons[i];
        btn.onclick = () => {
            const type = btn.dataset.type;
            const val  = btn.dataset.value;
            if (type === "ingredient"){
                for (let j = selectedIngredients.length - 1; j >= 0; j--){
                    if (selectedIngredients[j] === val){
                        selectedIngredients.splice(j, 1);
                    }
                }
            }
            if (type === "appliance"){
                for (let j = selectedAppliances.length - 1; j >= 0; j--){
                    if (selectedAppliances[j] === val){
                        selectedAppliances.splice(j, 1);
                    }
                }
            }
            if (type === "ustensil"){
                for (let j = selectedUstensils.length - 1; j >= 0; j--){
                    if (selectedUstensils[j] === val){
                        selectedUstensils.splice(j, 1);
                    }
                }
            }
            // Reconstruction depuis recherche texte
            const q = searchInput.value.trim().toLowerCase();
            if (q.length < 3){
                filteredRecipes = allRecipes.slice();
            }
            else {
                const list = [];
                for (let j = 0; j < allRecipes.length; j++){
                    if (recipeMatchesQuery(allRecipes[j], q)){
                        list.push(allRecipes[j]);
                    }
                }
                filteredRecipes = list;
            }
            applyFilters();
        };
    }
}


/* MISE À JOUR UI */
function updateUI(){
    renderAllRecipes(filteredRecipes);
    const ingList = getIngredients(filteredRecipes);
    const appList = getAppliances(filteredRecipes);
    const ustList = getUstensils(filteredRecipes);
    fillPanel(ingredientsPanel, ingList, selectedIngredients);
    fillPanel(appliancesPanel,  appList, selectedAppliances);
    fillPanel(ustensilsPanel,   ustList, selectedUstensils);
    renderTags();
    setupFilterSearch();
}


/* INITIALISATION */
document.addEventListener("DOMContentLoaded", ()=>{
    // Clone initial
    filteredRecipes = [];
    for (let i = 0; i < allRecipes.length; i++){
        filteredRecipes.push(allRecipes[i]);
    }
    updateUI();
    if (searchForm){
        searchForm.addEventListener("submit", (e)=>{
            e.preventDefault();
            applySearch(searchInput.value);
        });
    }
    const filters = document.querySelectorAll(".filter");
    for (let i = 0; i < filters.length; i++){
        const f = filters[i];
        const toggle = f.querySelector(".filter-toggle");
        if (!toggle) continue;
        toggle.onclick = () => {
            for (let j = 0; j < filters.length; j++){
                const other = filters[j];
                if (other !== f) other.classList.remove("filter--open");
            }
            f.classList.toggle("filter--open");
        };
    }
});
