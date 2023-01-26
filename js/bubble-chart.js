window.onload = function () {
    render("bubble_chart");
    window.addEventListener('resize', function () { render("bubble_chart"); });



    function render(divId) {
        const myTheme = {
            axisLabelFill: '#635F5D',
            xAxisLabelOffset: 50,
            yAxisLabelOffset: -50,
            xAxisTickFontSize: '12px',
            yAxisTickFontSize: '12px',
            xAxisLabelFontSize: '16px',
            yAxisLabelFontSize: '16px',
            xAxisTickFontFill: '#8E8883',
            yAxisTickFontFill: '#8E8883',
            xAxisTickLineStroke: '#C0C0BB',
            yAxisTickLineStroke: '#C0C0BB',
            xAxisDomainLineStroke: '#C0C0BB',
            yAxisDomainLineStroke: '#C0C0BB',
            xAxisTickDensity: 70, // pixels per tick
            yAxisTickDensity: 70 // pixels per tick
        };
        const divID = d3.select('#' + divId);
        var width = divID.node().getBoundingClientRect().width;
        // console.log(width)
        bubble_chart(divID, Object.assign({}, myTheme, {
            width: divID.node().getBoundingClientRect().width,
            height: width / 1.5,
            margin: { top: 20, bottom: 100, left: 100, right: 20 }
        }));

    }
    function bubble_chart(selection, props) {

        const { width,
            height,
            margin
        } = props;


        let svg = selection.selectAll('svg').data([null]);

        svg = svg.enter().append('svg')
            .merge(svg)
            .attr("class", "svg-content")
            .attr('viewBox', '0 0 ' + width + ' ' + height);

        // Remove previous group element
        svg.selectAll("g").remove();


        const { g, innerwidth, innerheight } = marginConvention(svg, { width, height, margin });


        //Y Axis
        const yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([innerheight, 0]);

        labeledYAxis(g, Object.assign({}, props, { yScale, innerheight }));


        //X Axis
        const xScale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, innerwidth]);

        labeledXAxis(g, Object.assign({}, props, { xScale, innerwidth, innerheight }));


        d3.csv("../data/buble_data.csv", function (data) {

            // console.log(data)
            var result = data.reduce(function (r, a) {
                r[a.Regional_indicator] = r[a.Regional_indicator] || [];
                r[a.Regional_indicator].push(a);
                return r;
            }, Object.create(null));
            // console.log(result)
            var GroupbyRegionalIndicator = Object.keys(result).map((key) => [key, result[key]]);

            // console.log(res)
            // console.log(GroupbyRegionalIndicator)

            var TotalRegionalIndicator = GroupbyRegionalIndicator.map((d, i) => ({ region: d[1][0].region, value: d[0] }));
            // console.log(TotalRegionalIndicator)
            var mycolors = ["#a5a5a5", "#ffc000", "#5b9bd5", "#ed7d31",

                '#364277', '#8FBFCC', '#226D7B', '#002E6B'];
            const color = d3.scaleOrdinal()
                .domain(TotalRegionalIndicator)
                .range(mycolors)

            // Highlight the specie that is hovered
            var highlight = function (d) {
                console.log(d)
                selected_region_key = d.region
                d3.selectAll(".bubbles")
                    .transition()
                    .duration(200)
                    .style("fill", "lightgrey")
                // .attr("r", 3)

                d3.selectAll("." + selected_region_key)
                    .transition()
                    .duration(200)
                    .style("fill", color(selected_region_key))
                // .attr("r", 7)
            }
            // Highlight the treetype that is hovered
            const doNotHighlight = function (d) {
                d3.selectAll(".bubbles")
                    .transition()
                    .duration(200)
                    .style("fill", d => color(d.region))
                // .attr("r", 3);
            }
            // Add a legend(interactive)

            svg.selectAll("myrect")
                .data(TotalRegionalIndicator)
                .enter()
                .append("circle")
                .attr("cx", margin.left + 450)
                .attr("cy", function (d, i) { return 20 + i * 25 })
                .attr("r", 7)
                .style("fill", function (d) { return color(d.region) })
                .on("mouseover", highlight)
                .on("mouseleave", doNotHighlight)

            // Add labels beside legend dots
            svg.selectAll("mylabels")
                .data(TotalRegionalIndicator)
                .enter()
                .append("text")
                .attr("x", margin.left + 466)
                .attr("y", function (d, i) { return 20 + i * 25 })
                .style("fill", function (d) { return color(d.region) })
                .text(function (d) { return d.value })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
                .on("mouseover", highlight)
                .on("mouseleave", doNotHighlight);
            // console.log(data)
            // Add a legend(interactive)



            // ------------------------------------------------------------------------------------------


            const x = d3.scaleLinear()
                .domain([0, 0.5])
                .range([0, innerwidth]);
            svg.append("g")
                .attr("transform", "translate(0," + innerheight + ")")
                .call(d3.axisBottom(x));

            svg.append("text")
                .attr("text-anchor", "end")

                .attr("x", innerwidth - 200)
                .attr("y", innerheight + 50)
                .text("Total Deaths/population (%)");


            // Add Y axis
            var y = d3.scaleLinear()
                .domain([0, 65])
                .range([chartHeight, 0]);
            svg.append("g")
                .call(d3.axisLeft(y));

            svg.append("text")
                .attr("text-anchor", "end")

                .attr("x", 0)
                .attr("y", -20)
                .text("Total Cases/population (%)")
                .attr("text-anchor", "start")

            // Add a scale for bubble size
            var z = d3.scaleLinear()
                .domain([1, 105])
                .range([1, 30]);
            var tooltip = d3.select("body")
                .append("div")
                .style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden")
                .style("box-shadow", "0px 3px 9px rgba(0, 0, 0, .15)")
                .style("padding", "5px")
                .style("background-color", "black")
                .style("border-radius", "5px")
                .style("padding", "10px")
                .style("color", "white")

            // // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
            var showTooltip = function (d) {
                console.log(d)
                tooltip
                    .style("visibility", "visible")
            }
            var moveTooltip = function (d) {
                tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px")
                    .html((d.location) + "<br><span>" + "percentage total vaccinations: " + (parseInt(d.ratio_total_vaccinations) + "%"));
            }
            var hideTooltip = function (d) {
                tooltip
                    .style("visibility", "hidden");
            }
            // Add dots
            svg.append('g')
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                // .attr("class", "bubbles")
                .attr("class", function (d) { return "bubbles " + d.region })

                .attr("cx", function (d) { return x(parseFloat(d.ratio_total_deaths)); })
                .attr("cy", function (d) { return y(parseInt(d.ratio_total_cases)); })
                .attr("r", function (d) { return z(parseFloat(d.ratio_total_vaccinations)); })
                .style("fill", function (d) { return color(d.region); })
                .style("opacity", "0.7")
                .attr("stroke", "black")
                .on("mouseover", showTooltip)
                .on("mousemove", moveTooltip)
                .on("mouseout", hideTooltip);



        });

        // //CSV Data
        // d3.csv("./data/world_total_death_pie_data.csv").then(function (data) {

        //     console.log(data);

        //     //color 
        //     // var colorList = ["#26265C", "#32327A", "#5454CC",
        //     //     "#6969FF", "#8E8EFF", "#B4B4FF"];

        //     var mycolors = ["#26265C", '#1D382B', '#D68C2C', '#1F1F1F',
        //         '#53070D', '#B7264A', '#66976B', '#A54A2B',
        //         '#C7A98C', '#F4A6B3', '#C5BE6A',
        //         '#364277', '#8FBFCC', '#226D7B', '#002E6B'];


        //     const color = d3.scaleOrdinal()
        //         .range(mycolors);

        //     var colorScale = d3.scaleThreshold()
        //         .domain([0, 2, 19, 22, 23, 25])
        //         .range(mycolors);

        //     // Compute the position of each group on the pie:
        //     const pie = d3.pie()
        //         .sort(null);

        //     const data_ready = pie.value(d => d.percentage)(data)
        //         .sort(function (a, b) { return d3.descending(a.value, b.value); });
        //     // Now I know that group A goes from 0 degrees to x degrees and so on.

        //     // shape helper to build arcs:
        //     const arcGenerator = d3.arc()
        //         .innerRadius(0)
        //         .outerRadius(radius)

        //     var formatDecimal = d3.format(",.2f");

        //     // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.

        //     // var paths = svg.selectAll('mySlices').data([null]);
        //     // paths = paths
        //     //     .enter()

        //     // g.selectAll("path").remove();
        //     // g.selectAll("text").remove();

        //     // let paths = g.selectAll('mySlices').data([null]);

        //     // paths = paths
        //     g.selectAll('mySlices')
        //         .data(data_ready)
        //         .join('path')
        //         .attr('d', arcGenerator)
        //         .attr('fill', function (d) {
        //             if (d.data.continent == "Asia") {
        //                 return ("#FF1D33")

        //             } else {
        //                 return (color(d.value))
        //                 // return (colorScale(d.value))

        //             }
        //         })
        //         .attr("stroke", "#E0E0E0")
        //         .style("stroke-width", "1px")
        //         .style("opacity", 1);

        //     // Now add the annotation. Use the centroid method to get the best coordinates
        //     g.selectAll('mySlices')
        //         .data(data_ready)
        //         .join('text')
        //         .text(function (d) { return d.data.continent + " " + formatDecimal(d.value) + "%" })
        //         .attr("transform", function (d) { return `translate(${arcGenerator.centroid(d)})` })
        //         .style("text-anchor", "middle")
        //         .style("fill", "#E0E0E0")
        //         .style("font-size", "1em")

        //     // close of Data function from csv
        // });


    };
    function marginConvention(selection, props) {
        const { width, height, margin, className = "margin-group" } = props;
        let g = selection
            .selectAll('.' + className).data([null]);
        g = g.enter().append('g')
            .attr('class', className)
            .merge(g)
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const innerwidth = width - margin.left - margin.right;
        const innerheight = height - margin.top - margin.bottom;

        return { g, innerwidth, innerheight }
    };
    function labeledYAxis(selection, props) {

        const {
            yScale,
            innerheight,
            axisLabelFill,
            yAxisLabelOffset,
            yAxisTickFontSize,
            yAxisLabelFontSize,
            yAxisTickFontFill,
            yAxisTickLineStroke,
            yAxisDomainLineStroke,
            yAxisTickDensity } = props;

        // Y axis 
        const yAxis = d3.axisLeft(yScale)
            .ticks(innerheight / yAxisTickDensity);
        let yAxisG = selection.selectAll('.yaxis-group').data([null]);
        yAxisG = yAxisG.enter().append('g')
            .attr("class", "yaxis-group")
            .merge(yAxisG);
        yAxisG.call(yAxis);
        yAxisG.selectAll('.tick text')
            .style('font-size', yAxisTickFontSize)
            .attr('fill', yAxisTickFontFill);
        yAxisG.selectAll('.tick line')
            .attr('stroke', yAxisTickLineStroke);

        yAxisG.selectAll('.domain')
            .attr('stroke', yAxisDomainLineStroke);

        //Y Axis Label
        let yAxisLabel = yAxisG.selectAll('.yaxis-label').data([null]);
        yAxisLabel = yAxisLabel.enter().append('text')
            .attr('class', "yaxis-label")
            .merge(yAxisLabel)
            .attr('fill', axisLabelFill)
            .text('Y Axis')
            .attr('transform', 'rotate(-90)')
            .attr('x', -innerheight / 2)
            .attr('y', yAxisLabelOffset)
            .style('font-size', yAxisLabelFontSize);
    }

    function labeledXAxis(selection, props) {

        const {
            xScale,
            innerwidth,
            innerheight,
            axisLabelFill,
            xAxisLabelOffset,
            xAxisTickFontSize,
            xAxisLabelFontSize,
            xAxisTickFontFill,
            xAxisTickLineStroke,
            xAxisDomainLineStroke,
            xAxisTickDensity } = props;


        const xAxis = d3.axisBottom(xScale)
            .ticks(innerwidth / xAxisTickDensity);

        let xAxisG = selection.selectAll('.xaxis-group').data([null]);
        xAxisG = xAxisG.enter().append('g')
            .attr("class", "xaxis-group")
            .merge(xAxisG)
            .attr('transform', `translate(0, ${innerheight})`);;

        xAxisG.call(xAxis);
        xAxisG.selectAll('.tick text')
            .style('font-size', xAxisTickFontSize)
            .attr('fill', xAxisTickFontFill);
        xAxisG.selectAll('.tick line')
            .attr('stroke', xAxisTickLineStroke);
        xAxisG.selectAll('.domain')
            .attr('stroke', xAxisDomainLineStroke);

        //Asix Labels

        let xAxisLabel = xAxisG.selectAll('.xaxis-label').data([null]);

        xAxisLabel = xAxisLabel.enter().append('text')
            .attr('class', "xaxis-label")
            .merge(xAxisLabel)
            .attr('fill', axisLabelFill)
            .text('X Axis')
            .attr('x', innerwidth / 2)
            .attr('y', xAxisLabelOffset)
            .style('font-size', xAxisLabelFontSize);


    }

}