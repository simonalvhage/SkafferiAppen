<?php
include_once('config.php');

// Retrieve the API key from the request header
$apiKey = isset($_GET['api_key']) ? mysqli_real_escape_string($conn, $_GET['api_key']) : "";

// Validate the API key against the database of API keys
$apiKeyValidationQuery = "SELECT user_table, active FROM api_keys WHERE api_key = '{$apiKey}'";
$apiKeyValidationResult = mysqli_query($conn, $apiKeyValidationQuery);

if (mysqli_num_rows($apiKeyValidationResult) > 0) {
    // The API key is valid
    $apiKeyValidationData = mysqli_fetch_array($apiKeyValidationResult);
    if ($apiKeyValidationData['active'] == 1) {
        // The API key is active
        $userTable = $apiKeyValidationData['user_table'];
        $list = isset($_GET['list']) ? mysqli_real_escape_string($conn, $_GET['list']) : "";
        $EAN = isset($_GET['EAN']) ? mysqli_real_escape_string($conn, $_GET['EAN']) : "";
        $tableName = $list ? "{$userTable}_{$list}" : $userTable;

        if ($EAN === "ALLPRODUCTS") {
            // Delete all products in the table, except the full table
            $sql = "DELETE FROM `{$tableName}` WHERE EAN != 'ALLPRODUCTS';";
        } else {
            // Delete a specific product by EAN
            $sql = "DELETE FROM `{$tableName}` WHERE EAN='{$EAN}';";
        }

        $get_data_query = mysqli_query($conn, $sql) or die(mysqli_error($conn));
        if (mysqli_affected_rows($conn) > 0) {
            $json = array("status" => 1, "Success" => "OK");
        } else {
            $json = array("status" => 1, "error" => "NOT OK");
        }

        @mysqli_close($conn);
        header('Content-type: application/json');
        echo json_encode($json);
    } else {
        // The API key is inactive
        $json = array("status" => 0, "error" => "Invalid API key");
        header('Content-type: application/json');
        echo json_encode($json);
    }
} else {
    // The API key is invalid
    $json = array("status" => 0, "error" => "Invalid API key");
    header('Content-type: application/json');
    echo json_encode($json);
}
?>
