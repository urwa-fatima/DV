render();
window.addEventListener('resize', render);

function render() {
    const divID = d3.select('#world-asia-pie-chart');
    pie_chart(divID, Object.assign({}, {
        width: divID.node().getBoundingClientRect().width,
        height: divID.node().getBoundingClientRect().height,
        margin: { top: 50, bottom: 50, left: 50, right: 50 }
    }));

}
function pie_chart(selection, props) {

    const { width,
        height,
        margin
    } = props;

    var radius = Math.min(width, height) / 1.85 - margin.left - margin.right;
    var inner_radius = Math.min(width, height) / 2.7 - margin.left - margin.right;

    let svg = selection.selectAll('svg').data([null]);

    svg = svg.enter().append('svg')
        .merge(svg)
        .attr("class", "svg-content")
        .attr('viewBox', '0 0 ' + Math.min(width, height) + ' ' + Math.min(width, height));

    // Remove previous group element
    svg.selectAll("g").remove();

    let g = svg.selectAll('g').data([null]);
    g = g
        .enter()
        .append('g')
        .merge(g)
        .attr("class", "arc")
        .attr('width', width)
        .attr('height', height)
        .attr("transform", "translate(" + Math.min(width, height) / 2 + "," + Math.min(width, height) / 2 + ")");


    //GROUP FOR LABELS
    let label_g = svg.selectAll('.label_group').data([null]);

    label_g = label_g
        .enter()
        .append("g")
        .merge(label_g)
        .attr("class", "label_group")
        .attr("transform", "translate(" + (Math.min(width, height) / 2) + "," + (Math.min(width, height) / 2) + ")");


    //CSV Data
    d3.csv("./data/world_total_death_pie_data.csv").then(function (data) {

        console.log(data);
        data.sort(function (a, b) {
            return b.total_no_deaths - a.total_no_deaths;
        });

        //color 
        // var colorList = ["#26265C", "#32327A", "#5454CC",
        //     "#6969FF", "#8E8EFF", "#B4B4FF"];

        var mycolors = ["#26265C", "#32327A", "#5454CC", "#6969FF", "#8E8EFF"]

        // var mycolors = ["#26265C", '#1D382B', '#D68C2C', '#1F1F1F',
        //     '#53070D', '#B7264A', '#66976B', '#A54A2B',
        //     '#C7A98C', '#F4A6B3', '#C5BE6A',
        //     '#364277', '#8FBFCC', '#226D7B', '#002E6B'];


        const color = d3.scaleOrdinal()
            .range(mycolors);

        var colorScale = d3.scaleThreshold()
            .domain([0, 2, 19, 22, 23, 25])
            .range(mycolors);

        // Compute the position of each group on the pie:
        const pie = d3.pie()
            .sort(null);

        const data_ready = pie.value(d => d.percentage)(data)
        // .sort(function (a, b) { return d3.descending(a.value, b.value); });
        // Now I know that group A goes from 0 degrees to x degrees and so on.

        // shape helper to build arcs:
        const arcGenerator = d3.arc()
            .innerRadius(inner_radius)
            .outerRadius(radius)

        var formatDecimal = d3.format(",.2f");

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.

        // paths = paths
        g.selectAll('mySlices')
            .data(data_ready)
            .join('path')
            .attr('d', arcGenerator)
            .attr('fill', function (d) {
                if (d.data.continent == "Asia") {
                    return ("#FF1D33")

                } else {
                    return (color(d.value))
                    // return (colorScale(d.value))

                }
            })
            .attr("stroke", "#E0E0E0")
            .style("stroke-width", "1px")
            .style("opacity", 1);

        //Now add the annotation. Use the centroid method to get the best coordinates
        label_g.selectAll('mySlices')
            .data(data_ready)
            .join('text')
            .attr("dy", 0)
            .text(function (d) { return d.data.continent + " " + formatDecimal(d.value) + "%" }).call(wrap, 50, 0.8)
            .attr("transform", function (d) {

                if (d.value < 3) {
                    return `translate(${arcGenerator.centroid(d)[0]},${arcGenerator.centroid(d)[1] - 40})`
                }
                if (d.value < 5) {
                    return `translate(${arcGenerator.centroid(d)[0]},${arcGenerator.centroid(d)[1] + 20})`
                }
                else {
                    return `translate(${arcGenerator.centroid(d)})`
                }
            })
            .style("text-anchor", "middle")
            .style("fill", "#E0E0E0")
            .style("font-size", "1em")

        var sum = d3.sum(data, function (d) {
            return +d.total_no_deaths;
        });

        label_g.append("text")
            .attr('y', -inner_radius + (inner_radius - 17))
            .attr("dy", 0)
            .text("Total Deaths " + "in World Due to COVID-19 ").call(wrap, 120, 1.5)
            .style("text-anchor", "middle")
            .style("fill", "white")
            .style("font-size", "0.8em")
            .style("text-anchor", "middle")


        label_g.append("text")
            .attr('y', -inner_radius + (inner_radius + 50))
            .attr("dy", 0)
            .text(sum).call(wrap, 90, 1.5)
            .style("text-anchor", "middle")
            .style("fill", "white")
            .style("font-size", "1.2em")
            .style("text-anchor", "middle")
            .style("font-weight", 600)


    });

    function wrap(text, width, lineH) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = +lineH, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }


}
