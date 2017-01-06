<?php
$servidor = 'localhost';
$banco = 'POETAbd';
$usuario = 'root';
$senha = 'POETAbd157';
$link = mysqli_connect($servidor, $usuario, $senha, $banco);

if(!$link){
    echo "Erro ao se conectar ao banco de dados!";
    exit();
}

mysqli_query($link,"SET NAMES 'utf8'");
mysqli_query($link,'SET character_set_connection=utf8');
mysqli_query($link,'SET character_set_client=utf8');
mysqli_query($link,'SET character_set_results=utf8');

$query = "SELECT * FROM CAMINHO";
$response = mysqli_query($link, $query);

$i = 1;
$alunoAnterior = -1;
$jArray = array();

while($node = mysqli_fetch_array($response)){
    if($alunoAnterior !== -1 and $node["ID_ALUNO"] !== $alunoAnterior){
        $i = 1;
        $json["Nome"] = $node["NOME"];
        $jArray[] = $json;
        unset($json);
    }
    $json["Level" . $i] = $node["DESC_ATIVIDADE"];
    $json["Data Inicio " . $i] = $node["DATA_INICIO"];
    $json["Data Fim " . $i] = $node["DATA_FIM"];
    $json["Nota" . $i] = $node["NOTA"];
    
    $alunoAnterior = $node["ID_ALUNO"];
    $i++;
}

$json["Nome"] = $node["NOME"];
$jArray[] = $json;

header('Location: home.html');

?>
