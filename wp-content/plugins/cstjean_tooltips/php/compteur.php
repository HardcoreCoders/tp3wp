<?php
    /**
     * Ajuste le nombre de clics par liens dans la base de données
     *
     * @author Steve Morin Érik Béland
     */

    header("content-type:application/json");

    if (isset($_POST['chemin']) && !empty($_POST['chemin'])) {
        $url = $_POST['chemin'];

        /** @var string Le nom de l'hôte */
        $host = 'localhost';
    
        /** @var string Le nom d'usager */
        $user = 'root';
    
        /** @var string Le mot de passe */
        $password = '';
    
        /** @var string Le nom de la base de données */
        $db = 'tp3wp';
        $conn = new mysqli($host, $user, $password, $db);	
    
        if ($conn->connect_error) {	
            die($conn->connect_error);	
        }
    
        $query = "SET NAMES utf8";
        $result = $conn->query($query);
    
        if (!$result) {
            die($conn->error);
        }
    
    
        if ($stmt = $conn->prepare('SELECT COUNT(*) FROM compteur WHERE chemin=?')) {
            $stmt->bind_param('s', $url);
            $stmt->execute();
            $stmt->bind_result($nbUrl);
            $stmt->fetch();
            $stmt->close();
    
            if ($nbUrl > 0) {
                $stmt = $conn->prepare("UPDATE compteur SET nb_affichages = nb_affichages + 1 WHERE chemin = ?");
                $stmt->bind_param('s', $url);
                $stmt->execute();
                $stmt->close();
            } else {
                $stmt = $conn->prepare("INSERT INTO compteur (chemin, nb_affichages) VALUES (?, ?)");
                $stmt->bind_param('si', $url, $initiale);
                $initiale = 1;
                $stmt->execute();
                $stmt->close();
            }
        }
    
        // On s'assure de fermer la connexion
        $conn->close();
    }

    exit();
?>