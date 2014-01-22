/*
Fragen: wie könne ich die einzelnen Werte ordnen, so dass immer zu unterst der größte Wert ist?
Jetzt habe ich das im csv sortiert...

ToDo: 
- curly braces on top, ORF, Bund, Länder
- zu den Labels: Gesamtmengen
- Abtrennung auf der Seite. Foto? Linie
- spielen mi curly brace: https://gist.github.com/alexhornbake/6005176. Einbinden?


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

	/*
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("right")
		.ticks(0); //wieso reagiert die Darstellung niht?;
	*/

	var tip = d3.tip()
		.attr("class", "d3-tip")
		.offset([-10, 0])
		.html( function(d){return "<text>" + d.name + ":"+ d3.round((d.x1-d.x0), 2) +" Euro </text>" }); 

	var svg = d3.select("body").append("svg")
		.attr("width", width  + margin.left + margin.right + 300)
		.attr("height", height + margin.top + margin.bottom )
		.append("g")
		.attr("transform", "translate(" + margin.left + ","+margin.top + ")");

	var test = drawCurlyBrace(3,30,4,40,50,0.6);

	svg.call(tip);
	svg.call(drawCurlyBrace);

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
		x.domain([0, d3.max(data, function(d){return d.gesamt + 0.9; }) ]);

		svg.append("g") //gruppe x Achse
			.attr("class", "x axis")
			.attr("transform", "translate("+margin.left + "," + (height +3) + ")")
			.call(xAxis)
			.append("text")
			//.attr("transform", "rotate(-90)")
			.attr("x", -10)
			.attr("dy", "0.41em")
			.style("text-anchor", "end")
			.text("Euro");

		/*	
		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis);
		*/

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

		
		bundesland.append("text")
			.text(function(d){ return d.Bundesland + ": " + d3.round( d.gesamt, 2) + " €"; })
			.style("fill", "#eee")
			.attr("x", margin.left+5)
			.attr("dy", "1.5em")
			.attr("text-anchor", "start");
		
		
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

//  try making curly braces
	
	function drawCurlyBrace(x1,y1,x2,y2,w,q){
		// ich muss hier die Daten definieren....

		var bracket = svg.selectAll("path")
	    	.attr("class","curlyBrace")
	    	//.data(data);//.data(coords); error data is not defined
	    
	    console.log("here");//2 mal. wieso?

	   	bracket
	   		//.enter() enter... has no method
	   		.append("path").attr("class","curlyBrace");

	   	bracket.attr("d", function(d) { return makeCurlyBrace(d.x1,d.y1,d.x2,d.y2,50,0.6); });

		function makeCurlyBrace(x1,y1,x2,y2,w,q){
			//Calculate unit vector
			var dx = x1-x2;
			var dy = y1-y2;
			var len = Math.sqrt(dx*dx + dy*dy);
			dx = dx / len;
			dy = dy / len;

			//Calculate Control Points of path,
			var qx1 = x1 + q*w*dy;
			var qy1 = y1 - q*w*dx;
			var qx2 = (x1 - .25*len*dx) + (1-q)*w*dy;
			var qy2 = (y1 - .25*len*dy) - (1-q)*w*dx;
			var tx1 = (x1 -  .5*len*dx) + w*dy;
			var ty1 = (y1 -  .5*len*dy) - w*dx;
			var qx3 = x2 + q*w*dy;
			var qy3 = y2 - q*w*dx;
			var qx4 = (x1 - .75*len*dx) + (1-q)*w*dy;
			var qy4 = (y1 - .75*len*dy) - (1-q)*w*dx;

    	return ( "M " +  x1 + " " +  y1 +
         		" Q " + qx1 + " " + qy1 + " " + qx2 + " " + qy2 + 
          		" T " + tx1 + " " + ty1 +
          		" M " +  x2 + " " +  y2 +
          		" Q " + qx3 + " " + qy3 + " " + qx4 + " " + qy4 + 
          		" T " + tx1 + " " + ty1 );
		}
	}
	
	//function update(){
	    
	   	
	   	//bracket.exit().remove();			    
	    //coords.shift(); brauch ich nicht
	   	//}
	

	
	/* brauch ich nicht.
	var width = 962;
		var height = 502;
		var coords = [];
		var clickPos = {};

	var svg = d3.select("body").append("svg")
    		.attr("width", width)
    		.attr("height", height)
    		.attr("x1", 3)
    		.attr( "y1", 7)
	*/


})();
