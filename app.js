/*
Fragen: wie könne ich die einzelnen Werte ordnen, so dass immer zu unterst der größte Wert ist?
Jetzt habe ich das im csv sortiert...

ToDo: 
- Linien rund um Boxes zeichnen?
- Angabe der Mengen wie? Vielleicht mit Tooltips - aber fixiert, irgendwie? oder mit fixierten Linien?
- Zwischen den Linien mit Brush zoomen? 
- Gebühren und Abgaben getrennt markieren? Bundes-Abgaben getrennt markieren?
- Foto?
- Ticks wer bei Bundesländern
- mit Scale spielen?


*/

(function(){ 

  	var margin = {top: 100, right: 20, bottom: 30, left: 150},
        width = 760 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

	//ordinal scale for the Bundeslaender
	var y = d3.scale.ordinal()
		.rangeRoundBands([height, 0], 0.3);

	//linear scale, range: 0, 30, domain: 0, max
	var x = d3.scale.linear()
		.range([0, 500]);

	//ordinal color scale
	var color = d3.scale.ordinal()
		.range(["#a05d56","#d0743c", "#ff8c00", "#8a89a6", "#7b6888", "#6b486b"])

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("right")
		.ticks(0); //wieso reagiert die Darstellung niht?;

	var tip = d3.tip()
		.attr("class", "d3-tip")
		.offset([-10, 0])
		.html( function(d){return "<text>" + d.name + ":"+ d3.round((d.x1-d.x0), 2) +" Euro </text>" }); 

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
			var x0 = 0;
			d.gebuehren = color.domain().map(function(name){ return {name: name, x0: x0, x1: x0 += +d[name]} });
			d.gesamt=d.gebuehren[d.gebuehren.length -1].x1;
			//console.log(d);
		});
		
		data.sort(function(a, b){ return b.gesamt - a.gesamt }); //ah, so einfach ist das mit dem sortieren...

		y.domain(data.map(function(d){return d.Bundesland; }) );
		x.domain([0, d3.max(data, function(d){return d.gesamt + 5; }) ]);

		svg.append("g") //gruppe x Achse
			.attr("class", "x axis")
			.attr("transform", "translate("+margin.left + "," + (height +3) + ")")
			.call(xAxis)
			.append("text")
			//.attr("transform", "rotate(-90)")
			.attr("x", 45)
			.attr("dy", "-0.41em")
			.style("text-anchor", "end")
			.text("Euro");

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis);
	
		var bundesland = svg.selectAll(".bundesland")
			.data(data)
			.enter()
			.append("g")
			.attr("class", "g")
			.attr("transform", function(d){ return "translate(0," +y(d.Bundesland)+")" });

		bundesland.selectAll("rect")
			.data(function(d){ return d.gebuehren; })
			.enter()
			.append("rect")
			.attr("height", y.rangeBand() )
			.attr("x", function(d){ return x(d.x0) + margin.left; })
			.attr("width", function(d) { return x(d.x1)-x(d.x0); })
			.style("fill", function(d){ return color(d.name) })
			.style("fill-opacity", "1")
			.on("mouseover", tip.show)
			.on("mouseout", tip.hide);
		
		
		var line = svg.selectAll(".vline")
			.data(data)
			.enter()
			.append("g")
			.attr("class", "g");

		line.selectAll(".vline")
			//.data(function(d){ return d.gebuehren[]; })//Filter nach BUndesland?
			//SiFu - das ist schirch gezeichnet. WIe ginge das dynamischer?
			.data([16.16, 17.32, 17.68, 18.12, 19.78])
			.enter()
			.append("line")
			//.attr("x1", function(d){return (x(d.x0) + margin.left) + (x(d.x1)-x(d.x0))})
			//.attr("x2", function(d){return (x(d.x0) + margin.left) + (x(d.x1)-x(d.x0))})
			.attr("x1", function(d){return margin.left + x(d)})
			.attr("x2", function(d){return margin.left + x(d)})
			.attr("y1", height+3)
			.attr("y2", -60)
			.style("stroke", "#444");


	});


})();
