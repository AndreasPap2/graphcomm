
const categories = [
    "ambiguous neg", "ambiguous neu", "ambiguous pos",
    "high neg", "high neu", "high pos",
    "low neu", "low pos",
    "mild neg", "mild neu", "mild pos"
];

// Define fixed colors manually
const categoryColors = {
    "ambiguous neg": "#6a0dad",
    "ambiguous neu": "#8a2be2",
    "ambiguous pos": "#9370db",
    "high neg": "#1f77b4",
    "high neu": "#17becf",
    "high pos": "#2ca02c",
    "low neu": "#7f7f7f",
    "low pos": "#bcbd22",
    "mild neg": "#ff7f0e",
    "mild neu": "#d62728",
    "mild pos": "#ffbb78"
};

// Placeholder dummy data
const data = categories.map(cat => ({
    category: cat,
    values: [
        { date: new Date(2020, 0, 1), percentage: Math.random() * 40, count: Math.floor(Math.random() * 5000) },
        { date: new Date(2021, 1, 1), percentage: Math.random() * 40, count: Math.floor(Math.random() * 5000) },
        { date: new Date(2022, 2, 1), percentage: Math.random() * 40, count: Math.floor(Math.random() * 5000) },
        { date: new Date(2023, 3, 1), percentage: Math.random() * 40, count: Math.floor(Math.random() * 5000) }
    ]
}));

const margin = { top: 60, right: 250, bottom: 80, left: 70 },
      width = 1600 - margin.left - margin.right,
      height = 1000 - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleTime()
    .domain([
        d3.min(data, d => d3.min(d.values, v => v.date)),
        d3.max(data, d => d3.max(d.values, v => v.date))
    ])
    .range([0, width]);

const y = d3.scaleLinear()
    .domain([0, 45])
    .range([height, 0]);

// X axis
svg.append("g")
    .attr("class", "x-axis")  // add this
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

// Y axis
svg.append("g")
    .attr("class", "y-axis")  // add this
    .call(d3.axisLeft(y));


// X axis label
svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 0)
    .text("Month")
    .style("font-size", "20px").style("font-weight", "bold");

// Y axis label
svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .text("Percentage of Comments")
    .style("font-size", "20px").style("font-weight", "bold");

svg.selectAll(".x-axis text")
    .style("font-size", "16px");

svg.selectAll(".y-axis text")
    .style("font-size", "16px");


const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.percentage));

const tooltip = d3.select("#tooltip");
const selectedCategories = new Set(categories); // all visible by default

svg.selectAll(".line-group")
    .data(data)
    .join("g")
    .attr("class", d => `line-group ${d.category.replace(/\s+/g, '-')}`)
    .each(function(d) {
        const group = d3.select(this);

        group.append("path")
            .datum(d.values)
            .attr("fill", "none")
            .attr("stroke", categoryColors[d.category])
            .attr("stroke-width", 2)
            .attr("d", line);

        group.selectAll("circle")
            .data(d.values)
            .join("circle")
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.percentage))
            .attr("r", 8)
            .attr("fill", categoryColors[d.category])
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                    tooltip.html(
                        `Category: ${d3.select(this.parentNode).datum().category}<br>
                         Date: ${d3.timeFormat("%B %Y")(d.date)}<br>
                         Count: ${d.count}<br>
                         Percentage: ${d.percentage.toFixed(2)}%`
                    )
                    
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    });

// Legend
const legend = svg.selectAll(".legend")
    .data(categories)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(${width + 30},${i * 22})`);

legend.append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", d => categoryColors[d]);

legend.append("text")
    .attr("x", 20)
    .attr("y", 12)
    .attr("dy", "0.35em")
    .style("font-size", "18px")
    .text(d => d);

    legend.on("click", function(event, category) {
        if (selectedCategories.has(category)) {
            selectedCategories.delete(category);
        } else {
            selectedCategories.add(category);
        }
    
        // Update line visibility (dimming)
        svg.selectAll(".line-group")
            .style("opacity", d => selectedCategories.has(d.category) ? 1 : 0.1);
    
        // Update legend item opacity
        d3.selectAll(".legend").select("rect")
            .style("opacity", d => selectedCategories.has(d) ? 1 : 0.3);
    });
    
