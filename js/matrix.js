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
    LEFT: 50,
    TOP: 50,
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

const y = d3.scaleBand()
    .range([0, PLOT.HEIGHT])
    .padding(0.05)

function color(hop) {
    let color;
    console.log(hop);
    switch(hop) {
        case 0:
            color = d3.hsl("black");
            break;
        case 1:
            color = d3.hsl("red");
            break;
        case 2:
            color = d3.hsl("blue");
            break;
        case 3: 
            color = d3.hsl("green");
            break;
    };
    console.log(d3.scaleSequential(t => d3.hsl(color.h, color.s * t, color.l) + ""))
    return d3.scaleSequential(t => d3.hsl(color.h, color.s * t, color.l) + "");
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

    const matrix = plot.append('g')
        .selectAll('rect')
        .data(data.edges)
        .enter()
        .append('rect')
            .attr('x', function(d) { return( x(d._SOURCE) ) })
            .attr('y', function(d) { return( y(d._TARGET) ) })
            .attr('width', x.bandwidth)
            .attr('height', y.bandwidth)
            .attr('fill', d => color(d._HOP)(d._WEIGHT));
    
}).catch(function(error) {

    console.log(error)

})