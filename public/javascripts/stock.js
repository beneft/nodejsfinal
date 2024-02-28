document.addEventListener('DOMContentLoaded', () => {
    fetchStockData();
    //renderChart(['1','2'],[1,2])
});

async function fetchStockData() {
    try {
        const response = await fetch('/api/stock');
        const data = await response.json();

        const dates = Object.keys(data['Time Series (Daily)']);
        const prices = dates.map(date => parseFloat(data['Time Series (Daily)'][date]['4. close']));

        renderChart(dates.reverse(), prices.reverse());
    } catch (error) {
        console.error('Error fetching stock data:', error);
    }
}

function renderChart(labels, data) {
    const ctx = document.getElementById('stockChart').getContext('2d');
    const stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Google Share, USD',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}