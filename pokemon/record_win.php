<?php
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

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

$pokemon_name = $conn->real_escape_string($data['pokemon_name']);
$victories = (int)$data['victories'];

// Vérifier si le Pokémon existe déjà dans la base de données
$sql = "SELECT COUNT(*) AS count FROM pokemon_wins WHERE pokemon_name = '$pokemon_name'";
$result = $conn->query($sql);
$row = $result->fetch_assoc();

if ($row['count'] > 0) {
    // Mettre à jour le nombre de victoires
    $sql = "UPDATE pokemon_wins SET victories = $victories WHERE pokemon_name = '$pokemon_name'";
} else {
    // Insérer un nouvel enregistrement
    $sql = "INSERT INTO pokemon_wins (pokemon_name, victories) VALUES ('$pokemon_name', $victories)";
}

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}

$conn->close();
?>
