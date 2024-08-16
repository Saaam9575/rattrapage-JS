class Pokemon {
  constructor(name, sprite, hp, moves, types) {
    this.name = name;
    this.sprite = sprite || "path/to/placeholder-image.png";
    this.hp = hp;
    this.fullhp = hp;
    this.moves = moves;
    this.types = types;
  }
}

// Fonction pour récupérer les données du Pokémon depuis l'API
async function getPokemonData(name) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}/`);
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    const data = await response.json();

    // Log des données reçues pour débogage
    console.log(`Données reçues pour ${name}:`, data);

    // Assurez-vous que les propriétés existent avant d'y accéder
    const sprite =
      data.sprites?.front_default || "path/to/placeholder-image.png";
    const hp =
      data.stats?.find((stat) => stat.stat.name === "hp")?.base_stat || 0;
    const moves =
      data.moves?.slice(0, 4).map((move) => ({
        name: move.move.name || "Unknown",
        type: move.move.type.name || "unknown",
        power: Math.floor(Math.random() * 100),
        accuracy: Math.random(),
      })) || [];
    const types = data.types?.map((typeInfo) => typeInfo.type.name) || [];

    // Vérifiez si toutes les informations nécessaires sont présentes
    if (!data.name || !hp || moves.length === 0 || types.length === 0) {
      console.error(`Données insuffisantes pour le Pokémon "${name}"`);
      return null;
    }

    return new Pokemon(name, sprite, hp, moves, types);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des données du Pokémon "${name}":`,
      error
    );
    return null;
  }
}

// Fonction pour obtenir les victoires des Pokémon depuis le backend PHP
async function getVictories() {
  try {
    const response = await fetch("get_wins.php");
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des victoires:", error);
    return {};
  }
}

// Fonction pour mettre à jour les victoires des Pokémon depuis le backend PHP
async function updateVictories(pokemonName, victories) {
  try {
    const response = await fetch("record_win.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pokemon_name: pokemonName, victories }),
    });
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour des victoires:", error);
  }
}

// Fonction pour initialiser l'équipe de Pokémon
async function initializeTeam(pokemonNames) {
  const team = [];
  for (const name of pokemonNames) {
    console.log(
      `Tentative de récupération des données pour le Pokémon: ${name}`
    );
    const pokemon = await getPokemonData(name);
    if (pokemon) {
      console.log(`Pokémon récupéré: ${pokemon.name}`);
      team.push(pokemon);
    } else {
      console.log(
        `Échec de la récupération des données pour le Pokémon: ${name}`
      );
    }
  }
  return team;
}

// Définir les types de Pokémon et leur efficacité
const typeMatch = {
  fire: { weak: ["water", "rock"], strong: ["grass", "steel"] },
  water: { weak: ["grass", "electric"], strong: ["fire", "ground", "rock"] },
  grass: { weak: ["fire", "ice"], strong: ["water", "ground", "rock"] },
  normal: { weak: ["fighting"], strong: [] },
  flying: {
    weak: ["electric", "ice", "rock"],
    strong: ["grass", "fighting", "bug"],
  },
  poison: { weak: ["ground", "psychic"], strong: ["grass", "fairy"] },
};

// Fonction pour gérer le combat entre deux Pokémon
function battle(pokemon1, pokemon2) {
  if (!pokemon1 || !pokemon2) {
    console.error("Un ou les deux Pokémon sont invalides.");
    return;
  }

  document.getElementById(
    "pk1"
  ).innerHTML = `<img src="${pokemon1.sprite}" alt="${pokemon1.name}">`;
  document.getElementById(
    "hp1"
  ).innerHTML = `HP: ${pokemon1.hp}/${pokemon1.fullhp}`;
  document.getElementById(
    "pk2"
  ).innerHTML = `<img src="${pokemon2.sprite}" alt="${pokemon2.name}">`;
  document.getElementById(
    "hp2"
  ).innerHTML = `HP: ${pokemon2.hp}/${pokemon2.fullhp}`;

  pokemon1.moves.forEach((move, index) => {
    const btn = document.getElementById(`m${index}`);
    if (btn) {
      btn.value = move.name;
      btn.onclick = () => {
        attack(move, pokemon1, pokemon2, "hp2", "");
        if (pokemon2.hp > 0) {
          setTimeout(() => {
            const enemyMove =
              pokemon2.moves[Math.floor(Math.random() * pokemon2.moves.length)];
            attack(enemyMove, pokemon2, pokemon1, "hp1", "Foe ");
          }, 2000);
        }
      };
    }
  });
}

// Fonction pour gérer l'attaque d'un Pokémon
function attack(move, attacker, receiver, hpElementId, owner) {
  document.getElementById(
    "comment"
  ).innerHTML = `${owner}${attacker.name} used ${move.name}!`;

  if (Math.random() < move.accuracy) {
    let power = move.power + Math.floor(Math.random() * 10);
    const typeEffectiveness = calculateEffectiveness(move.type, receiver.types);
    power *= typeEffectiveness.multiplier;

    setTimeout(() => {
      document.getElementById("comment").innerHTML = typeEffectiveness.message;
      receiver.hp -= Math.floor(power);
      if (receiver.hp < 0) receiver.hp = 0;
      document.getElementById(
        hpElementId
      ).innerHTML = `HP: ${receiver.hp}/${receiver.fullhp}`;
      checkWinner(receiver, hpElementId);
    }, 1000);
  } else {
    setTimeout(() => {
      document.getElementById("comment").innerHTML = "Attack missed!";
    }, 1000);
  }
}

// Fonction pour calculer l'efficacité d'un type d'attaque contre les types cibles
function calculateEffectiveness(moveType, targetTypes) {
  let multiplier = 1;
  let message = "It's a normal hit.";

  targetTypes.forEach((type) => {
    if (typeMatch[moveType]?.strong?.includes(type)) {
      multiplier *= 2;
      message = "It's super effective!";
    } else if (typeMatch[moveType]?.weak?.includes(type)) {
      multiplier *= 0.5;
      message = "It's not very effective...";
    }
  });

  return { multiplier, message };
}

// Fonction pour vérifier si un Pokémon est vaincu
function checkWinner(pokemon, hpElementId) {
  if (pokemon.hp <= 0) {
    document.getElementById(
      "comment"
    ).innerHTML = `${pokemon.name} is defeated!`;
    document.getElementById("hp1").innerHTML = `HP: 0/${pokemon.fullhp}`;
    document.getElementById("hp2").innerHTML = `HP: 0/${pokemon.fullhp}`;
    alert(`${pokemon.name} has been defeated!`);
    // Mise à jour des victoires dans la base de données
    updateVictories(pokemon.name, (pokemon.victories || 0) + 1);
  }
}

// Fonction pour démarrer le jeu
(async function startGame() {
  const pokemonNames = [
    "charizard",
    "blastoise",
    "venusaur",
    "pikachu",
    "jigglypuff",
    "meowth",
  ];
  console.log(
    "Initialisation de l'équipe avec les noms de Pokémon:",
    pokemonNames
  );
  const team = await initializeTeam(pokemonNames);

  if (team.length < 2) {
    console.error("Il n'y a pas assez de Pokémon pour commencer le combat.");
    return;
  }

  const [pokemon1, pokemon2] = team;
  battle(pokemon1, pokemon2);
})();
