<?php
header('Content-Type: application/json');

$servername = "localhost"; // Remplacez par votre serveur MySQL
$username = "root";        // Remplacez par votre utilisateur MySQL
$password = "";            // Remplacez par votre mot de passe MySQL
$dbname = "pokemon_db";    // Remplacez par le nom de votre base de données

// Créer une connexion
$conn = new mysqli($servername, $username, $password, $dbname);

// Vérifier la connexion
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT pokemon_name, victories FROM pokemon_wins";
$result = $conn->query($sql);

$victories = array();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $victories[$row["pokemon_name"]] = $row["victories"];
    }
}

echo json_encode($victories);

$conn->close();
?>
