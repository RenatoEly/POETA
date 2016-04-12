/**
 Copyright (c) 2014 BrightPoint Consulting, Inc.

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
*/

function main() {

    var m = [20, 120, 20, 120],
        w = 1280 - m[1] - m[3],
        h = 900 - m[0] - m[2],
        i = 0,
        root = {};

    var spendField = "sum_Federal";
    var sumFields = ["Federal", "GovXFer", "State", "Local"];
    var sourceFields = ["Category", "Level1", "Level2", "Level3", "Level4", "Level5", "Level6", "Level7", "Level8", "Level9", "Level10"];

	//Atributo que será usado para calcular a cor dos nós
	var campoAnalize = "sum_Federal";
	//Possíveis cores dos nós. Vermelho e verde, respectivamente.
	var cores=["#ff0000","#ffff00","#00ff00"];
	//valores do dominio para escala de cores. Menor valor fica a primeira cor do array cores e o maior a segunda.
	var dominio = [0,10,20];

    var colors = ["#bd0026", "#fecc5c", "#fd8d3c", "#f03b20", "#B02D5D",
        "#9B2C67", "#982B9A", "#692DA7", "#5725AA", "#4823AF",
        "#d7b5d8", "#dd1c77", "#5A0C7A", "#5A0C7A"];

    var formatNumber = d3.format(",.2f");
    var formatCurrency = function (d) {
        return d
    };

    var tree = d3.layout.tree();
    var circles={};
    var paths={};
    var labels={};

    tree.children(function (d) { return d.values; }).size([h, w]);

    var toolTip = d3.select(document.getElementById("toolTip")); //Todo o quadro que aparece ao passar o mouse em um nó
    var header = d3.select(document.getElementById("head"));	 //Texto que aparece no topo do toolTip
    var header1 = d3.select(document.getElementById("header1")); //Texto logo abaixo do header do toolTip
    var header2 = d3.select(document.getElementById("header2")); //Texto abaixo do anterior

    var fedSpend = d3.select(document.getElementById("fedSpend")); //Subquadro "Federal Funds" dentro do toolTip

    var stateSpend = d3.select(document.getElementById("stateSpend")); //Subquadro "State Funds" dentro do toolTip

    var localSpend = d3.select(document.getElementById("localSpend")); //Subquadro "Local Funds" dentro do toolTip
					//Todos os quadros e header's definidos aqui são declarados no proprio index.html

    var federalButton = d3.select(document.getElementById("federalButton"));
    var stateButton = d3.select(document.getElementById("stateButton"));
    var localButton = d3.select(document.getElementById("localButton"));
    var federalTip = d3.select(document.getElementById("federalTip"));
    var stateTip = d3.select(document.getElementById("stateTip"));
    var localTip = d3.select(document.getElementById("localTip"));


    var diagonal = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });

    var svg = d3.select("#body").append("svg:svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    var levelCeil=[{},{},{},{},{},{},{},{},{},{},{}];   //Acrescentei Mais Nós (Níveis de Célula) 25/03/2016

    var nodeRadius;

    d3.csv("data/FederalBudget_2013.csv", function (csv) {

        var data = [];

        //Remove all zero values nodes
        csv.forEach(function (d) {
            var t = 0;
            for (var i = 0; i < sumFields.length; i++) {
                t += Number(d[sumFields[i]]);
            }
            if (t > 0) {
                data.push(d);
            }
        })

        var nest = d3.nest()
            .key(function (d) {
                return d.Level1;
            })
            .key(function (d) {
                return d.Level2;
            })
            .key(function (d) {
                return d.Level3;
            })
            .key(function (d) {   //======================== 
                return d.Level4;  //Acrescentei este level  
            })                    //========================
            .key(function (d) {   //======================== 
                return d.Level5;  //Acrescentei este level  
            })                    //========================
            .key(function (d) {   //======================== 
                return d.Level6;  //Acrescentei este level  
            })                    //========================
            .key(function (d) {   //======================== 
                return d.Level7;  //Acrescentei este level  
            })                    //========================
            .key(function (d) {   //======================== 
                return d.Level8;  //Acrescentei este level  
            })                    //========================
            .key(function (d) {   //======================== 
                return d.Level9;  //Acrescentei este level  
            })
            .entries(data);

        root = {};
        root.values = nest;
        root.x0 = h / 2;
        root.y0 = 0;

        var nodes = tree.nodes(root).reverse();

        tree.children(function (d) {
            return d.children;
        });

        initialize();

        // Initialize the display to show a few nodes.
        root.values.forEach(toggleAll);

        toggleNodes(root.values[2]);
        toggleNodes(root.values[2].values[0]);
        toggleNodes(root.values[3]);

        update(root);

        toggleButtons(0);

        function initialize() {

            federalButton.on("click", function (d) {
                toggleButtons(0);
                spendField = "sum_Federal";
                update(root);
            });

            stateButton.on("click", function (d) {
                toggleButtons(1);
                spendField = "sum_State";
                update(root);
            });

            localButton.on("click", function (d) {
                toggleButtons(2);
                spendField = "sum_Local";
                update(root);
            });

            for (var i = 0; i < sumFields.length; i++) {
                for (var y = 0; y < levelCeil.length; y++) {
                    levelCeil[y]["sum_" + sumFields[i]] = 0;
                }
            }

            sumNodes(root.children);
        }

        function toggleAll(d) {
            if (d.values && d.values.actuals) {
                d.values.actuals.forEach(toggleAll);
                toggleNodes(d);
            }
            else if (d.values) {
                d.values.forEach(toggleAll);
                toggleNodes(d);
            }
        }


    });

    function setSourceFields(child, parent) {
        if (parent) {
            for (var i = 0; i < sourceFields.length; i++) {
                var sourceField = sourceFields[i];
                if (child[sourceField] != undefined) {
                    child["source_" + sourceField] = child[sourceField];
                }
                parent["source_" + sourceField] = (child["source_" + sourceField]) ? child["source_" + sourceField] : child[sourceField];
            }
        }

    }

    function sumNodes(nodes) {
        for (var y = 0; y < nodes.length; y++) {
            var node = nodes[y];
            if (node.children) {
                sumNodes(node.children);
                for (var z = 0; z < node.children.length; z++) {
                    var child = node.children[z];
                    for (var i = 0; i < sumFields.length; i++) {
                        if (isNaN(node["sum_" + sumFields[i]])) node["sum_" + sumFields[i]] = 0;
                        node["sum_" + sumFields[i]] += Number(child["sum_" + sumFields[i]]);
                        if ((node.parent)) {
                            levelCeil[node.depth-1]["sum_" + sumFields[i]] = Math.max(levelCeil[node.depth-1]["sum_" + sumFields[i]], Number(node["sum_" + sumFields[i]]));
                            setSourceFields(node, node.parent);
                        }
                    }
                }
            }
            else {
                for (var i = 0; i < sumFields.length; i++) {
                    node["sum_" + sumFields[i]] = Number(node[sumFields[i]]);
                    if (isNaN(node["sum_" + sumFields[i]])) {
                        node["sum_" + sumFields[i]] = 0;
                    }
                }
            }
            setSourceFields(node, node.parent);
        }
    }

    function update(source) {

        var duration = d3.event && d3.event.altKey ? 5000 : 500;

        var nodes = tree.nodes(root);

        var depthCounter = 0;

        nodeRadius = d3.scale.sqrt()
            .domain([0, levelCeil[0][spendField]])
            //.range([1, 40]);
            .range([8, 8]);

        // Normalize for fixed-depth.
        nodes.forEach(function (d) {
            d.y = d.depth * 110;  //Diminuí o tamanho da perna de um nó para o outro (25/03/2016)
            d.numChildren = (d.children) ? d.children.length : 0;
			var escala = d3.scale.linear().range(cores);
			
			escala.domain(dominio); //Parâmetro usado para definir a mudança de cores (Verde, Vermelho, amarelo)
			
			d.linkColor = escala(d[campoAnalize]);
			});
/*            if (d.depth == 1) {
                d.linkColor = colors[(depthCounter % (colors.length - 1))];
                depthCounter++;
            }
            if (d.numChildren == 0 && d._children) d.numChildren = d._children.length;

        });
*/
        //Set link colors based on parent color
/*        nodes.forEach(function (d) {
            var obj = d;
            while ((obj.source && obj.source.depth > 1) || obj.depth > 1) {
                obj = (obj.source) ? obj.source.parent : obj.parent;
            }
            d.linkColor = (obj.source) ? obj.source.linkColor : obj.linkColor;

        });*/

        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("svg:g")
            .attr("class", "node")
            .attr("id",function (d) { return "node_" + d.key })
            .attr("transform", function (d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on("click", function (d) {
                if (d.numChildren > 50) {
                    alert(d.key + " has too many departments (" + d.numChildren + ") to view at once.");
                }
                else {
                    toggleNodes(d);
                    update(d);
                }
            });

        nodeEnter.append("svg:circle")
            .attr("r", 1e-6)
            .on("mouseover", function (d) {
                node_onMouseOver(d);
            })
            .on("mouseout", function (d) { node_onMouseOut(d)})
            .style("fill", function (d) {
				return d.linkColor;
				})
//                circles[d.key] = this;
//                return d.source ? d.source.linkColor : d.linkColor;
//            })
            .style("fill-opacity", ".8")
            .style("stroke", function (d) {
				return d.linkColor;
//                return d.source ? d.source.linkColor : d.linkColor;
            });

        nodeEnter.append("svg:text")
            .attr("x", function (d) {
                labels[d.key] = this;
                return d.children || d._children ? -15 : 15;
            })
            .attr("dy", ".35em")
            .attr("text-anchor",
            function (d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function (d) {
                //var ret = (d.depth == 4) ? d.Level4 : d.key;
                var ret = (d.depth == 10) ? d.Level10 : d.key; //Mudei esta linha, acrescentando o level 9
                ret = (String(ret).length > 25) ? String(ret).substr(0, 22) + "..." : ret;
                return ret;
            })
            .style("fill-opacity", "0")
            .style("font-size","12")
            .on("mouseover", function (d) {node_onMouseOver(d);})
            .on("mouseout", function (d) { node_onMouseOut(d)});

        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
				if(d.parent){
					if(d.parent.x === d.x){
						d.x = d.x-0.1;
					}
				}
                return "translate(" + d.y + "," + d.x + ")";
            });

        nodeUpdate.select("circle")
            .attr("r", function (d) { return isNaN(nodeRadius(d[spendField])) ? 2: nodeRadius(d[spendField]); })
            .style("fill", function (d) {
				return d.linkColor;
				})
//				return d.source ? d.source.linkColor : d.linkColor 
//				})
            .style("fill-opacity", 1
//			function (d) { return ((d.depth + 1) / 5);}
			);

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle").attr("r", 1e-6);

        nodeExit.select("text").style("fill-opacity", 1e-6);

        var link = svg.selectAll("path.link")
            .data(tree.links(nodes), function (d) {
                return d.target.id;
            });
		
        var rootCounter = 0;

        // Enter any new links at the parent's previous position.
        link.enter().insert("svg:path", "g")
            .attr("class", "link")
            .attr("id",function (d) { return "link_" + d.target.key })
            .attr("d", function (d) {
                paths[d.target.key] = this;
                if (Number(d.target[spendField]) > 0) {
                    var o = {x: source.x0, y: source.y0};
                    return diagonal({source: o, target: o});
                }
                else {
                    null;
                }
            })
            .style("stroke", function (d, i) {
				var gradient = svg.append("defs")
				.append("linearGradient")
				.attr("id", "gradient_"+d.target.id)
				.attr("x1", "0%")
				.attr("y1", "0%")
				.attr("x2", "80%")
				.attr("y2", "0%")
//				.attr("spreadMethod", "pad");
				
				gradient.append("stop")
			    .attr("offset", "0%")
			    .attr("stop-color", d.source.linkColor)
			    .attr("stop-opacity", 1);
				
				gradient.append("stop")
			    .attr("offset", "100%")
			    .attr("stop-color", d.target.linkColor)
			    .attr("stop-opacity", 1);
                
			   	return "url(#gradient_"+d.target.id+")"
/*				if (d.source.depth == 0) {
                    rootCounter++;
                    return (d.source.children[rootCounter - 1].linkColor);
                }
                else {
                    return (d.source) ? d.source.linkColor : d.linkColor;
                }*/
            })
            .style("stroke-width", function (d, i) { return isNaN(nodeRadius(d.target[spendField])) ? 4: nodeRadius(d.target[spendField])*2; })
//            .style("stroke-opacity",function (d) { return d.target[spendField] <= 0 ? .1 : ((d.source.depth + 1) / 4.5); })
            .style("stroke-linecap", "round")
            .on("mouseover", function (d) {node_onMouseOver(d.source);})
            .on("mouseout", function (d) { node_onMouseOut(d.source)});

        link.transition()
            .duration(duration)
            .attr("d", diagonal)
            .style("stroke-width", function (d, i) { return isNaN(nodeRadius(d.target[spendField])) ? 4: nodeRadius(d.target[spendField])*2; })
            .style("stroke-opacity",function (d) {
                var ret = ((d.source.depth + 1) / 4.5)
                if (d.target[spendField] <= 0) ret = .1;
				return 1;
                return ret;
            })

        link.exit().transition()
            .duration(duration)
            .attr("d", diagonal)
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });


        function node_onMouseOver(d) {

            if (typeof d.target != "undefined") {
                d = d.target;
            }

            toolTip.transition()
                .duration(200)
                .style("opacity", ".9");
            header.text(d["source_Level1"]);
            header1.text((d.depth > 1) ? d["source_Level2"] : "");
            header2.html((d.depth > 2) ? d["source_Level3"] : "");
            if (d.depth > 3) header2.html(header2.html() + " - " + d["source_Level4"]);

            fedSpend.text(formatCurrency(d["sum_Federal"]));

            stateSpend.text(formatCurrency(d["sum_State"]));

            localSpend.text(formatCurrency(d["sum_Local"]));

            toolTip.style("left", (d3.event.pageX + 15) + "px")
                .style("top", (d3.event.pageY - 75) + "px");

            d3.select(labels[d.key]).transition().style("font-weight","bold").style("font-size","16");;
            d3.select(circles[d.key]).transition().style("fill-opacity",0.6);
//            highlightPath(d);

//            function highlightPath(d) {
//                if (d) {
//                    d3.select(paths[d.key]).style("stroke-opacity",function (d) {return d.target[spendField] <= 0 ? .1 + .3 : ((d.source.depth + 1) / 4.5) + .3;});
//                    highlightPath(d.parent);
//                }
//            }



        }

        function node_onMouseOut(d) {
            toolTip.transition()
                .duration(500)
                .style("opacity", "0");

            d3.select(labels[d.key]).transition().style("font-weight","normal").style("font-size","12");
            d3.select(circles[d.key]).transition().style("fill-opacity",0.3);
//            noHighlightPath(d);

//            function noHighlightPath(d) {
//                if (d) {
//                    d3.select(paths[d.key]).style("stroke-opacity",function (d) {return d.target[spendField] <= 0 ? .1 : ((d.source.depth + 1) / 4.5);});
//                    noHighlightPath(d.parent);
 //              }
//            }
        }


    }



    function toggleNodes(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
    }

    function toggleButtons(index) {
        d3.selectAll(".button").attr("class",function (d,i) { return (i==index) ? "button selected" : "button"; });
        d3.selectAll(".tip").attr("class",function (d,i) { return (i==index) ? "tip selected" : "tip";});
    }

}
