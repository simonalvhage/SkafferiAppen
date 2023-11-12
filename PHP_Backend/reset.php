<?php
echo '<link rel="stylesheet" type="text/css" href="style.css">';
include_once('config.php');

$reset_token = isset($_GET['token']) ? $_GET['token'] : "";

if (!empty($reset_token)) {
    $get_user = $conn->prepare("SELECT * FROM api_keys WHERE reset_token = ?");
    $get_user->bind_param("s", $reset_token);
    $get_user->execute();
    $result = $get_user->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $username = $user['user_table'];

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $new_pin = isset($_POST['pin']) ? mysqli_real_escape_string($conn, $_POST['pin']) : "";

            if (!empty($new_pin)) {

                $hashed_pin = password_hash($new_pin, PASSWORD_DEFAULT);

                $update_pin = $conn->prepare("UPDATE api_keys SET pin = ?, reset_token = NULL WHERE user_table = ?");
                $update_pin->bind_param("ss", $hashed_pin, $username);


                if ($update_pin->execute()) {
                    echo '<p>Your PIN has been successfully reset.</p>';
                } else {
                    echo '<p>Failed to reset PIN. Please try again later.</p>';
                }
            } else {
                echo '<p>Please enter a new PIN.</p>';
            }
        } else {
            echo '
            <form method="POST">
                <div class="form-group">
                    <label for="pin"><h1><center>New PIN:</h1></label>
                    <input type="text" class="form-control" name="pin" required>
                </div>
                <button type="submit" class="btn btn-primary">Reset PIN</button>
            </form>
            ';
        }
    } else {
        echo '<p>Invalid reset token. Please check your email or request a new password reset.</p>';
    }
} else {
    echo '<p>Invalid reset token. Please check your email or request a new password reset.</p>';
}

$conn->close();

?>
