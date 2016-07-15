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
 var toolTipAluno; //Div html que contem o grafico de barras dos nós alunos
 var toolTipGrafLinhas; //Div html que contem o grafico de linhas dos nós atividades
 var toolTipGrafTempo; //Div html que contem o grafico de tempo dos nós alunos
 var toolTip; //Div html que contem as informações das notas nos nós atividades
 var nodeAux;
 var escalaNota; 
 var dominioNota;
 var clickada = true;
 
    var margin;
    var width;
    var height;



//Variáveis usadas para desenhar o grafico de barras nos nós alunos
var x;
var y;
var xAxis;
var yAxis;
var tip;
var grafBarra;

var m = [20, 120, 20, 120],
        w = 4280 - m[1] - m[3],
        h = 900 - m[0] - m[2],
        i = 0,
        root = {};
	var raio = 10;
    var spendField = "sum_Federal";
    var sumFields = ["Federal", "GovXFer", "State", "Local"];
    var sourceFields = ["Category", "Level1", "Level2", "Level3", "Level4", "Level5", "Level6", "Level7", "Level8", "Level9", "Level10", "Level11", "Level12", "Level13", "Level14", "Level15", "Level16", "Level17", "Level18"];
	var campo = ["Nota >= 7","Nota < 7","Desistentes"];
	
	//Atributo que será usado para calcular a cor dos nós
	var campoAnalize = "sum_Federal";
	//Possíveis cores dos nós. Vermelho, amarelo e verde, respectivamente.
	var cores=["#ff0000","#ffff00","#00ff00"];
	//valores do dominio para escala de cores. Menor valor fica a primeira cor do array cores e o maior a segunda.
	var dominio = [0,0.5,1];
	dominioNotas = [1,5,10];
	
	var escala = d3.scale.linear().range(cores);
    
function main() {
	escala.domain(dominio); //Parâmetro usado para definir a mudança de cores (Verde, Vermelho, amarelo)
	
	escalaNota = d3.scale.linear().range(cores);
	escalaNota.domain(dominioNotas);
	
	//Cores para o grafico. Nota >= 7, Nota < 7, Desistentes.
	var coresGrafico = ["#00ff00","#ff0000","#c7dbe5"];

    var colors = ["#bd0026", "#fecc5c", "#fd8d3c", "#f03b20", "#B02D5D",
        "#9B2C67", "#982B9A", "#692DA7", "#5725AA", "#4823AF",
        "#d7b5d8", "#dd1c77", "#5A0C7A", "#5A0C7A"];

    var formatCurrency = function (d) {
        return d
    };

    var tree = d3.layout.tree();
    var circles={};
    var paths={};
    var labels={};

    tree.children(function (d) { return d.values; }).size([h, w]);

    toolTip = d3.select(document.getElementById("toolTip")); //Todo o quadro que aparece ao passar o mouse em um nó
    var header = d3.select(document.getElementById("head"));	 //Texto que aparece no topo do toolTip
    var header1 = d3.select(document.getElementById("header1")); //Texto logo abaixo do header do toolTip
    var header2 = d3.select(document.getElementById("header2")); //Texto abaixo do anterior
    
    toolTipAluno = d3.select(document.getElementById("toolTipAluno"));
    toolTipGrafLinhas = d3.select(document.getElementById("toolTipGrafLinha"));
    toolTipGrafTempo = d3.select(document.getElementById("toolTipGrafTempo"));
    
     criarGrafBarras();
     
     google.charts.load('current', {'packages':['line','timeline']});
 
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

    var fedSpend = d3.select(document.getElementById("fedSpend")); //Subquadro "Federal Funds" dentro do toolTip

    var stateSpend = d3.select(document.getElementById("stateSpend")); //Subquadro "State Funds" dentro do toolTip

    var localSpend = d3.select(document.getElementById("localSpend")); //Subquadro "Local Funds" dentro do toolTip
					//Todos os quadros e header's definidos aqui são declarados no proprio index.html

	var detalhes = false;
    var federalButton = d3.select(document.getElementById("federalButton"));
    var stateButton = d3.select(document.getElementById("stateButton"));
    var localButton = d3.select(document.getElementById("localButton"));

    var diagonal = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });

    var svg = d3.select("#body").append("svg:svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    var levelCeil=[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}];   //Acrescentei Mais Nós (Níveis de Célula) 25/03/2016

    var nodeRadius;

    d3.csv("data/DataBase.csv", function (csv) {

        var data = [];

        //Remove all zero values nodes
        csv.forEach(function (d) {
                data.push(d);
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
            .key(function (d) {  
                return d.Level4; 
            })                   
            .key(function (d) {  
                return d.Level5; 
            })                   
            .key(function (d) {  
                return d.Level6; 
            })                   
            .key(function (d) {  
                return d.Level7; 
            })                   
            .key(function (d) {  
                return d.Level8; 
            })                   
            .key(function (d) {  
                return d.Level9; 
            })
            .key(function (d) {
                return d.Level10;
            })
            .key(function (d) {
                return d.Level11;
            })
            .key(function (d) {
                return d.Level12;
            })
            .key(function (d) {  
                return d.Level13; 
            })                   
            .key(function (d) {  
                return d.Level14; 
            })                   
            .key(function (d) {  
                return d.Level15; 
            })                   
            .key(function (d) {  
                return d.Level16; 
            })                   
            .key(function (d) {  
                return d.Level17; 
            })
            .entries(data);

        root = {};
        root.values = nest;
        removeEmptyNodes(root,null,0);
        root.x0 = h / 2;
        root.y0 = 0;

        var nodes = tree.nodes(root).reverse();
        tree.children(function (d) {
            return d.children;
        });
		
        initialize();

        // Initialize the display to show a few nodes.
        root.values.forEach(toggleAll);
        update(root);

        toggleButtons(0);

        function initialize() {

            federalButton.on("click", function (d) {
                toggleButtons(0);
                detalhes = false;
            });

            stateButton.on("click", function (d) {
                toggleButtons(1);
                detalhes = true;
            });

            localButton.on("click", function (d) {
                toggleButtons(2);
                detalhes = false;
            });

            for (var i = 0; i < sumFields.length; i++) {
                for (var y = 0; y < levelCeil.length; y++) {
                    levelCeil[y]["sum_" + sumFields[i]] = 0;
                }
            }
	    setAnimacao(root.children);
            sumNodesCopia(root);
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

    function sumNodesCopia(root) {
		var pai = {};
		var folhas = [];
		var depth;
        getLeafs(root,folhas);
        for(var i = 0; i < folhas.length; i++){
			setSourceFields(folhas[i], folhas[i].parent);
			pai = folhas[i].parent;
			while(pai.depth > 1){
				setSourceFields(pai, pai.parent);
				if (isNaN(pai[campo[2]])) pai[campo[2]] = 0;
				if (isNaN(pai[campo[1]])) pai[campo[1]] = 0;
				if (isNaN(pai[campo[0]])) pai[campo[0]] = 0;
				depth = pai.depth-1;
				folhas[i]["Nota"+depth] = Number(folhas[i]["Nota"+depth]);
				
				if(isNaN(folhas[i]["Nota"+depth])){ 
					pai[campo[2]]++;
				}
				else if(folhas[i]["Nota"+depth] < 7){
					pai[campo[1]]++;
				}
				else if(folhas[i]["Nota"+depth] >= 7){
					pai[campo[0]]++;
				}
				pai = pai.parent;
			} 
		}
    }

    function update(source) {

        var duration = d3.event && d3.event.altKey ? 5000 : 500;

        var nodes = tree.nodes(root);

        var depthCounter = 0;

        nodeRadius = d3.scale.sqrt()
            .domain([0, levelCeil[0][spendField]])
            .range([8, 8]);

        // Normalize for fixed-depth.
        nodes.forEach(function (d) {
            d.y = d.depth * 170;  //Diminuí o tamanho da perna de um nó para o outro (25/03/2016)
            d.numChildren = (d.children) ? d.children.length : 0;
			
			if(d.depth <= 1){
				d.linkColor = "#0000ff";
			}
			else if(d.numChildren > 0 || d._children){
				d.linkColor = escala(d[campo[0]]/(d[campo[0]] + d[campo[1]] + d[campo[2]]));
			}
			
			else{
				var media = 0;
				var i;
				for(i = 1; i < d.depth-1; i++){
					if(isNaN(d["Nota"+i])){
						d.linkColor = coresGrafico[2];
						break;
					}
					media += d["Nota"+i];
				}
				
				media = media/i;
				
				if(d.linkColor !== coresGrafico[2]) d.linkColor = escalaNota(media);
			}
			});
        var node = svg.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        var nodeEnter = node.enter().append("svg:g")
            .attr("class", "node")
            .attr("id",function (d) { return "node_" + d.key })
            .attr("transform", function (d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on("click", function (d) {
				if(d.depth === 0) return
                if(d.depth === 1){
					toggleAll(d);
                    update(d);
				}
                else{
					if(clickada){
						exibirGrafico(d);
					}
					else{
						esconderGrafico(d);
					}
					clickada = !clickada;
				}
            });

        nodeEnter.append("svg:circle")
            .attr("r", 1e-6)
            .style("fill-opacity", ".8")
            .style("stroke", function (d) {
				return "#000000";
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
                var ret = (!(d.children || d._children)) ? d.Level18 : d.key; //Mudei esta linha, acrescentando o level 9
                ret = (String(ret).length > 25) ? String(ret).substr(0, 22) + "..." : ret;
                return ret;
            })
            .style("fill-opacity", "0")
            .style("font-size","12")

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
            .attr("r", raio+10)
            .style("fill", function (d) {
				return d.linkColor;
				})
            .style("fill-opacity", 1
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
				.attr("x2", "100%")
				.attr("y2", "0%")
				
				gradient.append("stop")
			    .attr("offset", "0%")
			    .attr("stop-color", d.source.linkColor)
			    .attr("stop-opacity", 1);
				
				gradient.append("stop")
			    .attr("offset", "100%")
			    .attr("stop-color", d.target.linkColor)
			    .attr("stop-opacity", 1);
                
			   	return "url(#gradient_"+d.target.id+")"
            })
            .style("stroke-width", 2*raio)
            .style("stroke-linecap", "round")

        link.transition()
            .duration(duration)
            .attr("d", diagonal)
            .style("stroke-width", 2*raio)
            .style("stroke-opacity",function (d) {
                var ret = ((d.source.depth + 1) / 4.5)
                if (d.target[spendField] <= 0) ret = .1;
				return 1;
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


        function exibirGrafico(d) {
			
			if (typeof d.target != "undefined") {
                d = d.target;
            }
            
            if (d.children || d._children){
				if (detalhes){
					geraGraficoLinhas(d);
					toolTipGrafLinhas.transition()
					.duration(200)
					.style("opacity", "1");
					
					toolTipGrafLinhas.style("left", (d3.event.pageX - 400) + "px")
                .style("top", (d3.event.pageY + 30) + "px");
				}
				else{
				
				toolTip.transition()
                .duration(200)
                .style("opacity", "1");
				
				header.text(d["source_Level1"]);
				header1.text((d.depth > 1) ? d["source_Level2"] : "");
				header2.html((d.depth > 2) ? d["source_Level3"] : "");
				if (d.depth > 3) header2.html(header2.html() + " - " + d["source_Level4"]);
            
				fedSpend.text(formatCurrency(d[campo[0]]));

				stateSpend.text(formatCurrency(d[campo[1]]));

				localSpend.text(formatCurrency(d[campo[2]]));
				
				 toolTip.style("left", (d3.event.pageX - 220) + "px")
                .style("top", (d3.event.pageY - 60) + "px");
				}
			}
			else {
				if(detalhes){
					geraGraficoTempo(d);
					toolTipGrafTempo.transition()
					.duration(200)
					.style("opacity", "1");
					
					toolTipGrafTempo.style("left", (d3.event.pageX - 700) + "px")
                .style("top", (d3.event.pageY + 30) + "px");
				}
				else{
				nodeAux = d;
				toolTipAluno.transition()
				.duration(200)
				.style("opacity", "1");
				
				desenharGrafBarras(d);
				
				toolTipAluno.style("left", (d3.event.pageX - 220) + "px")
                .style("top", (d3.event.pageY + 30) + "px");
				}

			}
 
            d3.select(labels[d.key]).transition().style("font-weight","bold").style("font-size","16");
        }
        
        function type(d) {
			d.frequency = +d.frequency;
			return d;
		}

        function esconderGrafico(d) {
			
					toolTipGrafLinhas.transition()
					.duration(200)
					.style("opacity", "0")
					.transition()
					.duration(0)
					.style("top","-1000px");
				
					 toolTip.transition()
					.duration(200)
					.style("opacity", "0");
				
					toolTipGrafTempo.transition()
					.duration(200)
					.style("opacity", "0")
					.transition()
					.duration(0)
					.style("top","-1000px");
				
					toolTipAluno.transition()
					.duration(200)
					.style("opacity", "0")
					.transition()
					.duration(0)
					.style("top","-1000px");
					apagaGrafBarras();
			
            d3.select(labels[d.key]).transition().style("font-weight","normal").style("font-size","12");
            d3.select(circles[d.key]).transition().style("fill-opacity",0.3);
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

function apagaGrafBarras(){
		grafBarra.selectAll(".bar").remove();
		grafBarra.selectAll("g").remove();
}	

function converteDados(node){
		var data = [];
		for(var i = 1; i < node.depth-1; i++){
			data[i-1] = {atividade: node["Level"+(i+1)],
					nota: node["Nota"+(i)],
					atv: "Atv."+i
					};
		}
		return data;
}
