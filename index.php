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

$query = "SELECT * FROM CAMINHO";
$response = mysqli_query($link, $query);

$i = 1;
$ultimoAluno = -1;
$jArray = array();

while($node = mysqli_fetch_array($response)){
    if($ultimoAluno !== -1 and $node["ID_ALUNO"] !== $ultimoAluno){
        $i = 1;
        $json["Nome"] = $node["NOME"];
        $jArray[] = $json;
        unset($json);
    }
    $json["Level" . $i] = $node["DESC_ATIVIDADE"];
    $json["Data Inicio " . $i] = $node["DATA_INICIO"];
    $json["Data Fim " . $i] = $node["DATA_FIM"];
    $json["Nota" . $i] = $node["NOTA"];
    
    $ultimoAluno = $node["ID_ALUNO"];
    $i++;
}

header("home.html");

?>
