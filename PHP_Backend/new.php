<?php

include_once('config.php');

$username = isset($_POST['username']) ? mysqli_real_escape_string($conn, $_POST['username']) :  "";
$email = isset($_POST['email']) ? mysqli_real_escape_string($conn, $_POST['email']) :  "";
$pin = isset($_POST['pin']) ? mysqli_real_escape_string($conn, $_POST['pin']) :  "";

if (!empty($username) && !empty($pin)) {
    $check_existing = $conn->prepare("SELECT * FROM api_keys WHERE user_table = ? OR email = ?");
    $check_existing->bind_param("ss", $username, $email);
    $check_existing->execute();
    $result = $check_existing->get_result();

    if ($result->num_rows > 0) {
        http_response_code(400);
        echo json_encode(array("error" => "Username/E-mail already exists."));
        return;
    }

    $api_key = bin2hex(openssl_random_pseudo_bytes(5));

    // Hash the password
    $hashed_pin = password_hash($pin, PASSWORD_DEFAULT);

    $insert_api_key = $conn->prepare("INSERT INTO api_keys (user_table, email, pin, active, api_key) VALUES (?, ?, ?, 1, ?)");
    $insert_api_key->bind_param("ssss", $username, $email, $hashed_pin, $api_key);


    $sql_newtable = "CREATE TABLE `$username` (
        `EAN` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
        `product` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
        `datum` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $sql_newtable2 = "CREATE TABLE `{$username}_shopping` (
      `EAN` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
      `product` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
      `datum` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

}

if ($insert_api_key->execute() && $conn->query($sql_newtable)) {
  if ($conn->query($sql_newtable2)) {
    http_response_code(200);
    echo json_encode(array("message" => "OK", "api_key" => $api_key));
  }
  else{
    http_response_code(500);
    echo json_encode(array("error" => "Error inserting API key into database."));
  }
} else {
    http_response_code(500);
    echo json_encode(array("error" => "Error inserting API key into database."));
}

$conn->close();

?>
