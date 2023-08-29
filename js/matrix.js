const promises = [
    d3.json('./data/simple.annotated.edges.json'),
    d3.json('./data/simple.nodes.json')
];

// FIGURE DIMENSIONS
const FIGURE = {
    HEIGHT: 400,
    WIDTH: 400
};
const MARGINS = {
    LEFT: 100,
    TOP: 100,
    RIGHT: 50,
    BOTTOM: 50
};
const PLOT = {
    HEIGHT: FIGURE.HEIGHT - MARGINS.BOTTOM - MARGINS.TOP,
    WIDTH: FIGURE.WIDTH - MARGINS.LEFT - MARGINS.RIGHT
};

// Axes
const x = d3.scaleBand()
    .range([0, PLOT.WIDTH])
    .padding(0.05)

const xAxis = d3.axisTop(x)

const y = d3.scaleBand()
    .range([0, PLOT.HEIGHT])
    .padding(0.05)

const yAxis = d3.axisLeft(y)

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
    data.edges.forEach(d => d.weight = Number(d.weight));
    data.nodes.sort(function(a, b) { 
        return (a._Hop + a._Weighted) - (b._Hop + b._Weighted);
    })

    x.domain(data.nodes.map(d => d._ID));
    y.domain(data.nodes.map(d => d._ID));

    const canvas = d3.select('#matrix')
        .append('svg')
            .attr('height', FIGURE.HEIGHT)
            .attr('width', FIGURE.WIDTH);

    const plot = canvas.append('g')
        .attr('transform', `translate(${MARGINS.LEFT}, ${MARGINS.TOP})`);

    plot.append('g')
        .attr('class', 'xAxis')
        .call(xAxis);
    
    plot.append('g')
        .attr('class', 'yAxis')
        .call(yAxis);
        
    
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
            .attr('rx', 4)
            .attr('ry', 4);
    
}).catch(function(error) {

    console.log(error)

})