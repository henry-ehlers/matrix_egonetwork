const promises = [
    d3.json('./data/miserables.annotated.edges.json'),
    d3.json('./data/miserables.nodes.json')
];

// FIGURE DIMENSIONS
const FIGURE = {
    HEIGHT: 800,
    WIDTH: 800
};
const MARGINS = {
    LEFT: 100,
    TOP: 50,
    RIGHT: 50,
    BOTTOM: 100
};
const PLOT = {
    HEIGHT: FIGURE.HEIGHT - MARGINS.BOTTOM - MARGINS.TOP,
    WIDTH: FIGURE.WIDTH - MARGINS.LEFT - MARGINS.RIGHT
};

// Axes
const x = d3.scaleBand()
    .range([0, PLOT.WIDTH])
    .padding(0.05)

const xAxis = d3.axisBottom(x)
    .tickSizeOuter(0)
    .tickSizeInner(0);   

const y = d3.scaleBand()
    .range([0, PLOT.HEIGHT])
    .padding(0.05)

const yAxis = d3.axisLeft(y)
    .tickSizeOuter(0)
    .tickSizeInner(0);

function color(hop) {
    let color;
    switch(hop) {
        case -1:
            color = 'black';
            break;
        case 0:
            color = 'black';
            break;
        case 1:
            color = 'red;'
            break;
        case 2:
            color = 'blue'
            break;
        case 3: 
            color = 'green';
            break;
        case 4: 
            color = 'pink';
            break;
    };
    return d3.scaleLinear().range(['white', color]).domain([0,1]);
}

Promise.all(promises).then(function(promisedData){

    // Load
    const data = {
        'edges': promisedData[0],
        'nodes': promisedData[1]
    };

    // Process
    data.edges.forEach(d => d._WEIGHT = Number(d._WEIGHT));
    data.nodes.sort(function(a, b) { 
        return (b._HOP + b._WEIGHTED) - (a._HOP + a._WEIGHTED);
    })

    x.domain(data.nodes.map(d => d._ID));
    y.domain(data.nodes.map(d => d._ID));

    const canvas = d3.select('#matrix')
        .append('svg') 
            .attr('height', FIGURE.HEIGHT)
            .attr('width', FIGURE.WIDTH);

    const plot = canvas.append('g')
        .attr('transform', `translate(${MARGINS.LEFT}, ${MARGINS.TOP})`);

    const axisX = plot.append('g')
            .attr('class', 'xaxis')
            .attr('transform', `translate(0, ${PLOT.HEIGHT})`)
        .call(xAxis)
    axisX.selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)")
    axisX.select(".domain")
        .remove();
    
    const axisY = plot.append('g')
        .attr('class', 'yaxis')
        .call(yAxis)
        .select(".domain")
        .remove();
    
    const matrix = plot.append('g')
            .attr('class', 'matrix')
        .selectAll('rect')
        .data(data.edges)
        .enter()
        .append('rect')
            .attr('x', function(d) { return( x(d._SOURCE) ) })
            .attr('y', function(d) { return( y(d._TARGET) ) })
            .attr('width', x.bandwidth)
            .attr('height', y.bandwidth)
            .attr('fill', d => color(d._HOP)(d._WEIGHT))
            .attr('color', 'black')
            .attr('rx', 2)
            .attr('ry', 2);
    
}).catch(function(error) {

    console.log(error)

})