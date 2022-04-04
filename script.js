const d = new Date();
const currentHour = d.getHours();
var dd = String(d.getDate()).padStart(2, '0');
var mm = String(d.getMonth() + 1).padStart(2, '0');
var yyyy = d.getFullYear();
const today = mm + '/' + dd + '/' + yyyy;

const chartAreaBorder = {
  id: 'chartAreaBorder',
  beforeDraw(chart, args, options) {
    const {ctx, chartArea: {left, top, width, height}} = chart;
    ctx.save();
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = options.borderWidth;
    ctx.setLineDash(options.borderDash || []);
    ctx.lineDashOffset = options.borderDashOffset;
    ctx.strokeRect(left, top, width, height);
    ctx.restore();
  }
};


function updateChart() {
  fetch('https://newest-posts.s40.repl.co/api/hour')
    .then(res => res.json())
    .then(data => populatePage(data))
}

function populatePage(data) {
  //separate into labels and datasets
  const dataset1 = []
  for (let i = 0; i < data.postsCount.length; i++) {
    dataset1.push(data.postsCount[i].value)
  }
  const labels1 = []
  for (let i = 0; i < data.postsCount.length; i++) {
    const timeToAddObject = new Date(`${today} ${data.postsCount[i].time}:00:00 ${data.timeFormat}`)
    const hourToAdd = timeToAddObject.getHours()
    if (currentHour < hourToAdd) {
      continue
    } else {
      if (currentHour == hourToAdd) {
        labels1.push(`(incomplete data) ${timeToAddObject.toString()}`)
      } else {
        labels1.push(timeToAddObject.toString())
      }
    }
  }
  addChart(labels1, dataset1, data.timeFormat)
}

function addChart(labels, dataset, timeFormat) {
  let params = new URLSearchParams(document.location.search);
  let color = params.get('color')
  let bgcolor = params.get('bgcolor')
  let textcolor = params.get('textcolor')
  let bordercolor = params.get('bordercolor')
  if (color == null) {
    color = '#D14D63'
  }
  if (bgcolor !== null) {
    document.body.style.backgroundColor = bgcolor
  }
  if (textcolor == null) {
    textcolor = 'white'
  }
  if (bordercolor === null) {
    bordercolor = 'grey'
  }
  const data = {
    labels: labels,
    datasets: [{
      label: `Posts per hour`,
      backgroundColor: color,
      borderColor: color,
      data: dataset,
    }]
  };
  const config = {
    type: 'line',
    data: data,
    options: {'responsive': true, scales: {xAxis: {display: false, min: 0},yAxis: {min: 0, ticks: {color: textcolor}, grid: {color: bordercolor}}},plugins: {legend: {labels: {color: textcolor}}, chartAreaBorder: {borderColor: bordercolor,borderWidth: 2,}}},
    plugins: [chartAreaBorder]
  };
  const myChart = new Chart(
    document.getElementById('postChart'),
    config
  );
}
updateChart()
setInterval(updateChart, 900000)
