const updatePropChart = () => {
    
    let month = months.indexOf($("#prop-chart-selector").val());
    proportionChart.data.datasets[0].data = cats.map(x => totalByCat(x, month));
    proportionChart.update();
}

let proportionChart, monthlyChart, quarterlyChart;

function loadGraphs() {
    var proportionCanvas = document.getElementById('proportion-chart');
    var monthlyCanvas = document.getElementById('monthly-spending-chart');
    var quarterlyCanvas = document.getElementById('quarterly-chart');

    let monthlyData = getMonthTotals();
    let quarterlyData = [];
    for(let i = 0; i < 4; i++) quarterlyData.push(monthlyData.slice((3*i),(3*i)+3).reduce((a,b) => a+b));
    
    monthlyChart = new Chart(monthlyCanvas, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'My First dataset',
                borderColor: "cyan",
                data: monthlyData
            }]
        },
        // Configuration options go here
        options: {
            legend: { display: false }
        }
    });

    var myChart = new Chart(quarterlyCanvas, {
        type: 'bar',
        data: {
            labels: ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'],
            datasets: [{
                label: 'Total Spent',
                data: quarterlyData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            legend: { display: false }
        }
    });

    let proportionalData = cats.map(x => totalByCat(x, curMonth).toFixed(2));
    console.log(proportionalData);

    proportionChart = new Chart(proportionCanvas, {
        type: 'pie',
        data: {
            labels: cats,
            datasets: [{
                label: 'My First dataset',
                backgroundColor: [
                    catColors["groceries"],
                    catColors["amazon"],
                    catColors["feasting"],
                    catColors["misc"],
                ],
                data: proportionalData
            }]
        },
        // Configuration options go here
        options: {
            legend: { display: false }
        }
    });
}