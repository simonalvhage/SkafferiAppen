<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
include_once('config.php');

$api_key = isset($_POST['api_key']) ? mysqli_real_escape_string($conn, $_POST['api_key']) :  "";

if (!empty($api_key)) {
    $select_user = $conn->prepare("SELECT user_table FROM api_keys WHERE api_key = ?");
    $select_user->bind_param("s", $api_key);
    $select_user->execute();
    $select_user->bind_result($user_table);
    $select_user->fetch();
    $select_user->close();


    if (!empty($user_table)) {
        // Delete user's table
        $delete_table = "DROP TABLE IF EXISTS `$user_table`";
        $delete_table2_name = $user_table . '_shopping';
        $delete_table2 = "DROP TABLE IF EXISTS `$delete_table2_name`";
        if ($conn->query($delete_table) && $conn->query($delete_table2)) {
            // Delete user from api_keys table
            $delete_user = $conn->prepare("DELETE FROM api_keys WHERE api_key = ?");
            $delete_user->bind_param("s", $api_key);

            if ($delete_user->execute()) {
                // Additional clean-up operations if needed
                http_response_code(200);
                echo json_encode(array("success" => true));
            } else {
                http_response_code(500);
                echo json_encode(array("error" => "Error deleting user."));
            }
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Error deleting user's table."));
        }
    } else {
        http_response_code(404);
        echo json_encode(array("error" => "User not found."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("error" => "Missing API key."));
}

$conn->close();

?>
