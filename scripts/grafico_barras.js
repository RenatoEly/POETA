function criarGrafBarras(){
    margin = {top: 10, right: 20, bottom: 30, left: 40};
    width = 400;
    height = 200;

	formatPercent = d3.format(".0");

	x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1);

	y = d3.scale.linear()
		.range([height, 0]);

	xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.tickFormat(formatPercent);

	tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
		return "<strong>"+d.atividade+":</strong> <span style='color:red'>" + d.nota + "</span>";
	})

	grafBarra = d3.select(document.getElementById("grafico")).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

function desenharGrafBarras(d){
			var data = converteDados(d);
				grafBarra.call(tip);
				
					x.domain(data.map(function(d) { return d.atv; }));
					y.domain([0, 10]);
					
					grafBarra.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis);

					grafBarra.append("g")
					.attr("class", "y axis")
					.call(yAxis);
					
					grafBarra.selectAll(".bar")
					.data(data)
					.enter().append("rect")
					.attr("class", "bar")
					.attr("x", function(d) { return x(d.atv); })
					.attr("width", x.rangeBand())
					.attr("y", function(d) { return y(d.nota); })
					.attr("height", function(d) { return height - y(d.nota); })
					.style("fill", function(d) { return escalaNota(d.nota)})
					.on('mouseover', tip.show)
					.on('mouseout', tip.hide)
}
