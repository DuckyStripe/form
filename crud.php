<?php
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Allow: GET, POST, OPTIONS, PUT, DELETE");
header("Content-Type: application/json; charset=utf-8");

function response($msg, $data = [], $flag = true, $status = 200)
{
    http_response_code($status);
    echo json_encode(['ok' => $flag, 'msg' => $msg, 'data' => $data]);
}


function connectDB()
{

    $nameServer = "";
    $nameDB = "";
    $userDB = "";
    $password = "";

    try {
        $conexion = new PDO("sqlsrv:Server=$nameServer;Database=$nameDB", $userDB, $password);
        $conexion->exec("set names utf8");
        return $conexion;
    } catch (PDOException $e) {
        response('No se logro conectar a BD',  $e->getMessage(), false, 500);
        die();
    }
}

function request()
{
    $dataSanitizada = [];
    $dataPOST = $_POST ?? [];
    $dataGET = $_GET ?? [];
    $dataJSON = json_decode(file_get_contents("php://input"), true) ?? [];


    $data = array_merge($dataPOST, $dataGET, $dataJSON);


    foreach ($data as $key => $value) {
        $dataSanitizada[htmlspecialchars($key)] = htmlspecialchars($value);
    }


    $dataSanitizada['__FILE'] = $_FILES ?? [];
    return $dataSanitizada;
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $cnx = connectDB();
    $data = request();
    $action = $data['action'];
    if ($action === '1') {
        $smtp = $cnx->prepare("EXEC SP_GRUD_TB_RPU :ACTION, :TERMINO");
        $smtp->execute([':ACTION' => $action, ':TERMINO' => $data['termino']]);
        $result = $smtp->fetchAll(PDO::FETCH_ASSOC);

        if (count($result) === 0) {
            response('No se encontraron registros con esas caracterizcas', [], false, 200);
            return;
        }
        if(count($result)===1){

        response('1', $result[0]);
        return;
        }else if(count($result)>1){
            response('1+', $result);
            return; 
        }
    } else {

        $smtp = $cnx->prepare("EXEC SP_GRUD_TB_RPU :ACTION, :TERMINO, :TELCELULAR, :NUMSERVICIO, :ALIAS, :ID");
        $smtp->execute([
            ':ACTION' => $action,
            ':TERMINO' => $data['termino'] ?? '',
            ':TELCELULAR' => $data['input_1'] ?? '',
            ':NUMSERVICIO' => $data['input_2'] ?? '',
            ':ALIAS' => $data['input_3'] ?? '',
            ':ID' => $data['id_registro'] ?? '',
        ]);

        $result = $smtp->fetchAll(PDO::FETCH_ASSOC);
        response('Action realizada correctamente.', $result[0]);
    }
}
