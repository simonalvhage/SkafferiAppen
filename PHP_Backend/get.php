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

        // Check if the list parameter is set to "shopping"
        if (isset($_GET['list']) && $_GET['list'] == "shopping") {
            $userTable .= "_shopping";
        }

        $EAN = isset($_GET['EAN']) ? mysqli_real_escape_string($conn, $_GET['EAN']) : "";
        $product = isset($_GET['product']) ? mysqli_real_escape_string($conn, $_GET['product']) : "";

        if (empty($EAN) && empty($product)) {
            $sql = "SELECT * FROM `{$userTable}`;";
            $get_data_query = mysqli_query($conn, $sql) or die(mysqli_error($conn));
            if (mysqli_num_rows($get_data_query) != 0) {
                $result = array();
                while ($r = mysqli_fetch_array($get_data_query)) {
                    extract($r);
                    $result[] = array("EAN" => $EAN, "product" => $product, "datum" => $datum);
                                }
                $json = array("status" => 1, "info" => $result);
            } else {
                $json = array("status" => 0, "error" => "Product not found");
            }
            header('Content-type: application/json');
            echo json_encode($json);
        } else if (!empty($EAN)) {
            $sql = "SELECT * FROM `{$userTable}` WHERE EAN='{$EAN}';";
            $get_data_query = mysqli_query($conn, $sql) or die(mysqli_error($conn));
            if (mysqli_num_rows($get_data_query) != 0) {
                $result = array();
                while ($r = mysqli_fetch_array($get_data_query)) {
                    extract($r);
                    $result[] = array("EAN" => $EAN, "product" => $product, "datum" => $datum);
                }
                $json = array("status" => 1, "info" => $result);
            } else {
                $json = array("status" => 0, "error" => "Product not found");
            }
            header('Content-type: application/json');
            echo json_encode($json);
        }
    } else {
        // The API key is inactive
        $json = array("status" => 0, "error" => "Inactive API key");
        header('Content-type: application/json');
        echo json_encode($json);
    }
} else {
	if (empty($apiKey)) {
		$userTable = "ALL";
		$EAN = isset($_GET['EAN']) ? mysqli_real_escape_string($conn, $_GET['EAN']) : "";
        $product = isset($_GET['product']) ? mysqli_real_escape_string($conn, $_GET['product']) : "";

        if (empty($EAN) && empty($product)) {
            $sql = "SELECT * FROM `{$userTable}`;";
            $get_data_query = mysqli_query($conn, $sql) or die(mysqli_error($conn));
            if (mysqli_num_rows($get_data_query) != 0) {
                $result = array();
                while ($r = mysqli_fetch_array($get_data_query)) {
                    extract($r);
                    $result[] = array("EAN" => $EAN, "product" => $product);
                }
                $json = array("status" => 1, "info" => $result);
            } else {
                $json = array("status" => 0, "error" => "Product not found");
            }
            header('Content-type: application/json');
            echo json_encode($json);
        } else if (!empty($EAN)) {
            $sql = "SELECT * FROM `{$userTable}` WHERE EAN='{$EAN}';";
            $get_data_query = mysqli_query($conn, $sql) or die(mysqli_error($conn));
            if (mysqli_num_rows($get_data_query) != 0) {
                $result = array();
                while ($r = mysqli_fetch_array($get_data_query)) {
                    extract($r);
                    $result[] = array("EAN" => $EAN, "product" => $product);
                }
                $json = array("status" => 1, "info" => $result);
            } else {
                $json = array("status" => 0, "error" => "Product not found");
            }
            header('Content-type: application/json');
            echo json_encode($json);
        }
	}
	else{
    // The API key is invalid
    $json = array("status" => 0, "error" => "Invalid API key");
    header('Content-type: application/json');
    echo json_encode($json);
	}
}

mysqli_close($conn);
?>
