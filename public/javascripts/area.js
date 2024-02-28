const fetchGDPDataAndCreateChart = async () => {
    fetch('/api/area')
        .then(response => response.json())
        .then(data => {
            const countries = data;
            const labels = countries.map(country => country.name);
            const area = countries.map(country => country.area);

            const ctx = document.getElementById('countryChart').getContext('2d');
            const countryChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Country Area',
                        data: area,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    legend: {
                        display: false
                    },
                    responsive: false,
                    maintainAspectRatio: false
                }
            });
        })
        .catch(error => console.error('Error fetching country data:', error));
};

document.addEventListener('DOMContentLoaded', fetchGDPDataAndCreateChart);