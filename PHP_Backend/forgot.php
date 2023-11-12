<?php

include_once('config.php');

$email = isset($_POST['email']) ? mysqli_real_escape_string($conn, $_POST['email']) :  "";

if (!empty($email)) {
    $check_existing = $conn->prepare("SELECT * FROM api_keys WHERE email = ?");
    $check_existing->bind_param("s", $email);
    $check_existing->execute();
    $result = $check_existing->get_result();

    if ($result->num_rows > 0) {
        $reset_token = bin2hex(openssl_random_pseudo_bytes(16));
        $update_reset_token = $conn->prepare("UPDATE api_keys SET reset_token = ? WHERE email = ?");
        $update_reset_token->bind_param("ss", $reset_token, $email);

        if ($update_reset_token->execute()) {
            // Send email with reset link
            $reset_link = "http://alvhage.se/api/reset.php?token=" . $reset_token;
            $email_subject = "Reset Your Password";
            $email_body = "Click the link below to reset your password:\n\n" . $reset_link;
            $email_headers = array(
                'From' => 'Alvhage.se',
                'Reply-To' => 'simon@alvhage.se',
            );

            if (mail($email, $email_subject, $email_body, $email_headers)) {
                http_response_code(200);
                echo json_encode(array("message" => "OK"));
                return;
            } else {
                http_response_code(500);
                echo json_encode(array("error" => "Failed to send reset email."));
                return;
            }
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Error updating reset token in the database."));
            return;
        }
    } else {
        http_response_code(400);
        echo json_encode(array("error" => "E-mail not found."));
        return;
    }
} else {
    http_response_code(400);
    echo json_encode(array("error" => "Invalid request."));
    return;
}

$conn->close();

?>
