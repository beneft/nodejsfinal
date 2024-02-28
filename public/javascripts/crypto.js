const fetchCryptoDataAndCreateChart = async () => {
    await fetch('/api/crypto')
        .then(response => response.json())
        .then(data => {
            const labels = Object.keys(data);
            const values = Object.values(data);

            const ctx = document.getElementById('cryptoChart').getContext('2d');
            const cryptoChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Price (USD)',
                        data: values,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching cryptocurrency data:', error));
};

document.addEventListener('DOMContentLoaded', fetchCryptoDataAndCreateChart);