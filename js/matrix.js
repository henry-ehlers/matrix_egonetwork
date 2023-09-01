const dataset = "miserables";
const ego = "Valjean";

const promises = [
    d3.json('./data/' + dataset + "." + ego + '.edges.json'),
    d3.json('./data/' + dataset + "." + ego + '.nodes.json')
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

function hopColor(hop){
    let color;
    switch(hop) {
        case -1:
            return 'black';
        case 0:
            return 'black';
        case 1:
            return 'red';
        case 2:
            return 'blue';
        case 3: 
            return 'turquoise';
        case 4: 
            return 'green';
        case 5:
            return 'orange'
    };
}

function colorGradient(hop) {
    let color = hopColor(hop);
    return d3.scaleLinear().range(['white', color]).domain([0,1]);
}

function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

function getEnds(orderedNodes) {
    let currentHop = 0;
    let currentLength = 0;
    let ends = [];
    let start = orderedNodes[0].id;
    let end = orderedNodes[0].id;
    for (const node of orderedNodes) {
        const newHop = node.hop;
        if (newHop == currentHop) {
            currentLength++
        } else {
            ends.push({'startX': start, 'startY': start, 'end': end, 'hop': currentHop, 'height': currentLength, 'width': currentLength});
            start = node.id;
            currentHop = newHop;
            currentLength = 1;
        }
        end = node.id;
    };
    ends.push({'startX': start, 'startY': start, 'end': end, 'hop': currentHop, 'height': currentLength, 'width': currentLength}); 
    return ends;
}

function getInbetweens(ends) {
    if (ends.length < 2) {
        return ends;
    }
    for (const ind of range(ends.length-1, 1)) {
        const inBetweenA = {
            'startX': ends[ind].startX,'startY': ends[ind - 1].startY,'hop': -1,'height': ends[ind - 1].height,'width': ends[ind].width
        };
        const inBetweenB = {
            'startX': ends[ind -1 ].startX,'startY': ends[ind].startY,'hop': -1,'height': ends[ind].width,'width': ends[ind - 1].height
        };
        ends.push(inBetweenA, inBetweenB);
    }
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
        return a.hop - b.hop || b.weighted - a.weighted; 
    });
    data['ends'] = getEnds(data.nodes);
    getInbetweens(data.ends);

    x.domain(data.nodes.map(d => d.id));
    y.domain(data.nodes.map(d => d.id));

    const canvas = d3.select('#matrix')
        .append('svg') 
            .attr('height', FIGURE.HEIGHT)
            .attr('width', FIGURE.WIDTH);

    const plot = canvas.append('g')
        .attr('transform', `translate(${MARGINS.LEFT}, ${MARGINS.TOP})`);
    
    const axisX = plot.append('g')
        .attr('class', 'xaxis')
            .style("font-size", "6pt")
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
            .style("font-size", "6pt")
        .call(yAxis)
        .select(".domain")
        .remove();
    
    const matrix = plot.append('g')
            .attr('class', 'matrix')
        .selectAll('rect')
        .data(data.edges)
        .enter()
        .append('rect')
            .attr('x', function(d) { return( x(d.source) ) })
            .attr('y', function(d) { return( y(d.target) ) })
            .attr('width', x.bandwidth)
            .attr('height', y.bandwidth)
            .attr('fill', d => colorGradient(d.hop)(d.weight))
            .attr('rx', 2)
            .attr('ry', 2);

    let test = 'Cosette'
    let width = x.bandwidth();
    console.log(width)
    const overlay = plot.append('g')
        .attr('class', 'overlay')
            .attr("stroke-width", 1)
            .attr('fill', 'transparent')
            .attr('opacity', 0.25)
        .selectAll('rect')
        .data(data.ends)
        .enter()
        .append('rect')
            .attr('x', d => x(d.startX))
            .attr('y', d => y(d.startY))
            .attr('width', d => d.width * 1.05 * x.bandwidth())
            .attr('height', d => d.height * 1.05 * y.bandwidth())
            .attr('stroke', d => hopColor(d.hop))
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('class', d => d.hop < 0 ? 'dashed' : "solid")

}).catch(function(error) {

    console.log(error)

})