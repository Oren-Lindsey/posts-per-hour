const d = new Date();
const currentHour = d.getHours();
const timeOffset = d.getTimezoneOffset() / 60
const adjustedHour = currentHour - timeOffset
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
  // rewrite this whole thing https://scratch.mit.edu/discuss/topic/593896/
  const localHours = []
  const localData = []
  for (let i = 0; i < data.postsCount.length; i++) {
    const localObj = new Date(`${today} ${data.postsCount[i].time}:00:00 ${data.timeFormat}`)
    const localTime = new Date(localObj.toString())
    const localHour = localTime.getHours()
    if (localHour > currentHour) {
      continue
    } else {
      if (currentHour == localHour) {
        localHours.push(`${localTime.toLocaleTimeString()} ${getTimezoneName()} (incomplete data)`)
      } else {
        localHours.push(`${localTime.toLocaleTimeString()} ${getTimezoneName()}`)
      }
      localData.push(data.postsCount[i].value)
    }
  }
  addChart(localHours, localData, data.timeFormat)
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

function getTimezoneName() {
  const today = new Date();
  const short = today.toLocaleDateString(undefined);
  const full = today.toLocaleDateString(undefined, { timeZoneName: 'long' });

  // Trying to remove date from the string in a locale-agnostic way
  const shortIndex = full.indexOf(short);
  if (shortIndex >= 0) {
    const trimmed = full.substring(0, shortIndex) + full.substring(shortIndex + short.length);
    
    // by this time `trimmed` should be the timezone's name with some punctuation -
    // trim it from both sides
    return trimmed.replace(/^[\s,.\-:;]+|[\s,.\-:;]+$/g, '');

  } else {
    // in some magic case when short representation of date is not present in the long one, just return the long one as a fallback, since it should contain the timezone's name
    return full;
  }
}

updateChart()
setInterval(updateChart, 900000)
