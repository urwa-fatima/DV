window.onload = function () {
    render("bubble_chart", "ratio_total_vaccinations");
    window.addEventListener('resize', function () { render("bubble_chart"); });

    d3.select('#graphContent')
        .on('change', function () {
            var newData = d3.select(this).node().value;
            console.log(newData)
            console.log("newData")
            render("bubble_chart", newData);
        });

    function render(divId, selectedColumn) {
        const myTheme = {
            axisLabelFill: '#635F5D',
            xAxisLabelOffset: 50,
            yAxisLabelOffset: -50,
            xAxisTickFontSize: '12px',
            yAxisTickFontSize: '12px',
            xAxisLabelFontSize: '1.3em',
            yAxisLabelFontSize: '1.3em',
            xAxisTickFontFill: '#8E8883',
            yAxisTickFontFill: '#8E8883',
            xAxisTickLineStroke: '#C0C0BB',
            yAxisTickLineStroke: '#C0C0BB',
            xAxisDomainLineStroke: '#C0C0BB',
            yAxisDomainLineStroke: '#C0C0BB',
            xAxisTickDensity: 70, // pixels per tick
            yAxisTickDensity: 70, // pixels per tick
            legendFontSize: '0.8em',
            legendFontFill: '#8E8883'
        };
        const divID = d3.select('#' + divId);
        var width = divID.node().getBoundingClientRect().width;
        // console.log(width)
        bubble_chart(divID, selectedColumn, Object.assign({}, myTheme, {
            // width: divID.node().getBoundingClientRect().width,
            width: 550,
            height: 400,
            // height: width / 2,
            margin: { top: 20, bottom: 100, left: 80, right: 20 }
        }));

    }
    function bubble_chart(selection, selectedColumn, props) {

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
            .domain([0, 70])
            .range([innerheight, 0]);

        labeledYAxis(g, Object.assign({}, props, { yScale, innerheight, yLabelText: "Total Cases/Population (%)" }));


        //X Axis
        const xScale = d3.scaleLinear()
            .domain([0, 0.5])
            .range([0, innerwidth]);

        labeledXAxis(g, Object.assign({}, props, { xScale, innerwidth, innerheight, xLabelText: "Total Deaths/Population (%)" }));

        // Z Axis
        // Add a scale for bubble size
        var domain = 105;
        var range = 30;
        if (selectedColumn == 'gdp_per_capita') {
            domain = 105000;
            range = 40
        } else if (selectedColumn == 'diabetes_prevalence') {
            domain = 18;
        } else if (selectedColumn == 'handwashing_facilities') {
            domain = 100;
            range = 30
        } else if (selectedColumn == 'hospital_beds_per_thousand') {
            domain = 14;
            range = 50
        }
        else if (selectedColumn == 'human_development_index') {
            domain = 0.99;
            range = 30
        }
        console.log(domain)
        var z = d3.scaleLinear()
            .domain([0, domain])
            .range([1, range]);

        d3.csv("../data/bubble_data.csv", function (data) {

            console.log(data)

            var result = data.reduce(function (r, a) {
                r[a.Regional_indicator] = r[a.Regional_indicator] || [];
                r[a.Regional_indicator].push(a);
                return r;
            }, Object.create(null));

            var GroupbyRegionalIndicator = Object.keys(result).map((key) => [key, result[key]]);

            var TotalRegionalIndicator = GroupbyRegionalIndicator.map((d, i) => ({ region: d[1][0].region, value: d[0] }));

            // console.log(TotalRegionalIndicator)
            var mycolors = ["#a30b71", '#8FBFCC', "#26265c", "#ffd20a", '#008080', "#FF1D33", '#226D7B', '#002E6B'];
            const color = d3.scaleOrdinal()
                .domain(TotalRegionalIndicator)
                .range(mycolors)

            // Highlight the group that is hovered
            var highlight = function (d) {
                console.log(d)
                selected_region_key = d.region
                d3.selectAll(".bubbles")
                    .transition()
                    .duration(200)
                    .style("fill", "lightgrey")
                // .attr("r", 3)

                d3.selectAll("." + selected_region_key).raise()
                    .transition()
                    .duration(200)
                    .style("fill", color(selected_region_key))
                // .attr("r", 7)
            }
            // Highlight the type that is hovered
            // const doNotHighlight = function (d) {
            //     d3.selectAll(".bubbles")
            //         .transition()
            //         .duration(200)
            //         .style("fill", d => color(d.region))
            //     // .attr("r", 3);
            // }

            // Add a legend(interactive)

            var legWidth = 500, legHeight = 100, legMargin = { top: 5, bottom: 5, left: 5, right: 5 };

            var legend_svg = d3.select("#my_legend").selectAll("svg").data([null]);

            legend_svg = legend_svg.enter()
                .append('svg')
                .merge(legend_svg)
                .attr("width", legWidth)
                .attr("height", legHeight);

            legend_svg.selectAll("g").remove();

            // let legend_label = legend_svg.selectAll('.label_group').data([null]);
            // legend_label = legend_label
            //     .enter()
            //     .append("g")
            //     .merge(legend_label)
            //     .attr("class", "label_group")
            // .attr("transform", `translate(${width - margin.right} , 0)`);

            legendConvention(legend_svg, Object.assign({}, props, {
                csvData: TotalRegionalIndicator,
                width: legWidth,
                height: legHeight,
                margin: legMargin,
                legColor: color,
                funcOnHover: highlight,
                funcNoHover: doNotHighlight,
                className: "legend"
            }))

            // ------------------------------------------------------------------------------------------

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
                selected_region_key = d.region
                d3.selectAll(".dot")
                    .transition()
                    .duration(200)
                    .style("fill", "lightgrey")
                // .attr("r", 3)

                d3.selectAll("." + selected_region_key)
                    .transition()
                    .duration(200)
                    .style("fill", color(selected_region_key))
                // .attr("r", 7)
                tooltip
                    .style("visibility", "visible")
                tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px")
                    .html((d.location) + "<br><span>" + "percentage total vaccinations: " + (parseInt(d.ratio_total_vaccinations) + "%"));
                // .html((d.location) + "<br><span>" + "Total cases:  " + (parseInt(d.total_cases) + "<br><span>" + "population: " + (d.population) + "<br> aged 65 and older: " + d.aged_65_older));

            }
            var moveTooltip = function (d) {
                tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px")
                    .html((d.location) + "<br><span>" + "percentage total vaccinations: " + (parseInt(d.ratio_total_vaccinations) + "%"));
                // .html((d.location) + "<br><span>" + "Total cases:  " + (parseInt(d.total_cases) + "<br><span>" + "population: " + (d.population) + "<br> aged 65 and older: " + d.aged_65_older));
            }

            var doNotHighlight = function (d) {
                d3.selectAll(".dot")
                    .transition()
                    .duration(200)
                    .style("fill", d => color(d.region))
                    .attr("r", 3);

                // tooltip.style("display", "none");
            }
            const hideTooltip = function (d) {
                tooltip
                    .style("visibility", "hidden");
            }

            // Add dots
            g.append('g')
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                // .attr("class", "bubbles")
                .attr("class", function (d) { return "bubbles " + d.region })

                .attr("cx", function (d) { return xScale(parseFloat(d.ratio_total_deaths)); })
                .attr("cy", function (d) { return yScale(parseInt(d.ratio_total_cases)); })
                .attr("r", function (d) { return z(parseFloat(d[selectedColumn])); })
                .style("fill", function (d) { return color(d.region); })
                .style("opacity", "0.7")
                .attr("stroke", "black")
                .on("mouseover", showTooltip)
                .on("mousemove", moveTooltip)
                .on("mouseout", hideTooltip);



        });

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
            yAxisTickDensity,
            yLabelText } = props;

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
            .text(yLabelText)
            .attr('transform', 'rotate(-90)')
            .attr('x', -innerheight / 4.5)
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
            xAxisTickDensity,
            xLabelText } = props;


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
            .text(xLabelText)
            .attr('x', innerwidth / 2)
            .attr('y', xAxisLabelOffset)
            .style('font-size', xAxisLabelFontSize);


    }

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
                tspan = text.text(null).append("tspan").attr("x", 20).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 20).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }


    function legendConvention(selection, props) {
        const { csvData,
            legendFontSize,
            legColor,
            funcOnHover,
            funcNoHover,
            className = "legend" } = props;

        var n = csvData.length / 2;
        var itemWidth = 150;
        var itemHeight = 50;

        let g = selection
            .selectAll('.' + className).data([null]);
        g = g.data(csvData).enter().append('g')
            .attr('class', className)
            .merge(g)
            .attr("transform", function (d, i) { return "translate(" + i % n * itemWidth + "," + Math.floor(i / n) * itemHeight + ")"; });

        var rects = g.append('rect')
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", function (d, i) { return legColor(d.region); })
            .on("click", funcOnHover)
            .on("mouseover", funcOnHover)
            .on("mouseleave", funcNoHover);

        var text = g.append('text')
            .attr("dy", 0)

            .attr("x", 20)
            .attr("y", 12)
            .style("fill", function (d) { return legColor(d.region) })
            .style('font-size', legendFontSize)
            .text(function (d) { return d.value }).call(wrap, 100, 1)
            .on("click", funcOnHover)
            .on("mouseover", funcOnHover)
            .on("mouseleave", funcNoHover);


        // let g = selection
        //     .selectAll('.' + className).data([null]);
        // g = g.enter().append('g')
        //     .attr('class', className)
        //     .merge(g)
        //     .attr('width', width)
        //     .attr('height', height)
        //     .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // // circles
        // g.selectAll("mycircles")
        //     .data(csvData)
        //     .enter()
        //     .append("circle")
        //     .attr("cx", margin.left)
        //     .attr("cy", function (d, i) { return 20 + i * 25 })
        //     .attr("r", 7)
        //     .style("fill", function (d) { return legColor(d.region) })
        //     .on("click", funcOnHover)
        //     .on("mouseover", funcOnHover)
        //     .on("mouseleave", funcNoHover)

        // g.selectAll("mylabels")
        //     .data(csvData)
        //     .enter()
        //     .append("text")
        //     .attr("x", margin.left + 16)
        //     .attr("y", function (d, i) { return 20 + i * 25 })
        //     // .attr('dy', 0)
        //     .style("fill", function (d) { return legColor(d.region) })
        //     .style('font-size', legendFontSize)
        //     .text(function (d) { return d.value }) //.call(wrap, 50, 1)
        //     .attr("text-anchor", "left")
        //     .style("alignment-baseline", "middle")
        //     .on("click", funcOnHover)
        //     .on("mouseover", funcOnHover)
        //     .on("mouseleave", funcNoHover);

        return { g }
    };

}