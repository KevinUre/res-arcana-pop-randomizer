const pairs = {
  "Elvish Heartwood": "Dwarven Forge",
  "Dwarven Forge": "Elvish Heartwood",
  "Cursed Forge": "Dwarven Mines",
  "Dwarven Mines": "Cursed Forge",
  "Gates of Hell": "Temple of the Abyss",
  "Temple of the Abyss": "Gates of Hell",
  "Dragon Aerie": "Crystal Keep",
  "Crystal Keep": "Dragon Aerie",
  "Sacred Grove": "Alchemist's Tower",
  "Alchemist's Tower": "Sacred Grove",
  "Sacrificial Pit": "Catacombs of the Dead",
  "Catacombs of the Dead": "Sacrificial Pit",
  "Dragon's Lair": "Sorcerer's Bestiary",
  "Sorcerer's Bestiary": "Dragon's Lair",
  "Sunken Reef": "Coral Castle",
  "Coral Castle": "Sunken Reef",
  "Mystical Menagerie": "Alchemical Workshop",
  "Alchemical Workshop": "Mystical Menagerie",
  "Blood Isle": "Pearl Bed",
  "Pearl Bed": "Blood Isle",
  "Druid Circle": "Dragon's Cave",
  "Dragon's Cave": "Druid Circle"
};

const defaultMaximums = {
  "Elvish Heartwood": 10,
  "Dwarven Forge": 10,
  "Cursed Forge": 1,
  "Dwarven Mines": 10,
  "Gates of Hell": 10,
  "Temple of the Abyss": 10,
  "Dragon Aerie": 10,
  "Crystal Keep": 5,
  "Sacred Grove": 1,
  "Alchemist's Tower": 0,
  "Sacrificial Pit": 1,
  "Catacombs of the Dead": 10,
  "Dragon's Lair": 5,
  "Sorcerer's Bestiary": 3,
  "Sunken Reef": 10,
  "Coral Castle": 1,
  "Mystical Menagerie": 10,
  "Alchemical Workshop": 10,
  "Blood Isle": 10,
  "Pearl Bed": 10,
  "Druid Circle": 10,
  "Dragon's Cave": 10
};

const count = 5;
const currentStorageKey = "res-arcana-place-of-power-ticket-counts-v1";
const maximumStorageKey = "res-arcana-place-of-power-maximums-v1";

function reconcileMaximums(storedMaximums) {
  const maximums = {};
  for (const [place, defaultMaximum] of Object.entries(defaultMaximums)) {
    const stored = storedMaximums?.[place];
    maximums[place] = Number.isSafeInteger(stored) && stored >= 0 ? stored : defaultMaximum;
  }
  return maximums;
}

function reconcileTicketCounts(maximums, storedCounts) {
  const counts = {};
  for (const [place, maximum] of Object.entries(maximums)) {
    const stored = storedCounts?.[place];
    counts[place] = Number.isSafeInteger(stored) && stored >= 0 ? Math.min(stored, maximum) : maximum;
  }
  return counts;
}

function select(currentTickets, random = Math.random) {
  const selections = [];
  const workingSet = Object.keys(currentTickets);

  for (let selectionNumber = 0; selectionNumber < count; selectionNumber++) {
    let totalTickets = 0;
    for (const place of workingSet) totalTickets += currentTickets[place];

    if (totalTickets === 0) {
      throw new Error(`Not enough eligible places to select ${count}. Reset the tickets or raise some maximums.`);
    }

    let ticket = random() * totalTickets;
    let winner = workingSet[workingSet.length - 1];
    for (const place of workingSet) {
      ticket -= currentTickets[place];
      if (ticket < 0) {
        winner = place;
        break;
      }
    }

    selections.push(winner);
    workingSet.splice(workingSet.indexOf(winner), 1);
    const pairedIndex = workingSet.indexOf(pairs[winner]);
    if (pairedIndex !== -1) workingSet.splice(pairedIndex, 1);
  }

  return selections;
}

function updateTicketCounts(maximums, currentTickets, selections) {
  const selected = new Set(selections);
  const updated = {};
  for (const place of Object.keys(maximums)) {
    updated[place] = selected.has(place)
      ? Math.floor(currentTickets[place] / 2)
      : Math.min(currentTickets[place] + 1, maximums[place]);
  }
  return updated;
}

function initializeBrowserApp() {
  const weightsElement = document.querySelector("#weights");
  const outputElement = document.querySelector("#output");
  const formElement = document.querySelector("#randomizer");
  const currentCountElements = {};
  const maximumInputElements = {};

  function readStoredValues(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  }

  function saveStoredValues(key, values) {
    try {
      localStorage.setItem(key, JSON.stringify(values));
    } catch {
      // The randomizer still works when storage is unavailable.
    }
  }

  let maximums = reconcileMaximums(readStoredValues(maximumStorageKey));
  let currentTickets = reconcileTicketCounts(maximums, readStoredValues(currentStorageKey));

  for (const place of Object.keys(defaultMaximums)) {
    const id = `maximum-${place.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const label = document.createElement("label");
    const input = document.createElement("input");
    const current = document.createElement("output");

    label.htmlFor = id;
    label.textContent = place;
    Object.assign(input, {
      id,
      name: place,
      type: "number",
      min: "0",
      step: "1",
      value: maximums[place],
      required: true,
      inputMode: "numeric"
    });
    input.setAttribute("aria-label", `${place} maximum tickets`);
    maximumInputElements[place] = input;

    current.className = "ticket-count";
    current.textContent = currentTickets[place];
    current.setAttribute("aria-label", `${place} current tickets`);
    currentCountElements[place] = current;
    weightsElement.append(label, input, current);
  }

  function persistState() {
    saveStoredValues(maximumStorageKey, maximums);
    saveStoredValues(currentStorageKey, currentTickets);
  }

  function renderCurrentTickets() {
    for (const [place, tickets] of Object.entries(currentTickets)) {
      currentCountElements[place].textContent = tickets;
    }
  }

  function readMaximums() {
    const formData = new FormData(formElement);
    const nextMaximums = {};

    for (const place of Object.keys(defaultMaximums)) {
      const rawMaximum = formData.get(place);
      const maximum = Number(rawMaximum);

      if (rawMaximum === "" || !Number.isSafeInteger(maximum) || maximum < 0) {
        throw new Error(`${place} must have a non-negative whole-number maximum.`);
      }

      nextMaximums[place] = maximum;
    }

    return nextMaximums;
  }

  function applyMaximums(nextMaximums) {
    maximums = nextMaximums;
    currentTickets = reconcileTicketCounts(maximums, currentTickets);
    persistState();
    renderCurrentTickets();
  }

  function showError(error) {
    outputElement.setAttribute("role", "alert");
    outputElement.textContent = error.message;
  }

  function showMessage(message) {
    outputElement.removeAttribute("role");
    outputElement.textContent = message;
  }

  persistState();

  formElement.addEventListener("change", (event) => {
    if (!event.target.matches("#weights input")) return;

    try {
      applyMaximums(readMaximums());
    } catch (error) {
      showError(error);
    }
  });

  formElement.addEventListener("submit", (event) => {
    event.preventDefault();

    try {
      applyMaximums(readMaximums());
      const selections = select(currentTickets);
      const list = document.createElement("ol");

      currentTickets = updateTicketCounts(maximums, currentTickets, selections);
      persistState();
      renderCurrentTickets();

      for (const place of selections) {
        const item = document.createElement("li");
        item.textContent = place;
        list.append(item);
      }

      outputElement.removeAttribute("role");
      outputElement.replaceChildren(list);
    } catch (error) {
      showError(error);
    }
  });

  document.querySelector("#reset-tickets").addEventListener("click", () => {
    try {
      maximums = readMaximums();
      currentTickets = { ...maximums };
      persistState();
      renderCurrentTickets();
      showMessage("Current ticket counts have been reset to their maximums.");
    } catch (error) {
      showError(error);
    }
  });

  document.querySelector("#reset-maximums").addEventListener("click", () => {
    maximums = { ...defaultMaximums };
    for (const [place, maximum] of Object.entries(maximums)) {
      maximumInputElements[place].value = maximum;
    }
    currentTickets = reconcileTicketCounts(maximums, currentTickets);
    persistState();
    renderCurrentTickets();
    showMessage("Default maximum ticket values have been restored.");
  });
}

if (typeof document !== "undefined") initializeBrowserApp();
if (typeof module !== "undefined") {
  module.exports = {
    count,
    defaultMaximums,
    pairs,
    reconcileMaximums,
    reconcileTicketCounts,
    select,
    updateTicketCounts
  };
}
