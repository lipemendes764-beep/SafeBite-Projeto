// Dados padrão dos itens do cardápio
const defaultMenuItems = [];

// Carregar dados do localStorage ou usar dados padrão
let menuItems = loadMenuItems();

// Função para carregar dados do localStorage
function loadMenuItems() {
    const saved = localStorage.getItem('menuItems');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Erro ao carregar dados do localStorage:', e);
            return [...defaultMenuItems];
        }
    }
    return [...defaultMenuItems];
}

// Função para salvar dados no localStorage
function saveMenuItems() {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
}

let currentFilter = 'todos';
let selectedItem = null;
let nextId = 11;

// Renderizar tabela
function renderTable() {
    const tbody = document.getElementById('menuTable');
    const filteredItems = currentFilter === 'todos'
        ? menuItems
        : menuItems.filter(item => item.category.toLowerCase() === getCategoryName(currentFilter));

    tbody.innerHTML = filteredItems.map(item => `
        <tr onclick="showDetails(${item.id})" class="${selectedItem?.id === item.id ? 'selected' : ''}">
            <td>
                <img src="${item.image}" alt="${item.name}" class="item-image" onerror="this.src='https://via.placeholder.com/48?text=Sem+Imagem'">
            </td>
            <td>
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description}</div>
            </td>
            <td>${item.category}</td>
            <td>R$ ${item.price.toFixed(2)}</td>
            <td>
                <span class="status-badge ${item.status === 'active' ? 'status-active' : 'status-inactive'}">
                    ${item.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>
                <div class="action-icons">
                    <span class="action-icon" onclick="event.stopPropagation(); editItem(${item.id})" title="Editar">✏️</span>
                    <span class="action-icon" onclick="event.stopPropagation(); deleteItem(${item.id})" title="Excluir">🗑️</span>
                </div>
            </td>
        </tr>
    `).join('');
}

// Converter filtro para nome de categoria
function getCategoryName(filter) {
    const map = {
        'entradas': 'entradas',
        'principais': 'pratos principais',
        'sobremesas': 'sobremesas',
        'bebidas': 'bebidas'
    };
    return map[filter] || '';
}

// Mostrar detalhes do item
function showDetails(itemId) {
    selectedItem = menuItems.find(item => item.id === itemId);
    if (!selectedItem) return;

    const panel = document.getElementById('detailsPanel');
    const content = document.getElementById('detailsContent');
    const mainContent = document.getElementById('mainContent');

    content.innerHTML = `
        <img src="${selectedItem.image}" alt="${selectedItem.name}" class="details-image" onerror="this.src='https://via.placeholder.com/300x200?text=Sem+Imagem'">

        <div class="detail-group">
            <div class="detail-label">Nome do Prato</div>
            <div class="detail-value detail-value-large">${selectedItem.name}</div>
        </div>

        <div class="detail-group">
            <div class="detail-label">Descrição</div>
            <div class="detail-value">${selectedItem.description}</div>
        </div>

        <div class="detail-group">
            <div class="detail-label">Categoria</div>
            <div class="detail-value">${selectedItem.category}</div>
        </div>

        <div class="detail-group">
            <div class="detail-label">Preço</div>
            <div class="detail-value detail-value-large">R$ ${selectedItem.price.toFixed(2)}</div>
        </div>

        <div class="detail-group">
            <div class="detail-label">Ingredientes</div>
            <div class="detail-value">${selectedItem.ingredients}</div>
        </div>

        <div class="detail-group">
            <div class="detail-label">Alérgenos</div>
            <div class="tags">
                ${selectedItem.allergens.split(',').map(allergen =>
            `<span class="tag">${allergen.trim()}</span>`
        ).join('')}
            </div>
        </div>

        <div class="detail-group">
            <div class="detail-label">Informações Nutricionais</div>
            <div class="nutritional-info">
                <div class="nutrition-item">
                    <div class="nutrition-label">Calorias</div>
                    <div class="nutrition-value">${selectedItem.calories || 0}</div>
                </div>
                <div class="nutrition-item">
                    <div class="nutrition-label">Proteínas (g)</div>
                    <div class="nutrition-value">${selectedItem.protein || 0}</div>
                </div>
                <div class="nutrition-item">
                    <div class="nutrition-label">Carboidratos (g)</div>
                    <div class="nutrition-value">${selectedItem.carbs || 0}</div>
                </div>
                <div class="nutrition-item">
                    <div class="nutrition-label">Gorduras (g)</div>
                    <div class="nutrition-value">${selectedItem.fat || 0}</div>
                </div>
            </div>
        </div>

        <div class="detail-group">
            <button class="btn btn-primary" style="width: 100%; margin-bottom: 8px;" onclick="editItem(${selectedItem.id})">Editar Item</button>
            <button class="btn btn-secondary" style="width: 100%;" onclick="toggleStatus(${selectedItem.id})">
                ${selectedItem.status === 'active' ? 'Desativar' : 'Ativar'} Item
            </button>
        </div>
    `;

    panel.classList.add('open');
    mainContent.classList.add('with-details');
    renderTable();
}

// Fechar painel de detalhes
function closeDetails() {
    const panel = document.getElementById('detailsPanel');
    const mainContent = document.getElementById('mainContent');
    panel.classList.remove('open');
    mainContent.classList.remove('with-details');
    selectedItem = null;
    renderTable();
}

// Abrir modal de novo item
function openNewItemModal() {
    document.getElementById('newItemModal').classList.add('open');
    document.getElementById('newItemForm').reset();
}

// Fechar modal de novo item
function closeNewItemModal() {
    document.getElementById('newItemModal').classList.remove('open');
}

// Processar formulário de novo item
function handleSubmitNewItem(event) {
    event.preventDefault();

    const newItem = {
        id: nextId++,
        name: document.getElementById('itemName').value,
        description: document.getElementById('itemDescription').value,
        category: document.getElementById('itemCategory').value,
        price: parseFloat(document.getElementById('itemPrice').value),
        status: document.getElementById('itemStatus').value,
        image: document.getElementById('itemImage').value || 'https://via.placeholder.com/200?text=Sem+Imagem',
        ingredients: document.getElementById('itemIngredients').value,
        allergens: document.getElementById('itemAllergens').value || 'Nenhum',
        calories: parseInt(document.getElementById('itemCalories').value) || 0,
        protein: parseInt(document.getElementById('itemProtein').value) || 0,
        carbs: parseInt(document.getElementById('itemCarbs').value) || 0,
        fat: parseInt(document.getElementById('itemFat').value) || 0
    };

    menuItems.push(newItem);
    saveMenuItems();
    closeNewItemModal();
    renderTable();

    // Mostrar mensagem de sucesso
    alert(`Item "${newItem.name}" adicionado com sucesso!`);

    // Abrir detalhes do novo item
    showDetails(newItem.id);
}

// Editar item
function editItem(itemId) {
    alert(`Funcionalidade de edição será implementada para o item ID: ${itemId}`);
}

// Excluir item
function deleteItem(itemId) {
    if (confirm('Tem certeza que deseja excluir este item?')) {
        const index = menuItems.findIndex(item => item.id === itemId);
        if (index > -1) {
            menuItems.splice(index, 1);
            saveMenuItems();
            closeDetails();
            renderTable();
            alert('Item excluído com sucesso!');
        }
    }
}

// Alternar status
function toggleStatus(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (item) {
        item.status = item.status === 'active' ? 'inactive' : 'active';
        saveMenuItems();
        showDetails(itemId);
        renderTable();
    }
}

// Event listeners para filtros
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        closeDetails();
        renderTable();
    });
});

// Fechar modal ao clicar fora
document.getElementById('newItemModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeNewItemModal();
    }
});

// Inicializar
renderTable();
