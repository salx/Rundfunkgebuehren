/*
Fragen: wie könne ich die einzelnen Werte ordnen, so dass immer zu unterst der größte Wert ist?
Jetzt habe ich das im csv sortiert...
*/

(function(){ 

  	var margin = {top: 100, right: 20, bottom: 30, left: 50},
        width = 760 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

	//ordinal scale for the Bundeslaender
	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], 0.4);

	//linear scale, range: 0, 30, domain: 0, max
	var y = d3.scale.linear()
		.range([height, 0]);

	//ordinal color scale
	var color = d3.scale.ordinal()
		.range(["#bc4c75", "#b2c151", "#55c59c", "#7364d1", "#5fb3c0", "#62d273", "#ff7f00"])

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	var tip = d3.tip()
		.attr("class", "d3-tip")
		.offset([-10, 0])
		.html( function(d){return "<text>" + d.name + ":"+ d3.round((d.y1-d.y0), 2) +" Euro </text>" });

	var svg = d3.select("body").append("svg")
		.attr("width", width  + margin.left + margin.right + 300)
		.attr("height", height + margin.top + margin.bottom )
		.append("g")
		.attr("transform", "translate(" + margin.left + ","+margin.top + ")");

	svg.call(tip);
	//load data
	d3.csv("Gebuehren.csv", function(error, data){ 

		color.domain( d3.keys( data[0]).filter( function(key){return key !== "Bundesland"; } ) );

		data.forEach(function(d) {
			var y0 = 0;
			d.gebuehren = color.domain().map(function(name){ return {name: name, y0: y0, y1: y0 += +d[name]} });
			d.gesamt=d.gebuehren[d.gebuehren.length -1].y1;
		});
		
		data.sort(function(a, b){ return b.gesamt - a.gesamt }); //ah, so einfach ist das mit dem sortieren...

		x.domain(data.map(function(d){return d.Bundesland; }) );
		y.domain([0, d3.max(data, function(d){return d.gesamt; }) ]);
	
		svg.append("g") //gruppe x Achse
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (height +3) + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", "0.71em")
			.style("text-anchor", "end")
			.text("Euro");

		var bundesland = svg.selectAll(".bundesland")
			.data(data)
			.enter()
			.append("g")
			.attr("class", "g")
			.attr("transform", function(d){ return "translate(" +x(d.Bundesland)+", 0)" });

		bundesland.selectAll("rect")
			.data(function(d){ return d.gebuehren; })
			.enter()
			.append("rect")
			.attr("width", x.rangeBand() )
			.attr("y", function(d){ return y(d.y1); })
			.attr("height", function(d) { return y(d.y0)-y(d.y1); })
			.style("fill", function(d){ return color(d.name) })
			.style("fill-opacity", "0.8")
			.on("mouseover", tip.show)
			.on("mouseout", tip.hide);

		var legend = svg.selectAll(".legend")
			.data(color.domain().slice())
			.enter()
			.append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i){ return "translate(0," + (20- (i*20)) + ")" });

		legend.append("rect")
			.attr("x", width + 10)
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", color)
			.style("fill-opacity", "0.8");

		legend.append("text")
			.attr("x", width +60)	
			.attr("y", 9)
			.attr("dy", "0.35em")
			.style("text-anchor", "start")
			.text(function(d){ return d; });


	});


})();
