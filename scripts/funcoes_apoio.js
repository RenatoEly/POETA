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
