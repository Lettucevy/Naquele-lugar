document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('ordersContainer');
    const productsContainer = document.getElementById('productsContainer');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const statsContainer = document.getElementById('statsContainer');
    const isKitchen = document.body.classList.contains('kitchen-view');
    const isAdmin = document.body.classList.contains('admin-view');

    async function fetchData() {
        try {
            const ordersTab = document.getElementById('ordersTab');
            const productsTab = document.getElementById('productsTab');
            const categoriesTab = document.getElementById('categoriesTab');

            if (isKitchen || (isAdmin && ordersTab && ordersTab.classList.contains('active'))) {
                const ordersResponse = await fetch('/api/admin/pedidos');
                const orders = await ordersResponse.json();
                renderOrders(orders);
                
                if (isAdmin && statsContainer) {
                    const statsResponse = await fetch('/api/admin/stats');
                    const stats = await statsResponse.json();
                    renderStats(stats);
                }
            }

            if (isAdmin && productsTab && productsTab.classList.contains('active')) {
                const prodResponse = await fetch('/api/admin/produtos');
                const products = await prodResponse.json();
                renderProducts(products);
            }

            if (isAdmin && categoriesTab && categoriesTab.classList.contains('active')) {
                const catResponse = await fetch('/api/admin/categorias');
                const categories = await catResponse.json();
                renderCategories(categories);
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    }

    // --- RENDERIZADORES ---

    function renderOrders(orders) {
        if (!ordersContainer) return;
        if (isKitchen) {
            const pending = orders.filter(o => o.Status === 'Pendente' || o.Status === 'Em Preparo');
            const finished = orders.filter(o => o.Status === 'Concluído').slice(0, 10);
            ordersContainer.innerHTML = `
                <div class="col">
                    <h2 class="col-title">Para Preparar 🛠️</h2>
                    <div class="orders-list">${pending.map(renderOrderCard).join('')}</div>
                </div>
                <div class="col">
                    <h2 class="col-title">Finalizados ✅</h2>
                    <div class="orders-list">${finished.map(renderOrderCard).join('')}</div>
                </div>
            `;
        } else {
            ordersContainer.innerHTML = `
                <div class="table-container">
                    <table>
                        <thead><tr><th>ID</th><th>Cliente</th><th>Data</th><th>Total</th><th>Status</th><th>Ações</th></tr></thead>
                        <tbody>${orders.map(renderOrderRow).join('')}</tbody>
                    </table>
                </div>
            `;
        }
    }

    function renderProducts(products) {
        productsContainer.innerHTML = `
            <div class="table-container">
                <table>
                    <thead><tr><th>Foto</th><th>Nome</th><th>Categoria</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead>
                    <tbody>
                        ${products.map(p => `
                            <tr class="${p.Disponivel ? '' : 'inactive-row'}">
                                <td><img src="${p.ImagemURL || 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?q=80&w=400&auto=format&fit=crop'}" 
                                         onerror="this.src='https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?q=80&w=400&auto=format&fit=crop'"
                                         width="50" height="50" style="object-fit:cover; border-radius:5px"></td>
                                <td>${p.Nome}</td>
                                <td>${p.CategoriaNome}</td>
                                <td>R$ ${p.Preco.toFixed(2)}</td>
                                <td><span class="status-badge ${p.Disponivel ? 'concluido' : 'pendente'}">${p.Disponivel ? 'Ativo' : 'Pausado'}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline" onclick="editProduct(${p.ID})">Editar</button>
                                    <button class="btn btn-sm ${p.Disponivel ? 'btn-red' : 'btn-green'}" onclick="toggleProduct(${p.ID}, ${p.Disponivel})">${p.Disponivel ? 'Pausar' : 'Ativar'}</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderCategories(categories) {
        categoriesContainer.innerHTML = `
            <div class="table-container">
                <table style="max-width: 600px">
                    <thead><tr><th>Nome</th><th>Status</th><th>Ações</th></tr></thead>
                    <tbody>
                        ${categories.map(c => `
                            <tr class="${c.Ativa ? '' : 'inactive-row'}">
                                <td>${c.Nome}</td>
                                <td><span class="status-badge ${c.Ativa ? 'concluido' : 'pendente'}">${c.Ativa ? 'Ativa' : 'Inativa'}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline" onclick="editCategory(${c.ID}, '${c.Nome}')">Renomear</button>
                                    <button class="btn btn-sm ${c.Ativa ? 'btn-red' : 'btn-green'}" onclick="toggleCategory(${c.ID}, ${c.Ativa})">${c.Ativa ? 'Desativar' : 'Reativar'}</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderOrderCard(order) {
        return `
            <div class="order-card status-${order.Status.toLowerCase().replace(' ', '-')}">
                <div class="card-header"><span>#${order.ID}</span><span>${new Date(order.DataPedido).toLocaleTimeString()}</span></div>
                <div class="card-client">${order.NomeCliente}</div>
                <div class="card-items">
                    ${order.Itens.map(item => `<div class="item-line"><span class="item-qty">${item.Quantidade}x</span><span>${item.Nome}</span></div>`).join('')}
                </div>
                <div class="card-actions">
                    ${order.Status === 'Pendente' ? `<button class="btn btn-sm" onclick="setStatus(${order.ID}, 'Em Preparo')">Começar</button>` : ''}
                    ${order.Status === 'Em Preparo' ? `<button class="btn btn-sm btn-green" onclick="setStatus(${order.ID}, 'Concluído')">Finalizar</button>` : ''}
                </div>
            </div>
        `;
    }

    function renderOrderRow(order) {
        return `
            <tr>
                <td>#${order.ID}</td>
                <td>${order.NomeCliente}</td>
                <td>${new Date(order.DataPedido).toLocaleString()}</td>
                <td>R$ ${order.Total.toFixed(2)}</td>
                <td><span class="status-badge ${order.Status.toLowerCase().replace(' ', '-')}">${order.Status}</span></td>
                <td>
                    <select onchange="setStatus(${order.ID}, this.value)">
                        <option value="Pendente" ${order.Status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="Em Preparo" ${order.Status === 'Em Preparo' ? 'selected' : ''}>Em Preparo</option>
                        <option value="Concluído" ${order.Status === 'Concluído' ? 'selected' : ''}>Concluído</option>
                    </select>
                </td>
            </tr>
        `;
    }

    function renderStats(stats) {
        statsContainer.innerHTML = `
            <div class="stat-card"><div class="stat-val">R$ ${stats.totalVendas.toFixed(2)}</div><div class="stat-label">Vendas Totais</div></div>
            <div class="stat-card"><div class="stat-val">${stats.qtdPedidos}</div><div class="stat-label">Pedidos</div></div>
        `;
    }

    // --- AÇÕES GLOBAIS ---

    window.openTab = (tabName) => {
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
        document.getElementById(tabName + 'Tab').classList.add('active');
        event.currentTarget.classList.add('active');
        fetchData();
    };

    window.setStatus = async (id, status) => {
        await fetch(`/api/admin/pedidos/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        fetchData();
    };

    window.toggleProduct = async (id, currentStatus) => {
        await fetch(`/api/admin/produtos/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Disponivel: currentStatus ? 0 : 1 })
        });
        fetchData();
    };

    window.toggleCategory = async (id, currentStatus) => {
        await fetch(`/api/admin/categorias/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ativa: currentStatus ? 0 : 1 })
        });
        fetchData();
    };

    // --- MODAIS ---
    window.closeModal = (id) => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'none';
            if (id === 'productModal') {
                document.getElementById('productForm').reset();
                document.getElementById('imagePreview').innerHTML = '';
            }
            if (id === 'categoryModal') document.getElementById('categoryForm').reset();
        }
    };

    window.openCategoryModal = () => {
        const idField = document.getElementById('catId');
        const titleField = document.getElementById('categoryModalTitle');
        if (idField) idField.value = '';
        if (titleField) titleField.innerText = 'Nova Categoria';
        document.getElementById('categoryModal').style.display = 'flex';
    };

    window.editCategory = (id, nome) => {
        const idField = document.getElementById('catId');
        const nameField = document.getElementById('catNome');
        const titleField = document.getElementById('categoryModalTitle');
        if (idField) idField.value = id;
        if (nameField) nameField.value = nome;
        if (titleField) titleField.innerText = 'Editar Categoria';
        document.getElementById('categoryModal').style.display = 'flex';
    };

    window.openProductModal = async () => {
        document.getElementById('prodId').value = '';
        document.getElementById('prodImg').value = '';
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('productModalTitle').innerText = 'Novo Produto';
        
        const res = await fetch('/api/admin/categorias');
        const cats = await res.json();
        const catSelect = document.getElementById('prodCat');
        if (catSelect) {
            catSelect.innerHTML = cats.filter(c => c.Ativa).map(c => `<option value="${c.ID}">${c.Nome}</option>`).join('');
        }
        document.getElementById('productModal').style.display = 'flex';
    };

    window.editProduct = async (id) => {
        const resProd = await fetch('/api/admin/produtos');
        const allProds = await resProd.json();
        const p = allProds.find(item => item.ID === id);

        const resCat = await fetch('/api/admin/categorias');
        const cats = await resCat.json();

        const idField = document.getElementById('prodId');
        const catSelect = document.getElementById('prodCat');
        const titleField = document.getElementById('productModalTitle');

        if (idField) idField.value = p.ID;
        if (catSelect) {
            catSelect.innerHTML = cats.filter(c => c.Ativa).map(c => `<option value="${c.ID}" ${p.CategoriaID === c.ID ? 'selected' : ''}>${c.Nome}</option>`).join('');
        }
        
        document.getElementById('prodNome').value = p.Nome;
        document.getElementById('prodDesc').value = p.Descricao;
        document.getElementById('prodPreco').value = p.Preco;
        document.getElementById('prodImg').value = p.ImagemURL || '';
        
        if (p.ImagemURL) {
            document.getElementById('imagePreview').innerHTML = `<img src="${p.ImagemURL}" style="max-width:100%; border-radius:10px; margin-top:10px">`;
        } else {
            document.getElementById('imagePreview').innerHTML = '';
        }
        
        if (titleField) titleField.innerText = 'Editar Produto';
        document.getElementById('productModal').style.display = 'flex';
    };

    // --- UPLOAD LOGIC ---
    document.getElementById('prodImgFile')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('imagem', file);

        try {
            document.getElementById('imagePreview').innerHTML = '<div class="loading">Subindo...</div>';
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            document.getElementById('prodImg').value = result.url;
            document.getElementById('imagePreview').innerHTML = `<img src="${result.url}" style="max-width:100%; border-radius:10px; margin-top:10px">`;
        } catch (error) {
            alert('Erro ao subir imagem');
            document.getElementById('imagePreview').innerHTML = '';
        }
    });

    // --- FORM SUBMITS ---
    document.getElementById('categoryForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('catId').value;
        const nome = document.getElementById('catNome').value;
        const url = id ? `/api/admin/categorias/${id}` : '/api/admin/categorias';
        const method = id ? 'PATCH' : 'POST';

        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome })
        });
        closeModal('categoryModal');
        fetchData();
    });

    document.getElementById('productForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('prodId').value;
        const data = {
            categoriaId: document.getElementById('prodCat').value,
            nome: document.getElementById('prodNome').value,
            descricao: document.getElementById('prodDesc').value,
            preco: document.getElementById('prodPreco').value,
            imagemUrl: document.getElementById('prodImg').value
        };

        const url = id ? `/api/admin/produtos/${id}` : '/api/admin/produtos';
        const method = id ? 'PATCH' : 'POST';

        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        closeModal('productModal');
        fetchData();
    });

    fetchData();
    setInterval(fetchData, 3000);
});
