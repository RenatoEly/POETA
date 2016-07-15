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
