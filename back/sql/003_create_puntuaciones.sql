CREATE TABLE IF NOT EXISTS puntuaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jugador_id INT NOT NULL,
    videojuego_id INT NOT NULL,
    puntuacion INT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_puntuacion_jugador
        FOREIGN KEY (jugador_id) REFERENCES jugadores(id),
    CONSTRAINT fk_puntuacion_videojuego
        FOREIGN KEY (videojuego_id) REFERENCES videojuegos(id),
    CONSTRAINT chk_puntuacion_no_negativa
        CHECK (puntuacion >= 0)
) ENGINE=InnoDB;
