<?php
include_once('config.php');

// Retrieve the API key from the request header
$apiKey = isset($_POST['api_key']) ? mysqli_real_escape_string($conn, $_POST['api_key']) : "";

// Validate the API key against the database of API keys
$apiKeyValidationQuery = "SELECT user_table, active FROM api_keys WHERE api_key = '{$apiKey}'";
$apiKeyValidationResult = mysqli_query($conn, $apiKeyValidationQuery);

if (mysqli_num_rows($apiKeyValidationResult) > 0) {
    // The API key is valid
    $apiKeyValidationData = mysqli_fetch_array($apiKeyValidationResult);
    if ($apiKeyValidationData['active'] == 1) {
        // The API key is active
        $userTable = $apiKeyValidationData['user_table'];

        // Check if the list parameter is set to "shopping"
        if (isset($_POST['list']) && $_POST['list'] == "shopping") {
            $userTable .= "_shopping";
        }

        // Continue with the code to insert data into the user's table
        $EAN = isset($_POST['EAN']) ? mysqli_real_escape_string($conn, $_POST['EAN']) : "";
        $product = isset($_POST['product']) ? mysqli_real_escape_string($conn, $_POST['product']) : "";

        $dateToday = date("d/m/Y");

        if (!empty($EAN) && !empty($product)) {
            $sql = "INSERT INTO `{$userTable}` (`EAN`, `product`, `datum`) VALUES ('$EAN', '$product', '$dateToday');";
            $post_data_query = mysqli_query($conn, $sql);
            if ($post_data_query) {
                $json = array("status" => 1, "Success" => "OK");
            } else {
                $json = array("status" => 0, "error" => "Error inserting data into the table");
            }
        } else {
            $json = array("status" => 0, "error" => "Missing EAN or product");
        }
    } else {
        // The API key is inactive
        $json = array("status" => 0, "error" => "The API key is inactive");
    }
} else {
    // The API key is not found in the database
    $json = array("status" => 0, "error" => "The API key is invalid");
}

header('Content-type: application/json');
echo json_encode($json);
@mysqli_close($conn);
?>
