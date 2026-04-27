document.addEventListener('DOMContentLoaded', () => {
    const menuGrid = document.getElementById('menuGrid');
    const categoryFilter = document.getElementById('categoryFilter');
    const cartToggle = document.getElementById('cartToggle');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const cartCountElement = document.querySelector('.cart-count');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const cancelModal = document.getElementById('cancelModal');
    const orderForm = document.getElementById('orderForm');

    let menuItems = [];
    let cart = [];

    // Fetch Menu
    async function fetchMenu() {
        try {
            const response = await fetch('/api/menu');
            menuItems = await response.json();
            renderMenu(menuItems);
            renderCategories(menuItems);
        } catch (error) {
            console.error('Erro ao carregar menu:', error);
            menuItems = [
                { ID: 1, Nome: 'Cerveja Asahi', Descricao: 'Cerveja japonesa premium 350ml.', Preco: 18.00, Categoria: 'Bebidas' },
                { ID: 2, Nome: 'Yakitori de Frango', Descricao: 'Espetinho de frango grelhado.', Preco: 15.00, Categoria: 'Yakitori' },
                { ID: 3, Nome: 'Sashimi de Salmão', Descricao: '5 fatias de salmão fresco.', Preco: 25.00, Categoria: 'Sushi' }
            ];
            renderMenu(menuItems);
            renderCategories(menuItems);
        }
    }

    function renderMenu(items) {
        menuGrid.innerHTML = items.map(item => `
            <div class="menu-item" data-category="${item.Categoria}">
                <div class="item-img">
                    <img src="${item.ImagemURL || 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?q=80&w=400&auto=format&fit=crop'}" 
                         onerror="this.src='https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?q=80&w=400&auto=format&fit=crop'"
                         alt="${item.Nome}">
                </div>
                <div class="item-info">
                    <div class="item-header">
                        <h3>${item.Nome}</h3>
                        <span class="item-price">R$ ${item.Preco.toFixed(2)}</span>
                    </div>
                    <p class="item-desc">${item.Descricao}</p>
                    <button class="btn btn-add" onclick="addToCart(${item.ID})">Adicionar ao Pedido</button>
                </div>
            </div>
        `).join('');
    }

    function renderCategories(items) {
        const categories = ['Todos', ...new Set(items.map(i => i.Categoria))];
        categoryFilter.innerHTML = categories.map(cat => `
            <button class="${cat === 'Todos' ? 'active' : ''}" data-category="${cat}">${cat}</button>
        `).join('');

        categoryFilter.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                categoryFilter.querySelector('.active').classList.remove('active');
                btn.classList.add('active');
                const cat = btn.getAttribute('data-category');
                const filtered = cat === 'Todos' ? menuItems : menuItems.filter(i => i.Categoria === cat);
                renderMenu(filtered);
            });
        });
    }

    // Cart Logic
    window.addToCart = (id) => {
        const item = menuItems.find(i => i.ID === id);
        const inCart = cart.find(c => c.id === id);

        if (inCart) {
            inCart.quantidade++;
        } else {
            cart.push({ id: item.ID, nome: item.Nome, preco: item.Preco, quantidade: 1 });
        }

        updateCartUI();
        openCartSidebar();
    };

    function updateCartUI() {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.nome}</h4>
                    <span>${item.quantidade}x R$ ${item.preco.toFixed(2)}</span>
                </div>
                <button class="btn-remove" onclick="removeFromCart(${item.id})">🗑️</button>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        cartTotalElement.innerText = `R$ ${total.toFixed(2)}`;
        cartCountElement.innerText = cart.reduce((sum, item) => sum + item.quantidade, 0);
    }

    window.removeFromCart = (id) => {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    };

    function openCartSidebar() { cartSidebar.classList.add('open'); }
    function closeCartSidebar() { cartSidebar.classList.remove('open'); }

    cartToggle.addEventListener('click', openCartSidebar);
    closeCart.addEventListener('click', closeCartSidebar);

    // Checkout
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return alert('Seu carrinho está vazio!');
        checkoutModal.style.display = 'flex';
    });

    cancelModal.addEventListener('click', () => checkoutModal.style.display = 'none');

    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const orderData = {
            cliente: document.getElementById('clientName').value,
            telefone: document.getElementById('clientPhone').value,
            itens: cart,
            total: cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0)
        };

        try {
            const response = await fetch('/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (response.ok) {
                orderForm.reset();
                cart = [];
                updateCartUI();
                checkoutModal.style.display = 'none';
                closeCartSidebar();

                Swal.fire({
                    title: 'Pedido Realizado! 🍱',
                    text: `Seu pedido #${data.pedidoId} foi recebido com sucesso.`,
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Rastrear Pedido',
                    cancelButtonText: 'Fechar',
                    confirmButtonColor: '#3b82f6',
                    background: '#1e293b',
                    color: '#fff'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = `tracking.html?id=${data.pedidoId}`;
                    }
                });
            } else {
                throw new Error('Falha no servidor');
            }
        } catch (error) {
            Swal.fire({
                title: 'Erro!',
                text: 'Não conseguimos enviar seu pedido. Tente novamente.',
                icon: 'error',
                background: '#1e293b',
                color: '#fff'
            });
        }
    });

    fetchMenu();
});
