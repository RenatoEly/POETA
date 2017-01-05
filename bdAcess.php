<?php
$servidor = 'localhost';
$banco = 'POETAbd';
$usuario = 'root';
$senha = '';
$link = mysql_connect($servidor, $usuario, $senha);
$db = mysql_select_db($banco, $link);

if(!$link){
    echo "Erro ao se conectar ao banco de dados!";
    exit();
}

$query = "SELECT * FROM CAMINHO";
$response = mysql_query($query);

$i = 1;
$ultimoAluno = -1;
$jArray = array();

while($node = mysql_fetch_array($response)){
    if($ultimoAluno !== -1 and $node[ID_ALUNO] !== $ultimoAluno){
        $i = 1;
        $json["Nome"] = $node["NOME"];
        $jArray[] = json_encode($json);
        unset($json);
    }
    $json["Level" + $i] = $node["DESC_ATIVIDADE"];
    $json["Data Inicio " + $i] = $node["DATA_INIICO"];
    $json["Data Fim " + $i] = $node["DATA_FIM"];
    $json["Nota" + $i] = $node["NOTA"];
    $ultimoAluno = $node[ID_ALUNO];
    $i++;
}

$jsData = json_encode($jArray);

?>