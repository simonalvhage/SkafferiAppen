<?php
include_once('config.php');

$username = isset($_POST['username']) ? mysqli_real_escape_string($conn, $_POST['username']) :  "";
$pin = isset($_POST['pin']) ? mysqli_real_escape_string($conn, $_POST['pin']) :  "";

if (!empty($username) && !empty($pin)) {
    $check_credentials = $conn->prepare("SELECT api_key, pin FROM api_keys WHERE user_table = ?");
    $check_credentials->bind_param("s", $username);
    $check_credentials->execute();
    $result = $check_credentials->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $hashed_pin = $row['pin'];

        // Verify the hashed password
        if (password_verify($pin, $hashed_pin)) {
            $api_key = $row['api_key'];
            http_response_code(200);
            echo json_encode(array("message" => "LOGGED IN", "api_key" => $api_key));
            return;
        }
    }

    http_response_code(401);
    echo json_encode(array("error" => "Wrong username or password."));
    return;
} else {
    http_response_code(400);
    echo json_encode(array("error" => "Missing username or password."));
    return;
}

$conn->close();

?>
