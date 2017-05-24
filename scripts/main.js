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
 
 var svg;
 var levelCeil;
 var diagonal;
 
 var formatCurrency = function (d) {
        return d
    };
    
    var header;	 //Texto que aparece no topo do toolTip
    var header1; //Texto logo abaixo do header do toolTip
    var header2; //Texto abaixo do anterior
 
 var fedSpend; //Subquadro "Federal Funds" dentro do toolTip

    var stateSpend; //Subquadro "State Funds" dentro do toolTip

    var localSpend; //Subquadro "Local Funds" dentro do toolTip
					//Todos os quadros e header's definidos aqui são declarados no proprio index.html

	var detalhes;
    var federalButton;
    var stateButton;
    var localButton;
 
    var margin;
    var width;
    var height;


//Cores para o grafico. Nota >= 7, Nota < 7, Desistentes.
	var coresGrafico = ["#00ff00","#ff0000","#c7dbe5"];
	
	var cor_level1 = "#1C86EE";

    var cor_AtividadeSemNota = "#ffffff"

    var colors = ["#bd0026", "#fecc5c", "#fd8d3c", "#f03b20", "#B02D5D",
        "#9B2C67", "#982B9A", "#692DA7", "#5725AA", "#4823AF",
        "#d7b5d8", "#dd1c77", "#5A0C7A", "#5A0C7A"];


    var tree;
    var circles;
    var paths;
    var labels;


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
        i = 0;
    var root;
	var raio = 10;
    var spendField = "sum_Federal";
    var sumFields = ["Federal", "GovXFer", "State", "Local"];
    var sourceFields = ["Category", "Level1", "Level2", "Level3", "Level4", "Level5", "Level6", "Level7", "Level8", "Level9", "Level10", "Level11", "Level12", "Level13", "Level14", "Level15", "Level16", "Level17", "Level18"];
	var campo = ["Nota >= 7","Nota < 7","Desistentes","Desistentes aqui","Atividade sem nota"];
	
	//Atributo que será usado para calcular a cor dos nós
	var campoAnalize = "sum_Federal";
	//Possíveis cores dos nós. Vermelho, amarelo e verde, respectivamente.
	var cores=["#ff0000","#ffff00","#00ff00"];
    //Possíveis cores dos nós para usuários daltônicos.
    var coresDaltonico=["#fc8d59","#ffffbf","#91cf60"];
	//valores do dominio para escala de cores. Menor valor fica a primeira cor do array cores e o maior a segunda.
	var dominio = [0,0.5,1];
	var dominioNotas = [1,5,10];
	
	var escala = d3.scale.linear().range(cores);
    
function main() {
	escala.domain(dominio); //Parâmetro usado para definir a mudança de cores (Verde, Vermelho, amarelo)
	
	escalaNota = d3.scale.linear().range(cores);
	escalaNota.domain(dominioNotas);


    tree = d3.layout.tree();
    circles={};
    paths={};
    labels={};

    tree.children(function (d) { return d.values; }).size([h, w]);

    toolTip = d3.select(document.getElementById("toolTip")); //Todo o quadro que aparece ao passar o mouse em um nó
    header = d3.select(document.getElementById("head"));	 //Texto que aparece no topo do toolTip
    header1 = d3.select(document.getElementById("header1")); //Texto logo abaixo do header do toolTip
    header2 = d3.select(document.getElementById("header2")); //Texto abaixo do anterior
    
    toolTipAluno = d3.select(document.getElementById("toolTipAluno"));
    toolTipGrafLinhas = d3.select(document.getElementById("toolTipGrafLinha"));
    toolTipGrafTempo = d3.select(document.getElementById("toolTipGrafTempo"));
    
     criarGrafBarras();
 
    fedSpend = d3.select(document.getElementById("fedSpend")); //Subquadro "Federal Funds" dentro do toolTip
    stateSpend = d3.select(document.getElementById("stateSpend")); //Subquadro "State Funds" dentro do toolTip

    localSpend = d3.select(document.getElementById("localSpend")); //Subquadro "Local Funds" dentro do toolTip
					//Todos os quadros e header's definidos aqui são declarados no proprio index.html

	detalhes = false;
    federalButton = d3.select(document.getElementById("federalButton"));
    stateButton = d3.select(document.getElementById("stateButton"));
    localButton = d3.select(document.getElementById("localButton"));

    diagonal = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });

    svg = d3.select("#body").append("svg:svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    levelCeil=[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}];   //Acrescentei Mais Nós (Níveis de Célula) 25/03/2016

    var nodeRadius;

    d3.csv("data/DataBase.csv", function (csv) {

        var data = [];

        //Remove all zero values nodes
        csv.forEach(function (d) {
                data.push(d);
        })

       
        console.log(data);

        var nest = d3.nest();
        var maxLevel = 17;

        loadingData(1);

        function loadingData(i){
            nest = nest.key(function (d) {
                return d["Level"+i];
            });   
            if(i< maxLevel) loadingData(i+1);
        }
        
        nest =  nest.entries(data);
        root = {};
        root.values = nest;
        removeEmptyNodes(root,null,0);
        root.x0 = h / 2;
        root.y0 = 0;

        var nodes = tree.nodes(root).reverse();
        var id_num = 0;
        nodes.forEach(function(d){
            id_num +=1;
            d.id_num = id_num;
        });
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
                setTextModoPesquisa();
            });

            stateButton.on("click", function (d) {
                toggleButtons(1);
                detalhes = true;
                setTextModoPesquisa();
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
	    //setAnimacao(root.children);
        }
    });
}

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
				depth = pai.depth-1;
				folhas[i]["Nota"+depth] = Number(folhas[i]["Nota"+depth]);
				if(isNaN(folhas[i]["Nota"+depth])){
					pai[campo[2]]++;
                    if(!isNaN(folhas[i]["Nota"+(depth-1)])){
						pai[campo[3]]++;
					}
				}   
                else if(folhas[i]["Nota"+depth] < 0){
                    console.log("[data]"+i);
                    pai[campo[4]]++;
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

function update(source) {
		sumNodesCopia(root);
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
			console.log(d[campo[4]]);
			if(d.depth <= 1){
				d.linkColor = cor_level1;
			}
			else if(d.numChildren > 0 || d._children){
                 if(d[campo[4]] > 0 ){
                    d.linkColor = cor_AtividadeSemNota;
                 }
				 else{
                    d.linkColor = escala(d[campo[0]]/(d[campo[0]] + d[campo[1]] + d[campo[2]]));
                }
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
            .attr("id",function (d) { return "node_" + d.id_num })
            .attr("name",function (d) { return d.id_num })
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
                        d3.select(document.getElementById("node_" + d.id_num)).select("circle")
                                .attr("r", raio+20);
					}
					else{
						esconderGrafico(d);
                        d3.select(document.getElementById("node_" + d.id_num)).select("circle")
                                .attr("r", raio+10);
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
                var ret = (!(d.children || d._children)) ? d.Level18 : d.key; 
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
            
            link[0].forEach(function (d){
			d3.select(d).style("stroke", function (d, i) {
				d3.select(document.getElementById("gradient_"+d.target.id)).remove();
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
		});
            
            
        

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
		
		removerBalao();
        colocarBalao(root);
        
        function type(d) {
			d.frequency = +d.frequency;
			return d;
		}
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
