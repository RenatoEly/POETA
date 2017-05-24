function converteData(data){
	 return new Date(Number(data.slice(6,10)), Number(data.slice(3,5)), Number(data.slice(0,2)));
 }
 
     function removeEmptyNodes(node,parent,id) {
		if(!node.values) return
        if(node.key === ""){
			var tam = parent.values.length;
			for(var k = 0; k < node.values.length-1; k++){
				parent.values[k+tam] = parent.values[id+k+1];
			}
			for(var j = 0; j < node.values.length; j++){
				parent.values[id+j] = node.values[j];
			}
			node = parent.values[id];
			if(!node.values) return
		}
		for(var i = 0; i < node.values.length; i++){
			removeEmptyNodes(node.values[i],node,i);
			if(node.values[i].key === "") i--;
		}
    }
    
    var nos_apagados = [];
    var opcoes = [false, true, true, true, true, true, true, false];
    
    function setar_opcoes(op){
		switch (op){
			case "faixa_etaria":
				opcoes[0] = !opcoes[0];
				break;
			case "masculino":
				opcoes[1] = !opcoes[1];
				break;
			case "feminino":
				opcoes[2] = !opcoes[2];
				break;
			case "solteiro":
				opcoes[3] = !opcoes[3];
				break;
			case "casado":
				opcoes[4] = !opcoes[4];
				break;
			case "publica":
				opcoes[5] = !opcoes[5];
				break;
			case "particular":
				opcoes[6] = !opcoes[6];
				break;
			case "daltonico":
				opcoes[7] = !opcoes[7];
				break;
		}
	}
    
    function filtrar(){
		//console.log(root);	
		if(opcoes[7]) {
			escala = d3.scale.linear().range(coresDaltonico);
			escalaNota = d3.scale.linear().range(coresDaltonico);
		}else{
		 	escala = d3.scale.linear().range(cores);
			escalaNota = d3.scale.linear().range(cores);
		}
		escala.domain(dominio);
		escalaNota.domain(dominioNotas);
		recuperarNosFiltrados();
		var folhas = [];
		getLeafs(root,folhas);
		for(var i=0; i < folhas.length; i++){
			if(!opcoes[1] && folhas[i]["sexo"]==="M"
				|| !opcoes[2] && folhas[i]["sexo"]==="F"
				|| !opcoes[3] && folhas[i]["estadoCivil"]==="SOLTEIRO"
				|| !opcoes[4] && folhas[i]["estadoCivil"]==="CASADO"
				|| !opcoes[5] && folhas[i]["escola"]==="PUBLICA"
				|| !opcoes[6] && folhas[i]["escola"]==="PARTICULAR"){
				
				
				if(folhas[i].parent.children == null){
					folhas[i].parent.children = folhas[i].parent._children;
					folhas[i].parent._children = null;
				}
				var filhos = folhas[i].parent.children;
				
				for(var j=0; j < filhos.length; j++){
					if (filhos[j] === folhas[i]){
						nos_apagados.push([filhos[j],j]);
						filhos.splice(j,1);
						break;
					}
				}
			}
			
			else if(opcoes[0]){
				var de = document.getElementById("textDe");
				var ate = document.getElementById("textAte");
				if(Number(folhas[i]["idade"]) < Number(de.value) || Number(folhas[i]["idade"]) > Number(ate.value)){
					var filhos = folhas[i].parent.children;
					for(var j=0; j < filhos.length; j++){
						if (filhos[j] === folhas[i]){
							nos_apagados.push([filhos[j],j]);
							filhos.splice(j,1);
							break;
						}
					}
				}
			}
		}
		update(root);
	}
	
	function recuperarNosFiltrados(){
		var pai;
		for(var i=nos_apagados.length-1; i >= 0; i--){
			if(opcoes[1] && nos_apagados[i][0]["sexo"]==="M"
				|| opcoes[2] && nos_apagados[i][0]["sexo"]==="F"
				|| opcoes[3] && nos_apagados[i][0]["estadoCivil"]==="SOLTEIRO"
				|| opcoes[4] && nos_apagados[i][0]["estadoCivil"]==="CASADO"
				|| opcoes[5] && nos_apagados[i][0]["escola"]==="PUBLICA"
				|| opcoes[6] && nos_apagados[i][0]["escola"]==="PARTICULAR"
				){
					
					pai = nos_apagados[i][0].parent;
					if(pai.children == null){
						pai.children = pai._children;
						pai._children = null;
					}
					pai.children.splice(nos_apagados[i][1],0,nos_apagados[i][0]);
					nos_apagados.splice(i,1);
				}
		}
	}
    
    function setAnimacao(nodes) {
        for (var y = 0; y < nodes.length; y++) {
            var node = nodes[y];
           if (node.children) {
                setAnimacao(node.children);
               for (var z = 0; z < node.children.length; z++) {
                   var child = node.children[z];
                   for (var i = 0; i < sumFields.length; i++) {
                        if (isNaN(node["sum_" + sumFields[i]])) node["sum_" + sumFields[i]] = 0;
                        node["sum_" + sumFields[i]] += Number(child["sum_" + sumFields[i]]);
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
        
       }
    }
    
    function getLeafs(node,leafs){
		var childrens;
		if(node.children){
			node[campo[4]] = 0;
			node[campo[3]] = 0;
			node[campo[2]] = 0;
			node[campo[1]] = 0;
			node[campo[0]] = 0;
			childrens = node.children;
		}
		else if(node._children){
			childrens = node._children;
		}
		if(childrens){
			for(var i = 0; i < childrens.length; i++){
				getLeafs(childrens[i],leafs);
			}
		}
		else{
			leafs.push(node);
		}
	}
	
	function colocarBalao(node){
		if(!node.children){
			return;
		}
		
		if(typeof node[campo[3]] != "undefined"){
			if(node[campo[3]] > 0){
				var qntBaloes = d3.selectAll(document.getElementsByName("balao"))[0].length;
				
				d3.select(document.getElementById("body")).append("div")
						.attr("name","balao")
						.attr("class","balao2")
						.style("left", (node.y+68)+"px")
						.style("top", (node.x-949-62*qntBaloes)+"px")
						.text(""+node[campo[3]]+" Desistência(s)");
			}
		}
		for(var i = 0; i < node.children.length; i++){
			colocarBalao(node.children[i]);
		}
	}
	
	function removerBalao(){
		d3.selectAll(document.getElementsByName("balao")).remove();
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

function setTextModoPesquisa(){
	var div_mode_pesq = document.getElementById("modo_pesquisa");
	if(detalhes)
		div_mode_pesq.innerText = "Modo de visualização Individual";
	else
		div_mode_pesq.innerText = "Modo de visualização Geral";
}