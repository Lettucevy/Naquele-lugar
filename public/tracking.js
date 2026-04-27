document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    if (orderId) {
        document.getElementById('searchInput').value = orderId;
        searchOrders();
    }
});

async function searchOrders() {
    const input = document.getElementById('searchInput').value.trim();
    if (!input) {
        Swal.fire('Ops!', 'Por favor, digite o número do pedido ou telefone.', 'warning');
        return;
    }

    const resultsContainer = document.getElementById('results');
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = '<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><p>Buscando seu pedido...</p></div>';

    try {
        let url;
        // Se for um número pequeno (ID)
        if (input.length < 5 && /^\d+$/.test(input)) {
            url = `/api/tracking/${input}`;
        } else {
            // Caso contrário, trata como telefone
            const phone = input.replace(/\D/g, '');
            url = `/api/tracking/phone/${phone}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (res.status === 404 || (Array.isArray(data) && data.length === 0)) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-box-open"></i>
                    <p>Nenhum pedido encontrado para "${input}".</p>
                </div>
            `;
            return;
        }

        if (Array.isArray(data)) {
            renderOrderList(data);
        } else {
            renderOrderList([data]);
        }

    } catch (err) {
        console.error(err);
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-exclamation"></i>
                <p>Erro ao buscar informações. Tente novamente mais tarde.</p>
            </div>
        `;
    }
}

function renderOrderList(orders) {
    const container = document.getElementById('results');
    container.innerHTML = '';

    orders.forEach(order => {
        const date = new Date(order.DataPedido).toLocaleString('pt-BR');
        const statusClass = `status-${order.Status.toLowerCase().replace(/ /g, '-')}`;

        const card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML = `
            <div class="order-header">
                <div>
                    <span class="order-id">#${order.ID}</span>
                    <div class="order-date">${date}</div>
                </div>
                <span class="status-badge ${statusClass}">${order.Status}</span>
            </div>
            
            <div class="order-details">
                ${order.Itens ? renderItems(order.Itens) : '<p>Consultando itens...</p>'}
            </div>

            <div class="total-row">
                <span>Total</span>
                <span>R$ ${parseFloat(order.Total).toFixed(2)}</span>
            </div>
        `;

        container.appendChild(card);
    });
}

function renderItems(items) {
    return items.map(item => `
        <div class="item-row">
            <span>${item.Quantidade}x ${item.Nome}</span>
            <span>R$ ${(item.Quantidade * item.PrecoUnitario).toFixed(2)}</span>
        </div>
    `).join('');
}

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchOrders();
});
